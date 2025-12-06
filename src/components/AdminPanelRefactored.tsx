import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Table, Tag, Button, Modal, Form, Input, Select, Tabs, Statistic, message } from 'antd';
import { UserOutlined, DatabaseOutlined, ApiOutlined, TeamOutlined, EyeOutlined, EyeInvisibleOutlined } from '@ant-design/icons';

// 使用Ant Design组件 - 公开稳定版本

// 统一的数据类型定义
interface KnowledgeItem {
  id: string;
  category: string;
  title: string;
  content: string;
  tags: string[];
  status: 'active' | 'inactive';
  createdAt: string;
}

interface AgentStatus {
  id: string;
  name: string;
  status: 'online' | 'offline' | 'error';
  lastHeartbeat: string;
  responseTime: number;
  requestCount: number;
  errorRate: number;
}

interface UserStats {
  id: string;
  username: string;
  phone: string;
  status: 'active' | 'inactive' | 'banned';
  lastLogin: string;
  requestCount: number;
}

// ANP消息类型定义
interface ANPMessage {
  protocol_version: string;
  message_id: string;
  timestamp: string;
  from_agent: string;
  to_agent: string;
  message_type: string;
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  payload: {
    action: string;
    data: any;
    metadata: {
      request_id: string;
      session_id: string;
      user_id: string;
      correlation_id: string;
    };
  };
}

// ANP Agent注册信息
interface ANPAgent {
  agent_id: string;
  name: string;
  version: string;
  role: string;
  capabilities: string[];
  message_handlers: Array<{
    message_type: string;
    handler: string;
    response_type: string;
  }>;
}

