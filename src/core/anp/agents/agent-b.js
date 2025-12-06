// Agent B - 工具执行器 (军工级实现)
class AgentB {
    constructor() {
        this.agentId = 'AGENT_B';
        this.role = '工具执行器';
        this.status = 'offline';
        this.capabilities = [
            'mcp_tool_execution',
            'api_integration',
            'external_service_calls',
            'data_processing'
        ];
        
        // 硬编码API配置 (演示版本)
        this.apiConfig = {
            siliconFlow: {
                apiKey: 'sk-cjqstblrzdcgwpayffghxnzletgcckesnysskzdfnwdhiutg',
                baseUrl: 'https://api.siliconflow.cn/v1',
                model: 'deepseek-chat'
            },
            zhipu: {
                apiKey: 'a049afdafb1b41a0862cdc1d73d5d6eb.YuGYXVGRQEUILpog',
                baseUrl: 'https://open.bigmodel.cn/api/paas/v4',
                model: 'glm-4-flash'
            },
            minimax: {
                apiKey: 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJHcm91cE5hbWUiOiJscyBsbGx5eXlzc3MiLCJVc2VyTmFtZSI6ImxzIGxsbHl5eXNzcyIsIkFjY291bnQiOiIiLCJTdWJqZWN0SUQiOiIxOTE4Nzk2Mjk4NDAwNTY3NDkyIiwiUGhvbmUiOiIiLCJHcm91cElEIjoiMTkxODc5NjI5ODM5NjM3MzE4OCIsIlBhZ2VOYW1lIjoiIiwiTWFpbCI6ImxsbC55eXkuc3NzLjc3QGdtYWlsLmNvbSIsIkNyZWF0ZVRpbWUiOiIyMDI1LTExLTIwIDE1OjUxOjQwIiwiVG9rZW5UeXBlIjoxLCJpc3MiOiJtaW5pbWF4In0.Nvc6I_x53hQk_OSankcxU1uyb2Cek9-EhZoNO44mS1wsyiR2TNiof8FA9JmELCEBjnkomCCho1cxseEb098hAebTNklqRL5PlVl4rxaj4spAZt-1oloxojSSU3g-NoiurR-4dPcSMp43KOp0mc3Ci_piLylbxOG9H2WT3iN4Eaaj_558q7DgsbmpwLmpf3vOiy_j_qBEF5QztVN4gF8xhPasjXWAmT_hox7fmjTubn4PcQMbaAHKVBj95uP8l4VwbrjRpLaajyMIKHGoTS_0JAhmBH2psw49I2CouBNLggZGsOQS9XLepjX7euCtrMPJC7V0kPsUGJuxddLnYLrzJw',
                groupId: '1918796298396373188',
                baseUrl: 'https://api.minimax.chat/v1'
            },
            amap: {
                apiKey: 'your_amap_key_here', // 需要申请高德地图API Key
                baseUrl: 'https://restapi.amap.com/v3'
            }
        };
        
        // 工具注册表
        this.tools = new Map();
        this.registerDefaultTools();
        
        // 执行统计
        this.executionStats = {
            totalExecutions: 0,
            successCount: 0,
            errorCount: 0,
            averageLatency: 0
        };
    }

    // 初始化Agent
    async initialize() {
        try {
            // 注册到ANP网络
            window.ANPNetwork.registerAgent(this.agentId, this);
            
            // 测试API连接
            await this.testApiConnections();
            
            this.status = 'online';
            console.log(`✅ ${this.agentId} (${this.role}) 初始化完成`);
            
            return true;
        } catch (error) {
            console.error(`❌ ${this.agentId} 初始化失败:`, error);
            this.status = 'error';
            return false;
        }
    }

