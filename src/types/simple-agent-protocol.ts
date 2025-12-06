// 优化后的Agent职责分工与通信协议

export type AgentRole = 'FRONTEND' | 'TOOLS' | 'KNOWLEDGE' | 'MONITOR';
export type AgentID = string;

// 基础数据类型
export interface AudioResult {
  audioData: string;
  duration?: number;
  format?: string;
}

export interface KnowledgeResult {
  id: string;
  title: string;
  content: string;
  relevance: number;
  source: string;
}

export interface RouteInfo {
  id: string;
  name: string;
  category: string;
  spots: string[];
  duration: number;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface SpotInfo {
  id: string;
  name: string;
  category: string;
  description: string;
  location: { lat: number; lng: number };
  images: string[];
  audio?: string;
  tags: string[];
  popularity: number;
}

// Agent A - 前台服务 (Frontend Service)
export interface AgentAInterface {
  role: 'FRONTEND';
  responsibilities: [
    '基础迎宾接待',
    '用户行为监听',
    '页面状态跟踪', 
    '用户足迹记录',
    '消息路由分发'
  ];
  
  // A发送给B的用户状态消息
  sendUserContext(context: UserContextMessage): Promise<void>;
  
  // 监听页面变化
  onPageChange(page: string, data?: any): void;
  onUserAction(action: string, data?: any): void;
  onSpotView(spotId: string, category: string): void;
}

// Agent B - 工具服务 (Tools Service) 
export interface AgentBInterface {
  role: 'TOOLS';
  responsibilities: [
    '问题回答处理',
    '对话管理',
    '语音交互',
    '音频播放控制',
    '工具调用执行'
  ];
  
  // 接收A的用户上下文
  onUserContextUpdate(context: UserContextMessage): Promise<void>;
  
  // 工具执行
  executeVoiceGeneration(text: string): Promise<AudioResult>;
  executeQuestionAnswer(question: string): Promise<string>;
  executeAudioPlayback(audioData: string): Promise<void>;
}

// Agent C - 知识服务 (Knowledge Service)
export interface AgentCInterface {
  role: 'KNOWLEDGE';
  responsibilities: [
    '景点数据管理',
    '文化知识库',
    '路线规划数据',
    '内容检索服务'
  ];
  
  // 为B提供知识支持
  getSpotInfo(spotId: string): Promise<SpotInfo>;
  searchKnowledge(query: string): Promise<KnowledgeResult[]>;
  getRouteData(category: string): Promise<RouteInfo[]>;
}

// Agent D - 监控服务 (Monitor Service)
export interface AgentDInterface {
  role: 'MONITOR';
  responsibilities: [
    '系统状态监控',
    '性能指标收集',
    '错误日志记录',
    '用户行为分析'
  ];
  
  // 监控数据收集
  recordUserInteraction(interaction: UserInteraction): void;
  recordSystemMetrics(metrics: SystemMetrics): void;
  recordError(error: SystemError): void;
}

// 用户上下文消息 - A发送给B
export interface UserContextMessage {
  type: 'USER_CONTEXT_UPDATE';
  data: {
    // 当前页面信息
    currentPage: string;
    currentSpot?: string;
    currentCategory?: string;
    
    // 用户状态
    userSession: {
      sessionId: string;
      startTime: number;
      visitedSpots: string[];
      interactions: UserInteraction[];
      preferences?: Record<string, any>;
    };
    
    // 页面状态
    pageState: {
      scrollPosition?: number;
      activeElements?: string[];
      userInputs?: Record<string, any>;
    };
    
    // 上下文元数据
    timestamp: number;
    source: 'page_change' | 'user_action' | 'spot_view' | 'periodic_update';
  };
}

// 简化的消息协议 - 专门为ABCD通信设计
export interface SimpleANPMessage {
  // 基础路由
  from: AgentRole;
  to: AgentRole;
  messageId: string;
  timestamp: number;
  
  // 消息类型
  type: 'CONTEXT_UPDATE' | 'TOOL_REQUEST' | 'KNOWLEDGE_QUERY' | 'MONITOR_EVENT' | 'RESPONSE';
  
