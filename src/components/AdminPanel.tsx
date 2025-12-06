import React, { useState, useEffect } from 'react';
import { Card, Button, Table, Form, Input, Select, InputNumber, Switch, Tabs, Statistic, Row, Col, Alert, Space, Tag, Modal } from 'antd';
import { UserOutlined, ApiOutlined, MonitorOutlined, DatabaseOutlined, SettingOutlined, PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { adminApiService } from '../services/adminApiService';

const { TabPane } = Tabs;
const { TextArea } = Input;
const { Option } = Select;

interface AdminPanelProps {}

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

interface ApiConfig {
  id: string;
  name: string;
  baseUrl: string;
  apiKey: string;
  enabled: boolean;
  usage: number;
  limit: number;
}

interface UserStats {
  id: string;
  username: string;
  phone: string;
  status: 'active' | 'inactive' | 'banned';
  lastLogin: string;
  requestCount: number;
}

const AdminPanel: React.FC<AdminPanelProps> = () => {
  const [activeTab, setActiveTab] = useState('monitor');
  const [loading, setLoading] = useState(false);
  
  // 状态数据
  const [dashboardStats, setDashboardStats] = useState<any>(null);
  const [agentStatus, setAgentStatus] = useState<AgentStatus[]>([]);
  const [apiConfigs, setApiConfigs] = useState<ApiConfig[]>([]);
  const [userStats, setUserStats] = useState<UserStats[]>([]);
  const [knowledgeBase, setKnowledgeBase] = useState<KnowledgeItem[]>([]);

  // 表单状态
  const [knowledgeForm] = Form.useForm();
  const [apiForm] = Form.useForm();
  const [knowledgeModalVisible, setKnowledgeModalVisible] = useState(false);
  const [apiModalVisible, setApiModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);

  // 加载数据
  useEffect(() => {
    loadDashboardData();
    loadAgentStatus();
    loadApiConfigs();
    loadUserStats();
    loadKnowledgeBase();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const response = await adminApiService.getDashboardData();
      if (response.success) {
        setDashboardStats(response.data);
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

  const loadApiConfigs = async () => {
    try {
      const response = await adminApiService.getSystemConfig();
      if (response.success) {
        const configs = Object.entries(response.data.apiSettings).map(([key, config]: [string, any]) => ({
          id: key,
          name: key.toUpperCase(),
          baseUrl: config.baseUrl,
          apiKey: '***hidden***',
          enabled: config.enabled,
          usage: config.usage,
          limit: config.limit
        }));
        setApiConfigs(configs);
      }
    } catch (error) {
      console.error('加载API配置失败:', error);
    }
  };

  const loadUserStats = async () => {
    try {
      // 模拟用户统计数据
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

  // Agent状态表格列
  const agentColumns = [
    {
      title: 'Agent名称',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={status === 'online' ? 'green' : status === 'offline' ? 'orange' : 'red'}>
          {status === 'online' ? '在线' : status === 'offline' ? '离线' : '错误'}
        </Tag>
      ),
    },
    {
      title: '响应时间',
      dataIndex: 'responseTime',
      key: 'responseTime',
      render: (time: number) => time > 0 ? `${time}ms` : '-',
    },
    {
      title: '请求次数',
      dataIndex: 'requestCount',
      key: 'requestCount',
    },
    {
      title: '错误率',
      dataIndex: 'errorRate',
      key: 'errorRate',
      render: (rate: number) => `${(rate * 100).toFixed(2)}%`,
    },
    {
      title: '最后心跳',
      dataIndex: 'lastHeartbeat',
      key: 'lastHeartbeat',
      render: (time: string) => new Date(time).toLocaleString(),
    },
  ];

  // API配置表格列
  const apiColumns = [
    {
      title: 'API名称',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '基础URL',
      dataIndex: 'baseUrl',
      key: 'baseUrl',
    },
    {
      title: '启用状态',
      dataIndex: 'enabled',
      key: 'enabled',
      render: (enabled: boolean) => (
        <Switch checked={enabled} onChange={() => toggleApiConfig('', !enabled)} />
      ),
    },
    {
      title: '使用量/限制',
      key: 'usage',
      render: (record: ApiConfig) => `${record.usage}/${record.limit}`,
    },
    {
      title: '操作',
      key: 'action',
      render: (record: ApiConfig) => (
        <Space>
          <Button size="small" icon={<EditOutlined />} onClick={() => editApiConfig(record)}>
            编辑
          </Button>
        </Space>
      ),
    },
  ];

  // 用户统计表格列
  const userColumns = [
    {
      title: '用户名',
      dataIndex: 'username',
      key: 'username',
    },
    {
      title: '手机号',
      dataIndex: 'phone',
      key: 'phone',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={status === 'active' ? 'green' : status === 'inactive' ? 'orange' : 'red'}>
          {status === 'active' ? '活跃' : status === 'inactive' ? '非活跃' : '封禁'}
        </Tag>
      ),
    },
    {
      title: '最后登录',
      dataIndex: 'lastLogin',
      key: 'lastLogin',
      render: (time: string) => new Date(time).toLocaleString(),
    },
    {
      title: '请求次数',
      dataIndex: 'requestCount',
      key: 'requestCount',
    },
  ];

  // 知识库表格列
  const knowledgeColumns = [
    {
      title: '分类',
      dataIndex: 'category',
      key: 'category',
    },
    {
      title: '标题',
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: '标签',
      dataIndex: 'tags',
      key: 'tags',
      render: (tags: string[]) => (
        <>
          {tags.map(tag => <Tag key={tag}>{tag}</Tag>)}
        </>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={status === 'active' ? 'green' : 'red'}>
          {status === 'active' ? '启用' : '禁用'}
        </Tag>
      ),
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (time: string) => new Date(time).toLocaleString(),
    },
    {
      title: '操作',
      key: 'action',
      render: (record: KnowledgeItem) => (
        <Space>
          <Button size="small" icon={<EditOutlined />} onClick={() => editKnowledge(record)}>
            编辑
          </Button>
          <Button size="small" danger icon={<DeleteOutlined />} onClick={() => deleteKnowledge(record.id)}>
            删除
          </Button>
        </Space>
      ),
    },
  ];

  const handleAddKnowledge = () => {
    setEditingItem(null);
    knowledgeForm.resetFields();
    setKnowledgeModalVisible(true);
  };

  const editKnowledge = (item: KnowledgeItem) => {
    setEditingItem(item);
    knowledgeForm.setFieldsValue(item);
    setKnowledgeModalVisible(true);
  };

  const deleteKnowledge = (id: string) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除这条知识库记录吗？',
      onOk: () => {
        setKnowledgeBase(knowledgeBase.filter(item => item.id !== id));
      },
    });
  };

  const editApiConfig = (config: ApiConfig) => {
    setEditingItem(config);
    apiForm.setFieldsValue(config);
    setApiModalVisible(true);
  };

  const toggleApiConfig = async (id: string, enabled: boolean) => {
    // 这里调用API更新配置
    console.log('Toggle API config:', id, enabled);
  };

  const handleKnowledgeSubmit = async (values: any) => {
    try {
      if (editingItem) {
        // 编辑
        setKnowledgeBase(knowledgeBase.map(item => 
          item.id === editingItem.id ? { ...item, ...values } : item
        ));
      } else {
        // 新增
        const newItem: KnowledgeItem = {
          id: Date.now().toString(),
          ...values,
          createdAt: new Date().toISOString(),
        };
        setKnowledgeBase([...knowledgeBase, newItem]);
      }
      setKnowledgeModalVisible(false);
      knowledgeForm.resetFields();
    } catch (error) {
      console.error('保存知识库失败:', error);
    }
  };

  return (
    <div style={{ padding: '24px', background: '#f0f2f5', minHeight: '100vh' }}>
      <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '24px' }}>
        🏛️ 东里村智能导游系统 - 管理后台
      </h1>

      <Tabs activeKey={activeTab} onChange={setActiveTab} type="card">
        {/* 系统监控 */}
        <TabPane tab={<span><MonitorOutlined />系统监控</span>} key="monitor">
          <Row gutter={16} style={{ marginBottom: '24px' }}>
            <Col span={6}>
              <Card>
                <Statistic
                  title="总提交数"
                  value={dashboardStats?.overview?.totalSubmissions || 0}
                  prefix={<DatabaseOutlined />}
                />
              </Card>
            </Col>
            <Col span={6}>
              <Card>
                <Statistic
                  title="活跃用户"
                  value={dashboardStats?.overview?.todayActive || 0}
                  prefix={<UserOutlined />}
                />
              </Card>
            </Col>
            <Col span={6}>
              <Card>
                <Statistic
                  title="草稿数量"
                  value={dashboardStats?.overview?.totalDrafts || 0}
                  prefix={<EditOutlined />}
                />
              </Card>
            </Col>
            <Col span={6}>
              <Card>
                <Statistic
                  title="在线Agent"
                  value={agentStatus.filter(a => a.status === 'online').length}
                  prefix={<ApiOutlined />}
                />
              </Card>
            </Col>
          </Row>

          <Card title="Agent健康状态" style={{ marginTop: '16px' }}>
            <Table
              columns={agentColumns}
              dataSource={agentStatus}
              rowKey="id"
              pagination={false}
              size="small"
            />
          </Card>
        </TabPane>

        {/* API配置 */}
        <TabPane tab={<span><SettingOutlined />API配置</span>} key="api">
          <Card
            title="API服务配置"
            extra={
              <Button type="primary" icon={<PlusOutlined />} onClick={() => setApiModalVisible(true)}>
                添加API
              </Button>
            }
          >
            <Table
              columns={apiColumns}
              dataSource={apiConfigs}
              rowKey="id"
              pagination={false}
              size="small"
            />
          </Card>
        </TabPane>

        {/* 用户管理 */}
        <TabPane tab={<span><UserOutlined />用户管理</span>} key="users">
          <Card title="用户统计 (D哥)">
            <Table
              columns={userColumns}
              dataSource={userStats}
              rowKey="id"
              pagination={{ pageSize: 10 }}
              size="small"
            />
          </Card>
        </TabPane>

        {/* 知识库管理 */}
        <TabPane tab={<span><DatabaseOutlined />知识库</span>} key="knowledge">
          <Card
            title="C数据知识库管理"
            extra={
              <Button type="primary" icon={<PlusOutlined />} onClick={handleAddKnowledge}>
                添加知识
              </Button>
            }
          >
            <Alert
              message="结构化知识库"
              description="一个萝卜一个坑填充，便于管理和维护。每个知识条目包含分类、标题、内容、标签等结构化信息。"
              type="info"
              showIcon
              style={{ marginBottom: '16px' }}
            />
            
            <Table
              columns={knowledgeColumns}
              dataSource={knowledgeBase}
              rowKey="id"
              pagination={{ pageSize: 10 }}
              size="small"
            />
          </Card>
        </TabPane>
      </Tabs>

      {/* 知识库编辑模态框 */}
      <Modal
        title={editingItem ? '编辑知识库' : '添加知识库'}
        visible={knowledgeModalVisible}
        onCancel={() => setKnowledgeModalVisible(false)}
        onOk={() => knowledgeForm.submit()}
        width={600}
      >
        <Form
          form={knowledgeForm}
          layout="vertical"
          onFinish={handleKnowledgeSubmit}
        >
          <Form.Item
            name="category"
            label="分类"
            rules={[{ required: true, message: '请选择分类' }]}
          >
            <Select placeholder="选择分类">
              <Option value="red_culture">红色文化</Option>
              <Option value="ecology">生态农业</Option>
              <Option value="folk">民俗文化</Option>
              <Option value="food">特色美食</Option>
              <Option value="celebrity">乡贤名人</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="title"
            label="标题"
            rules={[{ required: true, message: '请输入标题' }]}
          >
            <Input placeholder="输入知识库标题" />
          </Form.Item>

          <Form.Item
            name="content"
            label="内容"
            rules={[{ required: true, message: '请输入内容' }]}
          >
            <TextArea rows={4} placeholder="输入详细内容" />
          </Form.Item>

          <Form.Item
            name="tags"
            label="标签"
          >
            <Select mode="tags" placeholder="输入标签，回车添加">
              <Option value="红色文化">红色文化</Option>
              <Option value="历史">历史</Option>
              <Option value="生态">生态</Option>
              <Option value="农业">农业</Option>
              <Option value="民俗">民俗</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="status"
            label="状态"
            initialValue="active"
          >
            <Select>
              <Option value="active">启用</Option>
              <Option value="inactive">禁用</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      {/* API配置模态框 */}
      <Modal
        title="API配置"
        visible={apiModalVisible}
        onCancel={() => setApiModalVisible(false)}
        onOk={() => apiForm.submit()}
        width={600}
      >
        <Form
          form={apiForm}
          layout="vertical"
        >
          <Form.Item
            name="name"
            label="API名称"
            rules={[{ required: true, message: '请输入API名称' }]}
          >
            <Input placeholder="如：SiliconFlow" />
          </Form.Item>

          <Form.Item
            name="baseUrl"
            label="基础URL"
            rules={[{ required: true, message: '请输入基础URL' }]}
          >
            <Input placeholder="https://api.siliconflow.cn/v1" />
          </Form.Item>

          <Form.Item
            name="apiKey"
            label="API密钥"
          >
            <Input.Password placeholder="输入API密钥" />
          </Form.Item>

          <Form.Item
            name="limit"
            label="使用限制"
            rules={[{ required: true, message: '请输入使用限制' }]}
          >
            <InputNumber placeholder="1000" min={1} style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            name="enabled"
            label="启用状态"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default AdminPanel;
