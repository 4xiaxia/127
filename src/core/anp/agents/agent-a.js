// Agent A - 门面协调器 (军工级实现)
class AgentA {
    constructor() {
        this.agentId = 'AGENT_A';
        this.role = '门面协调器';
        this.status = 'offline';
        this.capabilities = [
            'user_interface',
            'intent_recognition', 
            'task_coordination',
            'response_aggregation'
        ];
        
        // 意图识别规则
        this.intentRules = [
            { pattern: /路线|导航|怎么走|路径/, intent: 'navigation', needsTools: true },
            { pattern: /特产|购买|买|商店|价格/, intent: 'shopping', needsTools: true },
            { pattern: /景点|介绍|参观|游览/, intent: 'attraction', needsTools: false },
            { pattern: /名人|历史|故事|文化/, intent: 'culture', needsTools: false },
            { pattern: /天气|温度|气候/, intent: 'weather', needsTools: true },
            { pattern: /餐厅|吃饭|美食|饭店/, intent: 'dining', needsTools: true }
        ];
        
        // 响应模板
        this.responseTemplates = {
            greeting: '您好！我是东里村的AI智能导游，很高兴为您服务！',
            fallback: '抱歉，我没有理解您的问题。您可以问我关于景点、路线、特产或历史文化的问题。',
            error: '系统暂时不可用，请稍后再试。',
            processing: '正在为您查询相关信息，请稍候...'
        };
    }

    // 初始化Agent
    async initialize() {
        try {
            // 注册到ANP网络
            window.ANPNetwork.registerAgent(this.agentId, this);
            
            this.status = 'online';
            console.log(`✅ ${this.agentId} (${this.role}) 初始化完成`);
            
            return true;
        } catch (error) {
            console.error(`❌ ${this.agentId} 初始化失败:`, error);
            this.status = 'error';
            return false;
        }
    }

    // 处理用户请求 (主要入口)
    async processUserRequest(message, location = '东里村', mode = 'text') {
        const startTime = Date.now();
        
        try {
            // 发送ANP消息记录用户请求
            await window.ANPNetwork.sendMessage('USER', this.agentId, 'user_request', {
                message,
                location,
                mode,
                timestamp: startTime
            });

            // 1. 意图识别
            const intent = this.parseIntent(message);
            
            // 2. 上下文增强
            const context = await this.buildContext(location, intent);
            
            // 3. 任务路由
            let response;
            if (intent.needsTools) {
                response = await this.routeToToolAgent(intent, message, context);
            } else {
                response = await this.routeToInfoAgent(intent, message, context);
            }
            
            // 4. 响应聚合和优化
            const finalResponse = await this.aggregateResponse(response, intent, context);
            
            // 5. 更新状态
            await this.updateAgentState(message, finalResponse);
            
            const responseTime = Date.now() - startTime;
            
            return {
                text: finalResponse.text,
                audio: finalResponse.audio,
                images: finalResponse.images,
                metadata: {
                    intent: intent.type,
                    responseTime,
                    agent: this.agentId,
                    confidence: finalResponse.confidence || 0.8
                }
            };
            
        } catch (error) {
            console.error(`❌ ${this.agentId} 处理请求失败:`, error);
            
            return {
                text: this.responseTemplates.error,
                error: true,
                metadata: {
                    error: error.message,
                    responseTime: Date.now() - startTime,
                    agent: this.agentId
                }
            };
        }
    }

    // 意图识别
    parseIntent(message) {
        const text = message.toLowerCase();
        
        // 遍历意图规则
        for (const rule of this.intentRules) {
            if (rule.pattern.test(text)) {
                return {
                    type: rule.intent,
                    needsTools: rule.needsTools,
                    confidence: 0.9,
                    originalText: message
                };
            }
        }
        
        // 默认意图
        return {
            type: 'general',
            needsTools: false,
            confidence: 0.5,
            originalText: message
        };
    }

