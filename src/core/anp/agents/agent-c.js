// Agent C - 信息处理器 (军工级实现)
class AgentC {
    constructor() {
        this.agentId = 'AGENT_C';
        this.role = '信息处理器';
        this.status = 'offline';
        this.capabilities = [
            'content_generation',
            'data_processing',
            'knowledge_management',
            'information_retrieval'
        ];
        
        // 硬编码知识库 (演示版本)
        this.knowledgeBase = {
            spots: [
                {
                    id: 'cultural_square',
                    name: '东里村文化广场',
                    description: '村民活动中心，是东里村的文化交流枢纽，经常举办各种文化活动和节庆庆典。',
                    category: '文化场所',
                    features: ['文化展示', '活动举办', '休闲娱乐'],
                    history: '建于2010年，是村民自筹资金建设的现代化文化设施。',
                    visitTime: '30-60分钟',
                    openHours: '全天开放'
                },
                {
                    id: 'ancient_buildings',
                    name: '古建筑群',
                    description: '保存完好的明清时期建筑群，展现了闽南传统建筑的精髓和历史文化底蕴。',
                    category: '历史建筑',
                    features: ['明清建筑', '传统工艺', '历史文化'],
                    history: '始建于明代，经清代扩建，是闽南地区保存最完整的古建筑群之一。',
                    visitTime: '60-90分钟',
                    openHours: '8:00-18:00'
                },
                {
                    id: 'celebrity_residence',
                    name: '名人故居',
                    description: '历史文化名人的故居，展示了东里村深厚的文化底蕴和人文历史。',
                    category: '名人故居',
                    features: ['名人文化', '历史展示', '文物保护'],
                    history: '清代著名学者故居，现为文物保护单位。',
                    visitTime: '45-60分钟',
                    openHours: '9:00-17:00'
                }
            ],
            
            celebrities: [
                {
                    id: 'scholar_wang',
                    name: '王文渊',
                    title: '清代著名学者',
                    period: '1650-1720',
                    achievements: '著有《东里文集》，对闽南文化发展有重要贡献',
                    story: '王文渊自幼聪颖，博览群书，后成为当地著名的教育家和文化传播者。'
                },
                {
                    id: 'artist_chen',
                    name: '陈雅韵',
                    title: '民国时期艺术家',
                    period: '1890-1960',
                    achievements: '闽南传统工艺传承人，作品被多家博物馆收藏',
                    story: '陈雅韵致力于传统工艺的保护和传承，培养了众多优秀的工艺传承人。'
                }
            ],
            
            specialties: [
                {
                    id: 'bamboo_craft',
                    name: '手工竹编',
                    description: '采用当地优质竹材，经传统工艺精心编制而成',
                    price: '68-288元',
                    category: '手工艺品',
                    features: ['环保材料', '传统工艺', '实用美观']
                },
                {
                    id: 'organic_tea',
                    name: '有机茶叶',
                    description: '生长在东里村山区的有机茶叶，口感清香甘甜',
                    price: '128-368元',
                    category: '农产品',
                    features: ['有机种植', '口感醇厚', '健康养生']
                },
                {
                    id: 'traditional_pastry',
                    name: '传统糕点',
                    description: '采用传统配方制作的特色糕点，口味独特',
                    price: '38-88元',
                    category: '食品',
                    features: ['传统配方', '手工制作', '口味独特']
                }
            ],
            
            routes: [
                {
                    id: 'cultural_tour',
                    name: '文化探索之旅',
                    description: '深度体验东里村的历史文化',
                    duration: '3-4小时',
                    spots: ['cultural_square', 'ancient_buildings', 'celebrity_residence'],
                    difficulty: '轻松',
                    highlights: ['历史文化', '建筑艺术', '名人故事']
                },
                {
                    id: 'leisure_tour',
                    name: '休闲观光之旅',
                    description: '轻松愉快的村庄观光体验',
                    duration: '2-3小时',
                    spots: ['cultural_square', 'ancient_buildings'],
                    difficulty: '非常轻松',
                    highlights: ['休闲放松', '拍照留念', '文化体验']
                }
            ]
        };
        
        // 内容模板
        this.contentTemplates = {
            spot_introduction: '📍 {name}\n\n{description}\n\n🏛️ 特色：{features}\n📚 历史：{history}\n⏰ 参观时间：{visitTime}\n🕐 开放时间：{openHours}',
            celebrity_story: '👤 {name} ({title})\n📅 生活年代：{period}\n🏆 主要成就：{achievements}\n📖 人物故事：{story}',
            specialty_info: '🛍️ {name}\n\n💰 价格：{price}\n📝 描述：{description}\n✨ 特点：{features}',
            route_plan: '🗺️ {name}\n\n⏱️ 用时：{duration}\n🚶 难度：{difficulty}\n📍 路线：{spots}\n🌟 亮点：{highlights}'
        };
        
        // 处理统计
        this.processingStats = {
            totalRequests: 0,
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
            
            // 预处理知识库
            await this.preprocessKnowledgeBase();
            
            this.status = 'online';
            console.log(`✅ ${this.agentId} (${this.role}) 初始化完成`);
            
            return true;
        } catch (error) {
            console.error(`❌ ${this.agentId} 初始化失败:`, error);
            this.status = 'error';
            return false;
        }
    }

