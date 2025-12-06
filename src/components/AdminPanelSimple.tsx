import React, { useState, useEffect } from 'react';

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

const AdminPanelSimple: React.FC = () => {
  const [activeTab, setActiveTab] = useState('monitor');
  const [loading, setLoading] = useState(false);
  
  // 状态数据
  const [dashboardStats, setDashboardStats] = useState<any>(null);
  const [agentStatus, setAgentStatus] = useState<AgentStatus[]>([]);
  const [userStats, setUserStats] = useState<any[]>([]);
  const [knowledgeBase, setKnowledgeBase] = useState<KnowledgeItem[]>([]);

  // 表单状态
  const [knowledgeModalVisible, setKnowledgeModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [formData, setFormData] = useState({
    category: '',
    title: '',
    content: '',
    tags: [] as string[],
    status: 'active' as 'active' | 'inactive'
  });

  // 加载数据
  useEffect(() => {
    loadDashboardData();
    loadAgentStatus();
    loadUserStats();
    loadKnowledgeBase();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:3001/api/admin/analytics/dashboard');
      const result = await response.json();
      if (result.success) {
        setDashboardStats(result.data);
      }
    } catch (error) {
      console.error('加载仪表板数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadAgentStatus = async () => {
    try {
      // 模拟Agent状态数据
      const mockAgentStatus: AgentStatus[] = [
        {
          id: 'agent-a',
          name: 'Agent A - 眼睛系统',
          status: 'online',
          lastHeartbeat: new Date().toISOString(),
          responseTime: 120,
          requestCount: 156,
          errorRate: 0.02
        },
        {
          id: 'agent-b',
          name: 'Agent B - 瞎子系统',
          status: 'online',
          lastHeartbeat: new Date().toISOString(),
          responseTime: 150,
          requestCount: 89,
          errorRate: 0.05
        },
        {
          id: 'agent-c',
          name: 'Agent C - 小抄系统',
          status: 'offline',
          lastHeartbeat: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
          responseTime: 0,
          requestCount: 0,
          errorRate: 0
        },
        {
          id: 'agent-d',
          name: 'Agent D - 心系统',
          status: 'online',
          lastHeartbeat: new Date().toISOString(),
          responseTime: 200,
          requestCount: 234,
          errorRate: 0.01
        }
      ];
      setAgentStatus(mockAgentStatus);
    } catch (error) {
      console.error('加载Agent状态失败:', error);
    }
  };

  const loadUserStats = async () => {
    try {
      // 模拟用户统计数据
      const mockUserStats = [
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
    } catch (error) {
      console.error('加载用户统计失败:', error);
    }
  };

  const loadKnowledgeBase = async () => {
    try {
      // 模拟知识库数据
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
    } catch (error) {
      console.error('加载知识库失败:', error);
    }
  };

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
  };

  const deleteKnowledge = (id: string) => {
    if (confirm('确定要删除这条知识库记录吗？')) {
      setKnowledgeBase(knowledgeBase.filter(item => item.id !== id));
    }
  };

  const handleKnowledgeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingItem) {
        // 编辑
        setKnowledgeBase(knowledgeBase.map(item => 
          item.id === editingItem.id ? { ...item, ...formData } : item
        ));
      } else {
        // 新增
        const newItem: KnowledgeItem = {
          id: Date.now().toString(),
          ...formData,
          createdAt: new Date().toISOString(),
        };
        setKnowledgeBase([...knowledgeBase, newItem]);
      }
      setKnowledgeModalVisible(false);
    } catch (error) {
      console.error('保存知识库失败:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online':
      case 'active':
        return '#52c41a';
      case 'offline':
      case 'inactive':
        return '#faad14';
      case 'error':
      case 'banned':
        return '#f5222d';
      default:
        return '#d9d9d9';
    }
  };

  const getStatusText = (status: string, type: string = 'agent') => {
    if (type === 'agent') {
      switch (status) {
        case 'online': return '在线';
        case 'offline': return '离线';
        case 'error': return '错误';
        default: return status;
      }
    } else {
      switch (status) {
        case 'active': return '活跃';
        case 'inactive': return '非活跃';
        case 'banned': return '封禁';
        default: return status;
      }
    }
  };

  return (
    <div style={{ 
      padding: '24px', 
      background: '#f0fdf4', 
      minHeight: '100vh',
      fontFamily: '"Noto Sans SC", system-ui, sans-serif'
    }}>
      <div style={{ 
        fontSize: '24px', 
        fontWeight: 'bold', 
        marginBottom: '24px',
        textAlign: 'center'
      }}>
        🏛️ 东里村智能导游系统 - 管理后台
      </div>

      {/* Tab导航 */}
      <div style={{
        display: 'flex',
        background: 'white',
        borderRadius: '12px',
        marginBottom: '24px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        overflow: 'hidden'
      }}>
        {[
          { key: 'monitor', label: '📊 系统监控' },
          { key: 'users', label: '👥 用户管理' },
          { key: 'knowledge', label: '📚 知识库' }
        ].map(tab => (
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

      {/* 系统监控 */}
      {activeTab === 'monitor' && (
        <div>
          {/* 统计卡片 */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '16px',
            marginBottom: '24px'
          }}>
            <div style={{
              background: 'white',
              padding: '20px',
              borderRadius: '12px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}>
              <div style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>总提交数</div>
              <div style={{ fontSize: '24px', fontWeight: 'bold' }}>
                {dashboardStats?.overview?.totalSubmissions || 0}
              </div>
            </div>
            <div style={{
              background: 'white',
              padding: '20px',
              borderRadius: '12px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}>
              <div style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>活跃用户</div>
              <div style={{ fontSize: '24px', fontWeight: 'bold' }}>
                {dashboardStats?.overview?.todayActive || 0}
              </div>
            </div>
            <div style={{
              background: 'white',
              padding: '20px',
              borderRadius: '12px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}>
              <div style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>在线Agent</div>
              <div style={{ fontSize: '24px', fontWeight: 'bold' }}>
                {agentStatus.filter(a => a.status === 'online').length}
              </div>
            </div>
            <div style={{
              background: 'white',
              padding: '20px',
              borderRadius: '12px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}>
              <div style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>知识库条目</div>
              <div style={{ fontSize: '24px', fontWeight: 'bold' }}>
                {knowledgeBase.length}
              </div>
            </div>
          </div>

          {/* Agent状态表格 */}
          <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: '20px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }}>
            <h3 style={{ marginBottom: '16px' }}>Agent健康状态</h3>
            <div style={{ overflow: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#fafafa' }}>
                    <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #f0f0f0' }}>Agent名称</th>
                    <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #f0f0f0' }}>状态</th>
                    <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #f0f0f0' }}>响应时间</th>
                    <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #f0f0f0' }}>请求次数</th>
                    <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #f0f0f0' }}>错误率</th>
                    <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #f0f0f0' }}>最后心跳</th>
                  </tr>
                </thead>
                <tbody>
                  {agentStatus.map(agent => (
                    <tr key={agent.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                      <td style={{ padding: '12px' }}>{agent.name}</td>
                      <td style={{ padding: '12px' }}>
                        <span style={{
                          background: getStatusColor(agent.status),
                          color: 'white',
                          padding: '4px 8px',
                          borderRadius: '4px',
                          fontSize: '12px'
                        }}>
                          {getStatusText(agent.status, 'agent')}
                        </span>
                      </td>
                      <td style={{ padding: '12px' }}>{agent.responseTime > 0 ? `${agent.responseTime}ms` : '-'}</td>
                      <td style={{ padding: '12px' }}>{agent.requestCount}</td>
                      <td style={{ padding: '12px' }}>{(agent.errorRate * 100).toFixed(2)}%</td>
                      <td style={{ padding: '12px' }}>{new Date(agent.lastHeartbeat).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 用户管理 */}
      {activeTab === 'users' && (
        <div style={{
          background: 'white',
          borderRadius: '12px',
          padding: '20px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ marginBottom: '16px' }}>用户统计 (D哥)</h3>
          <div style={{ overflow: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#fafafa' }}>
                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #f0f0f0' }}>用户名</th>
                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #f0f0f0' }}>手机号</th>
                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #f0f0f0' }}>状态</th>
                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #f0f0f0' }}>最后登录</th>
                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #f0f0f0' }}>请求次数</th>
                </tr>
              </thead>
              <tbody>
                {userStats.map(user => (
                  <tr key={user.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                    <td style={{ padding: '12px' }}>{user.username}</td>
                    <td style={{ padding: '12px' }}>{user.phone}</td>
                    <td style={{ padding: '12px' }}>
                      <span style={{
                        background: getStatusColor(user.status),
                        color: 'white',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '12px'
                      }}>
                        {getStatusText(user.status, 'user')}
                      </span>
                    </td>
                    <td style={{ padding: '12px' }}>{new Date(user.lastLogin).toLocaleString()}</td>
                    <td style={{ padding: '12px' }}>{user.requestCount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 知识库管理 */}
      {activeTab === 'knowledge' && (
        <div>
          <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: '20px',
            marginBottom: '16px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '16px'
            }}>
              <h3>📚 C数据知识库管理</h3>
              <button
                onClick={handleAddKnowledge}
                style={{
                  background: '#1677ff',
                  color: 'white',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: '6px',
                  cursor: 'pointer'
                }}
              >
                + 添加知识
              </button>
            </div>
            
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
          </div>

          {/* 知识库表格 */}
          <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: '20px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }}>
            <div style={{ overflow: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#fafafa' }}>
                    <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #f0f0f0' }}>分类</th>
                    <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #f0f0f0' }}>标题</th>
                    <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #f0f0f0' }}>标签</th>
                    <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #f0f0f0' }}>状态</th>
                    <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #f0f0f0' }}>创建时间</th>
                    <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #f0f0f0' }}>操作</th>
                  </tr>
                </thead>
                <tbody>
                  {knowledgeBase.map(item => (
                    <tr key={item.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                      <td style={{ padding: '12px' }}>{item.category}</td>
                      <td style={{ padding: '12px' }}>{item.title}</td>
                      <td style={{ padding: '12px' }}>
                        {item.tags.map(tag => (
                          <span key={tag} style={{
                            background: '#f0f0f0',
                            padding: '2px 6px',
                            borderRadius: '3px',
                            margin: '2px',
                            fontSize: '12px'
                          }}>
                            {tag}
                          </span>
                        ))}
                      </td>
                      <td style={{ padding: '12px' }}>
                        <span style={{
                          background: getStatusColor(item.status),
                          color: 'white',
                          padding: '4px 8px',
                          borderRadius: '4px',
                          fontSize: '12px'
                        }}>
                          {item.status === 'active' ? '启用' : '禁用'}
                        </span>
                      </td>
                      <td style={{ padding: '12px' }}>{new Date(item.createdAt).toLocaleString()}</td>
                      <td style={{ padding: '12px' }}>
                        <button
                          onClick={() => editKnowledge(item)}
                          style={{
                            background: '#1677ff',
                            color: 'white',
                            border: 'none',
                            padding: '4px 8px',
                            borderRadius: '4px',
                            marginRight: '8px',
                            cursor: 'pointer'
                          }}
                        >
                          编辑
                        </button>
                        <button
                          onClick={() => deleteKnowledge(item.id)}
                          style={{
                            background: '#f5222d',
                            color: 'white',
                            border: 'none',
                            padding: '4px 8px',
                            borderRadius: '4px',
                            cursor: 'pointer'
                          }}
                        >
                          删除
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 知识库编辑模态框 */}
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

export default AdminPanelSimple;