    // 构建上下文
    async buildContext(location, intent) {
        const context = {
            location,
            intent: intent.type,
            timestamp: Date.now(),
            sessionId: this.getSessionId(),
            userPreferences: await this.getUserPreferences()
        };
        
        // 发送上下文构建消息到Agent D
        await window.ANPNetwork.sendMessage(
            this.agentId, 
            'AGENT_D', 
            'build_context', 
            context
        );
        
        return context;
    }

    // 路由到工具执行Agent
    async routeToToolAgent(intent, message, context) {
        const toolRequest = {
            intent: intent.type,
            query: message,
            context,
            timestamp: Date.now()
        };
        
        // 发送到Agent B
        const messageId = await window.ANPNetwork.sendMessage(
            this.agentId,
            'AGENT_B',
            'execute_tool',
            toolRequest
        );
        
        // 等待响应 (简化实现，实际应该通过回调处理)
        return new Promise((resolve) => {
            setTimeout(() => {
                // 模拟工具执行结果
                const mockResponse = this.getMockToolResponse(intent.type, message);
                resolve(mockResponse);
            }, 800 + Math.random() * 1200);
        });
    }

    // 路由到信息处理Agent
    async routeToInfoAgent(intent, message, context) {
        const infoRequest = {
            intent: intent.type,
            query: message,
            context,
            timestamp: Date.now()
        };
        
        // 发送到Agent C
        const messageId = await window.ANPNetwork.sendMessage(
            this.agentId,
            'AGENT_C',
            'process_information',
            infoRequest
        );
        
        // 等待响应
        return new Promise((resolve) => {
            setTimeout(() => {
                const mockResponse = this.getMockInfoResponse(intent.type, message);
                resolve(mockResponse);
            }, 500 + Math.random() * 800);
        });
    }

    // 聚合响应
    async aggregateResponse(response, intent, context) {
        // 基础响应处理
        let finalResponse = {
            text: response.text || this.responseTemplates.fallback,
            confidence: response.confidence || 0.7
        };
        
        // 根据意图类型优化响应
        switch (intent.type) {
            case 'navigation':
                finalResponse = this.enhanceNavigationResponse(finalResponse, response);
                break;
            case 'shopping':
                finalResponse = this.enhanceShoppingResponse(finalResponse, response);
                break;
            case 'attraction':
                finalResponse = this.enhanceAttractionResponse(finalResponse, response);
                break;
            default:
                break;
        }
        
        // 添加个性化元素
        finalResponse = await this.personalizeResponse(finalResponse, context);
        
        return finalResponse;
    }

    // 增强导航响应
    enhanceNavigationResponse(response, originalResponse) {
        if (originalResponse.route) {
            response.text += `\n\n📍 推荐路线：${originalResponse.route}`;
        }
        if (originalResponse.duration) {
            response.text += `\n⏱️ 预计时间：${originalResponse.duration}`;
        }
        return response;
    }

    // 增强购物响应
    enhanceShoppingResponse(response, originalResponse) {
        if (originalResponse.products) {
            response.text += '\n\n🛍️ 推荐商品：';
            originalResponse.products.forEach((product, index) => {
                response.text += `\n${index + 1}. ${product.name} - ¥${product.price}`;
            });
        }
        return response;
    }

    // 增强景点响应
    enhanceAttractionResponse(response, originalResponse) {
        if (originalResponse.attractions) {
            response.text += '\n\n🏛️ 相关景点：';
            originalResponse.attractions.forEach((attraction, index) => {
                response.text += `\n${index + 1}. ${attraction.name} - ${attraction.description}`;
            });
        }
        return response;
    }

    // 个性化响应
    async personalizeResponse(response, context) {
        // 根据用户偏好调整响应
        if (context.userPreferences) {
            if (context.userPreferences.language === 'formal') {
                response.text = response.text.replace(/你/g, '您');
            }
        }
        
        // 添加时间相关的问候
        const hour = new Date().getHours();
        let greeting = '';
        if (hour < 12) {
            greeting = '早上好！';
        } else if (hour < 18) {
            greeting = '下午好！';
        } else {
            greeting = '晚上好！';
        }
        
        // 在某些情况下添加问候
        if (Math.random() < 0.3) {
            response.text = greeting + response.text;
        }
        
        return response;
    }

