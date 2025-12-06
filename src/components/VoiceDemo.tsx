import React, { useState } from 'react';
import { MiniMaxVoiceButton } from './MiniMaxVoiceButton';
import { Icon } from './common/Icon';

export function VoiceDemo() {
  const [message, setMessage] = useState('');
  const [generatedAudioPath, setGeneratedAudioPath] = useState('');

  const demoTexts = [
    "欢迎使用东里村智能导游系统！",
    "这里是我们美丽的古樟树，已有300年历史。",
    "请问有什么可以帮助您的吗？",
    "祝您在东里村玩得愉快！"
  ];

  const availableVoices = [
    { id: 'Chinese (Mandarin)_News_Anchor', name: '中文新闻主播' },
    { id: 'Chinese (Mandarin)_Warm_Girl', name: '温暖女生' },
    { id: 'Chinese (Mandarin)_Male_Announcer', name: '男播音员' },
    { id: 'English_FriendlyPerson', name: '英语友好声' }
  ];

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      {/* 标题 */}
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold text-gray-800">MiniMax 语音交互演示</h1>
        <p className="text-gray-600">点击喇叭图标即可将文字转换为语音</p>
      </div>

      {/* 输入区域 */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            输入要转换的文字：
          </label>
          <div className="flex space-x-2">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="请输入文字..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <MiniMaxVoiceButton 
              text={message || "请输入文字"} 
              onGenerated={setGeneratedAudioPath}
              className="px-4"
            />
          </div>
        </div>

        {/* 生成的音频文件路径 */}
        {generatedAudioPath && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center space-x-2">
              <Icon name="check-circle" className="w-4 h-4 text-green-600" />
              <span className="text-sm text-green-800">
                音频已生成: {generatedAudioPath.split('\\').pop()}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* 预设文字 */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="font-medium text-gray-800 mb-4">快速测试</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {demoTexts.map((text, index) => (
            <div 
              key={index}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
            >
              <span className="text-sm text-gray-700 truncate flex-1">{text}</span>
              <MiniMaxVoiceButton text={text} className="ml-2" />
            </div>
          ))}
        </div>
      </div>

      {/* 语音选择演示 */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="font-medium text-gray-800 mb-4">不同语音效果</h3>
        <div className="space-y-3">
          {availableVoices.map((voice) => (
            <div 
              key={voice.id}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
            >
              <div>
                <div className="font-medium text-gray-800">{voice.name}</div>
                <div className="text-xs text-gray-500">{voice.id}</div>
              </div>
              <MiniMaxVoiceButton 
                text={`这是${voice.name}的语音测试`} 
                voiceId={voice.id}
                className="ml-2" 
              />
            </div>
          ))}
        </div>
      </div>

      {/* 使用说明 */}
      <div className="bg-blue-50 rounded-xl border border-blue-200 p-6">
        <h3 className="font-medium text-blue-800 mb-3">集成说明</h3>
        <div className="space-y-2 text-sm text-blue-700">
          <p>✅ MiniMax MCP服务器已成功安装并配置</p>
          <p>✅ 支持200+种语音，包括中文、英文、日文、韩文等</p>
          <p>✅ 生成的音频文件保存在: C:\Users\Administrator\Desktop\MiniMax-Output</p>
          <p>✅ 支持文本转语音、语音克隆、图像生成等功能</p>
        </div>
        
        <div className="mt-4 p-3 bg-blue-100 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-2">在您的应用中使用：</h4>
          <code className="block text-xs bg-white p-2 rounded border border-blue-300">
{`import { MiniMaxVoiceButton } from './components/MiniMaxVoiceButton';

// 基本用法
<MiniMaxVoiceButton text="要转换的文字" />

// 自定义语音
<MiniMaxVoiceButton 
  text="自定义文字" 
  voiceId="Chinese (Mandarin)_News_Anchor"
  onGenerated={(audioPath) => console.log('音频已生成:', audioPath)}
/>`}
          </code>
        </div>
      </div>
    </div>
  );
}