    // 注册默认工具
    registerDefaultTools() {
        // AI对话工具
        this.tools.set('ai_chat', {
            name: 'AI对话',
            description: '调用AI服务进行对话',
            handler: this.executeAIChat.bind(this),
            timeout: 30000
        });
        
        // 地图搜索工具
        this.tools.set('map_search', {
            name: '地图搜索',
            description: '搜索地点和POI信息',
            handler: this.executeMapSearch.bind(this),
            timeout: 10000
        });
        
        // 路线规划工具
        this.tools.set('route_planning', {
            name: '路线规划',
            description: '规划两点间的路线',
            handler: this.executeRoutePlanning.bind(this),
            timeout: 15000
        });
        
        // 语音合成工具
        this.tools.set('text_to_speech', {
            name: '语音合成',
            description: '将文本转换为语音',
            handler: this.executeTextToSpeech.bind(this),
            timeout: 20000
        });
        
        // 天气查询工具
        this.tools.set('weather_query', {
            name: '天气查询',
            description: '查询指定地点的天气信息',
            handler: this.executeWeatherQuery.bind(this),
            timeout: 10000
        });
    }

    // 执行工具
    async executeTool(toolName, params, context = {}) {
        const startTime = Date.now();
        
        try {
            // 发送ANP消息
            await window.ANPNetwork.sendMessage(
                'AGENT_A',
                this.agentId,
                'execute_tool',
                { tool: toolName, params, context }
            );
            
            // 检查工具是否存在
            const tool = this.tools.get(toolName);
            if (!tool) {
                throw new Error(`工具 ${toolName} 未注册`);
            }
            
            // 执行工具
            const result = await Promise.race([
                tool.handler(params, context),
                this.createTimeoutPromise(tool.timeout)
            ]);
            
            // 更新统计
            const latency = Date.now() - startTime;
            this.updateExecutionStats(latency, true);
            
            // 发送结果
            await window.ANPNetwork.sendMessage(
                this.agentId,
                'AGENT_A',
                'tool_result',
                { 
                    tool: toolName, 
                    result, 
                    latency,
                    success: true 
                }
            );
            
            console.log(`✅ 工具执行成功: ${toolName} (${latency}ms)`);
            return result;
            
        } catch (error) {
            const latency = Date.now() - startTime;
            this.updateExecutionStats(latency, false);
            
            console.error(`❌ 工具执行失败: ${toolName}`, error);
            
            // 发送错误结果
            await window.ANPNetwork.sendMessage(
                this.agentId,
                'AGENT_A',
                'tool_error',
                { 
                    tool: toolName, 
                    error: error.message, 
                    latency 
                }
            );
            
            throw error;
        }
    }

    // AI对话工具实现
    async executeAIChat(params, context) {
        const { message, location = '东里村', mode = 'text' } = params;
        
        try {
            // 构建提示词
            const prompt = this.buildChatPrompt(message, location, context);
            
            // 优先使用硅基流动
            let result = await this.callSiliconFlowAPI(prompt);
            
            // 如果失败，尝试智谱AI
            if (!result) {
                result = await this.callZhipuAPI(prompt);
            }
            
            if (!result) {
                throw new Error('所有AI服务都不可用');
            }
            
            return {
                text: result.text,
                confidence: result.confidence || 0.8,
                source: result.source,
                tokens: result.tokens
            };
            
        } catch (error) {
            console.error('AI对话执行失败:', error);
            return {
                text: '抱歉，AI服务暂时不可用，请稍后再试。',
                confidence: 0.1,
                source: 'fallback',
                error: error.message
            };
        }
    }

    // 硅基流动API调用
    async callSiliconFlowAPI(prompt) {
        try {
            const response = await fetch(`${this.apiConfig.siliconFlow.baseUrl}/chat/completions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.apiConfig.siliconFlow.apiKey}`
                },
                body: JSON.stringify({
                    model: this.apiConfig.siliconFlow.model,
                    messages: [
                        {
                            role: 'system',
                            content: '你是东里村的专业AI导游，熟悉当地的历史文化、景点介绍、特产美食等信息。请用友好、专业的语气回答游客的问题。'
                        },
                        {
                            role: 'user',
                            content: prompt
                        }
                    ],
                    temperature: 0.7,
                    max_tokens: 1000
                })
            });
            
            if (!response.ok) {
                throw new Error(`硅基流动API错误: ${response.status}`);
            }
            
            const data = await response.json();
            
