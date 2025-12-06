import React, { useState } from 'react';
import { Icon } from './common/Icon';
import { Spinner } from './common/Spinner';
import { generateSpeech } from '../services/minimaxService';

interface MiniMaxVoiceButtonProps {
  text: string;
  voiceId?: string;
  className?: string;
  onGenerated?: (audioPath: string) => void;
}

export function MiniMaxVoiceButton({ 
  text, 
  voiceId = 'Chinese (Mandarin)_News_Anchor',
  className = '',
  onGenerated 
}: MiniMaxVoiceButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [audioPath, setAudioPath] = useState<string>('');
  const [isPlaying, setIsPlaying] = useState(false);

  const handleGenerateSpeech = async () => {
    setIsGenerating(true);
    setAudioPath('');
    
    try {
      // 使用我们的 MiniMax 服务生成语音
      const audioUrl = await generateSpeech(text, { voiceId });
      setAudioPath(audioUrl);
      if (onGenerated) {
        onGenerated(audioUrl);
      }
    } catch (error) {
      console.error('语音生成失败:', error);
      // 降级方案：使用浏览器内置 TTS
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'zh-CN';
        utterance.rate = 1.0;
        speechSynthesis.speak(utterance);
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const playAudio = () => {
    if (audioPath) {
      const audio = new Audio(audioPath);
      audio.play();
      setIsPlaying(true);
      audio.onended = () => setIsPlaying(false);
    }
  };

  return (
    <button
      onClick={audioPath ? playAudio : handleGenerateSpeech}
      disabled={isGenerating}
      className={`inline-flex items-center justify-center p-2 rounded-lg transition-all ${
        isGenerating 
          ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
          : 'bg-blue-50 hover:bg-blue-100 text-blue-600'
      } ${className}`}
      title={audioPath ? '播放语音' : '生成语音'}
    >
      {isGenerating ? (
        <Spinner size="sm" />
      ) : audioPath ? (
        <Icon name="play" className="w-4 h-4" />
      ) : (
        <Icon name="microphone" className="w-4 h-4" />
      )}
    </button>
  );
}
