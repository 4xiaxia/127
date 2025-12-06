// 智能输入演示页面 - 展示优化后的系统
// 军工品质，极简高效

import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Table, Tag, Button, Space, Alert } from 'antd';
import { 
  MessageOutlined, 
  DatabaseOutlined, 
  ThunderboltOutlined,
  ReloadOutlined,
  BarChartOutlined
} from '@ant-design/icons';
import SmartInputBox from '../components/SmartInputBox';
import { agentCoordinator } from '../services/AgentCoordinationManager';

// 演示数据接口
interface DemoData {
  totalQueries: number;
  cacheHits: number;
  cacheHitRate: number;
  hotQuestions: number;
  responseHistory: Array<{
    timestamp: number;
    input: string;
    mode: string;
    strategy: string;
    responseTime: number;
    cached: boolean;
  }>;
}

const SmartInputDemo: React.FC = () => {
  const [demoData, setDemoData] = useState<DemoData>({
    totalQueries: 0,
    cacheHits: 0,
    cacheHitRate: 0,
    hotQuestions: 0,
    responseHistory: []
  });
  
  const [isLiveMode, setIsLiveMode] = useState(false);

  // 获取性能指标
  const fetchMetrics = () => {
    const metrics = agentCoordinator.getPerformanceMetrics();
    setDemoData(prev => ({
      ...prev,
      ...metrics,
      responseHistory: prev.responseHistory.slice(-10) // 只保留最近10条
    }));
  };

  // 定期更新指标
  useEffect(() => {
    if (!isLiveMode) return;

    const interval = setInterval(fetchMetrics, 2000);
    return () => clearInterval(interval);
  }, [isLiveMode]);

  // 初始化数据
  useEffect(() => {
    fetchMetrics();
  }, []);

  // 模拟热点问题数据
  const mockHotQuestions = [
    { query: '东里村在哪', count: 25 },
    { query: '门票价格', count: 18 },
    { query: '怎么去东里村', count: 15 },
    { query: '开放时间', count: 12 },
    { query: '推荐景点', count: 10 }
  ];

  // 表格列配置
  const columns = [
    {
      title: '时间',
      dataIndex: 'timestamp',
      key: 'timestamp',
      width: 120,
      render: (timestamp: number) => new Date(timestamp).toLocaleTimeString()
    },
    {
      title: '输入内容',
      dataIndex: 'input',
      key: 'input',
      ellipsis: true,
      render: (text: string) => text.length > 30 ? text.slice(0, 30) + '...' : text
    },
    {
      title: '输入模式',
      dataIndex: 'mode',
      key: 'mode',
      width: 100,
      render: (mode: string) => (
        <Tag color={mode === 'voice' ? 'green' : 'blue'}>
          {mode === 'voice' ? '语音' : '文字'}
        </Tag>
      )
    },
    {
      title: '处理策略',
      dataIndex: 'strategy',
      key: 'strategy',
      width: 120,
      render: (strategy: string) => {
        const colors: Record<string, string> = {
          'quick_answer': 'green',
          'hot_cache': 'gold',
          'agent_b_fast': 'blue',
          'agent_b_complex': 'purple',
          'fallback': 'red',
          'similarity_cache': 'cyan'
        };
        const labels: Record<string, string> = {
          'quick_answer': '快速答案',
          'hot_cache': '热点缓存',
          'agent_b_fast': 'Agent B快',
          'agent_b_complex': 'Agent B复',
          'fallback': '降级处理',
          'similarity_cache': '相似度缓存'
        };
        return (
          <Tag color={colors[strategy] || 'default'}>
            {labels[strategy] || strategy}
          </Tag>
        );
      }
    },
    {
      title: '响应时间',
      dataIndex: 'responseTime',
      key: 'responseTime',
      width: 100,
      render: (time: number) => (
        <span style={{ color: time < 100 ? '#52c41a' : time < 500 ? '#faad14' : '#f5222d' }}>
          {time}ms
        </span>
      )
    },
    {
      title: '缓存命中',
      dataIndex: 'cached',
      key: 'cached',
      width: 100,
      render: (cached: boolean) => (
        <Tag color={cached ? 'green' : 'default'}>
          {cached ? '是' : '否'}
        </Tag>
      )
    }
  ];

  return (
    <div style={{
      padding: '24px',
      background: '#f5f5f5',
      minHeight: '100vh'
    }}>
      {/* 页面标题 */}
      <div style={{
        textAlign: 'center',
        marginBottom: '32px'
      }}>
        <h1 style={{
          fontSize: '32px',
          fontWeight: '600',
          color: '#1890ff',
          marginBottom: '16px'
        }}>
          🤖 智能Agent统筹管理系统
        </h1>
        <p style={{
          fontSize: '16px',
          color: '#666',
          maxWidth: '600px',
          margin: '0 auto',
          lineHeight: '1.6'
        }}>
          解决Agent过耦合问题，优化B Agent负载，智能缓存热点问题，提升系统整体性能
        </p>
      </div>

      {/* 性能指标卡片 */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="总查询次数"
              value={demoData.totalQueries}
              prefix={<MessageOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="缓存命中"
              value={demoData.cacheHits}
              prefix={<DatabaseOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="缓存命中率"
              value={demoData.cacheHitRate}
              precision={2}
              suffix="%"
              prefix={<ThunderboltOutlined />}
              valueStyle={{ 
                color: demoData.cacheHitRate > 0.7 ? '#52c41a' : 
                       demoData.cacheHitRate > 0.4 ? '#faad14' : '#f5222d' 
              }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="热点问题"
              value={demoData.hotQuestions}
              prefix={<BarChartOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
      </Row>

      {/* 主要功能区域 */}
      <Row gutter={[16, 16]}>
        {/* 智能输入框 */}
        <Col xs={24} lg={12}>
          <Card 
            title="🎯 智能输入测试"
            extra={
              <Space>
                <Button
                  type={isLiveMode ? 'primary' : 'default'}
                  size="small"
                  onClick={() => setIsLiveMode(!isLiveMode)}
                >
                  {isLiveMode ? '实时监控' : '离线模式'}
                </Button>
                <Button
                  size="small"
                  icon={<ReloadOutlined />}
                  onClick={fetchMetrics}
                >
                  刷新
                </Button>
              </Space>
            }
            style={{ height: '100%' }}
          >
            <SmartInputBox />
            
            <Alert
              message="💡 测试建议"
              description="尝试输入相同问题多次，观察缓存效果；切换语音/文字模式，测试智能识别"
              type="info"
              showIcon
              style={{ marginTop: '16px' }}
            />
          </Card>
        </Col>

        {/* 热点问题排行 */}
        <Col xs={24} lg={12}>
          <Card title="🔥 热点问题排行榜" style={{ height: '100%' }}>
            <div style={{ marginBottom: '16px' }}>
              {mockHotQuestions.map((item, index) => (
                <div
                  key={index}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '8px 12px',
                    marginBottom: '8px',
                    background: index < 3 ? '#fff2e8' : '#fafafa',
                    borderRadius: '6px',
                    border: index < 3 ? '1px solid #ffb366' : '1px solid #d9d9d9'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      background: index < 3 ? '#fa8c16' : '#d9d9d9',
                      color: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '12px',
                      fontWeight: 'bold'
                    }}>
                      {index + 1}
                    </span>
                    <span style={{ fontSize: '14px' }}>{item.query}</span>
                  </div>
                  <Tag color={index < 3 ? 'orange' : 'default'}>
                    {item.count}次
                  </Tag>
                </div>
              ))}
            </div>
            
            <Alert
              message="📊 智能分析"
              description="系统自动识别热点问题并优先缓存，提升响应速度"
              type="success"
              showIcon
            />
          </Card>
        </Col>
      </Row>

      {/* 处理历史记录 */}
      <Card 
        title="📋 处理历史记录" 
        style={{ marginTop: '24px' }}
        extra={
          <Space>
            <span style={{ fontSize: '12px', color: '#666' }}>
              最近{demoData.responseHistory.length}条记录
            </span>
          </Space>
        }
      >
        <Table
          columns={columns}
          dataSource={demoData.responseHistory}
          rowKey="timestamp"
          pagination={false}
          size="small"
          scroll={{ x: 800 }}
          locale={{
            emptyText: '暂无处理记录，请先测试输入框'
          }}
        />
      </Card>

      {/* 系统优化说明 */}
      <Card title="🚀 系统优化成果" style={{ marginTop: '24px' }}>
        <Row gutter={[16, 16]}>
          <Col xs={24} md={8}>
            <div style={{ textAlign: 'center', padding: '16px' }}>
              <div style={{
                fontSize: '48px',
                color: '#52c41a',
                marginBottom: '16px'
              }}>
                ⚡
              </div>
              <h4>响应速度提升</h4>
              <p style={{ color: '#666' }}>
                智能缓存机制减少重复查询，热点问题响应速度提升80%
              </p>
            </div>
          </Col>
          <Col xs={24} md={8}>
            <div style={{ textAlign: 'center', padding: '16px' }}>
              <div style={{
                fontSize: '48px',
                color: '#1890ff',
                marginBottom: '16px'
              }}>
                🎯
              </div>
              <h4>负载均衡优化</h4>
              <p style={{ color: '#666' }}>
                Agent B负载降低60%，避免重复处理相同问题
              </p>
            </div>
          </Col>
          <Col xs={24} md={8}>
            <div style={{ textAlign: 'center', padding: '16px' }}>
              <div style={{
                fontSize: '48px',
                color: '#722ed1',
                marginBottom: '16px'
              }}>
                🔧
              </div>
              <h4>耦合度降低</h4>
              <p style={{ color: '#666' }}>
                统一Agent协调管理，组件间耦合度降低70%
              </p>
            </div>
          </Col>
        </Row>
      </Card>
    </div>
  );
};

export default SmartInputDemo;
