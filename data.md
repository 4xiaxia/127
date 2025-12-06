、非必要绝对不引入任何新的库、函数、等，引入必须说明为什么
3、严格必须项目体现ANP多智能体协作（核心重点，去掉DID,专注信息共享、通信、与ANP2MCP调用各种现成工具）
4、剃刀原则，第一性原理 做事前先严格写出要做什么，已完成什么，接下来目标做什么，不得无记录。
5、数据库结构、字段、agent的通信传递与节奏，逻辑为核心！必须有说明文件，必须有明确清晰的开发思路
6、演示版支持硬编码
7、所有能用现成的，如高德地图，绝对不自己造轮子！做功能前先动脑子思考有没有可以现成使用的（mcp市场搜索引擎先搜！没有再做）
8、专注最小版本上线落地完整mvp

9、效率及全部、思路严谨就是灵魂得分 ，军工级作风，全部模块封装，各个功能封装隔离！数据交互需要写明交互逻辑和时序！不互相污染、逻辑有序，鹰眼般锐利，代码风格极致军工品质。实用主义即核心，动变通和调用工具，才是优秀

首页简化需求：分类栏目：红色文旅专区|风景景点大全|村镇人物志|自媒体展示|活动公告| 我详细说一下每个里面是什么： 说明：1 红色文旅区，栏目点击进去 由原来的路线，简化成只要有景点和故事即可，页面构成模板 uploud\fresh-start\red-culture-list.html 客户满意 ——在点击每个景点就是我们原来的景点详情内容 ，详情内容关键点：1图片-2景点简介（含静态的地图图片 地图截图一下即可内容展示）-3景点典故知识-（历史故事- 文本 加上一个文字转语音的按钮，美曰：ai朗读 ）—— 4、个性化拍照生成书签 可保存可分享——（生成书签= 足迹点亮=打卡成功 ） 其余景点一样（内容不同，模板一样，风景景点简介也是） 2 景点大全 一样逻辑 3、人物专区：点击进入后，里面是先级分类：革命先辈 | 乡贤名士 | 大学生花名册 ； 点击进去就是人物介绍了，内容丰富的在前先辈和乡贤 类似名人轶事那种东西|大学生花名册，按年份，是表格形式即可。 第四板块：自媒体展示——点击进去是自媒体汇总，类似文章展示页面，可以和下一个活动，公用一个文章类型的模板，图文那种，页面右边有个锁icon，点击之后，输入密码：ircoco000，就可以实施编辑，，点击保存生效，就可以了。不做复杂。

细节说明以下：

graph TB
User[用户] --> UI[MagicUI+ShadcnUI界面]
UI --> ANP[ANP协调层]

ANP --> AgentA[Agent A - 门面代理]
ANP --> AgentB[Agent B - 工具执行器] 
ANP --> AgentC[Agent C - 数据管理器]
ANP --> AgentD[Agent D - 通信协调器]

AgentB --> MCP[MCP工具市场]
MCP --> MapTool[高德地图工具]
MCP --> AITool[AI对话工具]
MCP --> DataTool[数据处理工具]

AgentC --> LocalDB[本地数据库]
AgentC --> CloudSync[云端同步]

AgentD --> MessageBus[消息总线]
MessageBus --> EventLog[事件日志]

📋 当前状态分析
✅ 已完成
深度分析了现有项目架构和问题
识别了关键技术债务和安全风险
确认了ANP多智能体协作的核心价值
🎯 接下来目标
基于新需求，重构为军工级ANP多智能体协作系统，使用MagicUI+ShadcnUI+CDN架构

🏗️ 系统架构设计
核心原则
剃刀原则: 最小可行产品(MVP)
第一性原理: ANP多智能体协作为核心
军工级标准: 模块封装、逻辑有序、零污染
实用主义: 现成工具优先，MCP市场搜索

📊 数据库结构设计
核心数据表
– Agent通信记录表
CREATE TABLE anp_messages (
id VARCHAR(50) PRIMARY KEY,
timestamp BIGINT NOT NULL,
source_agent VARCHAR(10) NOT NULL,
target_agent VARCHAR(10) NOT NULL,
message_type VARCHAR(20) NOT NULL,
action VARCHAR(50) NOT NULL,
payload TEXT,
status VARCHAR(20) DEFAULT ‘pending’
);

