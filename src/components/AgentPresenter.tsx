
import React, { useState, useEffect, useRef } from 'react';
import { Agent, Spot, VoiceResponse, RecognitionResponse, ShoppingInfo } from '../types';
import { Icon } from './common/Icon';
import { Spinner } from './common/Spinner';
import { AgentA } from '../services/agentSystem'; // Import the new Agent System
import { decode, decodeAudioData } from '../utils/audioUtils';

interface ChatMessage {
  id: number;
  sender: 'user' | 'agent' | 'system';
  type: 'text' | 'voice' | 'photo' | 'shop' | 'system';
  content: any;
}

interface AgentPresenterProps {
  agent: Agent;
  spot: Spot | null;
  onSwitchToAgentC: () => void;
}

// --- Sub-components ---

const SystemMessageBubble: React.FC<{ text: string }> = ({ text }) => (
  <div className="flex justify-center my-3 animate-fade-in">
    <span className="bg-gray-100/80 backdrop-blur-sm text-gray-500 text-xs px-4 py-1.5 rounded-full shadow-sm border border-gray-200/50 flex items-center space-x-1">
      <Icon name="check-circle" className="w-3 h-3 opacity-50" />
      <span>{text}</span>
    </span>
  </div>
);

const AgentMessageBubble: React.FC<{ message: ChatMessage; onPlayAudio: (b64: string) => void; isAudioPlaying: boolean; agent: Agent }> = ({ message, onPlayAudio, isAudioPlaying, agent }) => {
  const renderContent = () => {
    switch (message.type) {
      case 'voice':
        const voiceResult = message.content as VoiceResponse;
        return (
          <div className="flex items-start space-x-3">
            <p className="flex-grow leading-relaxed text-gray-700">{voiceResult.text}</p>
            {voiceResult.audio_base_64 && (
              <button
                onClick={() => onPlayAudio(voiceResult.audio_base_64!)}
                className={`p-2.5 rounded-full transition-all shrink-0 shadow-sm border ${isAudioPlaying ? 'bg-teal-100 text-teal-600 border-teal-200 animate-pulse' : 'bg-gray-50 text-gray-500 border-gray-200 hover:bg-teal-50 hover:text-teal-500'}`}
                aria-label={isAudioPlaying ? '停止播放' : '播放语音'}
              >
                <Icon name={isAudioPlaying ? 'pause' : 'play'} className="w-5 h-5" />
              </button>
            )}
          </div>
        );
      case 'photo':
        const photoResult = message.content as RecognitionResponse;
        return (
          <div className="space-y-3">
            <div className="relative rounded-xl overflow-hidden shadow-md border border-gray-100">
                <img src={photoResult.memorial_image} alt="AI生成纪念图" className="w-full object-cover" />
                <div className="absolute bottom-0 left-0 right-0 bg-black/50 backdrop-blur-sm px-3 py-1 text-white text-[10px]">
                    AI 视觉识别
                </div>
            </div>
            <div className="pt-1">
                <p className="text-gray-700 leading-relaxed">{photoResult.explanation}</p>
            </div>
          </div>
        );
      case 'shop':
        const shopResult = message.content as ShoppingInfo;
        return (
          <div className="space-y-4 text-sm text-gray-700">
            {/* 1. Conversational Text */}
            <div className="relative pl-3 border-l-2 border-orange-300">
                <p className="italic text-gray-600 leading-relaxed">
                    {shopResult.recommend_text}
                </p>
            </div>

            <div className="h-px bg-gray-100 w-full"></div>

            {/* 2. Product List (Orange Theme) */}
            <div className="bg-orange-50/50 rounded-xl p-3 border border-orange-100">
              <h4 className="font-bold text-orange-800 mb-3 flex items-center text-xs uppercase tracking-wider">
                  <Icon name="bag" className="w-3.5 h-3.5 mr-1.5"/>
                  特色好物
              </h4>
              <ul className="space-y-2">
                {shopResult.products.map((p, i) => (
                    <li key={i} className="flex justify-between items-center bg-white p-2.5 rounded-lg shadow-sm border border-orange-50/50">
                        <span className="font-medium text-gray-800">{p.name}</span>
                        <span className="text-orange-600 font-bold text-xs bg-orange-50 px-2 py-1 rounded-full">{p.price}</span>
                    </li>
                ))}
              </ul>
            </div>

            {/* 3. Merchant List (Teal Theme) */}
            <div className="bg-teal-50/50 rounded-xl p-3 border border-teal-100">
              <h4 className="font-bold text-teal-800 mb-3 flex items-center text-xs uppercase tracking-wider">
                  <Icon name="location" className="w-3.5 h-3.5 mr-1.5"/>
                  推荐商家
              </h4>
              <ul className="space-y-2 text-xs text-gray-600">
                {shopResult.businesses.map((b, i) => (
                    <li key={i} className="flex justify-between items-center bg-white p-2.5 rounded-lg shadow-sm border border-teal-50/50">
                         <div className="flex items-center space-x-2">
                             <div className="w-1.5 h-1.5 bg-teal-400 rounded-full"></div>
                             <span className="font-medium">{b.name}</span>
                         </div>
                         <span className="text-gray-400 text-[10px]">{b.distance}</span>
                    </li>
                ))}
              </ul>
            </div>
          </div>
        );
      case 'system': return <div className="text-gray-600">{message.content}</div>;
      case 'text': return <p className="text-gray-700 leading-relaxed">{(typeof message.content === 'object' ? message.content?.text : message.content) || ''}</p>;
      default: return null;
    }
  };

  return (
    <div className="flex items-start space-x-3 animate-fade-in-up" style={{ animationDuration: '0.4s' }}>
      <div className={`w-9 h-9 rounded-full flex items-center justify-center ${agent.colorClasses.iconBg} shadow-md flex-shrink-0 mt-1 border-2 border-white`}>
        <Icon name={agent.icon} className="w-5 h-5 text-white" />
      </div>
      <div className="bg-white rounded-2xl rounded-tl-none px-5 py-4 shadow-premium-sm max-w-[88%] border border-gray-100/50">
        {renderContent()}
      </div>
    </div>
  );
};

