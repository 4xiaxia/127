
import React, { useState, useEffect, useRef } from 'react';
import { Spot, VoiceResponse } from '../types';
import * as geminiService from '../services/geminiService';
import { Icon } from './common/Icon';
import { Spinner } from './common/Spinner';
import { decode, decodeAudioData } from '../utils/audioUtils';

interface ChatMessage {
    sender: 'user' | 'ai';
    text: string;
    audio?: string;
}

const ChatBubble: React.FC<{ message: ChatMessage; isPlaying: boolean; onPlay: () => void }> = ({ message, isPlaying, onPlay }) => {
  if (message.sender === 'user') {
    return (
      <div className="flex justify-end animate-fade-in-up" style={{ animationDuration: '0.3s' }}>
        <div className="bg-teal-500 text-white rounded-lg rounded-br-none px-4 py-3 shadow-premium-sm max-w-[85%]">
          {message.text}
        </div>
      </div>
    );
  }
  return (
    <div className="flex justify-start animate-fade-in-up" style={{ animationDuration: '0.3s' }}>
      <div className="bg-white text-gray-800 rounded-lg rounded-bl-none px-4 py-3 shadow-premium-sm max-w-[85%]">
        <p>{message.text}</p>
        <button 
            onClick={onPlay}
            className={`mt-2 flex items-center space-x-1 text-xs px-2 py-1 rounded-full border transition-colors
                ${isPlaying ? 'bg-teal-50 border-teal-200 text-teal-600 animate-pulse' : 'bg-gray-50 border-gray-200 text-gray-500 hover:bg-teal-50 hover:text-teal-500'}
            `}
        >
            <Icon name={isPlaying ? 'pause' : 'play'} className="w-3 h-3" />
            <span>{isPlaying ? '正在播放...' : '播放语音'}</span>
        </button>
      </div>
    </div>
  );
};

interface FloatingAgentBarProps {
    spot: Spot | null;
    activeQuestion?: string | null;
    onQuestionHandled?: () => void;
    bottomOffset?: number; // New prop for dynamic positioning
}