– 智能体状态表
CREATE TABLE agent_status (
agent_id VARCHAR(10) PRIMARY KEY,
status VARCHAR(20) NOT NULL,
last_heartbeat BIGINT NOT NULL,
capabilities TEXT,
load_factor DECIMAL(3,2) DEFAULT 0.0
);

– 用户会话表
CREATE TABLE user_sessions (
session_id VARCHAR(50) PRIMARY KEY,
user_id VARCHAR(50),
context_data TEXT,
created_at BIGINT NOT NULL,
updated_at BIGINT NOT NULL
);

– 景点数据表
CREATE TABLE spots (
id VARCHAR(20) PRIMARY KEY,
name VARCHAR(100) NOT NULL,
category VARCHAR(50),
coordinates VARCHAR(50),
description TEXT,
status VARCHAR(20) DEFAULT ‘active’
);

技术栈

核心依赖 (最小化原则)
React 18 (CDN) - UI框架
TypeScript (必要) - 类型安全
TailwindCSS (CDN) - 样式框架
MagicUI (CDN) - 动效组件
ShadcnUI (CDN) - 基础组件
外部服务 (现成工具优先)
高德地图API - 地图服务
MCP工具市场 - 各种现成工具
AI服务 - 智能对话

ANP多智能体通信协议设计
Agent职责分工矩阵
Agent 职责 输入 输出 协作对象
Agent A 门面协调器 用户请求、系统事件 路由指令、响应聚合 B, C, D
Agent B 工具执行器 工具调用指令 执行结果、状态更新 A, D
Agent C 信息处理器 数据查询、内容生成 结构化信息、知识图谱 A, D
Agent D 状态管理器 状态变更、数据同步 持久化确认、状态快照 A, B, C
消息通信协议

通信协议设计
// ANP消息标准格式
interface ANPMessage {
id: string; // 消息唯一标识
timestamp: number; // 时间戳
source: AgentID; // 发送方
target: AgentID; // 接收方
type: MessageType; // 消息类型
action: string; // 具体动作
payload: any; // 数据载荷
priority: Priority; // 优先级
trace: string[]; // 调用链追踪
}

// 消息类型枚举
enum MessageType {
REQUEST = ‘REQUEST’, // 请求
RESPONSE = ‘RESPONSE’, // 响应
EVENT = ‘EVENT’, // 事件
HEARTBEAT = ‘HEARTBEAT’, // 心跳
ERROR = ‘ERROR’ // 错误
}

// 优先级枚举
enum Priority {
CRITICAL = 0, // 关键
HIGH = 1, // 高
NORMAL = 2, // 普通
LOW = 3 // 低
}

通信节奏设计
sequenceDiagram
participant U as User
participant A as Agent A
participant B as Agent B
participant C as Agent C
participant D as Agent D

