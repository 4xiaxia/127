// 狡猾的胶囊输入框 - 智能语音/文字区分
// 军工品质，极简高效

import React, { useState, useRef, useEffect } from 'react';
import { agentCoordinator, InputType } from '../services/AgentCoordinationManager';
import { Button, Input, message } from 'antd';
import { AudioOutlined, SendOutlined } from '@ant-design/icons';

// 输入模式检测配置
interface InputDetectionConfig {
  minVoiceLength: number;      // 最小语音长度
  voiceKeywords: string[];     // 语音关键词
  textIndicators: string[];     // 文字指示器
  confidenceThreshold: number;  // 语音识别置信度阈值
}

// 输入状态接口
interface InputState {
  mode: InputType;
  confidence: number;
  isProcessing: boolean;
  lastInput: string;
  timestamp: number;
}

const SmartInputBox: React.FC = () => {
  const [inputText, setInputText] = useState('');
  const [inputState, setInputState] = useState<InputState>({
    mode: InputType.TEXT,
    confidence: 0,
    isProcessing: false,
    lastInput: '',
    timestamp: 0
  });
  
  const textareaRef = useRef<any>(null);
  const recognitionRef = useRef<any>(null);
  
  // 输入检测配置
  const detectionConfig: InputDetectionConfig = {
    minVoiceLength: 3,
    voiceKeywords: ['帮我', '请问', '想要', '需要', '告诉'],
    textIndicators: ['?', '？', '!', '！', '。', '怎么', '什么', '哪里'],
    confidenceThreshold: 0.7
  };

  // 初始化语音识别
  useEffect(() => {
    if (typeof window !== 'undefined' && 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'zh-CN';
      
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        const confidence = event.results[0][0].confidence;
        
        handleVoiceInput(transcript, confidence);
      };
      
      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        message.error('语音识别失败，请使用文字输入');
        setInputState(prev => ({ ...prev, isProcessing: false }));
      };
      
      recognition.onend = () => {
        setInputState(prev => ({ ...prev, isProcessing: false }));
      };
      
      recognitionRef.current = recognition;
    } else {
      console.warn('Speech recognition not supported');
    }
  }, []);

  // 智能输入模式检测
  const detectInputMode = (input: string): { mode: InputType; confidence: number } => {
    // 1. 检查语音特征
    const voiceScore = calculateVoiceScore(input);
    
    // 2. 检查文字特征
    const textScore = calculateTextScore(input);
    
    // 3. 综合判断
    if (voiceScore > textScore && voiceScore > detectionConfig.confidenceThreshold) {
      return { mode: InputType.VOICE, confidence: voiceScore };
    } else {
      return { mode: InputType.TEXT, confidence: textScore };
    }
  };

  // 计算语音特征分数
  const calculateVoiceScore = (input: string): number => {
    let score = 0;
    
    // 包含语音关键词
    detectionConfig.voiceKeywords.forEach(keyword => {
      if (input.includes(keyword)) {
        score += 0.3;
      }
    });
    
    // 长度适中（语音通常较长）
    if (input.length >= detectionConfig.minVoiceLength && input.length <= 50) {
      score += 0.2;
    }
    
    // 口语化特征
    if (/[嗯啊呃哦额呣嗯]/.test(input)) {
      score += 0.3;
    }
    
    // 句式特征（语音常用句式）
    if (/(帮我|请问|我想|能不能|可不可以)/.test(input)) {
      score += 0.2;
    }
    
    return Math.min(score, 1);
  };

  // 计算文字特征分数
  const calculateTextScore = (input: string): number => {
    let score = 0.3; // 基础分
    
    // 包含疑问词
    detectionConfig.textIndicators.forEach(indicator => {
      if (input.includes(indicator)) {
        score += 0.2;
      }
    });
    
    // 简短直接
    if (input.length < 20) {
      score += 0.2;
    }
    
    // 关键词密集
    const keywords = input.split(/[，。！？]/).filter(word => word.length > 0);
    if (keywords.length <= 3) {
      score += 0.3;
    }
    
    return Math.min(score, 1);
  };

  // 处理语音输入
  const handleVoiceInput = (transcript: string, confidence: number) => {
    setInputText(transcript);
    
    const { mode, confidence: detectedConfidence } = detectInputMode(transcript);
    setInputState({
      mode,
      confidence: Math.max(confidence, detectedConfidence),
      isProcessing: false,
      lastInput: transcript,
      timestamp: Date.now()
    });
  };

  // 开始语音识别
  const startVoiceRecognition = () => {
    if (!recognitionRef.current) {
      message.error('您的浏览器不支持语音识别');
      return;
    }
    
    try {
      setInputState(prev => ({ ...prev, isProcessing: true }));
      recognitionRef.current.start();
    } catch (error) {
      console.error('Start recognition error:', error);
      message.error('语音识别启动失败');
      setInputState(prev => ({ ...prev, isProcessing: false }));
    }
  };

  // 停止语音识别
  const stopVoiceRecognition = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  };

  // 手动切换输入模式
  const switchInputMode = (mode: InputType) => {
    setInputState(prev => ({
      ...prev,
      mode,
      confidence: mode === InputType.VOICE ? 0.5 : 0.8
    }));
    
    if (mode === InputType.VOICE) {
      startVoiceRecognition();
    } else {
      stopVoiceRecognition();
    }
  };

  // 处理输入变化
  const handleInputChange = (value: string) => {
    setInputText(value);
    
    // 实时检测输入模式
    const { mode, confidence } = detectInputMode(value);
    setInputState(prev => ({
      ...prev,
      mode,
      confidence,
      lastInput: value,
      timestamp: Date.now()
    }));
  };

  // 发送输入
  const handleSend = async () => {
    if (!inputText.trim()) {
      message.warning('请输入内容');
      return;
    }

    try {
      // 确定输出格式
      const outputFormat = inputState.mode === InputType.VOICE ? 'voice' : 'text';
      
      // 通过Agent统筹管理器处理
      const result = await agentCoordinator.processInput({
        type: inputState.mode,
        content: inputText.trim(),
        outputFormat,
        sessionId: `session_${Date.now()}`,
        timestamp: Date.now()
      });

      // 显示结果
      if (result.success !== false) {
        message.success(`${inputState.mode === InputType.VOICE ? '语音' : '文字'}处理完成`);
        
        // 清空输入
        setInputText('');
        setInputState(prev => ({
          ...prev,
          lastInput: '',
          confidence: 0
        }));
      } else {
        message.error(result.error || '处理失败');
      }
      
      // 显示性能信息（调试用）
      console.log('Processing result:', {
        inputMode: inputState.mode,
        outputFormat,
        responseTime: result.responseTime,
        strategy: result.strategy,
        cached: result.cached
      });
      
    } catch (error) {
      console.error('Send error:', error);
      message.error('发送失败，请重试');
    }
  };

  // 获取模式显示文本
  const getModeText = (): string => {
    switch (inputState.mode) {
      case InputType.VOICE:
        return inputState.confidence > 0.7 ? '🎤 语音模式' : '🎤 语音检测中';
      case InputType.TEXT:
        return inputState.confidence > 0.7 ? '⌨️ 文字模式' : '⌨️ 文字模式';
      default:
        return '🔍 检测中';
    }
  };

  // 获取模式颜色
  const getModeColor = (): string => {
    switch (inputState.mode) {
      case InputType.VOICE:
        return inputState.confidence > 0.7 ? '#52c41a' : '#faad14';
      case InputType.TEXT:
        return inputState.confidence > 0.7 ? '#1890ff' : '#d9d9d9';
      default:
        return '#f5222d';
    }
  };

  // 键盘快捷键
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.ctrlKey && e.key === 'Enter') {
      handleSend();
    } else if (e.key === 'Escape') {
      setInputText('');
    }
  };

  return (
    <div style={{
      padding: '20px',
      background: 'white',
      borderRadius: '12px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      maxWidth: '600px',
      margin: '0 auto'
    }}>
      {/* 输入模式指示器 */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '16px',
        padding: '12px 16px',
        background: '#f5f5f5',
        borderRadius: '8px',
        border: `2px solid ${getModeColor()}`
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <span style={{
            fontSize: '14px',
            fontWeight: '500',
            color: getModeColor()
          }}>
            {getModeText()}
          </span>
          <span style={{
            fontSize: '12px',
            color: '#666',
            background: '#e6f7ff',
            padding: '2px 6px',
            borderRadius: '4px'
          }}>
            置信度: {(inputState.confidence * 100).toFixed(0)}%
          </span>
        </div>
        
        <div style={{
          display: 'flex',
          gap: '8px'
        }}>
          <Button
            type={inputState.mode === InputType.VOICE ? 'primary' : 'default'}
            size="small"
            icon={<AudioOutlined />}
            onClick={() => switchInputMode(InputType.VOICE)}
            loading={inputState.isProcessing}
          >
            语音
          </Button>
          <Button
            type={inputState.mode === InputType.TEXT ? 'primary' : 'default'}
            size="small"
            onClick={() => switchInputMode(InputType.TEXT)}
          >
            文字
          </Button>
        </div>
      </div>

      {/* 输入区域 */}
      <div style={{
        position: 'relative',
        marginBottom: '16px'
      }}>
        <Input.TextArea
          ref={textareaRef}
          value={inputText}
          onChange={(e) => handleInputChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={
            inputState.mode === InputType.VOICE 
              ? '🎤 请说话，系统会自动识别您的语音输入...'
              : '⌨️ 请输入您的问题...'
          }
          style={{
            fontSize: '16px',
            padding: '16px',
            borderRadius: '8px',
            border: `2px solid ${getModeColor()}`,
            minHeight: '120px'
          }}
          disabled={inputState.isProcessing}
        />
        
        {/* 语音识别状态指示器 */}
        {inputState.isProcessing && (
          <div style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            color: '#52c41a'
          }}>
            <span style={{
              fontSize: '12px',
              animation: 'pulse 1.5s infinite'
            }}>
              🎤 正在听取...
            </span>
          </div>
        )}
      </div>

      {/* 发送按钮 */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        gap: '12px'
      }}>
        <Button
          type="primary"
          size="large"
          icon={<SendOutlined />}
          onClick={handleSend}
          disabled={!inputText.trim() || inputState.isProcessing}
          style={{
            minWidth: '120px',
            height: '48px',
            fontSize: '16px',
            fontWeight: '500'
          }}
        >
          {inputState.mode === InputType.VOICE ? '发送语音' : '发送文字'}
        </Button>
        
        {/* 快速清除按钮 */}
        <Button
          size="large"
          onClick={() => setInputText('')}
          style={{
            height: '48px'
          }}
        >
          清空
        </Button>
      </div>

      {/* 使用提示 */}
      <div style={{
        marginTop: '16px',
        padding: '12px',
        background: '#f0f9ff',
        borderRadius: '6px',
        fontSize: '12px',
        color: '#666',
        lineHeight: '1.5'
      }}>
        <strong>💡 使用提示：</strong>
        <ul style={{ margin: '8px 0 0 0 16px', paddingLeft: '16px' }}>
          <li>语音模式适合复杂问题和长内容输入</li>
          <li>文字模式适合精确查询和关键词搜索</li>
          <li>系统会智能识别您的输入类型并自动切换</li>
          <li>支持快捷键：Ctrl+Enter 发送，Esc 清空</li>
        </ul>
      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes pulse {
            0% { opacity: 1; }
            50% { opacity: 0.5; }
            100% { opacity: 1; }
          }
        `
      }} />
    </div>
  );
};

export default SmartInputBox;