    // 处理信息请求
    async processInformation(intent, query, context = {}) {
        const startTime = Date.now();
        
        try {
            // 发送ANP消息
            await window.ANPNetwork.sendMessage(
                'AGENT_A',
                this.agentId,
                'process_information',
                { intent, query, context }
            );
            
            let result;
            
            // 根据意图类型处理
            switch (intent) {
                case 'attraction':
                    result = await this.processAttractionQuery(query, context);
                    break;
                case 'culture':
                    result = await this.processCultureQuery(query, context);
                    break;
                case 'shopping':
                    result = await this.processShoppingQuery(query, context);
                    break;
                case 'route':
                    result = await this.processRouteQuery(query, context);
                    break;
                case 'general':
                    result = await this.processGeneralQuery(query, context);
                    break;
                default:
                    result = await this.processDefaultQuery(query, context);
            }
            
            // 增强内容
            result = await this.enhanceContent(result, context);
            
            // 更新统计
            const latency = Date.now() - startTime;
            this.updateProcessingStats(latency, true);
            
            // 发送结果
            await window.ANPNetwork.sendMessage(
                this.agentId,
                'AGENT_A',
                'information_result',
                { 
                    intent, 
                    result, 
                    latency,
                    success: true 
                }
            );
            
            console.log(`✅ 信息处理完成: ${intent} (${latency}ms)`);
            return result;
            
        } catch (error) {
            const latency = Date.now() - startTime;
            this.updateProcessingStats(latency, false);
            
            console.error(`❌ 信息处理失败: ${intent}`, error);
            
            // 发送错误结果
            await window.ANPNetwork.sendMessage(
                this.agentId,
                'AGENT_A',
                'information_error',
                { 
                    intent, 
                    error: error.message, 
                    latency 
                }
            );
            
            throw error;
        }
    }

    // 处理景点查询
    async processAttractionQuery(query, context) {
        const queryLower = query.toLowerCase();
        let matchedSpots = [];
        
        // 关键词匹配
        for (const spot of this.knowledgeBase.spots) {
            if (queryLower.includes(spot.name.toLowerCase()) ||
                spot.features.some(feature => queryLower.includes(feature)) ||
                queryLower.includes(spot.category)) {
                matchedSpots.push(spot);
            }
        }
        
        // 如果没有精确匹配，返回推荐景点
        if (matchedSpots.length === 0) {
            matchedSpots = this.knowledgeBase.spots.slice(0, 2);
        }
        
        // 生成内容
        let content = '';
        if (matchedSpots.length === 1) {
            const spot = matchedSpots[0];
            content = this.formatContent('spot_introduction', {
                name: spot.name,
                description: spot.description,
                features: spot.features.join('、'),
                history: spot.history,
                visitTime: spot.visitTime,
                openHours: spot.openHours
            });
        } else {
            content = '🏛️ 东里村主要景点推荐：\n\n';
            matchedSpots.forEach((spot, index) => {
                content += `${index + 1}. **${spot.name}**\n${spot.description}\n\n`;
            });
        }
        
        return {
            text: content,
            data: matchedSpots,
            type: 'attraction_info',
            confidence: 0.9
        };
    }