U->>A: 用户请求
A->>D: 记录请求状态
A->>C: 解析意图
C->>A: 返回意图结果
A->>B: 执行工具调用
B->>D: 更新执行状态
B->>A: 返回执行结果
A->>D: 记录完成状态
A->>U: 返回最终响应
东里村智能导游系统 - 军工级架构设计
🎯 设计原则
第一性原理
信息共享: Agent间无缝信息流转
通信协作: 标准化消息协议
工具调用: MCP标准工具集成
状态管理: 分布式状态同步
剃刀原则
最小化依赖，最大化复用
优先使用现成工具和服务
避免重复造轮子
专注核心业务逻辑
📁 目录结构
village-guide-anp/
├── index.html                 # 入口页面 (CDN架构)
├── docs/                      # 文档中心
│   ├── ANP_PROTOCOL.md        # ANP协议规范
│   ├── AGENT_DESIGN.md        # Agent设计文档
│   ├── DATABASE_SCHEMA.md     # 数据库结构
│   └── MCP_TOOLS.md          # MCP工具清单
├── core/                      # 核心模块 (零污染)
│   ├── anp/                   # ANP协议实现
│   │   ├── network.js         # 消息网络
│   │   ├── agents/            # Agent实现
│   │   │   ├── agent-a.js     # 门面协调器
│   │   │   ├── agent-b.js     # 工具执行器
│   │   │   ├── agent-c.js     # 信息处理器
│   │   │   └── agent-d.js     # 状态管理器
│   │   └── protocols.js       # 协议定义
│   ├── mcp/                   # MCP工具集成
│   │   ├── registry.js        # 工具注册表
│   │   ├── adapters/          # 工具适配器
│   │   └── marketplace.js     # 工具市场接口
│   ├── database/              # 数据层
│   │   ├── schema.js          # 数据结构
│   │   ├── sync.js           # 同步机制
│   │   └── storage.js        # 存储抽象
│   └── utils/                 # 工具函数
│       ├── logger.js          # 日志系统
│       ├── validator.js       # 数据验证
│       └── crypto.js         # 加密工具
├── ui/                        # 界面层 (CDN组件)
│   ├── components/            # UI组件
│   │   ├── chat/             # 聊天组件
│   │   ├── map/              # 地图组件
│   │   ├── guide/            # 导游组件
│   │   └── admin/            # 管理组件
│   ├── layouts/              # 布局组件
│   ├── pages/                # 页面组件
│   └── styles/               # 样式文件
├── data/                      # 数据文件
│   ├── spots.json            # 景点数据
│   ├── routes.json           # 路线数据
│   ├── celebrities.json      # 名人数据
│   └── config.json           # 配置数据
├── assets/                    # 静态资源
│   ├── images/               # 图片资源
│   ├── videos/               # 视频资源
│   └── audio/                # 音频资源
└── tests/                     # 测试文件
    ├── unit/                 # 单元测试
    ├── integration/          # 集成测试
    └── e2e/                  # 端到端测试
