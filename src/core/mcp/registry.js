// MCP工具注册管理器
// 军工级工具市场和插件管理系统

export class MCPRegistry {
    constructor() {
        this.registry = new Map();
        this.categories = new Map();
        this.installedTools = new Map();
        this.runningTools = new Map();
        
        // 注册表配置
        this.config = {
            registryUrl: 'https://api.mcp.tools/v1',
            cacheTimeout: 300000, // 5分钟
            maxRetries: 3,
            timeout: 10000
        };
        
        // 工具分类
        this.defaultCategories = {
            'mapping': {
                name: '地图服务',
                description: '地理位置、导航、地图相关工具',
                icon: '🗺️'
            },
            'ai': {
                name: 'AI服务',
                description: '人工智能、机器学习、自然语言处理',
                icon: '🤖'
            },
            'data': {
                name: '数据处理',
                description: '数据转换、分析、处理工具',
                icon: '📊'
            },
            'media': {
                name: '媒体处理',
                description: '图像、音频、视频处理工具',
                icon: '🎵'
            },
            'communication': {
                name: '通信服务',
                description: '消息推送、通知、通信工具',
                icon: '💬'
            },
            'utility': {
                name: '实用工具',
                description: '通用工具、辅助功能',
                icon: '🛠️'
            },
            'integration': {
                name: '集成服务',
                description: '第三方服务集成、API接口',
                icon: '🔗'
            }
        };
        
        // 统计信息
        this.stats = {
            totalRegistered: 0,
            totalInstalled: 0,
            totalRunning: 0,
            totalExecutions: 0,
            totalErrors: 0,
            cacheHits: 0,
            cacheMisses: 0
        };
        
        // 缓存
        this.cache = {
            tools: new Map(),
            categories: new Map(),
            lastUpdate: 0
        };
        
        // 初始化分类
        this.initializeCategories();
    }

    // 初始化分类
    initializeCategories() {
        Object.entries(this.defaultCategories).forEach(([id, category]) => {
            this.categories.set(id, category);
        });
        console.log('📂 MCP分类初始化完成:', this.categories.size);
    }

    // 注册工具
    async registerTool(toolConfig) {
        try {
            // 验证工具配置
            this.validateToolConfig(toolConfig);
            
            const tool = {
                id: toolConfig.id,
                name: toolConfig.name,
                description: toolConfig.description,
                version: toolConfig.version || '1.0.0',
                category: toolConfig.category || 'utility',
                author: toolConfig.author || 'Unknown',
                license: toolConfig.license || 'MIT',
                homepage: toolConfig.homepage || '',
                repository: toolConfig.repository || '',
                
                // 技术信息
                endpoint: toolConfig.endpoint || '',
                method: toolConfig.method || 'GET',
                headers: toolConfig.headers || {},
                parameters: toolConfig.parameters || {},
                returns: toolConfig.returns || {},
                
                // 运行时信息
                status: 'registered',
                installedAt: Date.now(),
                lastUsed: null,
                usageCount: 0,
                errorCount: 0,
                averageExecutionTime: 0,
                
                // 配置信息
                config: toolConfig.config || {},
                permissions: toolConfig.permissions || [],
                dependencies: toolConfig.dependencies || [],
                
                // 健康检查
                healthCheck: toolConfig.healthCheck || null,
                isHealthy: true,
                lastHealthCheck: null
            };
            
            // 注册到注册表
            this.registry.set(tool.id, tool);
            this.stats.totalRegistered++;
            
            console.log(`✅ 工具注册成功: ${tool.name} (${tool.id})`);
            
            // 发送注册事件
            await this.emitEvent('tool_registered', {
                toolId: tool.id,
                tool: tool
            });
            
            return tool;
            
        } catch (error) {
            console.error(`❌ 工具注册失败: ${toolConfig.id}`, error);
            throw error;
        }
    }

