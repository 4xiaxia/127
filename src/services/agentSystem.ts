import { AgentID, ANPMessage, SharedContext } from '../types';
import * as geminiService from './geminiService';

type MessageHandler = (msg: ANPMessage) => Promise<void>;

// 改进的请求管理器
class RequestManager {
  private timeouts = new Map<string, NodeJS.Timeout>();
  private pendingRequests = new Set<string>();

  createRequest(requestId: string, timeoutMs: number = 10000): Promise<boolean> {
    if (this.pendingRequests.has(requestId)) {
      console.warn(`Request ${requestId} already pending`);
      return Promise.resolve(false);
    }

    this.pendingRequests.add(requestId);
    
    const timeout = setTimeout(() => {
      this.cancelRequest(requestId);
      console.error(`Request ${requestId} timed out after ${timeoutMs}ms`);
    }, timeoutMs);
    
    this.timeouts.set(requestId, timeout);
    return Promise.resolve(true);
  }

  cancelRequest(requestId: string) {
    if (this.timeouts.has(requestId)) {
      clearTimeout(this.timeouts.get(requestId)!);
      this.timeouts.delete(requestId);
    }
    this.pendingRequests.delete(requestId);
  }

  cleanup() {
    this.timeouts.forEach(timeout => clearTimeout(timeout));
    this.timeouts.clear();
    this.pendingRequests.clear();
  }

  isRequestPending(requestId: string): boolean {
    return this.pendingRequests.has(requestId);
  }

  getPendingRequests(): string[] {
    return Array.from(this.pendingRequests);
  }
}

// 改进的Agent网络系统
class AgentNetwork {
  private listeners: Record<string, MessageHandler> = {};
  private sharedContext: SharedContext = {
    userSession: { history: [], litSpots: [] },
    systemStatus: { agentHealth: {}, pendingTasks: 0 }
  };
  
  public requestManager = new RequestManager();
  private retryConfig = {
    maxRetries: 3,
    baseDelay: 1000,
    backoffMultiplier: 2
  };
  private circuitBreakerConfig = {
    threshold: 5,
    timeout: 30000,
    failureCount: new Map<string, number>(),
    lastFailureTime: new Map<string, number>(),
    isOpen: new Map<string, boolean>()
  };

  register(agentId: AgentID, handler: MessageHandler) {
    this.listeners[agentId] = handler;
    this.sharedContext.systemStatus.agentHealth[agentId] = 'online';
  }

  unregister(agentId: AgentID) {
    delete this.listeners[agentId];
    delete this.sharedContext.systemStatus.agentHealth[agentId];
  }

  async dispatchWithRetry(msg: ANPMessage, retries: number = 0): Promise<void> {
    const requestId = msg.id;
    
    try {
      // 检查熔断器状态
      const serviceName = this.getServiceName(msg);
      if (this.isCircuitBreakerOpen(serviceName)) {
        if (Date.now() - (this.circuitBreakerConfig.lastFailureTime.get(serviceName) || 0) < this.circuitBreakerConfig.timeout) {
          throw new Error(`Circuit breaker is open for ${serviceName}`);
        } else {
          this.resetCircuitBreaker(serviceName);
        }
      }

      // 创建请求和超时控制
      const canProceed = await this.requestManager.createRequest(requestId, 15000);
      if (!canProceed) return;

      await this.dispatch(msg);
      this.requestManager.cancelRequest(requestId);
      
      // 记录成功
      this.recordSuccess(serviceName);
      
    } catch (error) {
      this.requestManager.cancelRequest(requestId);
      
      const serviceName = this.getServiceName(msg);
      this.recordFailure(serviceName);
      
      if (retries < this.retryConfig.maxRetries) {
        const delay = this.retryConfig.baseDelay * Math.pow(this.retryConfig.backoffMultiplier, retries);
        console.log(`Retrying request ${requestId} in ${delay}ms (attempt ${retries + 1}/${this.retryConfig.maxRetries})`);
        
        setTimeout(() => {
          this.dispatchWithRetry(msg, retries + 1);
        }, delay);
      } else {
        console.error(`Request ${requestId} failed after ${this.retryConfig.maxRetries} retries:`, error);
        
        // 发送错误响应
        this.dispatch({
          id: `err_${Date.now()}`,
          timestamp: Date.now(),
          source: 'SYSTEM' as AgentID,
          target: msg.source,
          type: 'ERROR',
          action: 'request_failed',
          payload: { 
            message: '请求失败，请稍后重试', 
            originalRequest: msg,
            error: error instanceof Error ? error.message : String(error)
          }
        });
      }
    }
  }

