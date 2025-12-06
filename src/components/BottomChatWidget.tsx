import React, { useState, useEffect, useRef } from "react";
import { Spot } from "../types";
import { AgentA } from "../services/agentSystem";
import { Icon } from "./common/Icon";
import UncleAvatar from "./common/UncleAvatar"; // Import the animated avatar
import { decode, decodeAudioData } from "../utils/audioUtils";

interface ChatMessage {
  id: string;
  sender: "user" | "ai";
  text: string;
  type: "text";
  timestamp: number;
}

interface BottomChatWidgetProps {
  spot?: Spot | null;
  hookWords?: string[];
  onIntentHandled?: (intent: string) => void;
  pendingIntent?: string | null;
  bottomOffset?: number;
}

const BottomChatWidget: React.FC<BottomChatWidgetProps> = ({
  spot,
  hookWords = [],
  bottomOffset = 0,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isTalking, setIsTalking] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isExpanded]);

  const handleSendMessage = async (text?: string) => {
    const content = text || inputValue;
    if (!content.trim()) return;

    setInputValue("");
    if (!isExpanded) setIsExpanded(true);

    setMessages((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        sender: "user",
        text: content,
        type: "text",
        timestamp: Date.now(),
      },
    ]);

    setIsLoading(true);
    setIsTalking(true);

    try {
      const result = await AgentA.processUserRequest(
        content,
        spot?.name || "东里村",
        "text"
      );
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          sender: "ai",
          text: result.text || "我收到啦！",
          type: "text",
          timestamp: Date.now(),
        },
      ]);
    } catch (e) {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          sender: "ai",
          text: "网络信号不好，请再说一遍。",
          type: "text",
          timestamp: Date.now(),
        },
      ]);
    } finally {
      setIsLoading(false);
      setTimeout(() => setIsTalking(false), 2000);
    }
  };

  return (
    <>
      {/* 1. Chat Drawer - Floating Clay Panel */}
      {isExpanded && (
        <div
          className="fixed bottom-24 right-4 w-[85vw] max-w-[320px] h-[55vh] clay-card-flat bg-[#f8fafc] z-50 flex flex-col animate-fade-in-up overflow-hidden border-2 border-white"
        >
          {/* Header */}
          <div className="bg-white p-3 border-b border-slate-100 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
              <span className="font-bold text-slate-700 text-xs">A叔 在线</span>
            </div>
            <button
              onClick={() => setIsExpanded(false)}
              className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 hover:bg-slate-200"
              title="关闭聊天"
              aria-label="关闭聊天"
            >
              <Icon name="x" className="w-3 h-3" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#f1f5f9]">
            {messages.length === 0 && (
              <div className="text-center mt-8">
                <p className="text-xs text-slate-400">👋 嗨！我是村官小A</p>
                <p className="text-xs text-slate-400 mt-1">
                  您可以问我路线、历史、或特产哦
                </p>
              </div>
            )}
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex w-full ${
                  m.sender === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`
                                max-w-[85%] px-4 py-2.5 text-sm rounded-2xl shadow-sm
                                ${
                                  m.sender === "user"
                                    ? "bg-slate-800 text-white rounded-br-none"
                                    : "bg-white text-slate-700 rounded-bl-none border border-slate-200"
                                }
                            `}
                >
                  {m.text}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-3 bg-white border-t border-slate-100 flex gap-2">
            <input
              className="flex-1 bg-slate-100 rounded-full px-4 py-2 text-xs outline-none focus:ring-2 focus:ring-slate-300 transition-all text-slate-700 placeholder-slate-400"
              placeholder="输入问题..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
            />
            <button
              onClick={() => handleSendMessage()}
              className="w-8 h-8 rounded-full bg-slate-800 text-white flex items-center justify-center shadow-lg active:scale-90 transition"
              title="发送消息"
              aria-label="发送消息"
            >
              <Icon name="arrow-left" className="w-3 h-3 rotate-90" />
            </button>
          </div>
        </div>
      )}

      {/* 2. Dynamic Island (Bottom Fixed) - Deep Clay Style */}
      <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-40 w-[92%] max-w-[380px]">
        {/* The Big Avatar (Floating on top) - Now using CSS Animated Component */}
        <div
          onClick={() => setIsExpanded(!isExpanded)}
          className={`
                    absolute left-2 -top-12 w-24 h-24 transition-transform duration-300 cursor-pointer z-50
                    ${
                      isTalking
                        ? "animate-bounce"
                        : "animate-[float-avatar_4s_ease-in-out_infinite]"
                    }
                `}
          style={{ filter: "drop-shadow(0 8px 12px rgba(0,0,0,0.2))" }}
        >
          {/* Replaced static img with UncleAvatar */}
          <UncleAvatar className="w-full h-full" isTalking={isTalking} />
          <div className="absolute bottom-3 right-4 w-3 h-3 bg-green-500 rounded-full border-2 border-white animate-pulse"></div>
        </div>

        {/* The Island Capsule */}
        <div className="clay-panel-dark h-16 flex items-center justify-between pl-24 pr-3 relative">
          <div className="flex flex-col justify-center">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
              AI 伴游中
            </span>
            <span className="text-xs font-bold text-white/90 truncate max-w-[140px] mt-0.5">
              {hookWords[0] || "我是A叔，我在听..."}
            </span>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => handleSendMessage("推荐路线")}
              className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 active:scale-95 transition"
              title="推荐路线"
              aria-label="推荐路线"
            >
              <Icon name="map" className="w-5 h-5 text-white" />
            </button>
            <button
              onClick={() => setIsExpanded(true)}
              className="w-10 h-10 bg-teal-500 rounded-full flex items-center justify-center text-white shadow-lg active:scale-95 transition hover:bg-teal-400"
              title="打开麦克风"
              aria-label="打开麦克风"
            >
              <Icon name="microphone" className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default BottomChatWidget;
