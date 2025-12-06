import { Spot, Route, VoiceResponse, RecognitionResponse, ShoppingInfo, NavigationInfo, RelatedKnowledge } from '../types';
import { AI_CONFIG } from './config';
import { STATIC_ROUTES } from './staticData';

// --- Utilities ---

async function sendWebhookAlert(provider: string, model: string, errorMsg: string) {
    try {
        const now = new Date();
        const dateStr = `${now.getFullYear()}-${(now.getMonth()+1).toString().padStart(2,'0')}-${now.getDate().toString().padStart(2,'0')}_${now.getHours().toString().padStart(2,'0')}:${now.getMinutes().toString().padStart(2,'0')}:${now.getSeconds().toString().padStart(2,'0')}`;
        
        const safeProvider = encodeURIComponent(provider);
        const safeModel = encodeURIComponent(model);
        const safeError = encodeURIComponent(errorMsg.replace(/[\r\n]/g, ' ').substring(0, 50));
        
        const url = `${AI_CONFIG.WEBHOOK_URL}/${dateStr}-${safeProvider}-${safeModel}-${safeError}`;
        fetch(url).catch(e => console.warn("Webhook alert failed:", e));
    } catch (e) {
        console.warn("Failed to construct webhook URL", e);
    }
}

async function callGeminiAPI<T>(
    baseUrl: string,
    apiKey: string,
    model: string,
    systemPrompt: string,
    userPrompt: string,
    jsonMode: boolean
): Promise<T> {
    const url = `${baseUrl}/models/${model}:generateContent?key=${apiKey}`;
    
    // Gemini API 格式不同于 OpenAI - 修复格式
    let contents;
    if (systemPrompt) {
        // 将系统提示和用户提示合并
        contents = [{ 
            role: "user", 
            parts: [{ text: `${systemPrompt}\n\n用户：${userPrompt}` }] 
        }];
    } else {
        contents = [{ 
            role: "user", 
            parts: [{ text: `用户：${userPrompt}` }] 
        }];
    }

    const payload = {
        contents: contents,
        generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 1000,
            responseMimeType: jsonMode ? "application/json" : "text/plain"
        }
    };

    console.log(`[Gemini] Calling ${baseUrl} with model: ${model}`);

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        console.log(`[Gemini] Response status: ${response.status}`);

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`[Gemini] HTTP Error ${response.status}: ${errorText}`);
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        console.log(`[Gemini] Response data:`, data);

        const content = data.candidates?.[0]?.content?.parts?.[0]?.text || "{}";
        const cleanContent = content.replace(/```json\n?|```/g, '').trim();

        if (jsonMode) {
            try {
                return JSON.parse(cleanContent);
            } catch (parseError) {
                console.error(`[Gemini] JSON parse error:`, parseError, `Content:`, cleanContent);
                throw new Error('Invalid JSON response from API');
            }
        }

        return cleanContent as T;
    } catch (error: any) {
        console.error(`[Gemini] Request failed:`, error);
        throw error;
    }
}

async function callOpenAICompatibleAPI<T>(
    baseUrl: string,
    apiKey: string,
    model: string,
    systemPrompt: string,
    userPrompt: string,
    jsonMode: boolean
): Promise<T> {
    const url = `${baseUrl}/chat/completions`;
    const payload = {
        model: model,
        messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt }
        ],
        temperature: 0.7,
        response_format: jsonMode ? { type: "json_object" } : undefined,
        stream: false
    };

    console.log(`[API] Calling ${baseUrl} with model: ${model}`);

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify(payload)
        });

        console.log(`[API] Response status: ${response.status}`);

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`[API] HTTP Error ${response.status}: ${errorText}`);
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        console.log(`[API] Response data:`, data);

        const content = data.choices[0]?.message?.content || "{}";
        const cleanContent = content.replace(/```json\n?|```/g, '').trim();

        if (jsonMode) {
            try {
                return JSON.parse(cleanContent);
            } catch (parseError) {
                console.error(`[API] JSON parse error:`, parseError, `Content:`, cleanContent);
                throw new Error('Invalid JSON response from API');
            }
        }

        return cleanContent as T;
    } catch (error: any) {
        console.error(`[API] Request failed:`, error);
        throw error;
    }
}

