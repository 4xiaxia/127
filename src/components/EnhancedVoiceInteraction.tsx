import React, { useState, useRef, useEffect } from "react";
import { Icon } from "./common/Icon";
import { Spinner } from "./common/Spinner";

interface EnhancedVoiceInteractionProps {
  onMessage?: (message: string) => void;
  className?: string;
}

interface VoiceMessage {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  audioPath?: string;
}

export function EnhancedVoiceInteraction({
  onMessage,
  className = "",
}: EnhancedVoiceInteractionProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentText, setCurrentText] = useState("");
  const [messages, setMessages] = useState<VoiceMessage[]>([]);
  const [selectedVoice, setSelectedVoice] = useState(
    "Chinese (Mandarin)_News_Anchor"
  );

  const recognitionRef = useRef<any>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // 初始化语音识别
  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = "zh-CN";

      recognitionRef.current.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((result: any) => result[0].transcript)
          .join("");

        setCurrentText(transcript);

        if (event.results[0].isFinal) {
          handleUserMessage(transcript);
        }
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error("语音识别错误:", event.error);
        setIsRecording(false);
      };

      recognitionRef.current.onend = () => {
        setIsRecording(false);
      };
    }
  }, []);

  // 获取可用语音列表
  const getAvailableVoices = async () => {
    try {
      // 这里会调用 MiniMax MCP 服务器的 list_voices 工具
      const response = await fetch("/api/mcp/minimax/list_voices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ voice_type: "all" }),
      });
      return await response.json();
    } catch (error) {
      console.error("获取语音列表失败:", error);
      return [];
    }
  };

  // 生成语音回复
  const generateSpeech = async (
    text: string,
    voiceId: string
  ): Promise<string> => {
    try {
      // 调用 MiniMax MCP 服务器的 text_to_audio 工具
      const response = await fetch("/api/mcp/minimax/text_to_audio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text,
          voice_id: voiceId,
          output_directory: "C:\\Users\\Administrator\\Desktop\\MiniMax-Output",
        }),
      });

      const result = await response.json();
      return result.audioPath || "";
    } catch (error) {
      console.error("语音生成失败:", error);
      return "";
    }
  };

  // 处理用户消息
  const handleUserMessage = async (text: string) => {
    const userMessage: VoiceMessage = {
      id: Date.now().toString(),
      text,
      isUser: true,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setCurrentText("");
    setIsProcessing(true);

    try {
      // 这里可以集成您的 AI 服务来生成回复
      const response = await generateAgentResponse(text);

      const agentMessage: VoiceMessage = {
        id: (Date.now() + 1).toString(),
        text: response,
        isUser: false,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, agentMessage]);

      // 生成语音文件
      const audioPath = await generateSpeech(response, selectedVoice);
      if (audioPath) {
        agentMessage.audioPath = audioPath;
        setMessages((prev) => [...prev.slice(0, -1), agentMessage]);
      }

      if (onMessage) {
        onMessage(response);
      }
    } catch (error) {
      console.error("处理消息失败:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  // 生成 Agent 回复（这里可以集成您的 Gemini 服务）
  const generateAgentResponse = async (userInput: string): Promise<string> => {
    // 模拟回复，实际使用时可以调用 geminiService
    const responses = [
      "您好！我是您的智能助手，很高兴为您服务。",
      "这是一个很好的问题，让我来为您解答。",
      "我理解您的需求，这里有些建议供您参考。",
      "感谢您的提问，我会尽力帮助您。",
    ];

    return responses[Math.floor(Math.random() * responses.length)];
  };

  // 开始录音
  const startRecording = () => {
    if (recognitionRef.current && !isRecording) {
      recognitionRef.current.start();
      setIsRecording(true);
    }
  };

  // 停止录音
  const stopRecording = () => {
    if (recognitionRef.current && isRecording) {
      recognitionRef.current.stop();
    }
  };

  // 播放语音
  const playAudio = (audioPath: string) => {
    if (audioRef.current) {
      audioRef.current.src = audioPath;
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  // 停止播放
  const stopAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
    }
  };

  return (
    <div
      className={`space-y-4 bg-white rounded-xl shadow-sm border border-gray-100 ${className}`}
    >
      {/* 隐藏的音频元素 */}
      <audio
        ref={audioRef}
        onEnded={() => setIsPlaying(false)}
        className="hidden"
      />

      {/* 头部 */}
      <div className="flex items-center justify-between p-4 border-b border-gray-100">
        <div className="flex items-center space-x-2">
          <Icon name="microphone" className="w-5 h-5 text-blue-500" />
          <h3 className="font-bold text-gray-800">智能语音助手</h3>
        </div>
        <div className="flex items-center space-x-2">
          <span
            className={`px-2 py-1 rounded-full text-xs ${
              isRecording
                ? "bg-red-100 text-red-600"
                : isProcessing
                ? "bg-yellow-100 text-yellow-600"
                : isPlaying
                ? "bg-green-100 text-green-600"
                : "bg-gray-100 text-gray-600"
            }`}
          >
            {isRecording
              ? "录音中"
              : isProcessing
              ? "处理中"
              : isPlaying
              ? "播放中"
              : "就绪"}
          </span>
        </div>
      </div>

      {/* 消息列表 */}
      <div className="max-h-64 overflow-y-auto p-4 space-y-3">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${
              message.isUser ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-xs px-4 py-2 rounded-2xl ${
                message.isUser
                  ? "bg-blue-500 text-white"
                  : "bg-gray-100 text-gray-800"
              }`}
            >
              <p className="text-sm">{message.text}</p>
              <div className="flex items-center justify-between mt-2">
                <span className="text-xs opacity-70">
                  {message.timestamp.toLocaleTimeString()}
                </span>
                {!message.isUser && message.audioPath && (
                  <button
                    onClick={() => playAudio(message.audioPath!)}
                    className="ml-2 p-1 rounded-full hover:bg-white hover:bg-opacity-20 transition"
                  >
                    <Icon name="play" className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}

        {currentText && (
          <div className="flex justify-end">
            <div className="max-w-xs px-4 py-2 rounded-2xl bg-blue-100 text-gray-600">
              <p className="text-sm italic">{currentText}</p>
            </div>
          </div>
        )}
      </div>

      {/* 控制区域 */}
      <div className="p-4 border-t border-gray-100 space-y-4">
        {/* 语音选择 */}
        <div className="flex items-center space-x-2">
          <label className="text-sm text-gray-600">语音:</label>
          <select
            value={selectedVoice}
            onChange={(e) => setSelectedVoice(e.target.value)}
            className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200"
          >
            <option value="Chinese (Mandarin)_News_Anchor">中文新闻主播</option>
            <option value="Chinese (Mandarin)_Warm_Girl">温暖女生</option>
            <option value="English_FriendlyPerson">友好英语</option>
            <option value="Japanese_GentleButler">日语管家</option>
          </select>
        </div>

        {/* 录音按钮 */}
        <div className="flex items-center justify-center space-x-4">
          <button
            onClick={isRecording ? stopRecording : startRecording}
            disabled={isProcessing}
            className={`flex items-center px-6 py-3 rounded-full font-medium transition-all transform active:scale-95 ${
              isRecording
                ? "bg-red-500 hover:bg-red-600 text-white shadow-lg ring-4 ring-red-100"
                : "bg-blue-500 hover:bg-blue-600 text-white shadow-md"
            } ${isProcessing ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            {isProcessing ? (
              <>
                <Spinner size="sm" />
                处理中...
              </>
            ) : isRecording ? (
              <>
                <Icon name="microphone" className="w-5 h-5 mr-2" />
                停止录音
              </>
            ) : (
              <>
                <Icon name="microphone" className="w-5 h-5 mr-2" />
                开始录音
              </>
            )}
          </button>

          {isPlaying && (
            <button
              onClick={stopAudio}
              className="p-3 rounded-full bg-gray-500 hover:bg-gray-600 text-white shadow-md"
            >
              <Icon name="stop" className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* 快捷操作 */}
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() =>
              generateSpeech(
                "您好，我是您的智能助手，请问有什么可以帮助您的吗？",
                selectedVoice
              )
            }
            disabled={isProcessing}
            className="px-3 py-2 text-sm bg-gray-50 hover:bg-gray-100 rounded-lg transition"
          >
            <Icon name="play" className="w-4 h-4 inline mr-1" />
            播放欢迎语
          </button>
          <button
            onClick={() => setCurrentText("")}
            className="px-3 py-2 text-sm bg-gray-50 hover:bg-gray-100 rounded-lg transition"
          >
            <Icon name="refresh" className="w-4 h-4 inline mr-1" />
            清空记录
          </button>
        </div>
      </div>
    </div>
  );
}
