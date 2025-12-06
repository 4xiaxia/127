import { 
  AgentRole, 
  SimpleANPMessage, 
  UserContextMessage, 
  AgentState,
  SimpleMessageBus,
  UserInteraction,
  SystemMetrics,
  SystemError
} from '../types/simple-agent-protocol';

// 简化的消息总线实现
export class SimpleANPMessageBus implements SimpleMessageBus {
  private agents = new Map<AgentRole, any>();
  private handlers = new Map<AgentRole, (message: SimpleANPMessage) => void>();
  private agentStates = new Map<AgentRole, AgentState>();
  
  constructor() {
    // 初始化Agent状态
    (['FRONTEND', 'TOOLS', 'KNOWLEDGE', 'MONITOR'] as AgentRole[]).forEach(role => {
      this.agentStates.set(role, {
        role,
        status: 'idle',
        lastHeartbeat: Date.now(),
        currentTasks: 0,
        totalProcessed: 0,
        errorCount: 0
      });
    });
  }

  async send(message: SimpleANPMessage): Promise<void> {
    try {
      const handler = this.handlers.get(message.to);
      if (!handler) {
        throw new Error(`No handler registered for agent ${message.to}`);
      }

      // 更新发送方状态
      this.updateAgentState(message.from, { currentTasks: 1 });
      
      // 处理消息
      await handler(message);
      
      // 更新统计
      this.updateAgentState(message.from, { 
        currentTasks: -1, 
        totalProcessed: 1 
      });
      
    } catch (error) {
      this.updateAgentState(message.from, { 
        currentTasks: -1, 
        errorCount: 1,
        status: 'error'
      });
      throw error;
    }
  }

  subscribe(agentRole: AgentRole, handler: (message: SimpleANPMessage) => void): void {
    this.handlers.set(agentRole, handler);
    this.updateAgentState(agentRole, { status: 'active' });
  }

  async broadcast(message: Omit<SimpleANPMessage, 'to'>): Promise<void> {
    const broadcastMessage = { ...message, to: 'MONITOR' as AgentRole };
    await this.send(broadcastMessage as SimpleANPMessage);
  }

  getAgentState(role: AgentRole): AgentState {
    return this.agentStates.get(role)!;
  }

  async healthCheck(): Promise<Record<AgentRole, boolean>> {
    const result: Record<AgentRole, boolean> = {} as any;
    const now = Date.now();
    
    this.agentStates.forEach((state, role) => {
      // 5分钟内有心跳且状态不是error
      result[role] = (now - state.lastHeartbeat < 300000) && state.status !== 'error';
    });
    
    return result;
  }

  private updateAgentState(role: AgentRole, updates: Partial<AgentState>): void {
    const current = this.agentStates.get(role)!;
    this.agentStates.set(role, {
      ...current,
      ...updates,
      lastHeartbeat: Date.now(),
      currentTasks: Math.max(0, current.currentTasks + (updates.currentTasks || 0)),
      totalProcessed: current.totalProcessed + (updates.totalProcessed || 0),
      errorCount: current.errorCount + (updates.errorCount || 0)
    });
  }
}

// Agent A - 前台服务实现
export class AgentA {
  private messageBus: SimpleMessageBus;
  private currentUserContext: UserContextMessage['data'] | null = null;

  constructor(messageBus: SimpleMessageBus) {
    this.messageBus = messageBus;
    this.setupMessageHandler();
  }

  private setupMessageHandler(): void {
    this.messageBus.subscribe('FRONTEND', (message) => {
      // Agent A 主要发送消息，很少接收
      console.log('Agent A received message:', message);
    });
  }

  // 页面变化监听
  onPageChange(page: string, data?: any): void {
    this.updateUserContext({
      currentPage: page,
      pageState: data,
      source: 'page_change'
    });
  }

  // 用户行为监听
  onUserAction(action: string, data?: any): void {
    this.updateUserContext({
      source: 'user_action',
      pageState: { activeElements: [action], userInputs: data }
    });

    // 记录用户交互到监控系统
    this.recordUserInteraction({
      type: 'page_view',
      data: { action, ...data }
    });
  }

  // 景点查看监听
  onSpotView(spotId: string, category: string): void {
    this.updateUserContext({
      currentSpot: spotId,
      currentCategory: category,
      source: 'spot_view'
    });

    // 记录景点查看
    this.recordUserInteraction({
      type: 'spot_click',
      data: { spotId, category }
    });
  }