async function fetchChatCompletion<T>(
  systemPrompt: string, 
  userPrompt: string, 
  jsonMode: boolean = true
): Promise<T> {
    try {
        // 优先使用 SiliconFlow API
        return await callOpenAICompatibleAPI<T>(
            AI_CONFIG.SILICON_FLOW.BASE_URL,
            AI_CONFIG.SILICON_FLOW.API_KEY,
            AI_CONFIG.SILICON_FLOW.MODELS.TEXT,
            systemPrompt,
            userPrompt,
            jsonMode
        );
    } catch (primaryError: any) {
        console.warn("Primary API (SiliconFlow) Failed. Initiating Fallback (Zhipu AI)...", primaryError);
        const errorMsg = primaryError instanceof Error ? primaryError.message : String(primaryError);
        sendWebhookAlert("SiliconFlow", AI_CONFIG.SILICON_FLOW.MODELS.TEXT, errorMsg);

        try {
            return await callOpenAICompatibleAPI<T>(
                AI_CONFIG.ZHIPU.BASE_URL,
                AI_CONFIG.ZHIPU.API_KEY,
                AI_CONFIG.ZHIPU.MODELS.TEXT,
                systemPrompt,
                userPrompt,
                jsonMode
            );
        } catch (finalError) {
            console.error("All API Providers failed.", finalError);
            throw finalError;
        }
    }
}

export interface VoiceSettings {
  voice_id: string;
  speed: number;
  vol: number;
  pitch: number;
}