            return {
                text: data.choices[0].message.content,
                confidence: 0.9,
                source: 'siliconflow',
                tokens: data.usage?.total_tokens || 0
            };
            
        } catch (error) {
            console.error('硅基流动API调用失败:', error);
            return null;
        }
    }

    // 智谱AI API调用
    async callZhipuAPI(prompt) {
        try {
            const response = await fetch(`${this.apiConfig.zhipu.baseUrl}/chat/completions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.apiConfig.zhipu.apiKey}`
                },
                body: JSON.stringify({
                    model: this.apiConfig.zhipu.model,
                    messages: [
                        {
                            role: 'system',
                            content: '你是东里村的专业AI导游，熟悉当地的历史文化、景点介绍、特产美食等信息。请用友好、专业的语气回答游客的问题。'
                        },
                        {
                            role: 'user',
                            content: prompt
                        }
                    ],
                    temperature: 0.7,
                    max_tokens: 1000
                })
            });
            
            if (!response.ok) {
                throw new Error(`智谱AI API错误: ${response.status}`);
            }
            
            const data = await response.json();
            
            return {
                text: data.choices[0].message.content,
                confidence: 0.85,
                source: 'zhipu',
                tokens: data.usage?.total_tokens || 0
            };
            
        } catch (error) {
            console.error('智谱AI API调用失败:', error);
            return null;
        }
    }

    // 地图搜索工具实现
    async executeMapSearch(params, context) {
        const { keyword, city = '漳州', location } = params;
        
        // 模拟高德地图API调用 (需要真实API Key)
        try {
            // 这里应该调用真实的高德地图API
            // const response = await fetch(`${this.apiConfig.amap.baseUrl}/place/text?key=${this.apiConfig.amap.apiKey}&keywords=${keyword}&city=${city}`);
            
            // 模拟响应
            const mockResults = [
                {
                    name: '东里村文化广场',
                    address: '福建省漳州市东里村中心',
                    location: '118.123456,24.567890',
                    type: '文化场所'
                },
                {
                    name: '东里村古建筑群',
                    address: '福建省漳州市东里村古街',
                    location: '118.124456,24.568890',
                    type: '历史建筑'
                }
            ];
            
            return {
                results: mockResults,
                count: mockResults.length,
                source: 'amap_simulation'
            };
            
        } catch (error) {
            console.error('地图搜索失败:', error);
            return {
                results: [],
                count: 0,
                error: error.message
            };
        }
    }

    // 路线规划工具实现
    async executeRoutePlanning(params, context) {
        const { origin, destination, strategy = 'fastest' } = params;
        
        try {
            // 模拟路线规划结果
            const mockRoute = {
                distance: '2.5公里',
                duration: '约15分钟步行',
                steps: [
                    '从起点出发，向东步行200米',
                    '右转进入古街，步行500米',
                    '经过文化广场，继续直行800米',
                    '左转进入景区路，步行1000米到达终点'
                ],
                waypoints: [
                    { name: '起点', location: '118.123456,24.567890' },
                    { name: '文化广场', location: '118.124456,24.568890' },
                    { name: '终点', location: '118.125456,24.569890' }
                ]
            };
            
            return {
                route: mockRoute,
                success: true,
                source: 'amap_simulation'
            };
            
        } catch (error) {
            console.error('路线规划失败:', error);
            return {
                route: null,
                success: false,
                error: error.message
            };
        }
    }

    // 语音合成工具实现
    async executeTextToSpeech(params, context) {
        const { text, voice = 'female', speed = 1.0 } = params;
        
        try {
            // 调用MiniMax TTS API
            const response = await fetch(`${this.apiConfig.minimax.baseUrl}/text_to_speech`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.apiConfig.minimax.apiKey}`
                },
                body: JSON.stringify({
                    text: text,
                    voice_id: voice === 'female' ? 'female-tianmei' : 'male-qn',
                    speed: speed,
                    vol: 1.0,
                    pitch: 0,
                    audio_sample_rate: 16000,
                    bitrate: 128000
                })
            });
            
            if (!response.ok) {
                throw new Error(`MiniMax TTS API错误: ${response.status}`);
            }
            
            const audioBlob = await response.blob();
            const audioUrl = URL.createObjectURL(audioBlob);
            
            return {
                audioUrl: audioUrl,
                audioBlob: audioBlob,
                duration: Math.ceil(text.length / 5), // 估算时长
                success: true,
                source: 'minimax'
            };
            
        } catch (error) {
            console.error('语音合成失败:', error);
            
            // 降级到浏览器原生TTS
            return this.fallbackToWebSpeech(text);
        }
    }

    // 浏览器原生TTS降级方案
    fallbackToWebSpeech(text) {
        try {
            if ('speechSynthesis' in window) {
                const utterance = new SpeechSynthesisUtterance(text);
                utterance.lang = 'zh-CN';
                utterance.rate = 1.0;
                utterance.pitch = 1.0;
                
                window.speechSynthesis.speak(utterance);
                
                return {
                    audioUrl: null,
                    audioBlob: null,
                    duration: Math.ceil(text.length / 5),
                    success: true,
                    source: 'web_speech'
                };
            } else {
                throw new Error('浏览器不支持语音合成');
            }
        } catch (error) {
            return {
                audioUrl: null,
                audioBlob: null,
                duration: 0,
                success: false,
                source: 'fallback',
                error: error.message
            };
        }
    }

    // 天气查询工具实现
    async executeWeatherQuery(params, context) {
        const { location = '东里村' } = params;
        
        try {
            // 模拟天气数据 (实际应该调用天气API)
            const mockWeather = {
                location: location,
                temperature: '24°C',
                condition: '晴朗',
                humidity: '65%',
                windSpeed: '微风',
                forecast: [
                    { date: '今天', temp: '22-28°C', condition: '晴' },
                    { date: '明天', temp: '20-26°C', condition: '多云' },
                    { date: '后天', temp: '18-24°C', condition: '小雨' }
                ]
            };
            
            return {
                weather: mockWeather,
                success: true,
                source: 'weather_simulation'
            };
            
        } catch (error) {
            console.error('天气查询失败:', error);
            return {
                weather: null,
                success: false,
                error: error.message
            };
        }
    }

    // 构建聊天提示词
    buildChatPrompt(message, location, context) {
        let prompt = `用户在${location}询问: ${message}`;
        
        if (context.intent) {
            prompt += `\n意图类型: ${context.intent}`;
        }
        
        if (context.userPreferences) {
            prompt += `\n用户偏好: ${JSON.stringify(context.userPreferences)}`;
        }
        
        return prompt;
    }

    // 测试API连接
    async testApiConnections() {
        const tests = [
            { name: '硅基流动', test: () => this.callSiliconFlowAPI('测试连接') },
            { name: '智谱AI', test: () => this.callZhipuAPI('测试连接') }
        ];
        
        for (const { name, test } of tests) {
            try {
                await test();
                console.log(`✅ ${name} API连接正常`);
            } catch (error) {
                console.warn(`⚠️ ${name} API连接失败:`, error.message);
            }
        }
    }

    // 创建超时Promise
    createTimeoutPromise(timeout) {
        return new Promise((_, reject) => {
            setTimeout(() => reject(new Error('工具执行超时')), timeout);
        });
    }

    // 更新执行统计
    updateExecutionStats(latency, success) {
        this.executionStats.totalExecutions++;
        
        if (success) {
            this.executionStats.successCount++;
        } else {
            this.executionStats.errorCount++;
        }
        
        // 计算平均延迟
        const alpha = 0.1;
        this.executionStats.averageLatency = 
            this.executionStats.averageLatency * (1 - alpha) + latency * alpha;
    }

    // 处理ANP消息
    async handleMessage(message) {
        switch (message.action) {
            case 'execute_tool':
                const { tool, params, context } = message.payload;
                return await this.executeTool(tool, params, context);
            
            case 'ping':
                return { action: 'pong', timestamp: Date.now(), agent: this.agentId };
            
            case 'get_status':
                return {
                    action: 'status_response',
                    status: this.status,
                    role: this.role,
                    capabilities: this.capabilities,
                    stats: this.executionStats,
                    tools: Array.from(this.tools.keys())
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
            stats: this.executionStats,
            tools: Array.from(this.tools.keys())
        };
    }
}

// 创建全局Agent B实例
window.AgentB = new AgentB();

// 自动初始化
document.addEventListener('DOMContentLoaded', () => {
    window.AgentB.initialize();
});

// 导出供其他模块使用
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AgentB;
}