const AdminPanelRefactored: React.FC = () => {
  const [activeTab, setActiveTab] = useState('monitor');
  const [loading, setLoading] = useState(false);
  
  // 状态数据 - 统一管理
  const [dashboardStats, setDashboardStats] = useState<any>(null);
  const [agentStatus, setAgentStatus] = useState<AgentStatus[]>([]);
  const [userStats, setUserStats] = useState<UserStats[]>([]);
  const [knowledgeBase, setKnowledgeBase] = useState<KnowledgeItem[]>([]);

  // 知识库编辑状态
  const [knowledgeModalVisible, setKnowledgeModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState<KnowledgeItem | null>(null);
  const [formData, setFormData] = useState({
    category: '',
    title: '',
    content: '',
    tags: [] as string[],
    status: 'active' as 'active' | 'inactive'
  });

  // ANP通信日志
  const [anpMessages, setAnpMessages] = useState<ANPMessage[]>([]);

  // 组件化数据加载 - 遵循剃刀原则，单一职责
  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:3001/api/admin/analytics/dashboard');
      const result = await response.json();
      if (result.success) {
        setDashboardStats(result.data);
        // 记录ANP通信日志
        logANPMessage('SYSTEM', 'DATA_MANAGER', 'DATA_QUERY_RESPONSE', 'HIGH', {
          action: 'dashboard_data_loaded',
          data: result.data,
          metadata: {
            request_id: `req_${Date.now()}`,
            session_id: 'session_admin',
            user_id: 'user_admin',
            correlation_id: `corr_${Date.now()}`
          }
        });
      }
    } catch (error) {
      console.error('加载仪表板数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadAgentStatus = async () => {
    try {
      // 模拟Agent状态数据 - 体现ANP多智能体协作
      const mockAgentStatus: AgentStatus[] = [
        {
          id: 'input_manager',
          name: '输入管理器 (Agent A)',
          status: 'online',
          lastHeartbeat: new Date().toISOString(),
          responseTime: 50,
          requestCount: 156,
          errorRate: 0.01
        },
        {
          id: 'query_processor',
          name: '查询处理器 (Agent B)',
          status: 'online',
          lastHeartbeat: new Date().toISOString(),
          responseTime: 200,
          requestCount: 89,
          errorRate: 0.02
        },
        {
          id: 'data_manager',
          name: '数据管理器 (Agent C)',
          status: 'online',
          lastHeartbeat: new Date().toISOString(),
          responseTime: 12,
          requestCount: 234,
          errorRate: 0.00
        },
        {
          id: 'user_monitor',
          name: '用户监控器 (Agent D)',
          status: 'online',
          lastHeartbeat: new Date().toISOString(),
          responseTime: 100,
          requestCount: 67,
          errorRate: 0.01
        }
      ];
      setAgentStatus(mockAgentStatus);
      
      // 记录ANP Agent状态查询
      logANPMessage('SYSTEM', 'ALL_AGENTS', 'STATUS_REPORT', 'MEDIUM', {
        action: 'agent_status_query_completed',
        data: { agents: mockAgentStatus },
        metadata: {
          request_id: `req_${Date.now()}`,
          session_id: 'session_admin',
          user_id: 'user_admin',
          correlation_id: `corr_${Date.now()}`
        }
      });
    } catch (error) {
      console.error('加载Agent状态失败:', error);
    }
  };

  const loadUserStats = async () => {
    try {
      // 模拟用户统计数据 - D哥心系统职责
      const mockUserStats: UserStats[] = [
        {
          id: '1',
          username: 'admin',
          phone: '13800138000',
          status: 'active',
          lastLogin: new Date().toISOString(),
          requestCount: 45
        },
        {
          id: '2',
          username: 'user001',
          phone: '13800138001',
          status: 'active',
          lastLogin: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          requestCount: 23
        }
      ];
      setUserStats(mockUserStats);
      
      // 记录ANP用户监控数据
      logANPMessage('SYSTEM', 'USER_MONITOR', 'DATA_QUERY_RESPONSE', 'MEDIUM', {
        action: 'user_stats_loaded',
        data: { users: mockUserStats },
        metadata: {
          request_id: `req_${Date.now()}`,
          session_id: 'session_admin',
          user_id: 'user_admin',
          correlation_id: `corr_${Date.now()}`
        }
      });
    } catch (error) {
      console.error('加载用户统计失败:', error);
    }
  };

  const loadKnowledgeBase = async () => {
    try {
      // 模拟知识库数据 - C数据小抄职责
      const mockKnowledge: KnowledgeItem[] = [
        {
          id: '1',
          category: 'red_culture',
          title: '东里村红色历史',
          content: '东里村有着丰富的红色文化历史...',
          tags: ['红色文化', '历史', '革命'],
          status: 'active',
          createdAt: new Date().toISOString()
        },
        {
          id: '2',
          category: 'ecology',
          title: '生态农业介绍',
          content: '东里村生态农业发展情况...',
          tags: ['生态', '农业', '绿色'],
          status: 'active',
          createdAt: new Date().toISOString()
        }
      ];
      setKnowledgeBase(mockKnowledge);
      
      // 记录ANP数据管理器操作
      logANPMessage('SYSTEM', 'DATA_MANAGER', 'DATA_QUERY_RESPONSE', 'LOW', {
        action: 'knowledge_base_loaded',
        data: { knowledge_items: mockKnowledge },
        metadata: {
          request_id: `req_${Date.now()}`,
          session_id: 'session_admin',
          user_id: 'user_admin',
          correlation_id: `corr_${Date.now()}`
        }
      });
    } catch (error) {
      console.error('加载知识库失败:', error);
    }
  };

  // ANP消息记录函数 - 核心通信日志
  const logANPMessage = (
    from_agent: string,
    to_agent: string,
    message_type: string,
    priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW',
    payload: any
  ) => {
    const message: ANPMessage = {
      protocol_version: '1.0',
      message_id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      from_agent,
      to_agent,
      message_type,
      priority,
      payload
    };
    
    setAnpMessages(prev => [...prev.slice(-20), message]);
  };

  // 知识库操作函数 - 组件化事件处理
  const handleAddKnowledge = () => {
    setEditingItem(null);
    setFormData({
      category: '',
      title: '',
      content: '',
      tags: [],
      status: 'active'
    });
    setKnowledgeModalVisible(true);
    
    // 记录ANP操作日志
    logANPMessage('ADMIN', 'DATA_MANAGER', 'DATA_STORE_REQUEST', 'MEDIUM', {
      action: 'add_knowledge_initiated',
      data: { mode: 'create' },
      metadata: {
        request_id: `req_${Date.now()}`,
        session_id: 'session_admin',
        user_id: 'user_admin',
        correlation_id: `corr_${Date.now()}`
      }
    });
  };

  const editKnowledge = (item: KnowledgeItem) => {
    setEditingItem(item);
    setFormData({
      category: item.category,
      title: item.title,
      content: item.content,
      tags: item.tags,
      status: item.status
    });
    setKnowledgeModalVisible(true);
    
    // 记录ANP操作日志
    logANPMessage('ADMIN', 'DATA_MANAGER', 'DATA_STORE_REQUEST', 'MEDIUM', {
      action: 'edit_knowledge_initiated',
      data: { item_id: item.id, mode: 'edit' },
      metadata: {
        request_id: `req_${Date.now()}`,
        session_id: 'session_admin',
        user_id: 'user_admin',
        correlation_id: `corr_${Date.now()}`
      }
    });
  };

  const deleteKnowledge = (id: string) => {
    if (confirm('确定要删除这条知识库记录吗？')) {
      setKnowledgeBase(knowledgeBase.filter(item => item.id !== id));
      
      // 记录ANP删除操作
      logANPMessage('ADMIN', 'DATA_MANAGER', 'DATA_STORE_REQUEST', 'HIGH', {
        action: 'delete_knowledge_completed',
        data: { deleted_id: id },
        metadata: {
          request_id: `req_${Date.now()}`,
          session_id: 'session_admin',
          user_id: 'user_admin',
          correlation_id: `corr_${Date.now()}`
        }
      });
    }
  };

  const handleKnowledgeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingItem) {
        // 编辑操作
        setKnowledgeBase(knowledgeBase.map(item => 
          item.id === editingItem.id ? { ...item, ...formData } : item
        ));
        
        logANPMessage('ADMIN', 'DATA_MANAGER', 'DATA_STORE_RESPONSE', 'MEDIUM', {
          action: 'edit_knowledge_completed',
          data: { updated_item: { ...editingItem, ...formData } },
          metadata: {
            request_id: `req_${Date.now()}`,
            session_id: 'session_admin',
            user_id: 'user_admin',
            correlation_id: `corr_${Date.now()}`
          }
        });
      } else {
        // 新增操作
        const newItem: KnowledgeItem = {
          id: Date.now().toString(),
          ...formData,
          createdAt: new Date().toISOString(),
        };
        setKnowledgeBase([...knowledgeBase, newItem]);
        
        logANPMessage('ADMIN', 'DATA_MANAGER', 'DATA_STORE_RESPONSE', 'MEDIUM', {
          action: 'add_knowledge_completed',
          data: { new_item: newItem },
          metadata: {
            request_id: `req_${Date.now()}`,
            session_id: 'session_admin',
            user_id: 'user_admin',
            correlation_id: `corr_${Date.now()}`
          }
        });
      }
      setKnowledgeModalVisible(false);
    } catch (error) {
      console.error('保存知识库失败:', error);
    }
  };

  // 初始化数据加载
  useEffect(() => {
    loadDashboardData();
    loadAgentStatus();
    loadUserStats();
    loadKnowledgeBase();
  }, []);

  // Tab导航配置 - 组件化配置
  const tabs = [
    { key: 'monitor', label: '📊 系统监控' },
    { key: 'users', label: '👥 用户管理' },
    { key: 'knowledge', label: '📚 知识库' },
    { key: 'anp', label: '🔄 ANP通信' }
  ];

  return (
    <div style={{ 
      padding: '24px', 
      background: '#f0fdf4', 
      minHeight: '100vh',
      fontFamily: '"Noto Sans SC", system-ui, sans-serif'
    }}>
      {/* 页面标题 */}
      <div style={{ 
        fontSize: '24px', 
        fontWeight: 'bold', 
        marginBottom: '24px',
        textAlign: 'center'
      }}>
        🏛️ 东里村智能导游系统 - ANP多智能体协作管理后台
      </div>

      {/* Tab导航 - 组件化 */}
      <div style={{
        display: 'flex',
        background: 'white',
        borderRadius: '12px',
        marginBottom: '24px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        overflow: 'hidden'
      }}>
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            style={{
              flex: 1,
              padding: '16px',
              border: 'none',
              background: activeTab === tab.key ? '#1677ff' : 'transparent',
              color: activeTab === tab.key ? 'white' : '#666',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 系统监控 - 使用Ant Design组件 */}
      {activeTab === 'monitor' && (
        <div>
          <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
            <Col xs={24} sm={12} md={6}>
              <Card>
                <Statistic
                  title="在线Agent"
                  value={agentStatus.filter(a => a.status === 'online').length}
                  prefix={<TeamOutlined />}
                  valueStyle={{ color: '#3f8600' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card>
                <Statistic
                  title="知识库条目"
                  value={knowledgeBase.length}
                  prefix={<DatabaseOutlined />}
                  valueStyle={{ color: '#1890ff' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card>
                <Statistic
                  title="用户总数"
                  value={userStats.length}
                  prefix={<UserOutlined />}
                  valueStyle={{ color: '#722ed1' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card>
                <Statistic
                  title="ANP消息"
                  value={anpMessages.length}
                  prefix={<ApiOutlined />}
                  valueStyle={{ color: '#fa8c16' }}
                />
              </Card>
            </Col>
          </Row>

          <Card title="Agent健康状态" style={{ marginBottom: '16px' }}>
            <Table
              dataSource={agentStatus}
              rowKey="id"
              pagination={false}
              columns={[
                {
                  title: 'Agent名称',
                  dataIndex: 'name',
                  key: 'name'
                },
                {
                  title: '状态',
                  dataIndex: 'status',
                  key: 'status',
                  render: (status: string) => (
                    <Tag color={status === 'online' ? 'green' : status === 'offline' ? 'orange' : 'red'}>
                      {status === 'online' ? '在线' : status === 'offline' ? '离线' : '错误'}
                    </Tag>
                  )
                },
                {
                  title: '响应时间',
                  dataIndex: 'responseTime',
                  key: 'responseTime',
                  render: (time: number) => time > 0 ? `${time}ms` : '-'
                },
                {
                  title: '请求次数',
                  dataIndex: 'requestCount',
                  key: 'requestCount'
                },
                {
                  title: '错误率',
                  dataIndex: 'errorRate',
                  key: 'errorRate',
                  render: (rate: number) => `${(rate * 100).toFixed(2)}%`
                },
                {
                  title: '最后心跳',
                  dataIndex: 'lastHeartbeat',
                  key: 'lastHeartbeat',
                  render: (time: string) => new Date(time).toLocaleString()
                }
              ]}
            />
          </Card>
        </div>
      )}

      {/* 用户管理 - 使用Ant Design组件 */}
      {activeTab === 'users' && (
        <Card title="用户统计 (D哥)">
          <Table
            dataSource={userStats}
            rowKey="id"
            pagination={{ pageSize: 10 }}
            columns={[
              {
                title: '用户名',
                dataIndex: 'username',
                key: 'username'
              },
              {
                title: '手机号',
                dataIndex: 'phone',
                key: 'phone'
              },
              {
                title: '状态',
                dataIndex: 'status',
                key: 'status',
                render: (status: string) => (
                  <Tag color={status === 'active' ? 'green' : status === 'inactive' ? 'orange' : 'red'}>
                    {status === 'active' ? '活跃' : status === 'inactive' ? '非活跃' : '封禁'}
                  </Tag>
                )
              },
              {
                title: '最后登录',
                dataIndex: 'lastLogin',
                key: 'lastLogin',
                render: (time: string) => new Date(time).toLocaleString()
              },
              {
                title: '请求次数',
                dataIndex: 'requestCount',
                key: 'requestCount'
              }
            ]}
          />
        </Card>
      )}

      {/* 知识库管理 - 使用Ant Design组件 */}
      {activeTab === 'knowledge' && (
        <div>
          <Card 
            title="📚 C数据知识库管理" 
            style={{ marginBottom: '16px' }}
            extra={
              <Button type="primary" onClick={handleAddKnowledge}>
                + 添加知识
              </Button>
            }
          >
            <div style={{
              background: '#e6f7ff',
              border: '1px solid #91d5ff',
              borderRadius: '6px',
              padding: '12px',
              marginBottom: '16px',
              fontSize: '14px'
            }}>
              <strong>结构化知识库：</strong>一个萝卜一个坑填充，便于管理和维护。每个知识条目包含分类、标题、内容、标签等结构化信息。
            </div>
          </Card>

          <Card>
            <Table
              dataSource={knowledgeBase}
              rowKey="id"
              pagination={{ pageSize: 10 }}
              columns={[
                {
                  title: '分类',
                  dataIndex: 'category',
                  key: 'category'
                },
                {
                  title: '标题',
                  dataIndex: 'title',
                  key: 'title'
                },
                {
                  title: '标签',
                  dataIndex: 'tags',
                  key: 'tags',
                  render: (tags: string[]) => (
                    <>
                      {tags.map(tag => (
                        <Tag key={tag} style={{ margin: '2px' }}>{tag}</Tag>
                      ))}
                    </>
                  )
                },
                {
                  title: '状态',
                  dataIndex: 'status',
                  key: 'status',
                  render: (status: string) => (
                    <Tag color={status === 'active' ? 'green' : 'orange'}>
                      {status === 'active' ? '启用' : '禁用'}
                    </Tag>
                  )
                },
                {
                  title: '创建时间',
                  dataIndex: 'createdAt',
                  key: 'createdAt',
                  render: (time: string) => new Date(time).toLocaleString()
                },
                {
                  title: '操作',
                  key: 'actions',
                  render: (_, record) => (
                    <div>
                      <Button 
                        type="link" 
                        onClick={() => editKnowledge(record)}
                        style={{ marginRight: '8px' }}
                      >
                        编辑
                      </Button>
                      <Button 
                        type="link" 
                        danger
                        onClick={() => deleteKnowledge(record.id)}
                      >
                        删除
                      </Button>
                    </div>
                  )
                }
              ]}
            />
          </Card>
        </div>
      )}

      {/* ANP通信日志 - 核心功能展示 */}
      {activeTab === 'anp' && (
        <div style={{
          background: 'white',
          borderRadius: '12px',
          padding: '20px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ marginBottom: '16px' }}>🔄 ANP多智能体通信日志</h3>
          
          <div style={{
            background: '#e6f7ff',
            border: '1px solid #91d5ff',
            borderRadius: '6px',
            padding: '12px',
            marginBottom: '16px',
            fontSize: '14px'
          }}>
            <strong>ANP协议核心特点：</strong>
            <ul style={{ marginTop: '8px', marginBottom: '0' }}>
              <li>标准化消息格式和通信协议</li>
              <li>多智能体协作和信息共享</li>
              <li>工具调用和MCP集成</li>
              <li>统一的错误处理和重试机制</li>
              <li>实时监控和调试支持</li>
            </ul>
          </div>

          <div style={{ overflow: 'auto', maxHeight: '400px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#fafafa' }}>
                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #f0f0f0' }}>时间</th>
                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #f0f0f0' }}>发送方</th>
                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #f0f0f0' }}>接收方</th>
                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #f0f0f0' }}>消息类型</th>
                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #f0f0f0' }}>优先级</th>
                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #f0f0f0' }}>操作</th>
                </tr>
              </thead>
              <tbody>
                {anpMessages.map((msg, index) => (
                  <tr key={index} style={{ borderBottom: '1px solid #f0f0f0' }}>
                    <td style={{ padding: '8px', fontSize: '12px' }}>
                      {new Date(msg.timestamp).toLocaleTimeString()}
                    </td>
                    <td style={{ padding: '8px', fontSize: '12px' }}>{msg.from_agent}</td>
                    <td style={{ padding: '8px', fontSize: '12px' }}>{msg.to_agent}</td>
                    <td style={{ padding: '8px', fontSize: '12px' }}>{msg.message_type}</td>
                    <td style={{ padding: '8px', fontSize: '12px' }}>
                      <span style={{
                        background: msg.priority === 'CRITICAL' ? '#f5222d' :
                                   msg.priority === 'HIGH' ? '#fa8c16' :
                                   msg.priority === 'MEDIUM' ? '#faad14' : '#52c41a',
                        color: 'white',
                        padding: '2px 6px',
                        borderRadius: '3px',
                        fontSize: '10px'
                      }}>
                        {msg.priority}
                      </span>
                    </td>
                    <td style={{ padding: '8px', fontSize: '12px' }}>
                      {msg.payload.action}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 知识库编辑模态框 - 组件化 */}
      {knowledgeModalVisible && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: '24px',
            width: '90%',
            maxWidth: '600px',
            maxHeight: '80vh',
            overflow: 'auto'
          }}>
            <h3 style={{ marginBottom: '16px' }}>
              {editingItem ? '编辑知识库' : '添加知识库'}
            </h3>
            
            <form onSubmit={handleKnowledgeSubmit}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>分类</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #d9d9d9',
                    borderRadius: '6px'
                  }}
                  required
                >
                  <option value="">选择分类</option>
                  <option value="red_culture">红色文化</option>
                  <option value="ecology">生态农业</option>
                  <option value="folk">民俗文化</option>
                  <option value="food">特色美食</option>
                  <option value="celebrity">乡贤名人</option>
                </select>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>标题</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  placeholder="输入知识库标题"
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #d9d9d9',
                    borderRadius: '6px'
                  }}
                  required
                />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>内容</label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({...formData, content: e.target.value})}
                  placeholder="输入详细内容"
                  rows={4}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #d9d9d9',
                    borderRadius: '6px',
                    resize: 'vertical'
                  }}
                  required
                />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>状态</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({...formData, status: e.target.value as 'active' | 'inactive'})}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #d9d9d9',
                    borderRadius: '6px'
                  }}
                >
                  <option value="active">启用</option>
                  <option value="inactive">禁用</option>
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button
                  type="button"
                  onClick={() => setKnowledgeModalVisible(false)}
                  style={{
                    padding: '8px 16px',
                    border: '1px solid #d9d9d9',
                    borderRadius: '6px',
                    background: 'white',
                    cursor: 'pointer'
                  }}
                >
                  取消
                </button>
                <button
                  type="submit"
                  style={{
                    padding: '8px 16px',
                    border: 'none',
                    borderRadius: '6px',
                    background: '#1677ff',
                    color: 'white',
                    cursor: 'pointer'
                  }}
                >
                  保存
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanelRefactored;
