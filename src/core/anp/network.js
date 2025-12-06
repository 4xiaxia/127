// ANP网络核心 - 军工级消息总线
class ANPNetwork {
    constructor() {
        this.agents = new Map();
        this.messageQueue = [];
        this.messageHistory = [];
        this.isRunning = false;
        this.debugMode = false;
        this.heartbeatInterval = null;
        
        // 性能监控
        this.metrics = {
            messagesProcessed: 0,
            averageLatency: 0,
            errorCount: 0,
            startTime: Date.now()
        };
    }

    // 初始化网络
    initialize() {
        console.log('🚀 ANP网络初始化中...');
        
        this.isRunning = true;
        this.startMessageProcessor();
        this.startHeartbeat();
        
        console.log('✅ ANP网络启动完成');
        return this;
    }

    // 注册Agent
    registerAgent(agentId, agentInstance) {
        if (this.agents.has(agentId)) {
            throw new Error(`Agent ${agentId} 已存在`);
        }
        
        this.agents.set(agentId, {
            instance: agentInstance,
            status: 'online',
            lastHeartbeat: Date.now(),
            messageCount: 0,
            errorCount: 0
        });
        
        console.log(`📝 Agent ${agentId} 注册成功`);
        this.broadcastEvent('agent_registered', { agentId });
        
        return this;
    }

    // 发送消息
    async sendMessage(sourceId, targetId, action, payload, options = {}) {
        const message = {
            id: this.generateMessageId(),
            timestamp: Date.now(),
            source: sourceId,
            target: targetId,
            action: action,
            payload: payload,
            priority: options.priority || 'NORMAL',
            timeout: options.timeout || 30000,
            retryCount: 0,
            maxRetries: options.maxRetries || 3
        };

        // 添加到消息队列
        this.messageQueue.push(message);
        
        // 记录消息历史
        this.messageHistory.push({
            ...message,
            status: 'queued'
        });

        if (this.debugMode) {
            console.log('📨 ANP消息入队:', message);
        }

        return message.id;
    }

    // 广播消息
    async broadcast(action, payload, excludeAgent = null) {
        const promises = [];
        
        for (const [agentId] of this.agents) {
            if (agentId !== excludeAgent) {
                promises.push(
                    this.sendMessage('SYSTEM', agentId, action, payload)
                );
            }
        }
        
        return Promise.all(promises);
    }

    // 广播事件
    broadcastEvent(eventType, data) {
        const event = new CustomEvent('anp:' + eventType, { detail: data });
        window.dispatchEvent(event);
    }

    // 消息处理器
    startMessageProcessor() {
        const processMessages = async () => {
            if (!this.isRunning) return;
            
            // 按优先级排序
            this.messageQueue.sort((a, b) => {
                const priorities = { HIGH: 1, NORMAL: 2, LOW: 3 };
                return priorities[a.priority] - priorities[b.priority];
            });
            
            // 处理消息
            while (this.messageQueue.length > 0) {
                const message = this.messageQueue.shift();
                await this.processMessage(message);
            }
            
            // 继续处理
            setTimeout(processMessages, 10);
        };
        
        processMessages();
    }

    // 处理单个消息
    async processMessage(message) {
        const startTime = Date.now();
        
        try {
            // 检查超时
            if (Date.now() - message.timestamp > message.timeout) {
                throw new Error('消息超时');
            }
            
            // 获取目标Agent
            const targetAgent = this.agents.get(message.target);
            if (!targetAgent) {
                throw new Error(`目标Agent ${message.target} 不存在`);
            }
            
            // 检查Agent状态
            if (targetAgent.status !== 'online') {
                throw new Error(`Agent ${message.target} 不在线`);
            }
            
            // 执行消息处理
            let result;
            if (targetAgent.instance && typeof targetAgent.instance.handleMessage === 'function') {
                result = await targetAgent.instance.handleMessage(message);
            } else {
                result = await this.defaultMessageHandler(message);
            }
            
            // 更新统计
            const latency = Date.now() - startTime;
            this.updateMetrics(latency, true);
            targetAgent.messageCount++;
            
            // 记录成功
            this.updateMessageHistory(message.id, 'completed', result);
            
            if (this.debugMode) {
                console.log(`✅ 消息处理完成: ${message.id} (${latency}ms)`);
            }
            
            return result;
            
        } catch (error) {
            // 重试逻辑
            if (message.retryCount < message.maxRetries) {
                message.retryCount++;
                this.messageQueue.push(message);
                
                if (this.debugMode) {
                    console.log(`🔄 消息重试: ${message.id} (${message.retryCount}/${message.maxRetries})`);
                }
                
                return;
            }
            
            // 更新统计
            this.updateMetrics(Date.now() - startTime, false);
            this.metrics.errorCount++;
            
            // 记录失败
            this.updateMessageHistory(message.id, 'failed', { error: error.message });
            
            console.error(`❌ 消息处理失败: ${message.id}`, error);
            
            // 发送错误通知
            if (message.source !== 'SYSTEM') {
                this.sendMessage('SYSTEM', message.source, 'error', {
                    originalMessageId: message.id,
                    error: error.message
                });
            }
        }
    }

