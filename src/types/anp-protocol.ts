// 基础类型定义
export type AgentID = string;

export interface AgentStatus {
  status: 'online' | 'offline' | 'busy' | 'error' | 'maintenance';
  lastHeartbeat: number;
  currentLoad: number;
  errorCount: number;
  uptime: number;
  capabilities: string[];
  version: string;
}

// 标准化ANP消息协议
export interface StandardANPMessage {
  // 消息头 - 基础元信息
  header: {
    id: string;
    timestamp: number;
    version: string; // 协议版本 "1.0"
    priority: 'low' | 'normal' | 'high' | 'urgent';
    ttl?: number; // 消息生存时间(ms)
  };
  
  // 路由信息 - 消息传递控制
  routing: {
    source: AgentID;
    target: AgentID | 'BROADCAST';
    replyTo?: AgentID;
    correlationId?: string; // 关联请求ID，用于追踪请求-响应
    route?: AgentID[]; // 消息路径记录
  };
  
  // 消息类型
  type: 'REQUEST' | 'RESPONSE' | 'EVENT' | 'ERROR' | 'HEARTBEAT';
  
  // 业务载荷
  payload: {
    action: string;
    data: any;
    metadata?: {
      userContext?: string; // 用户上下文标识
      sessionId?: string; // 会话ID
      traceId?: string; // 链路追踪ID
      [key: string]: any;
    };
  };
  
  // 服务质量控制
  qos: {
    timeout?: number; // 超时时间(ms)
    retryCount?: number; // 重试次数
    requireAck?: boolean; // 是否需要确认
    deliveryMode?: 'at_most_once' | 'at_least_once' | 'exactly_once';
  };
}

// 错误码枚举
export enum ANPErrorCode {
  // 系统级错误 (1000-1999)
  SYSTEM_TIMEOUT = 1001,
  SYSTEM_OVERLOAD = 1002,
  AGENT_OFFLINE = 1003,
  CIRCUIT_BREAKER_OPEN = 1004,
  RATE_LIMIT_EXCEEDED = 1005,
  
  // 业务级错误 (2000-2999)
  INVALID_TOOL = 2001,
  TOOL_EXECUTION_FAILED = 2002,
  INSUFFICIENT_PARAMS = 2003,
  BUSINESS_LOGIC_ERROR = 2004,
  
  // 通信级错误 (3000-3999)
  MESSAGE_FORMAT_ERROR = 3001,
  ROUTING_FAILED = 3002,
  AUTHENTICATION_FAILED = 3003,
  AUTHORIZATION_FAILED = 3004,
  MESSAGE_TOO_LARGE = 3005,
  
  // 数据级错误 (4000-4999)
  CONTEXT_ACCESS_DENIED = 4001,
  CONTEXT_NOT_FOUND = 4002,
  DATA_VALIDATION_FAILED = 4003
}

// 标准化错误响应
export interface ANPError {
  code: ANPErrorCode;
  message: string;
  details?: any;
  timestamp: number;
  source: AgentID;
  correlationId?: string;
  retryable: boolean; // 是否可重试
  retryAfter?: number; // 重试延迟时间(ms)
}

// Agent权限定义
export interface AgentPermissions {
  // 工具调用权限
  tools: {
    allowed: string[]; // 允许调用的工具
    denied: string[]; // 禁止调用的工具
    requireApproval: string[]; // 需要审批的工具
  };
  
  // 上下文访问权限
  context: {
    read: string[]; // 可读字段
    write: string[]; // 可写字段
    subscribe: string[]; // 可订阅变更的字段
  };
  
  // 通信权限
  communication: {
    canBroadcast: boolean;
    allowedTargets: AgentID[]; // 允许通信的目标Agent
    maxMessageSize: number; // 最大消息大小(bytes)
  };
  
  // 资源限制
  limits: {
    maxConcurrentRequests: number;
    requestsPerMinute: number;
    requestsPerHour: number;
    maxMemoryUsage: number; // MB
    maxCpuTime: number; // ms
  };
}

// 上下文访问控制
export interface ContextAccessControl {
  read: AgentID[];
  write: AgentID[];
  notify: AgentID[]; // 变更通知订阅者
  owner: AgentID; // 数据所有者
  ttl?: number; // 数据生存时间
}

// 安全的共享上下文
export interface SecureSharedContext {
  userSession: {
    data: {
      currentSpot?: string;
      litSpots: string[];
      history: string[];
      preferences?: Record<string, any>;
    };
    access: ContextAccessControl;
    version: number; // 版本号，用于乐观锁
    lastModified: number;
  };
  
  systemStatus: {
    data: {
      agentHealth: Record<AgentID, AgentStatus>;
      pendingTasks: number;
      systemLoad: number;
      errorRate: number;
    };
    access: ContextAccessControl;
    version: number;
    lastModified: number;
  };
  
  businessData: {
    data: {
      spots: Record<string, any>;
      routes: Record<string, any>;
      userInteractions: any[];
    };
    access: ContextAccessControl;
    version: number;
    lastModified: number;
  };
}

// Agent状态定义
export interface AgentStatus {
  status: 'online' | 'offline' | 'busy' | 'error' | 'maintenance';
  lastHeartbeat: number;
  currentLoad: number; // 0-100
  errorCount: number;
  uptime: number; // ms
  capabilities: string[];
  version: string;
}

// 消息验证规则
export interface MessageValidationRule {
  field: string;
  required: boolean;
  type: 'string' | 'number' | 'boolean' | 'object' | 'array';
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  allowedValues?: any[];
  customValidator?: (value: any) => boolean;
}

// 审计日志条目
export interface AuditLogEntry {
  id: string;
  timestamp: number;
  event: string;
  source: AgentID;
  target?: AgentID;
  messageId?: string;
  action?: string;
  result: 'success' | 'failure' | 'timeout';
  duration?: number; // ms
  errorCode?: ANPErrorCode;
  metadata?: Record<string, any>;
}

// 性能监控指标
export interface PerformanceMetrics {
  messageCount: {
    total: number;
    byType: Record<string, number>;
    byAgent: Record<AgentID, number>;
  };
  
  responseTime: {
    average: number;
    p50: number;
    p95: number;
    p99: number;
  };
  
  errorRate: {
    total: number;
    byCode: Record<ANPErrorCode, number>;
    byAgent: Record<AgentID, number>;
  };
  
  throughput: {
    messagesPerSecond: number;
    bytesPerSecond: number;
  };
  
  resourceUsage: {
    memoryUsage: number; // MB
    cpuUsage: number; // %
    networkIO: number; // bytes/s
  };
}

// 配置管理
export interface ANPConfiguration {
  // 全局设置
  global: {
    defaultTimeout: number;
    maxRetries: number;
    heartbeatInterval: number;
    messageQueueSize: number;
  };
  
  // Agent配置
  agents: Record<AgentID, {
    permissions: AgentPermissions;
    config: Record<string, any>;
    enabled: boolean;
  }>;
  
  // 工具配置
  tools: Record<string, {
    timeout: number;
    retries: number;
    rateLimits: {
      callsPerMinute: number;
      callsPerHour: number;
    };
    requiredPermissions: string[];
  }>;
  
  // 监控配置
  monitoring: {
    enableAuditLog: boolean;
    enablePerformanceMetrics: boolean;
    metricsRetentionDays: number;
    alertThresholds: {
      errorRate: number;
      responseTime: number;
      memoryUsage: number;
    };
  };
}