  public async dispatch(msg: ANPMessage): Promise<void> {
    this.monitor(msg);

    if (msg.target === 'BROADCAST') {
      const dispatchPromises = Object.values(this.listeners).map(handler => 
        handler(msg).catch(error => {
          console.error('Broadcast handler error:', error);
        })
      );
      await Promise.allSettled(dispatchPromises);
    } else if (this.listeners[msg.target]) {
      await this.listeners[msg.target](msg);
    }
  }

  private monitor(msg: ANPMessage) {
    if (msg.type === 'EVENT' && msg.action === 'context_update') {
      this.sharedContext = { ...this.sharedContext, ...msg.payload };
    }
    if (msg.source === 'USER' && msg.action === 'query') {
      this.sharedContext.userSession.history.push(msg.payload.text);
    }
  }

  private getServiceName(msg: ANPMessage): string {
    if (msg.action === 'call_tool') {
      const toolName = msg.payload?.toolName;
      return `tool:${toolName || 'unknown'}`;
    }
    return `agent:${msg.target}`;
  }

  private isCircuitBreakerOpen(serviceName: string): boolean {
    const failureCount = this.circuitBreakerConfig.failureCount.get(serviceName) || 0;
    const isOpen = this.circuitBreakerConfig.isOpen.get(serviceName) || false;
    
    return isOpen || failureCount >= this.circuitBreakerConfig.threshold;
  }

  private recordFailure(serviceName: string) {
    const failures = (this.circuitBreakerConfig.failureCount.get(serviceName) || 0) + 1;
    this.circuitBreakerConfig.failureCount.set(serviceName, failures);
    this.circuitBreakerConfig.lastFailureTime.set(serviceName, Date.now());
    
    if (failures >= this.circuitBreakerConfig.threshold) {
      this.circuitBreakerConfig.isOpen.set(serviceName, true);
      console.warn(`Circuit breaker opened for ${serviceName} due to ${failures} failures`);
    }
  }

  private recordSuccess(serviceName: string) {
    this.circuitBreakerConfig.failureCount.set(serviceName, 0);
    this.circuitBreakerConfig.isOpen.set(serviceName, false);
  }

  private resetCircuitBreaker(serviceName: string) {
    this.circuitBreakerConfig.failureCount.set(serviceName, 0);
    this.circuitBreakerConfig.isOpen.set(serviceName, false);
    this.circuitBreakerConfig.lastFailureTime.delete(serviceName);
  }

  cancelPendingRequests(agentId?: string) {
    if (agentId) {
      this.unregister(agentId as AgentID);
    }
    this.requestManager.cleanup();
  }

  getSystemHealth() {
    const agentHealth = Object.entries(this.sharedContext.systemStatus.agentHealth).map(([agentId, status]) => ({
      agentId,
      status,
      pendingRequests: this.requestManager.getPendingRequests().filter(req => req.includes(agentId)).length
    }));

    const circuitBreakerStatus = Object.fromEntries(
      Array.from(this.circuitBreakerConfig.failureCount.entries()).map(([service, count]) => [
        service,
        {
          failures: count,
          isOpen: this.circuitBreakerConfig.isOpen.get(service) || false,
          lastFailure: this.circuitBreakerConfig.lastFailureTime.get(service) || null
        }
      ])
    );

    return {
      agentsOnline: agentHealth,
      totalPendingRequests: this.requestManager.getPendingRequests().length,
      circuitBreakers: circuitBreakerStatus,
      timestamp: Date.now()
    };
  }

  getContext() {
    return this.sharedContext;
  }
}

export const Network = new AgentNetwork();

// 工具注册
const tools = {
  'voice_interaction': geminiService.voiceInteraction,
  'object_recognition': geminiService.objectRecognition,
  'get_shopping_info': geminiService.getShoppingInfo,
  'get_related_knowledge': geminiService.getRelatedKnowledge,
  'get_map': geminiService.getStaticMapImage
};