export async function generateMinimaxAudio(text: string, settings?: Partial<VoiceSettings>): Promise<string> {
  if (!AI_CONFIG.MINIMAX.API_KEY) {
    console.warn("MiniMax API Key not configured. Falling back to Browser TTS.");
    return "";
  }

  const url = `${AI_CONFIG.MINIMAX.BASE_URL}/t2a_v2`;
  const payload = {
    model: AI_CONFIG.MINIMAX.MODELS.AUDIO,
    text: text,
    stream: false,
    voice_setting: {
      voice_id: settings?.voice_id || "male-qn-qingse",
      speed: settings?.speed || 1.0,
      vol: settings?.vol || 1.0,
      pitch: settings?.pitch || 0
    }
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${AI_CONFIG.MINIMAX.API_KEY}`,
        'GroupId': AI_CONFIG.MINIMAX.GROUP_ID
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      console.warn(`MiniMax API Error: ${response.status} ${response.statusText}`);
      return "";
    }

    const data = await response.json();
    if (data.data && data.data.audio) {
        return data.data.audio;
    } else if (data.base64_audio) {
        return data.base64_audio;
    }
    
    return "";
  } catch (error) {
    console.warn("Audio Generation Failed:", error);
    return "";
  }
}

export async function objectRecognition(contextSpotName: string): Promise<RecognitionResponse> {
    const systemPrompt = `你是一个专业的乡村导游。用户上传了一张在"${contextSpotName}"拍摄的照片。请模拟识别这张照片，并生成一段富有感染力的解说词，介绍图中的内容。
    返回JSON格式：
    { "explanation": "解说词内容，100字左右", "memorial_image": "明信片Prompt" }`;

    const userPrompt = `请识别这张照片。`;
    const result = await fetchChatCompletion<any>(systemPrompt, userPrompt);
    const memorialImage = getReliableImage(`${contextSpotName} illustration art`);
    // Lazy load audio for recognition too if needed, but keeping here for now as it's premium feature
    const audio = await generateMinimaxAudio(result.explanation);

    return {
        explanation: result.explanation,
        audio_base_64: audio,
        memorial_image: memorialImage
    };
}

export async function voiceInteraction(spotName: string, question?: string): Promise<VoiceResponse> {
  const systemPrompt = `你是一个热情、博学的乡村导游"小A"。当前景点是"${spotName}"。请用口语化风格回答。
  返回JSON格式：{ "text": "回答内容", "need_manual_input": false }`;

  const userPrompt = question ? `用户提问：${question}` : `用户到达景点，开始讲解。`;

  try {
    console.log(`[Gemini] Processing voice interaction for spot: ${spotName}, question: ${question || 'none'}`);
    
    const result = await fetchChatCompletion<{text: string, need_manual_input: boolean}>(systemPrompt, userPrompt);
    
    console.log(`[Gemini] API response:`, result);
    
    // COST SAVING: Do NOT generate audio automatically. 
    // We will call generateMinimaxAudio on demand when user clicks "Play".
    
    return {
      text: result.text,
      audio_base_64: "", // Empty audio by default to save cost
      need_manual_input: result.need_manual_input
    };
  } catch (error: any) {
    console.error(`[Gemini] Voice interaction failed:`, error);
    
    // 根据错误类型提供不同的提示
    let errorMessage = "服务暂时不可用，请稍后再试。";
    
    if (error.message && error.message.includes('timeout')) {
      errorMessage = "请求超时了，请检查网络连接后重试。";
    } else if (error.message && error.message.includes('network')) {
      errorMessage = "网络连接不稳定，请稍后再试。";
    } else if (error.message && error.message.includes('HTTP 429')) {
      errorMessage = "请求过于频繁，请稍等片刻再试。";
    } else if (error.message && error.message.includes('HTTP 401')) {
      errorMessage = "服务认证失败，请联系管理员。";
    }
    
    return {
      text: errorMessage,
      audio_base_64: "",
      need_manual_input: false,
      error: true
    };
  }
}

export async function getShoppingInfo(userLocation: string, query: string): Promise<ShoppingInfo> {
    const systemPrompt = `你是东里村特产推荐官。用户问"${query}"。请推荐当地特色。
    返回JSON：{ "recommend_text": "...", "businesses": [], "products": [] }`;
    return await fetchChatCompletion<ShoppingInfo>(systemPrompt, query);
}

export async function getRelatedKnowledge(topic: string): Promise<RelatedKnowledge> {
    const systemPrompt = `你是文化讲解员。请针对"${topic}"提供深度背景故事。返回JSON：{ "title": "...", "content": "..." }`;
    const result = await fetchChatCompletion<RelatedKnowledge>(systemPrompt, topic);
    result.imageUrl = getReliableImage(topic + " history culture");
    return result;
}

export async function getNavigationRoute(from: string, toName: string, toCoord: string): Promise<NavigationInfo> {
    return {
        route_text: `从当前位置出发，向北走约5分钟，在古樟树路口右转，前行200米到达${toName}。`,
        walking_time: "约 8 分钟"
    };
}

export async function getRoutes(userCoord: string, areaName: string): Promise<{routes: Route[]}> {
  return { routes: STATIC_ROUTES };
}

export const getGoogleMapsUrl = (coord: string, query: string) => {
    const [lng, lat] = coord.split(',');
    return `https://www.google.com/maps/search/?api=1&query=${lat},${lng}&query_place_id=${encodeURIComponent(query)}`;
};

// Upgraded reliable image source using Pollinations.ai for real-time AI generation
// This is accessible in China and provides high-quality, context-aware images without a backend.
export const getReliableImage = (prompt: string): string => {
    // Clean prompt for URL
    const cleanPrompt = prompt.trim().replace(/\s+/g, ' ');
    const encodedPrompt = encodeURIComponent(`${cleanPrompt} realistic photography highly detailed 4k`);
    // Use a random seed to ensure variety but allow caching if needed (remove seed for consistency)
    // Pollinations URL format: https://image.pollinations.ai/prompt/{prompt}
    // We add 'nologo' to remove watermarks if supported, and a seed cache buster if we want variety
    // For stability, we can use a hash of the prompt as a seed if we wanted consistent images per spot
    return `https://image.pollinations.ai/prompt/${encodedPrompt}?nologo=true&width=1024&height=768&model=flux`;
};

export const getStaticMapImage = (viewType: string): string => {
    // For maps, we still use a placeholder or could use a map generation prompt
    return getReliableImage(`map view of ${viewType} satellite style top down`);
};