const UserMessageBubble: React.FC<{ message: ChatMessage }> = ({ message }) => (
  <div className="flex justify-end animate-fade-in-up" style={{ animationDuration: '0.4s' }}>
    <div className="bg-gradient-to-br from-teal-500 to-teal-600 text-white rounded-2xl rounded-tr-none px-5 py-3 shadow-premium-sm max-w-[85%]">
      <p className="leading-relaxed">{message.content}</p>
    </div>
  </div>
);

const LoadingBubble: React.FC<{ agent: Agent; text?: string }> = ({ agent, text = "Agent B 正在调用 MCP..." }) => (
  <div className="flex items-start space-x-3 animate-fade-in-up">
    <div className={`w-9 h-9 rounded-full flex items-center justify-center ${agent.colorClasses.iconBg} shadow-md flex-shrink-0 mt-1 border-2 border-white`}>
      <Icon name={agent.icon} className="w-5 h-5 text-white" />
    </div>
    <div className="bg-white text-gray-500 rounded-2xl rounded-tl-none px-5 py-4 flex items-center space-x-3 shadow-premium-sm border border-gray-100/50">
      <span className="text-sm italic">{text}</span>
      <div className="flex space-x-1">
        <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
        <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.15s' }}></div>
        <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }}></div>
      </div>
    </div>
  </div>
);

const Suggestions: React.FC<{ list: string[]; onSelect: (text: string) => void }> = ({ list, onSelect }) => (
    <div className="flex flex-wrap gap-2 pl-12 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
        {list.map((text, idx) => (
            <button
                key={idx}
                onClick={() => onSelect(text)}
                className="group px-4 py-2 bg-white/80 backdrop-blur border border-teal-100 text-teal-700 text-xs rounded-full shadow-sm hover:bg-teal-50 hover:border-teal-200 hover:shadow-md transition-all active:scale-95 flex items-center space-x-1"
            >
                <span className="opacity-50 group-hover:opacity-100 transition-opacity">✨</span>
                <span>{text}</span>
            </button>
        ))}
    </div>
);