// Agent B: 工具执行器
Network.register('B', async (msg: ANPMessage) => {
  if (msg.type === 'REQUEST' && msg.action === 'call_tool') {
    const { toolName, params } = msg.payload;
    try {
      const tool = tools[toolName as keyof typeof tools];
      if (!tool) throw new Error(`Tool ${toolName} not found`);

      // 添加超时控制
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Tool execution timeout')), 30000)
      );

      const result = await Promise.race([(tool as any)(...params), timeoutPromise]);

      Network.dispatch({
        id: `resp_${Date.now()}`,
        timestamp: Date.now(),
        source: 'B',
        target: msg.source,
        type: 'RESPONSE',
        action: 'tool_result',
        payload: result
      });

      // 发送上下文更新事件
      if (params[0] && typeof params[0] === 'string') {
        Network.dispatch({
          id: `evt_${Date.now()}`,
          timestamp: Date.now(),
          source: 'B',
          target: 'A',
          type: 'EVENT',
          action: 'context_update',
          payload: { userSession: { currentSpot: params[0] } }
        });
      }
    } catch (error: any) {
      console.error('Tool execution failed:', error);
      
      Network.dispatch({
        id: `err_${Date.now()}`,
        timestamp: Date.now(),
        source: 'B',
        target: msg.source,
        type: 'ERROR',
        action: 'tool_failed',
        payload: { 
          message: error.message || '工具执行失败',
          toolName,
          error: error.stack
        }
      });
    }
  }
});

// 意图解析函数
function parseIntent(text: string): { tool: string, isCommerce: boolean } {
  if (text.includes('买') || text.includes('吃') || text.includes('特色')) {
    return { tool: 'get_shopping_info', isCommerce: true };
  }
  if (text.includes('历史') || text.includes('知识') || text.includes('故事')) {
    return { tool: 'get_related_knowledge', isCommerce: false };
  }
  return { tool: 'voice_interaction', isCommerce: false };
}

// Agent A: 门面服务
export const AgentA = {
  processUserRequest: async (
    text: string, 
    contextSpot: string, 
    mode: 'text' | 'photo' = 'text',
    options?: { signal?: AbortSignal }
  ): Promise<any> => {
    
    // 检查取消信号
    if (options?.signal?.aborted) {
      throw new Error('Request was cancelled');
    }

    return new Promise((resolve, reject) => {
      const requestId = `req_${Date.now()}`;

      // 设置请求取消监听
      const cancelHandler = (signal: AbortSignal) => {
        if (signal.aborted) {
          Network.requestManager.cancelRequest(requestId);
          reject(new Error('Request was cancelled'));
        }
      };

      if (options?.signal) {
        options.signal.addEventListener('abort', () => cancelHandler(options.signal!));
      }

      const responseHandler = async (msg: ANPMessage) => {
        try {
          if (msg.type === 'RESPONSE' || msg.type === 'ERROR') {
            if (msg.type === 'ERROR') {
              reject(new Error(msg.payload.message || '服务暂时不可用'));
            } else {
              resolve(msg.payload);
            }
          }
        } catch (error) {
          reject(error);
        }
      };
      
      Network.register('A', responseHandler);

      let toolName = 'voice_interaction';
      let params = [contextSpot, text];

      try {
        if (mode === 'photo') {
          toolName = 'object_recognition';
          params = [contextSpot];
        } else {
          const intent = parseIntent(text);
          if (intent.isCommerce) {
            toolName = 'get_shopping_info';
            params = ["118.205,25.235", contextSpot]; 
          } else if (intent.tool === 'get_related_knowledge') {
            toolName = 'get_related_knowledge';
            params = [contextSpot];
          }
        }

        Network.dispatchWithRetry({
          id: requestId,
          timestamp: Date.now(),
          source: 'A',
          target: 'B',
          type: 'REQUEST',
          action: 'call_tool',
          payload: { toolName, params }
        });

      } catch (error) {
        Network.unregister('A');
        reject(error);
      }
    });
  }
};

// 导出网络监控功能
export const NetworkMonitor = {
  getHealth: () => Network.getSystemHealth(),
  cancelAllRequests: () => Network.cancelPendingRequests(),
  getContext: () => Network.getContext()
};
