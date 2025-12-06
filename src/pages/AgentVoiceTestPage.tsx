// Agent语音功能测试页面
// 军工品质，极简高效

import React, { useState, useRef } from 'react';
import { Card, Button, Input, Select, Space, Alert, message, Typography, Divider, Tag } from 'antd';
import { 
  AudioOutlined, 
  PlayCircleOutlined, 
  DownloadOutlined,
  SoundOutlined,
  RobotOutlined
} from '@ant-design/icons';
import { agentCoordinator, InputType } from '../services/AgentCoordinationManager';
import { generateSpeech, getVoices } from '../services/minimaxService';

const { Title, Paragraph, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

interface TestResult {
  input: string;
  mode: InputType;
  voiceId: string;
  response: string;
  audioUrl?: string;
  responseTime: number;
  strategy: string;
  timestamp: number;
}

const AgentVoiceTestPage: React.FC = () => {
  const [testText, setTestText] = useState('东里村有什么好玩的景点？');
  const [selectedVoice, setSelectedVoice] = useState('Chinese (Mandarin)_News_Anchor');
  const [availableVoices, setAvailableVoices] = useState<Array<{id: string, name: string}>>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [audioPlayer, setAudioPlayer] = useState<HTMLAudioElement | null>(null);
  
  const audioRef = useRef<HTMLAudioElement>(null);

  // 初始化语音列表
  React.useEffect(() => {
    const loadVoices = async () => {
      try {
        const voices = await getVoices();
        setAvailableVoices(voices);
      } catch (error) {
        console.error('加载语音列表失败:', error);
        message.error('加载语音列表失败');
      }
    };
    
    loadVoices();
    
    // 创建音频播放器
    const player = new Audio();
    setAudioPlayer(player);
    
    return () => {
      if (player) {
        player.pause();
        player.src = '';
      }
    };
  }, []);

  // 测试Agent语音处理
  const testVoiceProcessing = async (inputMode: InputType) => {
    if (!testText.trim()) {
      message.warning('请输入测试文本');
      return;
    }

    setIsProcessing(true);
    const startTime = Date.now();

    try {
      // 1. 通过Agent统筹管理器处理
      const result = await agentCoordinator.processInput({
        type: inputMode,
        content: testText.trim(),
        outputFormat: 'voice',
        sessionId: `test_${Date.now()}`,
        timestamp: Date.now()
      });

      if (result.success === false) {
        throw new Error(result.error || '处理失败');
      }

      // 2. 生成语音
      const audioUrl = await generateSpeech(result.content, {
        voiceId: selectedVoice,
        speed: 1.0,
        volume: 1.0,
        pitch: 0
      });

      // 3. 记录测试结果
      const testResult: TestResult = {
        input: testText,
        mode: inputMode,
        voiceId: selectedVoice,
        response: result.content,
        audioUrl,
        responseTime: Date.now() - startTime,
        strategy: result.strategy || 'unknown',
        timestamp: Date.now()
      };

      setTestResults(prev => [testResult, ...prev.slice(0, 9)]); // 保留最近10条

      message.success(`语音处理完成！响应时间: ${testResult.responseTime}ms`);

      // 4. 自动播放语音
      if (audioRef.current) {
        audioRef.current.src = audioUrl;
        audioRef.current.play().catch(error => {
          console.error('语音播放失败:', error);
          message.warning('语音播放失败，请手动点击播放');
        });
      }

    } catch (error: any) {
      console.error('语音处理失败:', error);
      message.error(`语音处理失败: ${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  // 播放语音
  const playAudio = (audioUrl: string) => {
    if (audioRef.current) {
      audioRef.current.src = audioUrl;
      audioRef.current.play().catch(error => {
        console.error('语音播放失败:', error);
        message.warning('语音播放失败');
      });
    }
  };

  // 下载音频
  const downloadAudio = async (audioUrl: string, filename: string) => {
    try {
      const response = await fetch(audioUrl);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = `${filename}.mp3`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      message.success('音频下载成功');
    } catch (error) {
      console.error('下载失败:', error);
      message.error('音频下载失败');
    }
  };

  // 清空测试结果
  const clearResults = () => {
    setTestResults([]);
    message.info('测试结果已清空');
  };

  return (
    <div style={{
      padding: '24px',
      background: '#f5f5f5',
      minHeight: '100vh'
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* 页面标题 */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <Title level={2} style={{ color: '#1890ff' }}>
            🤖 Agent语音功能测试
          </Title>
          <Paragraph style={{ color: '#666' }}>
            测试Agent的语音处理能力，包括智能识别、语音合成和播放功能
          </Paragraph>
        </div>

        {/* 测试控制面板 */}
        <Card title="🎯 测试控制面板" style={{ marginBottom: '24px' }}>
          <Space direction="vertical" style={{ width: '100%' }} size="large">
            {/* 输入文本 */}
            <div>
              <Text strong>测试文本：</Text>
              <TextArea
                value={testText}
                onChange={(e) => setTestText(e.target.value)}
                placeholder="请输入要测试的文本..."
                rows={3}
                style={{ marginTop: '8px', width: '100%' }}
                showCount
                maxLength={500}
              />
            </div>

            {/* 语音选择 */}
            <div>
              <Text strong>选择语音：</Text>
              <Select
                value={selectedVoice}
                onChange={setSelectedVoice}
                style={{ width: '300px', marginTop: '8px' }}
                placeholder="选择语音类型"
              >
                {availableVoices.map(voice => (
                  <Option key={voice.id} value={voice.id}>
                    {voice.name}
                  </Option>
                ))}
              </Select>
            </div>

            {/* 测试按钮 */}
            <div>
              <Text strong>测试模式：</Text>
              <div style={{ marginTop: '8px' }}>
                <Space>
                  <Button
                    type="primary"
                    icon={<RobotOutlined />}
                    onClick={() => testVoiceProcessing(InputType.TEXT)}
                    loading={isProcessing}
                    size="large"
                  >
                    文字输入测试
                  </Button>
                  <Button
                    type="primary"
                    icon={<AudioOutlined />}
                    onClick={() => testVoiceProcessing(InputType.VOICE)}
                    loading={isProcessing}
                    size="large"
                    style={{ background: '#52c41a', borderColor: '#52c41a' }}
                  >
                    语音输入测试
                  </Button>
                  <Button
                    icon={<SoundOutlined />}
                    onClick={clearResults}
                    size="large"
                  >
                    清空结果
                  </Button>
                </Space>
              </div>
            </div>
          </Space>
        </Card>

        {/* 测试提示 */}
        <Alert
          message="💡 测试建议"
          description={
            <ul>
              <li>测试相似问题：东里村在哪、东里村在什么地方、东里村位置</li>
              <li>测试复杂查询：推荐几个景点、比较一下东里村和西湖</li>
              <li>测试语音功能：检查语音合成的自然度和清晰度</li>
              <li>测试缓存效果：重复相同问题，观察响应时间变化</li>
            </ul>
          }
          type="info"
          showIcon
          style={{ marginBottom: '24px' }}
        />

        {/* 测试结果 */}
        <Card 
          title="📋 测试结果记录" 
          extra={
            <Text type="secondary">
              最近 {testResults.length} 条记录
            </Text>
          }
          style={{ marginBottom: '24px' }}
        >
          {testResults.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
              暂无测试记录，请先进行测试
            </div>
          ) : (
            <Space direction="vertical" style={{ width: '100%' }} size="middle">
              {testResults.map((result, index) => (
                <Card
                  key={result.timestamp}
                  size="small"
                  style={{ 
                    background: index === 0 ? '#f0f9ff' : '#fafafa',
                    border: index === 0 ? '1px solid #1890ff' : '1px solid #d9d9d9'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ marginBottom: '8px' }}>
                        <Text strong>输入：</Text>
                        <Text code>{result.input}</Text>
                        <Tag 
                          color={result.mode === 'voice' ? 'green' : 'blue'} 
                          style={{ marginLeft: '8px' }}
                        >
                          {result.mode === 'voice' ? '语音' : '文字'}
                        </Tag>
                        <Tag color="purple" style={{ marginLeft: '4px' }}>
                          {result.strategy}
                        </Tag>
                      </div>
                      
                      <div style={{ marginBottom: '8px' }}>
                        <Text strong>回复：</Text>
                        <Text>{result.response}</Text>
                      </div>
                      
                      <div>
                        <Text type="secondary" style={{ fontSize: '12px' }}>
                          语音: {availableVoices.find(v => v.id === result.voiceId)?.name || result.voiceId} | 
                          响应时间: {result.responseTime}ms |
                          {new Date(result.timestamp).toLocaleTimeString()}
                        </Text>
                      </div>
                    </div>
                    
                    <Space>
                      {result.audioUrl && (
                        <>
                          <Button
                            type="primary"
                            icon={<PlayCircleOutlined />}
                            size="small"
                            onClick={() => playAudio(result.audioUrl!)}
                          >
                            播放
                          </Button>
                          <Button
                            icon={<DownloadOutlined />}
                            size="small"
                            onClick={() => downloadAudio(result.audioUrl!, `voice_test_${index + 1}`)}
                          >
                            下载
                          </Button>
                        </>
                      )}
                    </Space>
                  </div>
                </Card>
              ))}
            </Space>
          )}
        </Card>

        {/* 性能统计 */}
        {testResults.length > 0 && (
          <Card title="📊 性能统计">
            <div style={{ display: 'flex', justifyContent: 'space-around' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1890ff' }}>
                  {testResults.length}
                </div>
                <div>总测试次数</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#52c41a' }}>
                  {Math.round(testResults.reduce((sum, r) => sum + r.responseTime, 0) / testResults.length)}ms
                </div>
                <div>平均响应时间</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#722ed1' }}>
                  {testResults.filter(r => r.mode === InputType.VOICE).length}
                </div>
                <div>语音测试次数</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#fa8c16' }}>
                  {testResults.filter(r => r.strategy.includes('cache')).length}
                </div>
                <div>缓存命中次数</div>
              </div>
            </div>
          </Card>
        )}
      </div>

      {/* 隐藏的音频播放器 */}
      <audio ref={audioRef} style={{ display: 'none' }} />
    </div>
  );
};

export default AgentVoiceTestPage;