    // 验证工具配置
    validateToolConfig(config) {
        const required = ['id', 'name', 'description'];
        
        for (const field of required) {
            if (!config[field]) {
                throw new Error(`Missing required field: ${field}`);
            }
        }
        
        // 验证ID格式
        if (!/^[a-zA-Z0-9_-]+$/.test(config.id)) {
            throw new Error('Tool ID can only contain letters, numbers, hyphens and underscores');
        }
        
        // 检查重复
        if (this.registry.has(config.id)) {
            throw new Error(`Tool ID already exists: ${config.id}`);
        }
        
        // 验证分类
        if (config.category && !this.categories.has(config.category)) {
            console.warn(`Unknown category: ${config.category}, using 'utility' instead`);
            config.category = 'utility';
        }
    }

    // 安装工具
    async installTool(toolId, options = {}) {
        try {
            const tool = this.registry.get(toolId);
            if (!tool) {
                throw new Error(`Tool not found: ${toolId}`);
            }
            
            if (this.installedTools.has(toolId)) {
                throw new Error(`Tool already installed: ${toolId}`);
            }
            
            // 检查依赖
            if (tool.dependencies.length > 0) {
                await this.checkDependencies(tool.dependencies);
            }
            
            // 下载工具代码（如果是远程工具）
            if (tool.endpoint && tool.endpoint.startsWith('http')) {
                await this.downloadTool(tool);
            }
            
            // 标记为已安装
            tool.status = 'installed';
            tool.installedAt = Date.now();
            this.installedTools.set(toolId, tool);
            this.stats.totalInstalled++;
            
            console.log(`✅ 工具安装成功: ${tool.name} (${toolId})`);
            
            // 发送安装事件
            await this.emitEvent('tool_installed', {
                toolId: toolId,
                tool: tool
            });
            
            return tool;
            
        } catch (error) {
            console.error(`❌ 工具安装失败: ${toolId}`, error);
            throw error;
        }
    }

    // 卸载工具
    async uninstallTool(toolId) {
        try {
            const tool = this.installedTools.get(toolId);
            if (!tool) {
                throw new Error(`Tool not installed: ${toolId}`);
            }
            
            // 停止工具（如果正在运行）
            if (this.runningTools.has(toolId)) {
                await this.stopTool(toolId);
            }
            
            // 清理资源
            await this.cleanupTool(tool);
            
            // 从已安装列表移除
            tool.status = 'uninstalled';
            this.installedTools.delete(toolId);
            this.stats.totalInstalled--;
            
            console.log(`✅ 工具卸载成功: ${tool.name} (${toolId})`);
            
            // 发送卸载事件
            await this.emitEvent('tool_uninstalled', {
                toolId: toolId,
                tool: tool
            });
            
            return true;
            
        } catch (error) {
            console.error(`❌ 工具卸载失败: ${toolId}`, error);
            throw error;
        }
    }

    // 启动工具
    async startTool(toolId, config = {}) {
        try {
            const tool = this.installedTools.get(toolId);
            if (!tool) {
                throw new Error(`Tool not installed: ${toolId}`);
            }
            
            if (this.runningTools.has(toolId)) {
                throw new Error(`Tool already running: ${toolId}`);
            }
            
            // 合并配置
            const finalConfig = { ...tool.config, ...config };
            
            // 初始化工具
            const toolInstance = await this.initializeTool(tool, finalConfig);
            
            // 健康检查
            if (tool.healthCheck) {
                const isHealthy = await this.performHealthCheck(tool);
                tool.isHealthy = isHealthy;
                tool.lastHealthCheck = Date.now();
                
                if (!isHealthy) {
                    throw new Error(`Tool health check failed: ${toolId}`);
                }
            }
            
            // 标记为运行中
            tool.status = 'running';
            tool.startTime = Date.now();
            this.runningTools.set(toolId, toolInstance);
            this.stats.totalRunning++;
            
            console.log(`✅ 工具启动成功: ${tool.name} (${toolId})`);
            
            // 发送启动事件
            await this.emitEvent('tool_started', {
                toolId: toolId,
                tool: tool,
                instance: toolInstance
            });
            
            return toolInstance;
            
        } catch (error) {
            console.error(`❌ 工具启动失败: ${toolId}`, error);
            throw error;
        }
    }