    // 处理文化查询
    async processCultureQuery(query, context) {
        const queryLower = query.toLowerCase();
        let result = '';
        
        if (queryLower.includes('名人') || queryLower.includes('人物')) {
            // 名人信息
            const celebrities = this.knowledgeBase.celebrities;
            result = '👥 东里村历史名人：\n\n';
            celebrities.forEach((celebrity, index) => {
                result += this.formatContent('celebrity_story', celebrity);
                if (index < celebrities.length - 1) result += '\n\n';
            });
        } else if (queryLower.includes('历史') || queryLower.includes('文化')) {
            // 历史文化信息
            result = `🏛️ 东里村历史文化

东里村有着800多年的悠久历史，始建于南宋时期，是闽南地区保存较为完整的古村落之一。

📚 **文化特色**
• 闽南传统建筑艺术
• 深厚的文化底蕴
• 丰富的民俗传统
• 历史名人文化

🎭 **民俗文化**
村中至今保留着传统的节庆活动和民俗文化，如春节庙会、中秋赏月等传统节日庆典。

🏗️ **建筑文化**
古建筑群展现了闽南传统建筑的精髓，包括燕尾脊、红砖墙、雕花窗等典型元素。`;
        } else {
            // 综合文化信息
            result = `🌟 东里村文化概览

东里村是一个文化底蕴深厚的古村落，融合了历史传承与现代发展。

🏛️ **历史传承**：800多年历史，南宋时期建村
👥 **名人文化**：历代文人学者辈出
🎨 **传统工艺**：竹编、茶艺等传统技艺传承
🏗️ **建筑艺术**：明清古建筑群保存完好`;
        }
        
        return {
            text: result,
            data: this.knowledgeBase.celebrities,
            type: 'culture_info',
            confidence: 0.95
        };
    }

    // 处理购物查询
    async processShoppingQuery(query, context) {
        const queryLower = query.toLowerCase();
        let matchedSpecialties = [];
        
        // 关键词匹配
        for (const specialty of this.knowledgeBase.specialties) {
            if (queryLower.includes(specialty.name.toLowerCase()) ||
                queryLower.includes(specialty.category) ||
                specialty.features.some(feature => queryLower.includes(feature))) {
                matchedSpecialties.push(specialty);
            }
        }
        
        // 如果没有精确匹配，返回所有特产
        if (matchedSpecialties.length === 0) {
            matchedSpecialties = this.knowledgeBase.specialties;
        }
        
        let content = '🛍️ 东里村特产推荐：\n\n';
        matchedSpecialties.forEach((specialty, index) => {
            content += this.formatContent('specialty_info', {
                name: specialty.name,
                price: specialty.price,
                description: specialty.description,
                features: specialty.features.join('、')
            });
            if (index < matchedSpecialties.length - 1) content += '\n\n';
        });
        
        content += '\n\n📍 **购买地点**\n• 村内特产店：营业时间 8:00-18:00\n• 文化广场周边商铺\n• 景区入口处纪念品店';
        
        return {
            text: content,
            data: matchedSpecialties,
            type: 'shopping_info',
            confidence: 0.9
        };
    }

    // 处理路线查询
    async processRouteQuery(query, context) {
        const queryLower = query.toLowerCase();
        let matchedRoutes = [];
        
        // 关键词匹配
        for (const route of this.knowledgeBase.routes) {
            if (queryLower.includes(route.name.toLowerCase()) ||
                route.highlights.some(highlight => queryLower.includes(highlight))) {
                matchedRoutes.push(route);
            }
        }
        
        // 如果没有精确匹配，返回推荐路线
        if (matchedRoutes.length === 0) {
            matchedRoutes = this.knowledgeBase.routes;
        }
        
        let content = '🗺️ 推荐游览路线：\n\n';
        matchedRoutes.forEach((route, index) => {
            const spotNames = route.spots.map(spotId => {
                const spot = this.knowledgeBase.spots.find(s => s.id === spotId);
                return spot ? spot.name : spotId;
            }).join(' → ');
            
            content += this.formatContent('route_plan', {
                name: route.name,
                duration: route.duration,
                difficulty: route.difficulty,
                spots: spotNames,
                highlights: route.highlights.join('、')
            });
            if (index < matchedRoutes.length - 1) content += '\n\n';
        });
        
        return {
            text: content,
            data: matchedRoutes,
            type: 'route_info',
            confidence: 0.9
        };
    }