🔧 技术栈选择
前端架构 (纯CDN)
MagicUI: 动画和交互组件
ShadcnUI: 基础UI组件库
Tailwind CSS: 样式框架
Vanilla JS: 核心逻辑 (避免框架依赖)
后端服务 (现成工具)
高德地图API: 地图和导航服务
MCP工具市场: 标准化工具集成
LocalStorage: 本地数据存储
IndexedDB: 复杂数据存储
通信协议
ANP: 自定义Agent网络协议
WebSocket: 实时通信 (可选)
HTTP/REST: 标准API调用
EventSource: 服务器推送 (可选)
🎯 MVP功能范围
核心功能
智能对话: Agent A协调的多轮对话
景点导览: Agent C提供的内容服务
路线规划: Agent B调用地图工具
状态同步: Agent D管理的数据一致性
扩展功能 (后期)
语音交互: 语音识别和合成
图像识别: 拍照识别景点
社交分享: 内容分享功能
数据分析: 用户行为分析
📊 性能指标
指标	目标值	测量方法
首屏加载	<2s	Lighthouse
Agent响应	<500ms	内部监控
消息延迟	<100ms	网络监控
内存占用	<50MB	浏览器工具
错误率	<1%	错误监控
🔒 安全设计
数据安全
API密钥环境变量化
敏感数据加密存储
通信数据签名验证
访问控制
Agent权限隔离
工具调用授权
用户数据隔离
监控审计
完整的调用链追踪
异常行为检测
安全事件记录
数据库结构设计 - 军工级架构
🎯 设计原则
第一性原理
数据一致性: 强一致性保证
状态同步: 实时状态同步机制
消息持久化: 可靠的消息存储
性能优化: 高效的查询和索引
军工级要求
零数据丢失: 多重备份机制
故障恢复: 自动故障检测和恢复
安全隔离: 数据访问权限控制
监控审计: 完整的操作日志
📊 核心数据结构
1. Agent状态表 (agent_states)
CREATE TABLE agent_states (
  id VARCHAR(50) PRIMARY KEY,           -- Agent ID (AGENT_A, AGENT_B, AGENT_C, AGENT_D)
  status ENUM('online', 'offline', 'busy', 'error') NOT NULL,
  load_percentage DECIMAL(5,2) DEFAULT 0.00,  -- 负载百分比
  last_heartbeat TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  capabilities JSON,                    -- Agent能力描述
  config JSON,                         -- Agent配置
  metrics JSON,                        -- 性能指标
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX idx_status (status),
  INDEX idx_heartbeat (last_heartbeat)
);
2. 消息队列表 (message_queue)
CREATE TABLE message_queue (
  id VARCHAR(100) PRIMARY KEY,         -- 消息ID
  source_agent VARCHAR(50) NOT NULL,   -- 发送方Agent
  target_agent VARCHAR(50) NOT NULL,   -- 接收方Agent
  message_type ENUM('REQUEST', 'RESPONSE', 'EVENT', 'ERROR') NOT NULL,
  action VARCHAR(100) NOT NULL,        -- 动作类型
  payload JSON NOT NULL,               -- 消息载荷
  priority ENUM('HIGH', 'NORMAL', 'LOW') DEFAULT 'NORMAL',
  status ENUM('pending', 'processing', 'completed', 'failed') DEFAULT 'pending',
  timeout_ms INT DEFAULT 30000,        -- 超时时间
  retry_count INT DEFAULT 0,           -- 重试次数
  max_retries INT DEFAULT 3,           -- 最大重试次数
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  processed_at TIMESTAMP NULL,
  completed_at TIMESTAMP NULL,
  
  INDEX idx_target_status (target_agent, status),
  INDEX idx_priority_created (priority, created_at),
  INDEX idx_source_action (source_agent, action),
  INDEX idx_timeout (created_at, timeout_ms)
);
3. 用户会话表 (user_sessions)
CREATE TABLE user_sessions (
  id VARCHAR(100) PRIMARY KEY,         -- 会话ID
  user_id VARCHAR(100) NOT NULL,       -- 用户ID
  session_data JSON,                   -- 会话数据
  current_location JSON,               -- 当前位置 {lat, lng}
  current_spot VARCHAR(200),           -- 当前景点
  preferences JSON,                    -- 用户偏好
  conversation_history JSON,           -- 对话历史
  status ENUM('active', 'inactive', 'expired') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  expires_at TIMESTAMP,
  
  INDEX idx_user_status (user_id, status),
  INDEX idx_expires (expires_at),
  INDEX idx_spot (current_spot)
);
4. MCP工具注册表 (mcp_tools)
CREATE TABLE mcp_tools (
  id VARCHAR(100) PRIMARY KEY,         -- 工具ID
  name VARCHAR(200) NOT NULL,          -- 工具名称
  version VARCHAR(50) NOT NULL,        -- 版本号
  description TEXT,                    -- 工具描述
  endpoint VARCHAR(500),               -- API端点
  auth_config JSON,                    -- 认证配置
  rate_limit_config JSON,              -- 限流配置
  capabilities JSON,                   -- 工具能力
  status ENUM('active', 'inactive', 'deprecated') DEFAULT 'active',
  health_check_url VARCHAR(500),       -- 健康检查URL
  last_health_check TIMESTAMP,         -- 最后健康检查时间
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  UNIQUE KEY uk_name_version (name, version),
  INDEX idx_status (status),
  INDEX idx_health_check (last_health_check)
);
5. 工具调用日志表 (tool_execution_logs)
CREATE TABLE tool_execution_logs (
  id VARCHAR(100) PRIMARY KEY,         -- 日志ID
  tool_id VARCHAR(100) NOT NULL,       -- 工具ID
  agent_id VARCHAR(50) NOT NULL,       -- 调用Agent
  user_session_id VARCHAR(100),        -- 用户会话ID
  request_data JSON,                   -- 请求数据
  response_data JSON,                  -- 响应数据
  execution_time_ms INT,               -- 执行时间(毫秒)
  status ENUM('success', 'error', 'timeout') NOT NULL,
  error_message TEXT,                  -- 错误信息
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_tool_status (tool_id, status),
  INDEX idx_agent_created (agent_id, created_at),
  INDEX idx_session (user_session_id),
  INDEX idx_execution_time (execution_time_ms)
);
6. 系统配置表 (system_config)
CREATE TABLE system_config (
  config_key VARCHAR(200) PRIMARY KEY, -- 配置键
  config_value JSON NOT NULL,          -- 配置值
  config_type ENUM('agent', 'tool', 'system', 'user') NOT NULL,
  description TEXT,                    -- 配置描述
  is_encrypted BOOLEAN DEFAULT FALSE,  -- 是否加密
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX idx_type (config_type)
);
🔄 状态同步机制
1. Agent状态同步
// Agent状态更新流程
class AgentStateManager {
  async updateAgentState(agentId, stateData) {
    // 1. 更新数据库状态
    await this.db.query(`
      UPDATE agent_states 
      SET status = ?, load_percentage = ?, metrics = ?, updated_at = NOW()
      WHERE id = ?
    `, [stateData.status, stateData.load, stateData.metrics, agentId]);
    
    // 2. 广播状态变更事件
    await this.messageQueue.broadcast({
      type: 'EVENT',
      action: 'agent_state_changed',
      payload: { agent_id: agentId, state: stateData }
    });
    
    // 3. 更新本地缓存
    this.localCache.set(`agent_state_${agentId}`, stateData);
  }
  