    // 停止工具
    async stopTool(toolId) {
        try {
            const toolInstance = this.runningTools.get(toolId);
            const tool = this.installedTools.get(toolId);
            
            if (!toolInstance || !tool) {
                throw new Error(`Tool not running: ${toolId}`);
            }
            
            // 清理工具实例
            if (toolInstance && typeof toolInstance.cleanup === 'function') {
                await toolInstance.cleanup();
            }
            
            // 标记为已停止
            tool.status = 'stopped';
            tool.stopTime = Date.now();
            this.runningTools.delete(toolId);
            this.stats.totalRunning--;
            
            console.log(`✅ 工具停止成功: ${tool.name} (${toolId})`);
            
            // 发送停止事件
            await this.emitEvent('tool_stopped', {
                toolId: toolId,
                tool: tool
            });
            
            return true;
            
        } catch (error) {
            console.error(`❌ 工具停止失败: ${toolId}`, error);
            throw error;
        }
    }

    // 执行工具
    async executeTool(toolId, parameters = {}, options = {}) {
        const startTime = Date.now();
        
        try {
            const tool = this.installedTools.get(toolId);
            const toolInstance = this.runningTools.get(toolId);
            
            if (!tool) {
                throw new Error(`Tool not installed: ${toolId}`);
            }
            
            if (!toolInstance) {
                // 自动启动工具
                await this.startTool(toolId);
                return await this.executeTool(toolId, parameters, options);
            }
            
            // 验证参数
            this.validateParameters(tool, parameters);
            
            // 执行工具
            let result;
            if (typeof toolInstance.execute === 'function') {
                result = await toolInstance.execute(parameters, options);
            } else {
                throw new Error(`Tool ${toolId} does not have execute method`);
            }
            
            // 更新统计
            const executionTime = Date.now() - startTime;
            tool.lastUsed = Date.now();
            tool.usageCount++;
            tool.averageExecutionTime = 
                (tool.averageExecutionTime * (tool.usageCount - 1) + executionTime) / tool.usageCount;
            
            this.stats.totalExecutions++;
            
            console.log(`✅ 工具执行成功: ${tool.name} (${toolId}, ${executionTime}ms)`);
            
            // 发送执行事件
            await this.emitEvent('tool_executed', {
                toolId: toolId,
                parameters,
                result,
                executionTime,
                success: true
            });
            
            return {
                success: true,
                data: result,
                executionTime,
                toolId,
                toolName: tool.name
            };
            
        } catch (error) {
            // 更新错误统计
            const tool = this.installedTools.get(toolId);
            if (tool) {
                tool.errorCount++;
                tool.lastError = error;
                tool.lastErrorTime = Date.now();
            }
            
            this.stats.totalErrors++;
            
            console.error(`❌ 工具执行失败: ${toolId}`, error);
            
            // 发送错误事件
            await this.emitEvent('tool_executed', {
                toolId: toolId,
                parameters,
                error: error.message,
                success: false
            });
            
            return {
                success: false,
                error: error.message,
                toolId,
                toolName: tool ? tool.name : toolId
            };
        }
    }

    // 验证参数
    validateParameters(tool, parameters) {
        for (const [paramName, paramConfig] of Object.entries(tool.parameters)) {
            const value = parameters[paramName];
            
            // 检查必需参数
            if (paramConfig.required && (value === undefined || value === null)) {
                throw new Error(`Required parameter missing: ${paramName}`);
            }
            
            // 检查参数类型
            if (value !== undefined && paramConfig.type) {
                const actualType = typeof value;
                const expectedType = paramConfig.type;
                
                if (actualType !== expectedType) {
                    throw new Error(`Parameter ${paramName} type mismatch: expected ${expectedType}, got ${actualType}`);
                }
            }
            
            // 检查枚举值
            if (value !== undefined && paramConfig.enum && !paramConfig.enum.includes(value)) {
                throw new Error(`Parameter ${paramName} invalid value: ${value}, allowed: ${paramConfig.enum.join(', ')}`);
            }
        }
    }