const FloatingAgentBar: React.FC<FloatingAgentBarProps> = ({ spot, activeQuestion, onQuestionHandled, bottomOffset = 0 }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  
  const [playingIndex, setPlayingIndex] = useState<number | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const synthRef = useRef<SpeechSynthesis | null>(typeof window !== 'undefined' ? window.speechSynthesis : null);

  const chatEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  const suggestedQuestions = [
    "这个景点的历史背景是什么？",
    "最佳游览时间是多久？",
    "拍照的最佳位置在哪里？"
  ];

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  useEffect(() => {
      if (activeQuestion && !isLoading) {
          if (!isOpen) setIsOpen(true);
          handleSendMessage(activeQuestion);
          if (onQuestionHandled) onQuestionHandled();
      }
  }, [activeQuestion]);

  useEffect(() => {
      return () => {
          if (audioSourceRef.current) {
              try { audioSourceRef.current.stop(); } catch (e) {}
          }
          if (synthRef.current && synthRef.current.speaking) {
              synthRef.current.cancel();
          }
      };
  }, []);

  const getBestVoice = () => {
    if (!synthRef.current) return null;
    const voices = synthRef.current.getVoices();
    return voices.find(v => v.lang === 'zh-CN') || voices[0];
  };

  const handlePlayAudio = async (base64: string | undefined, text: string, index: number) => {
     if (audioSourceRef.current) {
         try { audioSourceRef.current.stop(); } catch (e) {}
         audioSourceRef.current = null;
     }
     if (synthRef.current) synthRef.current.cancel();
     
     if (playingIndex === index) {
         setPlayingIndex(null);
         return;
     }
     
     setPlayingIndex(index);

     if (base64) {
         try {
            if (!audioContextRef.current || audioContextRef.current.state === 'closed') {
                audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
            }
            if (audioContextRef.current.state === 'suspended') await audioContextRef.current.resume();
            
            const buffer = await decodeAudioData(decode(base64), audioContextRef.current, 24000, 1);
            const source = audioContextRef.current.createBufferSource();
            source.buffer = buffer;
            source.connect(audioContextRef.current.destination);
            source.onended = () => setPlayingIndex(null);
            
            audioSourceRef.current = source;
            source.start(0);
            return;
         } catch (e) {
             console.warn("Audio play failed, falling back to TTS", e);
         }
     }

     if (synthRef.current) {
         const utterance = new SpeechSynthesisUtterance(text);
         const bestVoice = getBestVoice();
         if (bestVoice) utterance.voice = bestVoice;
         utterance.onend = () => setPlayingIndex(null);
         utterance.onerror = () => setPlayingIndex(null);
         synthRef.current.speak(utterance);
     }
  };

  const handleSendMessage = async (questionText?: string) => {
    const textToSend = questionText || inputValue;
    if (!textToSend.trim()) return;

    if (!questionText) setInputValue('');
    
    setMessages(prev => [...prev, { sender: 'user', text: textToSend }]);
    setIsLoading(true);

    try {
      const contextSpotName = spot?.name || '这个地方';
      const response: VoiceResponse = await geminiService.voiceInteraction(contextSpotName, textToSend);
      
      setMessages(prev => {
          const newMsgs = [...prev, { sender: 'ai' as const, text: response.text, audio: response.audio_base_64 }];
          setTimeout(() => handlePlayAudio(response.audio_base_64, response.text, newMsgs.length - 1), 100);
          return newMsgs;
      });

    } catch (error) {
      setMessages(prev => [...prev, { sender: 'ai', text: '抱歉，我现在有点忙，请稍后再试。' }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMicClick = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("您的浏览器暂不支持语音功能");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'zh-CN';
    recognition.continuous = false;
    recognition.interimResults = true;

    recognition.onstart = () => {
        setIsListening(true);
        setInputValue('');
    };
    recognition.onend = () => setIsListening(false);
    recognition.onresult = (event: any) => {
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
                finalTranscript += event.results[i][0].transcript;
            } else {
                finalTranscript += event.results[i][0].transcript;
            }
        }
        setInputValue(finalTranscript);
    };
    recognition.onerror = (event: any) => {
        setIsListening(false);
        if (event.error === 'not-allowed') {
             alert("无法访问麦克风。");
        }
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  if (!isOpen) {
    return (
      <div 
        className="fixed right-4 z-40 animate-fade-in-up" 
        style={{ 
            animationDelay: '0.5s',
            // Default 96px (bottom-24) + offset
            bottom: `${96 + bottomOffset}px` 
        }}
      >
        <button
          onClick={() => setIsOpen(true)}
          className="bg-gradient-to-br from-teal-500 to-cyan-600 text-white rounded-full shadow-premium-xl p-3 flex items-center justify-center transition-all transform hover:scale-105"
          style={{ width: '60px', height: '60px' }}
        >
          <Icon name="chat-bubble" className="w-7 h-7 text-white" />
        </button>
      </div>
    );
  }

  return (
    <div 
        className="fixed right-4 z-50 w-[calc(100%-2rem)] max-w-[360px] h-[calc(100%-6rem)] max-h-[600px] bg-gray-50 rounded-2xl shadow-premium-xl flex flex-col animate-fade-in-up border border-white/50 backdrop-blur-md"
        style={{ 
            // Default 16px (bottom-4) + offset
            bottom: `${16 + bottomOffset}px` 
        }}
    >
      <header className="flex-shrink-0 p-4 bg-white rounded-t-2xl flex items-center justify-between border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-full flex items-center justify-center bg-gradient-to-br from-teal-500 to-cyan-600 shadow-lg">
            <Icon name="chat-bubble" className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="font-bold text-gray-800">村官智能体</p>
            <p className="text-xs text-gray-500">您的专属AI导游</p>
          </div>
        </div>
        <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-gray-600"><Icon name="x" className="w-5 h-5" /></button>
      </header>

      <main className="flex-grow p-4 space-y-4 overflow-y-auto scrollbar-hide bg-gray-100/50">
        <div className="p-3 bg-teal-50 border border-teal-200 rounded-lg text-sm text-teal-800">
          <p className="font-semibold mb-2">您可以问：</p>
          <div className="flex flex-wrap gap-2">
            {suggestedQuestions.map((q, i) => (
              <button key={i} onClick={() => handleSendMessage(q)} className="text-xs bg-white border border-teal-300 rounded-full px-3 py-1 hover:bg-teal-100 transition">
                {q}
              </button>
            ))}
          </div>
        </div>
        {messages.map((msg, index) => (
          <ChatBubble key={index} message={msg} isPlaying={playingIndex === index} onPlay={() => handlePlayAudio(msg.audio, msg.text, index)} />
        ))}
        {isLoading && <div className="bg-white rounded-lg px-4 py-3 shadow-sm"><Spinner size="sm"/></div>}
        <div ref={chatEndRef} />
      </main>

      <footer className="flex-shrink-0 p-3 bg-white border-t rounded-b-2xl">
        <div className="flex items-center space-x-2">
          <button
            onClick={handleMicClick}
            className={`p-2 rounded-full transition-all flex-shrink-0 ${isListening ? 'bg-red-100 text-red-500 animate-pulse' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
          >
             <Icon name="microphone" className="w-5 h-5" />
          </button>
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder={isListening ? "正在聆听..." : "输入您的问题..."}
            disabled={isLoading}
            className="flex-grow bg-gray-100 rounded-lg px-4 py-2.5 text-gray-800 border-transparent focus:ring-2 focus:ring-teal-400 outline-none transition-all"
          />
          <button onClick={() => handleSendMessage()} disabled={isLoading || !inputValue.trim()} className="w-10 h-10 rounded-lg flex items-center justify-center bg-teal-500 text-white">
            <Icon name="arrow-left" className="w-5 h-5 transform rotate-90" />
          </button>
        </div>
      </footer>
    </div>
  );
};

export default FloatingAgentBar;
