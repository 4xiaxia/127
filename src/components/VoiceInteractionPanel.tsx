
import React, { useState, useEffect, useRef } from 'react';
import { Icon } from './common/Icon';
import { Spinner } from './common/Spinner';
import * as geminiService from '../services/geminiService';
import { decode, decodeAudioData } from '../utils/audioUtils';

interface VoiceInteractionPanelProps {
  onVoiceCommand: (command: any) => void;
  onRecordingStatusChange: (status: boolean) => void;
}

export function VoiceInteractionPanel({ 
  onVoiceCommand, 
  onRecordingStatusChange 
}: VoiceInteractionPanelProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentCommand, setCurrentCommand] = useState('');
  const [voiceSettings, setVoiceSettings] = useState({
    language: 'zh-CN',
    voice: 'male-qn-qingse',
    speed: 1.0,
    volume: 1.0,
    pitch: 0,
    emotion: 'happy'
  });
  const [isPlaying, setIsPlaying] = useState(false);
  
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioSourceRef = useRef<AudioBufferSourceNode | null>(null);

  // Initialize Speech Recognition
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = voiceSettings.language;
      
      recognitionRef.current.onresult = (event: Event) => {
        const speechEvent = event as SpeechRecognitionEvent;
        const transcript = Array.from(speechEvent.results)
          .map((result: any) => result[0].transcript)
          .join('');
        
        setCurrentCommand(transcript);

        if (speechEvent.results[0].isFinal) {
          setIsProcessing(true);
          onVoiceCommand({
            text: transcript,
            timestamp: new Date().toISOString()
          });
          setTimeout(() => setIsProcessing(false), 1000);
        }
      };
      
      recognitionRef.current.onerror = (event: Event) => {
        const errorEvent = event as SpeechRecognitionErrorEvent;
        if (errorEvent.error !== 'aborted') {
            console.error('语音识别错误:', errorEvent.error);
        }
        setIsRecording(false);
        onRecordingStatusChange(false);
      };
      
      recognitionRef.current.onend = () => {
        setIsRecording(false);
        onRecordingStatusChange(false);
      };
    }
  }, [voiceSettings.language]);

  // Start Recording
  const startRecording = () => {
    if (recognitionRef.current && !isRecording) {
      try {
        recognitionRef.current.start();
        setIsRecording(true);
        onRecordingStatusChange(true);
        setCurrentCommand('');
      } catch (e) {
        console.error("Failed to start recording", e);
      }
    } else if (!recognitionRef.current) {
      alert("您的浏览器不支持语音识别");
    }
  };

  // Stop Recording
  const stopRecording = () => {
    if (recognitionRef.current && isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
      onRecordingStatusChange(false);
    }
  };

  // TTS Logic using geminiService (Client-Side to MiniMax)
  const speakText = async (text: string) => {
    try {
      setIsProcessing(true);
      
      // Call geminiService directly with all settings
      const audioBase64 = await geminiService.generateMinimaxAudio(text, {
          voice_id: voiceSettings.voice,
          speed: voiceSettings.speed,
          vol: voiceSettings.volume,
          pitch: voiceSettings.pitch
      });

      if (audioBase64) {
        if (!audioContextRef.current || audioContextRef.current.state === 'closed') {
            audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
        }
        if (audioContextRef.current.state === 'suspended') {
            await audioContextRef.current.resume();
        }
        
        const audioBytes = decode(audioBase64);
        const buffer = await decodeAudioData(audioBytes, audioContextRef.current, 24000, 1);
        
        const source = audioContextRef.current.createBufferSource();
        source.buffer = buffer;
        source.connect(audioContextRef.current.destination);
        source.onended = () => setIsPlaying(false);
        
        audioSourceRef.current = source;
        source.start(0);
        setIsPlaying(true);
      } else {
        alert("语音生成失败，请检查API配置");
      }
      
    } catch (error) {
      console.error('语音合成失败:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const stopAudio = () => {
    if (audioSourceRef.current) {
      try { audioSourceRef.current.stop(); } catch (e) {}
      setIsPlaying(false);
    }
  };

  return (
    <div className="space-y-6 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Icon name="microphone" className="w-5 h-5 text-blue-500" />
          <h3 className="font-bold text-gray-800">语音交互调试</h3>
        </div>
        <span className={`px-2 py-1 rounded text-xs ${isRecording ? "bg-red-100 text-red-600" : "bg-gray-100 text-gray-600"}`}>
          {isRecording ? '录音中...' : '就绪'}
        </span>
      </div>

      {/* Recording Section */}
      <div className="space-y-3">
          <div className="flex items-center justify-center space-x-4">
            <button
              onClick={isRecording ? stopRecording : startRecording}
              className={`flex items-center px-6 py-3 rounded-full font-bold transition-all transform active:scale-95 ${
                  isRecording 
                  ? "bg-red-500 hover:bg-red-600 text-white shadow-lg ring-4 ring-red-100" 
                  : "bg-blue-500 hover:bg-blue-600 text-white shadow-md"
              }`}
              disabled={isProcessing}
            >
              <Icon name="microphone" className="w-5 h-5 mr-2" />
              <span>{isRecording ? '停止录音' : '开始录音'}</span>
            </button>
          </div>
          
          <div className="min-h-[40px] p-3 bg-gray-50 rounded-lg border border-dashed border-gray-300 text-center text-sm text-gray-600">
             {currentCommand || "请点击开始录音，然后说话..."}
          </div>
      </div>

      <hr className="border-gray-100" />

      {/* TTS Settings Section */}
      <div className="space-y-4">
          <h4 className="text-sm font-bold text-gray-700">语音合成参数</h4>
          
          <div className="grid grid-cols-2 gap-4">
            {/* Voice Selection */}
            <div>
              <label className="text-xs text-gray-500 mb-1 block">音色 (Voice)</label>
              <select 
                value={voiceSettings.voice}
                onChange={(e) => setVoiceSettings(prev => ({ ...prev, voice: e.target.value }))}
                className="w-full text-xs px-2 py-2 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-200"
              >
                <option value="male-qn-qingse">青涩男声 (标准)</option>
                <option value="female-shaonvivi">少女依依</option>
                <option value="male-qn-jingying">精英男声</option>
                <option value="female-yujie">御姐音</option>
                <option value="presenter_male">男主播</option>
                <option value="presenter_female">女主播</option>
              </select>
            </div>
            
            {/* Speed Control */}
            <div>
              <label className="text-xs text-gray-500 mb-1 flex justify-between">
                  <span>语速 (Speed)</span>
                  <span className="font-mono text-blue-600">{voiceSettings.speed}x</span>
              </label>
              <input
                type="range"
                min="0.5"
                max="2.0"
                step="0.1"
                value={voiceSettings.speed}
                onChange={(e) => setVoiceSettings(prev => ({ ...prev, speed: parseFloat(e.target.value) }))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
            </div>

            {/* Volume Control */}
            <div>
              <label className="text-xs text-gray-500 mb-1 flex justify-between">
                  <span>音量 (Vol)</span>
                  <span className="font-mono text-blue-600">{voiceSettings.volume}</span>
              </label>
              <input
                type="range"
                min="0.1"
                max="2.0"
                step="0.1"
                value={voiceSettings.volume}
                onChange={(e) => setVoiceSettings(prev => ({ ...prev, volume: parseFloat(e.target.value) }))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-green-500"
              />
            </div>

            {/* Pitch Control */}
            <div>
              <label className="text-xs text-gray-500 mb-1 flex justify-between">
                  <span>音调 (Pitch)</span>
                  <span className="font-mono text-blue-600">{voiceSettings.pitch}</span>
              </label>
              <input
                type="range"
                min="-12"
                max="12"
                step="1"
                value={voiceSettings.pitch}
                onChange={(e) => setVoiceSettings(prev => ({ ...prev, pitch: parseFloat(e.target.value) }))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-500"
              />
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => speakText("欢迎来到东里村，我是您的智能导游。")}
              disabled={isProcessing || isPlaying}
              className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs font-medium text-gray-700 hover:bg-gray-50 active:bg-gray-100 transition flex items-center justify-center"
            >
              <Icon name="play" className="w-3 h-3 mr-1" />
              试听：欢迎词
            </button>
            
            <button
              onClick={() => speakText(currentCommand || "您好，请问有什么可以帮您？")}
              disabled={isProcessing || isPlaying || !currentCommand}
              className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs font-medium text-gray-700 hover:bg-gray-50 active:bg-gray-100 transition flex items-center justify-center"
            >
               <Icon name="play" className="w-3 h-3 mr-1" />
               试听：当前文本
            </button>
          </div>
          
          {isPlaying && (
              <button 
                onClick={stopAudio}
                className="w-full py-2 bg-red-50 text-red-600 text-xs font-bold rounded-lg hover:bg-red-100 transition"
              >
                  停止播放
              </button>
          )}
      </div>

      {/* Status Indicators */}
      <div className="grid grid-cols-3 gap-2 text-[10px] text-gray-500">
         <div className="flex items-center space-x-1 bg-gray-50 px-2 py-1 rounded">
             <div className={`w-2 h-2 rounded-full ${isRecording ? 'bg-red-500' : 'bg-gray-300'}`}></div>
             <span>录音</span>
         </div>
         <div className="flex items-center space-x-1 bg-gray-50 px-2 py-1 rounded">
             <div className={`w-2 h-2 rounded-full ${isProcessing ? 'bg-yellow-500' : 'bg-gray-300'}`}></div>
             <span>处理</span>
         </div>
         <div className="flex items-center space-x-1 bg-gray-50 px-2 py-1 rounded">
             <div className={`w-2 h-2 rounded-full ${isPlaying ? 'bg-green-500' : 'bg-gray-300'}`}></div>
             <span>播放</span>
         </div>
      </div>
    </div>
  );
}