  // 业务数据
  payload: {
    action: string;
    data: any;
    correlationId?: string; // 关联请求ID
  };
  
  // 简化的QoS
  timeout?: number;
  priority?: 'low' | 'normal' | 'high';
}

// Agent通信流程定义
export interface AgentCommunicationFlow {
  // A -> B: 用户上下文更新
  userContextFlow: {
    trigger: 'page_change' | 'user_action' | 'spot_view';
    message: SimpleANPMessage & {
      from: 'FRONTEND';
      to: 'TOOLS';
      type: 'CONTEXT_UPDATE';
      payload: {
        action: 'update_user_context';
        data: UserContextMessage['data'];
      };
    };
  };
  
  // B -> C: 知识查询
  knowledgeQueryFlow: {
    trigger: 'question_received' | 'spot_info_needed';
    message: SimpleANPMessage & {
      from: 'TOOLS';
      to: 'KNOWLEDGE';
      type: 'KNOWLEDGE_QUERY';
      payload: {
        action: 'search_knowledge' | 'get_spot_info';
        data: {
          query?: string;
          spotId?: string;
          category?: string;
        };
      };
    };
  };
  
  // A/B/C -> D: 监控事件
  monitorEventFlow: {
    trigger: 'user_interaction' | 'system_event' | 'error_occurred';
    message: SimpleANPMessage & {
      from: 'FRONTEND' | 'TOOLS' | 'KNOWLEDGE';
      to: 'MONITOR';
      type: 'MONITOR_EVENT';
      payload: {
        action: 'record_interaction' | 'record_metrics' | 'record_error';
        data: UserInteraction | SystemMetrics | SystemError;
      };
    };
  };
}

// 用户交互记录
export interface UserInteraction {
  id: string;
  sessionId: string;
  timestamp: number;
  type: 'page_view' | 'spot_click' | 'voice_input' | 'chat_message' | 'audio_play';
  data: {
    page?: string;
    spotId?: string;
    category?: string;
    input?: string;
    duration?: number;
    [key: string]: any;
  };
  userAgent?: string;
  location?: {
    lat?: number;
    lng?: number;
  };
}

// 系统指标
export interface SystemMetrics {
  timestamp: number;
  agent: AgentRole;
  metrics: {
    responseTime: number;
    memoryUsage: number;
    cpuUsage: number;
    activeConnections: number;
    messageQueueSize: number;
    errorCount: number;
  };
}

// 系统错误
export interface SystemError {
  id: string;
  timestamp: number;
  agent: AgentRole;
  level: 'info' | 'warn' | 'error' | 'fatal';
  message: string;
  stack?: string;
  context?: any;
  userSession?: string;
}

// 简化的Agent注册表
export interface SimpleAgentRegistry {
  agents: {
    A: AgentAInterface; // 前台服务
    B: AgentBInterface; // 工具服务  
    C: AgentCInterface; // 知识服务
    D: AgentDInterface; // 监控服务
  };
  
  // 消息路由规则
  routingRules: {
    'CONTEXT_UPDATE': { from: 'FRONTEND', to: 'TOOLS' };
    'KNOWLEDGE_QUERY': { from: 'TOOLS', to: 'KNOWLEDGE' };
    'MONITOR_EVENT': { from: ['FRONTEND', 'TOOLS', 'KNOWLEDGE'], to: 'MONITOR' };
  };
}

// Agent状态管理
export interface AgentState {
  role: AgentRole;
  status: 'active' | 'idle' | 'busy' | 'error';
  lastHeartbeat: number;
  currentTasks: number;
  totalProcessed: number;
  errorCount: number;
}

// 简化的消息总线
export interface SimpleMessageBus {
  // 发送消息
  send(message: SimpleANPMessage): Promise<void>;
  
  // 订阅消息
  subscribe(agentRole: AgentRole, handler: (message: SimpleANPMessage) => void): void;
  
  // 广播消息
  broadcast(message: Omit<SimpleANPMessage, 'to'>): Promise<void>;
  
  // 获取Agent状态
  getAgentState(role: AgentRole): AgentState;
  
  // 健康检查
  healthCheck(): Promise<Record<AgentRole, boolean>>;
}