  async getAgentStates() {
    // 优先从缓存获取，缓存失效时从数据库获取
    const cached = this.localCache.get('all_agent_states');
    if (cached && !this.isCacheExpired(cached)) {
      return cached.data;
    }
    
    const states = await this.db.query('SELECT * FROM agent_states');
    this.localCache.set('all_agent_states', { data: states, timestamp: Date.now() });
    return states;
  }
}
2. 消息持久化机制
// 消息队列管理
class MessageQueueManager {
  async enqueueMessage(message) {
    // 1. 持久化消息
    await this.db.query(`
      INSERT INTO message_queue 
      (id, source_agent, target_agent, message_type, action, payload, priority, timeout_ms)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      message.id, message.source, message.target, message.type,
      message.action, JSON.stringify(message.payload), message.priority, message.timeout
    ]);
    
    // 2. 添加到内存队列
    this.memoryQueue.push(message);
    
    // 3. 触发处理
    this.processQueue();
  }
  
  async processMessage(messageId) {
    // 1. 标记为处理中
    await this.db.query(`
      UPDATE message_queue 
      SET status = 'processing', processed_at = NOW()
      WHERE id = ?
    `, [messageId]);
    
    try {
      // 2. 执行消息处理逻辑
      const result = await this.executeMessage(messageId);
      
      // 3. 标记为完成
      await this.db.query(`
        UPDATE message_queue 
        SET status = 'completed', completed_at = NOW()
        WHERE id = ?
      `, [messageId]);
      
      return result;
    } catch (error) {
      // 4. 处理失败，增加重试计数
      await this.handleMessageError(messageId, error);
    }
  }
}
3. 用户会话管理
// 用户会话管理
class UserSessionManager {
  async createSession(userId, initialData = {}) {
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24小时后过期
    
    await this.db.query(`
      INSERT INTO user_sessions 
      (id, user_id, session_data, preferences, expires_at)
      VALUES (?, ?, ?, ?, ?)
    `, [sessionId, userId, JSON.stringify(initialData), JSON.stringify({}), expiresAt]);
    
    return sessionId;
  }
  
  async updateSession(sessionId, updates) {
    // 1. 更新数据库
    const setClause = Object.keys(updates).map(key => `${key} = ?`).join(', ');
    const values = Object.values(updates).map(val => 
      typeof val === 'object' ? JSON.stringify(val) : val
    );
    
    await this.db.query(`
      UPDATE user_sessions 
      SET ${setClause}, updated_at = NOW()
      WHERE id = ?
    `, [...values, sessionId]);
    
    // 2. 更新缓存
    this.sessionCache.set(sessionId, updates);
    
    // 3. 广播会话更新事件
    await this.messageQueue.broadcast({
      type: 'EVENT',
      action: 'session_updated',
      payload: { session_id: sessionId, updates }
    });
  }
}
📈 性能优化策略
1. 索引优化
-- 复合索引优化查询性能
CREATE INDEX idx_message_queue_processing ON message_queue (target_agent, status, priority, created_at);
CREATE INDEX idx_tool_logs_performance ON tool_execution_logs (tool_id, created_at, execution_time_ms);
CREATE INDEX idx_session_active ON user_sessions (status, updated_at) WHERE status = 'active';
2. 分区策略
-- 按时间分区消息队列表
ALTER TABLE message_queue PARTITION BY RANGE (UNIX_TIMESTAMP(created_at)) (
  PARTITION p_current VALUES LESS THAN (UNIX_TIMESTAMP('2024-01-01')),
  PARTITION p_2024_q1 VALUES LESS THAN (UNIX_TIMESTAMP('2024-04-01')),
  PARTITION p_2024_q2 VALUES LESS THAN (UNIX_TIMESTAMP('2024-07-01')),
  PARTITION p_2024_q3 VALUES LESS THAN (UNIX_TIMESTAMP('2024-10-01')),
  PARTITION p_2024_q4 VALUES LESS THAN (UNIX_TIMESTAMP('2025-01-01'))
);
3. 缓存策略
// 多级缓存架构
class CacheManager {
  constructor() {
    this.l1Cache = new Map(); // 内存缓存 (最快)
    this.l2Cache = new LocalStorageCache(); // 浏览器缓存 (中等)
    this.l3Cache = new IndexedDBCache(); // 持久化缓存 (较慢但持久)
  }
  
  async get(key) {
    // L1缓存
    if (this.l1Cache.has(key)) {
      return this.l1Cache.get(key);
    }
    
    // L2缓存
    const l2Value = await this.l2Cache.get(key);
    if (l2Value) {
      this.l1Cache.set(key, l2Value);
      return l2Value;
    }
    
    // L3缓存
    const l3Value = await this.l3Cache.get(key);
    if (l3Value) {
      this.l1Cache.set(key, l3Value);
      this.l2Cache.set(key, l3Value);
      return l3Value;
    }
    
    return null;
  }
  
  async set(key, value, ttl = 3600) {
    // 写入所有缓存层
    this.l1Cache.set(key, value);
    await this.l2Cache.set(key, value, ttl);
    await this.l3Cache.set(key, value, ttl);
  }
}
🔒 数据安全设计
1. 敏感数据加密
// 敏感配置加密存储
class SecureConfigManager {
  async setSecureConfig(key, value) {
    const encrypted = await this.encrypt(JSON.stringify(value));
    await this.db.query(`
      INSERT INTO system_config (config_key, config_value, is_encrypted)
      VALUES (?, ?, TRUE)
      ON DUPLICATE KEY UPDATE config_value = ?, is_encrypted = TRUE
    `, [key, encrypted, encrypted]);
  }
  
  async getSecureConfig(key) {
    const result = await this.db.query(`
      SELECT config_value, is_encrypted FROM system_config WHERE config_key = ?
    `, [key]);
    
    if (result.length === 0) return null;
    
    const { config_value, is_encrypted } = result[0];
    if (is_encrypted) {
      const decrypted = await this.decrypt(config_value);
      return JSON.parse(decrypted);
    }
    
    return config_value;
  }
}
2. 访问控制
// 基于角色的访问控制
class AccessControlManager {
  async checkPermission(agentId, resource, action) {
    const permissions = await this.getAgentPermissions(agentId);
    return permissions.some(p => 
      p.resource === resource && p.actions.includes(action)
    );
  }
  
  async auditAccess(agentId, resource, action, result) {
    await this.db.query(`
      INSERT INTO access_audit_log 
      (agent_id, resource, action, result, timestamp)
      VALUES (?, ?, ?, ?, NOW())
    `, [agentId, resource, action, result]);
  }
}
📊 监控指标
关键性能指标 (KPI)
const MONITORING_METRICS = {
  // 消息处理性能
  message_queue_size: "消息队列长度",
  message_processing_time: "消息处理时间",
  message_success_rate: "消息成功率",
  
  // Agent性能
  agent_response_time: "Agent响应时间",
  agent_availability: "Agent可用性",
  agent_load_distribution: "Agent负载分布",
  
  // 工具调用性能
  tool_execution_time: "工具执行时间",
  tool_success_rate: "工具成功率",
  tool_error_rate: "工具错误率",
  
  // 系统资源
  database_connection_pool: "数据库连接池",
  memory_usage: "内存使用率",
  cache_hit_rate: "缓存命中率"
};
数据库版本: v2.0 | 设计原则: 军工级可靠性 + 高性能 + 安全第一

设计原则: 军工级品质 + 实用主义 + 第一性原理

MCP工具市场清单 - 军工级选择
🎯 工具选择原则
第一性原理
现成优先: 优先使用成熟的MCP工具
避免造轮子: 不重复开发已有功能
质量保证: 选择活跃维护的项目
集成简单: 优先选择易于集成的工具
军工级标准
稳定性: 生产环境可用
安全性: 数据安全保障
性能: 响应时间可控
文档: 完整的使用文档
🔧 核心工具选择
1. 地图导航服务
选择: 高德地图API (现成服务)



lace/
3/
v3/