    // 处理一般查询
    async processGeneralQuery(query, context) {
        const queryLower = query.toLowerCase();
        
        // 简单的关键词匹配
        if (queryLower.includes('介绍') || queryLower.includes('概况')) {
            return {
                text: `🏛️ 东里村概况

东里村是福建省漳州市的一个历史文化名村，有着800多年的悠久历史。村中保存着完好的明清古建筑群，文化底蕴深厚，是体验闽南传统文化的绝佳去处。

🌟 **村庄特色**
• 历史悠久：南宋时期建村，800多年历史
• 建筑精美：明清古建筑群保存完好
• 文化深厚：历代名人辈出，文化传承丰富
• 环境优美：古朴村落与自然景观和谐统一

📍 **主要景点**：文化广场、古建筑群、名人故居
🛍️ **特色产品**：手工竹编、有机茶叶、传统糕点
🎯 **推荐活动**：文化探索、休闲观光、传统工艺体验`,
                type: 'general_info',
                confidence: 0.8
            };
        }
        
        return {
            text: '欢迎来到东里村！我可以为您介绍景点、历史文化、特产购物和游览路线。请告诉我您想了解什么具体信息？',
            type: 'general_response',
            confidence: 0.6
        };
    }

    // 处理默认查询
    async processDefaultQuery(query, context) {
        return {
            text: '抱歉，我没有理解您的问题。您可以询问关于东里村的景点介绍、历史文化、特产购物或游览路线等信息。',
            type: 'default_response',
            confidence: 0.3
        };
    }

    // 增强内容
    async enhanceContent(result, context) {
        // 根据用户偏好调整内容
        if (context.userPreferences) {
            if (context.userPreferences.interests) {
                // 根据兴趣添加相关信息
                if (context.userPreferences.interests.includes('history') && result.type === 'attraction_info') {
                    result.text += '\n\n💡 **历史小贴士**：建议您在参观时留意建筑细节，每一处雕刻都有其历史故事。';
                }
            }
        }
        
        // 添加实用信息
        if (result.type === 'attraction_info') {
            result.text += '\n\n📱 **温馨提示**：建议您带好相机，这里有很多值得拍照留念的美景。';
        }
        
        return result;
    }

    // 预处理知识库
    async preprocessKnowledgeBase() {
        // 建立索引，优化查询性能
        this.spotIndex = new Map();
        this.knowledgeBase.spots.forEach(spot => {
            this.spotIndex.set(spot.id, spot);
            this.spotIndex.set(spot.name.toLowerCase(), spot);
        });
        
        this.celebrityIndex = new Map();
        this.knowledgeBase.celebrities.forEach(celebrity => {
            this.celebrityIndex.set(celebrity.id, celebrity);
            this.celebrityIndex.set(celebrity.name.toLowerCase(), celebrity);
        });
        
        console.log('📚 知识库预处理完成');
    }

    // 格式化内容
    formatContent(template, data) {
        let content = this.contentTemplates[template];
        
        for (const [key, value] of Object.entries(data)) {
            const placeholder = `{${key}}`;
            content = content.replace(new RegExp(placeholder, 'g'), value);
        }
        
        return content;
    }

    // 更新处理统计
    updateProcessingStats(latency, success) {
        this.processingStats.totalRequests++;
        
        if (success) {
            this.processingStats.successCount++;
        } else {
            this.processingStats.errorCount++;
        }
        
        // 计算平均延迟
        const alpha = 0.1;
        this.processingStats.averageLatency = 
            this.processingStats.averageLatency * (1 - alpha) + latency * alpha;
    }

    // 处理ANP消息
    async handleMessage(message) {
        switch (message.action) {
            case 'process_information':
                const { intent, query, context } = message.payload;
                return await this.processInformation(intent, query, context);
            
            case 'ping':
                return { action: 'pong', timestamp: Date.now(), agent: this.agentId };
            
            case 'get_status':
                return {
                    action: 'status_response',
                    status: this.status,
                    role: this.role,
                    capabilities: this.capabilities,
                    stats: this.processingStats,
                    knowledgeBase: {
                        spots: this.knowledgeBase.spots.length,
                        celebrities: this.knowledgeBase.celebrities.length,
                        specialties: this.knowledgeBase.specialties.length,
                        routes: this.knowledgeBase.routes.length
                    }
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
            stats: this.processingStats,
            knowledgeBase: {
                spots: this.knowledgeBase.spots.length,
                celebrities: this.knowledgeBase.celebrities.length,
                specialties: this.knowledgeBase.specialties.length,
                routes: this.knowledgeBase.routes.length
            }
        };
    }
}

// 创建全局Agent C实例
window.AgentC = new AgentC();

// 自动初始化
document.addEventListener('DOMContentLoaded', () => {
    window.AgentC.initialize();
});

// 导出供其他模块使用
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AgentC;
}