    // 更新Agent状态
    async updateAgentState(request, response) {
        const stateUpdate = {
            lastRequest: request,
            lastResponse: response.text,
            requestCount: (this.requestCount || 0) + 1,
            timestamp: Date.now()
        };
        
        await window.ANPNetwork.sendMessage(
            this.agentId,
            'AGENT_D',
            'update_state',
            { agentId: this.agentId, state: stateUpdate }
        );
        
        this.requestCount = stateUpdate.requestCount;
    }

    // 获取会话ID
    getSessionId() {
        if (!this.sessionId) {
            this.sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        }
        return this.sessionId;
    }

    // 获取用户偏好
    async getUserPreferences() {
        // 从本地存储或Agent D获取用户偏好
        return {
            language: 'casual',
            interests: ['history', 'culture'],
            visitType: 'tourist'
        };
    }

    // 模拟工具响应
    getMockToolResponse(intentType, message) {
        const responses = {
            navigation: {
                text: '为您规划了最佳游览路线：文化广场 → 古建筑群 → 名人故居 → 特产店',
                route: '文化广场 → 古建筑群 → 名人故居 → 特产店',
                duration: '2-3小时',
                confidence: 0.9
            },
            shopping: {
                text: '推荐东里村特色产品',
                products: [
                    { name: '手工竹编', price: 68 },
                    { name: '有机茶叶', price: 128 },
                    { name: '传统糕点', price: 38 }
                ],
                confidence: 0.85
            },
            weather: {
                text: '今天东里村天气晴朗，温度22-28°C，适合游览',
                temperature: '22-28°C',
                condition: '晴朗',
                confidence: 0.95
            },
            dining: {
                text: '推荐附近餐厅：村里小厨、农家乐、传统茶馆',
                restaurants: [
                    { name: '村里小厨', type: '农家菜', rating: 4.5 },
                    { name: '农家乐', type: '本地菜', rating: 4.2 },
                    { name: '传统茶馆', type: '茶点', rating: 4.7 }
                ],
                confidence: 0.8
            }
        };
        
        return responses[intentType] || {
            text: '已为您查询相关信息',
            confidence: 0.6
        };
    }

    // 模拟信息响应
    getMockInfoResponse(intentType, mesge) {
        const responses = {
            attraction: {
                text: '东里村主要景点包括文化广场、古建筑群和名人故居，每个都有独特的历史价           attractions: [
                    { name: '文化广场', description: '村民活动中心，展示当地文化' },
                    { name: '古建筑群', description: '明清时期建筑，保存完好' },
                    { name: '名人故居', description: '历史文化名人居住地' }
                ],
                confidence: 0.9
            },
            culture: {
                text: '东里村有着800多年历史，文化底蕴深厚，是闽南文化的重要代表',
           history: '始建于南宋时期',
                culture: '闽南传统文化',
                confidence: 0.95
            },
    general: {
                text: '东里村是一个美丽的古村落，欢迎您的到来！有什么具体想了解的吗？',
                confidence: 0.7
            }
        };
        return responses[intentType] || responses.general;
    }

    // 处理ANP消息
    async handleMessage(message) {
        switch (age.action) {
            case 'ping':
                return { action: 'pong', timestamp: Date.now(), agent: Id };
            
            case 'get_status':
                return {
                    action: 'status_response',
                    status: this.status,
                    role: this.role,
                    capabilities: this.capabilities,
                    requestCount: this.requestCount || 0
                };
            
            default:
                throw new Error(`未知的消息动作: ${message.action}`);
        }
    }

    // 获取Agent状态
    getStatus() {
        return {
            agentId: this.agentId,
            role: this.role,
            status: this.status,
            capabilities: this.capabilities,
            requestCount: this.requestCount || 0,
            sessionId: this.sessionId
        };
    }
}

// 创建全局Agent A实例
window.AgentA = new AgentA();

// 自动初始化
document.addEventListener('DOMContentLoaded', () => {
    window.AgentA.initialize();
});

// 导出供其他模块使用
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AgentA;
}