    // 初始化工具
    async initializeTool(tool, config) {
        // 根据工具类型创建实例
        switch (tool.category) {
            case 'mapping':
                return new MappingTool(tool, config);
            case 'ai':
                return new AITool(tool, config);
            case 'data':
                return new DataTool(tool, config);
            case 'media':
                return new MediaTool(tool, config);
            default:
                return new GenericTool(tool, config);
        }
    }

    // 检查依赖
    async checkDependencies(dependencies) {
        for (const depId of dependencies) {
            if (!this.installedTools.has(depId)) {
                throw new Error(`Dependency not installed: ${depId}`);
            }
        }
    }

    // 下载工具
    async downloadTool(tool) {
        if (!tool.endpoint) return;
        
        try {
            const response = await fetch(tool.endpoint, {
                timeout: this.config.timeout
            });
            
            if (!response.ok) {
                throw new Error(`Download failed: ${response.status}`);
            }
            
            const code = await response.text();
            tool.downloadedCode = code;
            tool.downloadTime = Date.now();
            
            console.log(`✅ 工具下载成功: ${tool.name}`);
            
        } catch (error) {
            console.error(`❌ 工具下载失败: ${tool.name}`, error);
            throw error;
        }
    }

    // 清理工具
    async cleanupTool(tool) {
        try {
            // 删除下载的代码
            if (tool.downloadedCode) {
                delete tool.downloadedCode;
            }
            
            // 清理配置
            tool.config = {};
            
            console.log(`✅ 工具清理完成: ${tool.name}`);
            
        } catch (error) {
            console.error(`❌ 工具清理失败: ${tool.name}`, error);
        }
    }

    // 健康检查
    async performHealthCheck(tool) {
        if (!tool.healthCheck) {
            return true; // 没有健康检查配置，默认健康
        }
        
        try {
            const result = await this.executeHealthCheck(tool);
            return result;
        } catch (error) {
            console.error(`健康检查失败: ${tool.id}`, error);
            return false;
        }
    }

    // 执行健康检查
    async executeHealthCheck(tool) {
        const { url, method = 'GET', headers = {}, expectedStatus = 200 } = tool.healthCheck;
        
        const response = await fetch(url, {
            method,
            headers,
            timeout: 5000
        });
        
        return response.status === expectedStatus;
    }

    // 获取工具列表
    getTools(category = null, status = null) {
        let tools = Array.from(this.registry.values());
        
        // 按分类过滤
        if (category) {
            tools = tools.filter(tool => tool.category === category);
        }
        
        // 按状态过滤
        if (status) {
            tools = tools.filter(tool => tool.status === status);
        }
        
        return tools;
    }

    // 获取已安装工具
    getInstalledTools(category = null, status = null) {
        let tools = Array.from(this.installedTools.values());
        
        if (category) {
            tools = tools.filter(tool => tool.category === category);
        }
        
        if (status) {
            tools = tools.filter(tool => tool.status === status);
        }
        
        return tools;
    }

    // 获取运行中工具
    getRunningTools() {
        return Array.from(this.runningTools.entries()).map(([toolId, instance]) => ({
            toolId,
            instance,
            tool: this.installedTools.get(toolId)
        }));
    }

    // 获取分类列表
    getCategories() {
        return Array.from(this.categories.entries()).map(([id, category]) => ({
            id,
            ...category
        }));
    }