  // 发送用户上下文给Agent B
  private async updateUserContext(updates: Partial<UserContextMessage['data']>): Promise<void> {
    // 更新本地上下文
    this.currentUserContext = {
      ...this.currentUserContext,
      ...updates,
      timestamp: Date.now()
    } as UserContextMessage['data'];

    // 发送给Agent B
    const message: SimpleANPMessage = {
      from: 'FRONTEND',
      to: 'TOOLS',
      messageId: `ctx_${Date.now()}`,
      timestamp: Date.now(),
      type: 'CONTEXT_UPDATE',
      payload: {
        action: 'update_user_context',
        data: this.currentUserContext
      }
    };

    await this.messageBus.send(message);
  }

  // 记录用户交互
  private async recordUserInteraction(interaction: Partial<UserInteraction>): Promise<void> {
    const fullInteraction: UserInteraction = {
      id: `int_${Date.now()}`,
      sessionId: this.currentUserContext?.userSession?.sessionId || 'unknown',
      timestamp: Date.now(),
      type: interaction.type || 'page_view',
      data: interaction.data || {},
      ...interaction
    };

    const message: SimpleANPMessage = {
      from: 'FRONTEND',
      to: 'MONITOR',
      messageId: `mon_${Date.now()}`,
      timestamp: Date.now(),
      type: 'MONITOR_EVENT',
      payload: {
        action: 'record_interaction',
        data: fullInteraction
      }
    };

    await this.messageBus.send(message);
  }

  // 获取当前用户上下文
  getCurrentUserContext(): UserContextMessage['data'] | null {
    return this.currentUserContext;
  }
}

// Agent B - 工具服务实现
export class AgentB {
  private messageBus: SimpleMessageBus;
  private currentUserContext: UserContextMessage['data'] | null = null;

  constructor(messageBus: SimpleMessageBus) {
    this.messageBus = messageBus;
    this.setupMessageHandler();
  }

  private setupMessageHandler(): void {
    this.messageBus.subscribe('TOOLS', async (message) => {
      switch (message.type) {
        case 'CONTEXT_UPDATE':
          if (message.payload.action === 'update_user_context') {
            await this.onUserContextUpdate(message.payload.data);
          }
          break;
        default:
          console.log('Agent B received unknown message:', message);
      }
    });
  }

  // 接收用户上下文更新
  async onUserContextUpdate(context: UserContextMessage['data']): Promise<void> {
    this.currentUserContext = context;
    
    // 根据上下文变化触发相应的工具
    if (context.source === 'spot_view' && context.currentSpot) {
      // 用户查看景点时，预加载景点信息
      await this.preloadSpotInfo(context.currentSpot);
    }
  }

  // 预加载景点信息
  private async preloadSpotInfo(spotId: string): Promise<void> {
    const message: SimpleANPMessage = {
      from: 'TOOLS',
      to: 'KNOWLEDGE',
      messageId: `know_${Date.now()}`,
      timestamp: Date.now(),
      type: 'KNOWLEDGE_QUERY',
      payload: {
        action: 'get_spot_info',
        data: { spotId }
      }
    };

    await this.messageBus.send(message);
  }

  // 执行语音生成
  async executeVoiceGeneration(text: string): Promise<any> {
    // 实际的语音生成逻辑
    console.log('Generating voice for:', text);
    return { audioData: 'base64_audio_data' };
  }

  // 执行问题回答
  async executeQuestionAnswer(question: string): Promise<string> {
    // 先查询知识库
    const message: SimpleANPMessage = {
      from: 'TOOLS',
      to: 'KNOWLEDGE',
      messageId: `qa_${Date.now()}`,
      timestamp: Date.now(),
      type: 'KNOWLEDGE_QUERY',
      payload: {
        action: 'search_knowledge',
        data: { query: question }
      }
    };

    await this.messageBus.send(message);
    
    // 实际的问答逻辑
    return `回答: ${question}`;
  }

  // 执行音频播放
  async executeAudioPlayback(audioData: string): Promise<void> {
    console.log('Playing audio:', audioData.substring(0, 50) + '...');
  }
}

// 全局消息总线实例
export const globalMessageBus = new SimpleANPMessageBus();

// 全局Agent实例
export const agentA = new AgentA(globalMessageBus);
export const agentB = new AgentB(globalMessageBus);