const AgentPresenter: React.FC<AgentPresenterProps> = ({ agent, spot, onSwitchToAgentC }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("Agent B 正在调用 MCP...");
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [question, setQuestion] = useState('');
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  // --- Logic for Suggestions ---
  const getSuggestions = (agentId: string, spotName?: string) => {
      if (spotName) {
          return [
              `讲讲${spotName}的故事`,
              `这里有什么特色？`,
              "适合拍照的地方？",
              "附近有洗手间吗？"
          ];
      }
      if (agentId === 'C') {
          return ["推荐东里特产", "哪里买红菇？", "有什么纪念品？", "附近有什么好吃的？"];
      }
      if (['B', 'RED', 'ECO'].includes(agentId)) {
          return ["讲讲这里的历史", "有什么自然景观？", "带我去看古民居", "帮我拍张照"];
      }
      return ["推荐一条游览路线", "东里村有什么好玩的？", "哪里有卫生间？", "介绍一下名人故事"];
  };

  useEffect(() => {
    const initialSuggestions = getSuggestions(agent.id, spot?.name);
    setSuggestions(initialSuggestions);

    const getInitialMessage = (): ChatMessage => {
      let content;
      if (['B', 'RED', 'ECO', 'FOOD', 'A'].includes(agent.id)) {
        content = (
          <div className="text-gray-700 space-y-3">
            <p className="font-semibold text-lg text-teal-900">您好, 我是{agent.name}</p>
            <p className="text-sm">在<span className="font-medium text-teal-600">{spot?.name || '此景点'}</span>，您可以随时向我提问，我会调用知识库为您解答。</p>
          </div>
        );
      } else {
        content = <p className="text-gray-600">欢迎来到东里村！</p>;
      }
      return { id: Date.now(), sender: 'agent', type: 'system', content };
    };
    setChatHistory([getInitialMessage()]);

    return () => {
      if (audioSourceRef.current) {
          try { audioSourceRef.current.stop(); } catch (e) {}
      }
      if (recognitionRef.current) {
          try { recognitionRef.current.stop(); } catch (e) {}
      }
    };
  }, [agent.id, spot?.id]);

  useEffect(() => {
    const fetchShopInfoForAgentC = async () => {
      if (agent.id === 'C' && spot) {
        setLoadingMessage("Agent B 正在检索商业数据...");
        setIsLoading(true);
        try {
          // Using Agent System even for Agent C's initial load
          const result = await AgentA.processUserRequest("推荐特产", spot.name, 'text');
          addMessage({ sender: 'agent', type: 'shop', content: result });
        } catch (error) {
          console.error(error);
          addMessage({ sender: 'agent', type: 'text', content: { text: "数据检索失败。" } });
        } finally {
          setIsLoading(false);
          setLoadingMessage("Agent B 正在调用 MCP...");
        }
      }
    };
    fetchShopInfoForAgentC();
  }, [agent.id, spot]);

  useEffect(() => {
    chatContainerRef.current?.scrollTo({ top: chatContainerRef.current.scrollHeight, behavior: 'smooth' });
  }, [chatHistory, isLoading]);

  const addMessage = (message: Omit<ChatMessage, 'id'>) => {
    setChatHistory(prev => [...prev, { ...message, id: Date.now() }]);
  };

  const handlePlayAudio = async (base64Audio: string) => {
    if (isAudioPlaying) {
      try { audioSourceRef.current?.stop(); } catch(e) {}
      setIsAudioPlaying(false);
      return;
    }
    if (!base64Audio) return;

    try {
      if (!audioContextRef.current || audioContextRef.current.state === 'closed') {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      }
      if (audioContextRef.current.state === 'suspended') {
        await audioContextRef.current.resume();
      }

      const audioBytes = decode(base64Audio);
      const audioBuffer = await decodeAudioData(audioBytes, audioContextRef.current, 24000, 1);

      const source = audioContextRef.current.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioContextRef.current.destination);
      source.onended = () => setIsAudioPlaying(false);
      
      source.start(0);
      audioSourceRef.current = source;
      setIsAudioPlaying(true);
    } catch (e) {
      console.error("Audio playback failed:", e);
      setIsAudioPlaying(false);
    }
  };

  const processUserQuery = async (text: string) => {
      if (!text.trim()) return;

      addMessage({ sender: 'user', type: 'text', content: text });
      setSuggestions([]);

      setIsLoading(true);
      setLoadingMessage("Agent A 正在分发任务...");

      try {
        const contextSpotName = spot?.name || '这个地方';
        
        // Use the new Agent System to process the request
        // Agent A will act as the gateway, dispatching to B (MCP Runner) via ANP
        const result = await AgentA.processUserRequest(text, contextSpotName, 'text');
        
        // Determine response type based on result structure from Agent System
        let type: ChatMessage['type'] = 'voice';
        if (result.products) type = 'shop'; // It's shopping info
        if (result.title && result.content) type = 'text'; // It's related knowledge
        if (result.memorial_image) type = 'photo'; // It's recognition
        
        addMessage({ sender: 'agent', type, content: result });
        
        if (result.audio_base_64) {
            handlePlayAudio(result.audio_base_64);
        }
      } catch (error) {
        console.error(error);
        addMessage({ sender: 'agent', type: 'text', content: { text: "Agent Network 响应超时。" } });
      } finally {
        setIsLoading(false);
      }
  };

  const handleMicClick = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      addMessage({ 
          sender: 'system', 
          type: 'system', 
          content: "您的浏览器暂不支持语音，不过没关系，打字交流也一样高效哦！" 
      });
      return;
    }

    try {
        const recognition = new SpeechRecognition();
        recognition.lang = 'zh-CN';
        recognition.continuous = false;
        recognition.interimResults = false;

        recognition.onstart = () => setIsListening(true);
        recognition.onresult = (event: Event) => {
            const speechEvent = event as SpeechRecognitionEvent;
            const transcript = speechEvent.results[0][0].transcript;
            processUserQuery(transcript);
        };
        recognition.onerror = (event: Event) => {
            const errorEvent = event as SpeechRecognitionErrorEvent;
            setIsListening(false);
            
            // Ignore 'aborted' error which happens when stopping manually or network interruption
            if (errorEvent.error === 'aborted') return;

            let errorMessage = "语音识别中断。";
            
            // Check for specific permission errors
            if (errorEvent.error === 'not-allowed') {
                errorMessage = "无法访问麦克风，请检查浏览器权限设置。";
            } else if (errorEvent.error === 'service-not-allowed') {
                errorMessage = "当前环境不支持语音识别服务。";
            }

            addMessage({ sender: 'system', type: 'system', content: errorMessage });
        };
        recognition.onend = () => setIsListening(false);

        recognitionRef.current = recognition;
        recognition.start();
    } catch (e) {
        setIsListening(false);
        addMessage({ sender: 'system', type: 'system', content: "语音功能启动失败。" });
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    setLoadingMessage("Agent B 正在调用视觉模型...");
    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        addMessage({ sender: 'user', type: 'text', content: '📸 发送了一张图片' });
        setSuggestions([]);
        
        const contextSpotName = spot?.name || '这里';
        // Dispatch to Agent System with mode='photo'
        const response = await AgentA.processUserRequest("识别这张照片", contextSpotName, 'photo');
        addMessage({ sender: 'agent', type: 'photo', content: response });
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error(error);
      addMessage({ sender: 'agent', type: 'text', content: { text: "图片识别失败。" } });
    } finally {
      setIsLoading(false);
    }
    if (event.target) event.target.value = '';
  };

  return (
    <div className="flex flex-col h-full bg-[#f8fafc]"> 
      <header className={`flex-shrink-0 px-4 py-3 ${agent.colorClasses.bg} border-b ${agent.colorClasses.border} flex items-center justify-between shadow-sm z-10`}>
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full border-2 border-white shadow-sm overflow-hidden bg-white">
            {agent.imageUrl ? (
              <img src={agent.imageUrl} alt={agent.name} className="w-full h-full object-cover" />
            ) : (
              <div className={`w-full h-full flex items-center justify-center ${agent.colorClasses.iconBg}`}>
                <Icon name={agent.icon} className="w-5 h-5 text-white" />
              </div>
            )}
          </div>
          <div>
            <h3 className={`font-bold text-base ${agent.colorClasses.text}`}>{agent.name}</h3>
            <p className="text-[10px] text-gray-600 opacity-80">{agent.description}</p>
          </div>
        </div>
        <div className="flex items-center space-x-1">
             <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
             <span className="text-[9px] text-gray-400">ANP Online</span>
        </div>
      </header>

      <div className="flex-grow overflow-y-auto p-4 space-y-5 scrollbar-hide" ref={chatContainerRef}>
        {chatHistory.map((msg) => (
          msg.type === 'system' 
            ? <SystemMessageBubble key={msg.id} text={msg.content} />
            : msg.sender === 'agent' 
                ? <AgentMessageBubble key={msg.id} message={msg} onPlayAudio={handlePlayAudio} isAudioPlaying={isAudioPlaying} agent={agent} />
                : <UserMessageBubble key={msg.id} message={msg} />
        ))}
        
        {!isLoading && suggestions.length > 0 && (
             <Suggestions list={suggestions} onSelect={processUserQuery} />
        )}

        {isLoading && <LoadingBubble agent={agent} text={loadingMessage} />}
      </div>

      {/* Redesigned Footer: Merged Mic Button into Input Row */}
      <div className="flex-shrink-0 p-3 bg-white border-t border-gray-100 shadow-[0_-4px_20px_rgba(0,0,0,0.03)] z-20">
        <div className="flex items-center gap-2">
            {/* Mic Button */}
            <button 
                onClick={handleMicClick}
                className={`p-2.5 rounded-full transition-all flex-shrink-0 duration-300 border
                    ${isListening 
                        ? 'bg-red-50 border-red-200 text-red-500 animate-pulse' 
                        : 'bg-teal-50 border-teal-100 text-teal-600 hover:bg-teal-100'
                    }`}
                title={isListening ? "停止" : "语音"}
            >
                 {isListening ? (
                     <div className="w-5 h-5 flex items-center justify-center">
                        <div className="w-2.5 h-2.5 bg-red-500 rounded-sm"></div>
                     </div>
                 ) : (
                     <Icon name="microphone" className="w-5 h-5" />
                 )}
            </button>

            {/* Camera Button */}
            <button onClick={() => fileInputRef.current?.click()} className="p-2.5 rounded-full bg-blue-50 text-blue-600 border border-blue-100 hover:bg-blue-100 transition-colors flex-shrink-0" title="拍照识别">
                <Icon name="camera" className="w-5 h-5" />
            </button>

            {/* Input */}
            <div className="relative flex-grow flex items-center">
                <input
                  type="text"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && !isLoading && processUserQuery(question)}
                  placeholder={isListening ? "正在聆听..." : "输入您的问题..."}
                  className="w-full bg-gray-50 rounded-full px-4 py-2.5 pr-10 text-sm text-gray-700 border border-gray-200 focus:border-teal-300 focus:bg-white focus:ring-2 focus:ring-teal-100 outline-none transition-all placeholder-gray-400"
                />
                <button
                  onClick={() => processUserQuery(question)}
                  disabled={!question.trim() || isLoading}
                  className="absolute right-1.5 p-1.5 bg-teal-500 text-white rounded-full shadow-sm hover:bg-teal-600 disabled:opacity-30 disabled:shadow-none transition-all"
                >
                   <Icon name="arrow-left" className="w-4 h-4 transform rotate-90" />
                </button>
            </div>
        </div>
      </div>

      <input type="file" ref={fileInputRef} onChange={handleImageUpload} className="hidden" accept="image/*" />
    </div>
  );
};

export default AgentPresenter;