    // 默认消息处理器
    async defaultMessageHandler(message) {
        switch (message.action) {
            case 'ping':
                return { action: 'pong', timestamp: Date.now() };
            
            case 'get_status':
                return {
                    action: 'status_response',
                    status: this.getNetworkStatus()
                };
            
            default:
                throw new Error(`未知的消息动作: ${message.action}`);
        }
    }

    // 启动心跳检测
    startHeartbeat() {
        this.heartbeatInterval = setInterval(() => {
            this.checkAgentHealth();
            this.cleanupExpiredMessages();
        }, 5000);
    }

    // 检查Agent健康状态
    checkAgentHealth() {
        const now = Date.now();
        const timeout = 30000; // 30秒超时
        
        for (const [agentId, agent] of this.agents) {
            if (now - agent.lastHeartbeat > timeout) {
                agent.status = 'offline';
                console.warn(`⚠️ Agent ${agentId} 心跳超时`);
                this.broadcastEvent('agent_offline', { agentId });
            }
        }
    }

    // 清理过期消息
    cleanupExpiredMessages() {
        const cutoff = Date.now() - 300000; // 5分钟前
        this.messageHistory = this.messageHistory.filter(msg => msg.timestamp > cutoff);
    }

    // 更新性能指标
    updateMetrics(latency, success) {
        this.metrics.messagesProcessed++;
        
        // 计算平均延迟
        const alpha = 0.1; // 指数移动平均
        this.metrics.averageLatency = 
            this.metrics.averageLatency * (1 - alpha) + latency * alpha;
    }

    // 更新消息历史
    updateMessageHistory(messageId, status, result = null) {
        const message = this.messageHistory.find(msg => msg.id === messageId);
        if (message) {
            message.status = status;
            message.result = result;
            message.completedAt = Date.now();
        }
    }

    // 生成消息ID
    generateMessageId() {
        return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    // 获取网络状态
    getNetworkStatus() {
        const agentStatus = {};
        for (const [agentId, agent] of this.agents) {
            agentStatus[agentId] = {
                status: agent.status,
                messageCount: agent.messageCount,
                errorCount: agent.errorCount,
                lastHeartbeat: agent.lastHeartbeat
            };
        }
        
        return {
            isRunning: this.isRunning,
            agentCount: this.agents.size,
            queueLength: this.messageQueue.length,
            metrics: this.metrics,
            agents: agentStatus
        };
    }

    // 启用调试模式
    enableDebugMode() {
        this.debugMode = true;
        console.log('🐛 ANP调试模式已启用');
    }

    // 禁用调试模式
    disableDebugMode() {
        this.debugMode = false;
        console.log('🐛 ANP调试模式已禁用');
    }

    // 停止网络
    shutdown() {
        this.isRunning = false;
        
        if (this.heartbeatInterval) {
            clearInterval(this.heartbeatInterval);
        }
        
        this.agents.clear();
        this.messageQueue = [];
        
        console.log('🛑 ANP网络已停止');
    }

    // 获取Agent列表
    getAgents() {
        return Array.from(this.agents.keys());
    }

    // 获取消息历史
    getMessageHistory(limit = 50) {
        return this.messageHistory.slice(-limit);
    }

    // 获取性能指标
    getMetrics() {
        return {
            ...this.metrics,
            uptime: Date.now() - this.metrics.startTime,
            messagesPerSecond: this.metrics.messagesProcessed / ((Date.now() - this.metrics.startTime) / 1000)
        };
    }
}

// 创建全局ANP网络实例
window.ANPNetwork = new ANPNetwork();

// 导出供其他模块使用
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ANPNetwork;
}