    // 搜索工具
    searchTools(query, options = {}) {
        const tools = Array.from(this.registry.values());
        const queryLower = query.toLowerCase();
        
        const results = tools.filter(tool => {
            // 名称匹配
            if (tool.name.toLowerCase().includes(queryLower)) {
                return true;
            }
            
            // 描述匹配
            if (tool.description.toLowerCase().includes(queryLower)) {
                return true;
            }
            
            // 分类匹配
            if (tool.category && tool.category.toLowerCase().includes(queryLower)) {
                return true;
            }
            
            return false;
        });
        
        // 按相关性排序
        return results.sort((a, b) => {
            const aScore = this.calculateRelevanceScore(a, queryLower);
            const bScore = this.calculateRelevanceScore(b, queryLower);
            
            return bScore - aScore;
        });
    }

    // 计算相关性分数
    calculateRelevanceScore(tool, query) {
        let score = 0;
        
        // 名称完全匹配
        if (tool.name.toLowerCase() === query) {
            score += 100;
        } else if (tool.name.toLowerCase().startsWith(query)) {
            score += 50;
        }
        
        // 描述匹配
        if (tool.description.toLowerCase().includes(query)) {
            score += 20;
        }
        
        // 使用次数加权
        score += Math.min(tool.usageCount * 2, 10);
        
        return score;
    }

    // 发送事件
    async emitEvent(eventType, data) {
        // 这里可以集成事件总线
        console.log(`📢 MCP事件: ${eventType}`, data);
        
        // 如果有ANP网络，发送网络消息
        if (typeof window !== 'undefined' && window.Network) {
            try {
                await window.Network.sendRequest({
                    source: 'MCP_REGISTRY',
                    target: 'BROADCAST',
                    type: 'EVENT',
                    action: eventType,
                    payload: data
                });
            } catch (error) {
                console.warn('发送ANP事件失败:', error);
            }
        }
    }

    // 获取统计信息
    getStats() {
        return {
            ...this.stats,
            registeredTools: this.registry.size,
            installedTools: this.installedTools.size,
            runningTools: this.runningTools.size,
            categories: this.categories.size,
            uptime: Date.now() - (this.startTime || Date.now())
        };
    }

    // 清理注册表
    async cleanup() {
        try {
            console.log('🧹 清理MCP注册表...');
            
            // 停止所有运行中的工具
            const runningTools = Array.from(this.runningTools.keys());
            for (const toolId of runningTools) {
                try {
                    await this.stopTool(toolId);
                } catch (error) {
                    console.error(`停止工具失败: ${toolId}`, error);
                }
            }
            
            // 清理缓存
            this.cache.tools.clear();
            this.cache.categories.clear();
            this.cache.lastUpdate = 0;
            
            console.log('✅ MCP注册表清理完成');
            
        } catch (error) {
            console.error('❌ MCP注册表清理失败:', error);
        }
    }
}

// 工具基类
class GenericTool {
    constructor(tool, config) {
        this.tool = tool;
        this.config = config;
        this.state = 'initialized';
    }

    async execute(parameters, options = {}) {
        throw new Error('Tool execute method not implemented');
    }

    async cleanup() {
        this.state = 'cleaned';
    }
}

// 地图工具类
class MappingTool extends GenericTool {
    async execute(parameters, options = {}) {
        // 地图工具特定实现
        return {
            type: 'mapping_result',
            data: parameters,
            timestamp: Date.now()
        };
    }
}

// AI工具类
class AITool extends GenericTool {
    async execute(parameters, options = {}) {
        // AI工具特定实现
        return {
            type: 'ai_result',
            data: parameters,
            timestamp: Date.now()
        };
    }
}

// 数据工具类
class DataTool extends GenericTool {
    async execute(parameters, options = {}) {
        // 数据工具特定实现
        return {
            type: 'data_result',
            data: parameters,
            timestamp: Date.now()
        };
    }
}

// 媒体工具类
class MediaTool extends GenericTool {
    async execute(parameters, options = {}) {
        // 媒体工具特定实现
        return {
            type: 'media_result',
            data: parameters,
            timestamp: Date.now()
        };
    }
}

// 导出单例实例
export const MCPRegistry = new MCPRegistry();

// 导出工具类
export {
    GenericTool,
    MappingTool,
    AITool,
    DataTool,
    MediaTool
};
