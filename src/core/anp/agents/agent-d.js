// Agent D - 状态管理器 (军工级实现)
class AgentD {
    constructor() {
        this.agentId = 'AGENT_D';
        this.role = '状态管理器';
        this.status = 'offline';
        this.capabilities = [
            'state_management',
            'data_persistence',
            'cache_management',
            'session_management'
        ];
        
        // 状态存储
        this.globalState = {
            system: {
                startTime: Date.now(),
                version: 'ANP v2.0',
                environment: 'production'
            },
            agents: {},
            users: {},
            sessions: {},
            cache: {}
        };
        
        // 存储配置
        this.storageConfig = {
            localStorage: {
                prefix: 'anp_',
                maxSize: 5 * 1024 * 1024, // 5MB
                compression: true
            },
            sessionStorage: {
                prefix: 'anp_session_',
                maxSize: 2 * 1024 * 1024 // 2MB
            },
            indexedDB: {
                dbName: 'ANP_Database',
                version: 1,
                stores: ['states', 'sessions', 'cache', 'logs']
            }
        };
        
        // 同步配置
        this.syncConfig = {
            intervals: {
                state: 5000,    // 5秒同步状态
                cache: 30000,   // 30秒同步缓存
                cleanup: 300000 // 5分钟清理过期数据
            },
            retryAttempts: 3,
            retryDelay: 1000
        };
        
        // 统计信息
        this.stats = {
            stateUpdates: 0,
            cacheHits: 0,
            cacheMisses: 0,
            syncOperations: 0,
            errors: 0
        };
        
        // 初始化存储
        this.initializeStorage();
    }

    // 初始化Agent
    async initialize() {
        try {
            // 注册到ANP网络
            window.ANPNetwork.registerAgent(this.agentId, this);
            
            // 初始化存储系统
            await this.setupStorage();
            
            // 恢复持久化状态
            await this.restorePersistedState();
            
            // 启动同步服务
            this.startSyncServices();
            
            this.status = 'online';
            console.log(`✅ ${this.agentId} (${this.role}) 初始化完成`);
            
            return true;
        } catch (error) {
            console.error(`❌ ${this.agentId} 初始化失败:`, error);
            this.status = 'error';
            return false;
        }
    }

    // 初始化存储
    initializeStorage() {
        // 检查存储支持
        this.storageSupport = {
            localStorage: typeof Storage !== 'undefined' && window.localStorage,
            sessionStorage: typeof Storage !== 'undefined' && window.sessionStorage,
            indexedDB: typeof window.indexedDB !== 'undefined'
        };
        
        console.log('💾 存储支持检查:', this.storageSupport);
    }

    // 设置存储系统
    async setupStorage() {
  ndexedDB
        if (this.storageSupport.indexedDB) {
            await this.setupIndexedDB();
        }
        
        // 清理过期数据
        this.cleanupExpiredData();
    }

    // 设置IndexedDB
    async setupIndexedDB() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(
                this.storageConfig.indexedDB.dbName,
                this.storageConfig.indexedDB.version
            );
            
            request.onerror = () => reject(request.error);
            request.onsuccess = () => {
                this.indexedDB = request.result;
                console.log('✅ IndexedDB 初始化完成');
                resolve();
            };
            
            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                
                // 创建对象存储
                this.storageConfig.indexedDB.stores.forEach(storeName => {
                    if (!db.objectStoreNames.contains(storeName)) {
                        const store = db.createObjectStore(storeName, { keyPath: 'id' });
                        store.createIndex('timestamp', 'timestamp', { unique: false });
                    }
                });
            };
        });
    }

    // 更新状态
    async updateState(key, value, options = {}) {
        const startTime = Date.now();
        
        try {
            // 发送ANP消息
            await window.ANrk.sendMessage(
                'SYSTEM',
                this.agentId,
                'update_state',
                { key, value, options }
            );
            
            // 更新内存状态
            this.setNestedValue(this.globalState, key, value);
            
            // 持久化存储
            if (options.persist !== false) {
                await this.persistState(key, value, options);
            }
            
            // 广播状态变更
            if (options.broadcast !== false) {
                await this.broadcastStateChange(key, value);
            }
            
            // 更新统计
            this.stats.stateUpdates++;
            
            const latency = Date.now() - startTime;
            console.log(`✅ 状态更新完成: ${key} (${latency}ms)`);
            
            return true;
            
        } catch (error) {
            this.stats.errors++;
            console.error(`❌ 状态更新失败: ${key}`, error);
            throw error;
        }
    }

    // 获取状态
    async getState(key, options = {}) {
        try {
            // 优先从内存获取
            let value = this.getNestedValue(this.globalState, key);
            
            // 如果内存中没有，尝试从持久化存储获取
            if (value === undefined && options.fromStorage !== false) {
                value = await this.getPersistedState(key);
                
                // 如果找到，更新内存状态
                if (value !== undefined) {
                    this.setNestedValue(this.globalState, key, value);
                }
            }
            
            return value;
            
        } catch (error) {
            console.error(`❌ 获取状态失败: ${key}`, error);
            return undefined;
        }
    }

    // 删除状态
    async deleteState(key, options = {}) {
        try {
            // 从内存删除
            this.deleteNestedValue(this.globalState, key);
            
            // 从持久化存储删除
            if (options.fromStorage !== false) {
                await this.deletePersistedState(key);
            }
            
            // 广播删除事件
            if (options.broadcast !== false) {
                await this.broadcastStateChange(key, undefined, 'deleted');
            }
            
            console.log(`✅ 状态删除完成: ${key}`);
            return true;
            
        } catch (error) {
            console.error(`❌ 状态删除失败: ${key}`, error);
            throw error;
        }
    }

    // 持久化状态
    async persistState(key, value, options = {}) {
        const data = {
            id: key,
            value: value,
            timestamp: Date.now(),
            ttl: options.ttl || 0, // 0表示永不过期
            compressed: false
        };
        
        // 数据压缩 (简化实现)
        if (this.storageConfig.localStorage.compression && 
            JSON.stringify(value).length > 1000) {
            data.compressed = true;
            // 这里可以实现真正的压缩算法
        }
        
        // 存储到不同的存储系统
        const promises = [];
        
        // LocalStorage
        if (this.storageSupport.localStorage && options.localStorage !== false) {
            promises.push(this.saveToLocalStorage(key, data));
        }
        
        // SessionStorage
        if (this.storageSupport.sessionStorage && options.sessionStorage === true) {
            promises.push(this.saveToSessionStorage(key, data));
        }
        
        // IndexedDB
        if (this.storageSupport.indexedDB && options.indexedDB !== false) {
            promises.push(this.saveToIndexedDB('states', data));
        }
        
        await Promise.allSettled(promises);
    }

    // 获取持久化状态
    async getPersistedState(key) {
        // 优先级: IndexedDB > LocalStorage > SessionStorage
        
        // 尝试从IndexedDB获取
        if (this.storageSupport.indexedDB) {
            const data = await this.getFromIndexedDB('states', key);
            if (data && !this.isExpired(data)) {
                return this.decompressData(data);
            }
        }
        
        // 尝试从LocalStorage获取
        if (this.storageSupport.localStorage) {
            const data = this.getFromLocalStorage(key);
            if (data && !this.isExpired(data)) {
                return this.decompressData(data);
            }
        }
        
        // 尝试从SessionStorage获取
        if (this.storageSupport.sessionStorage) {
            const data = this.getFromSessionStorage(key);
            if (data && !this.isExpired(data)) {
                return this.decompressData(data);
            }
        }
        
        return undefined;
    }

    // 保存到LocalStorage
    async saveToLocalStorage(key, data) {
        try {
            const storageKey = this.storageConfig.localStorage.prefix + key;
            localStorage.setItem(storageKey, JSON.stringify(data));
        } catch (error) {
            console.warn('LocalStorage保存失败:', error);
        }
    }

    // 从LocalStorage获取
    getFromLocalStorage(key) {
        try {
            const storageKey = this.storageConfig.localStorage.prefix + key;
            const data = localStorage.getItem(storageKey);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.warn('LocalStorage读取失败:', error);
            return null;
        }
    }

    // 保存到SessionStorage
    async saveToSessionStorage(key, data) {
        try {
            const storageKey = this.storageConfig.sessionStorage.prefix + key;
            sessionStorage.setItem(storageKey, JSON.stringify(data));
        } catch (error) {
            console.warn('SessionStorage保存失败:', error);
        }
    }

    // 从SessionStorage获取
    getFromSessionStorage(key) {
        try {
            const storageKey = this.storageConfig.sessionStorage.prefix + key;
            const data = sessionStorage.getItem(storageKey);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.warn('SessionStorage读取失败:', error);
            return null;
        }
    }

    // 保存到IndexedDB
    async saveToIndexedDB(storeName, data) {
        if (!this.indexedDB) return;
        
        return new Promise((resolve, reject) => {
            const transaction = this.indexedDB.transaction([storeName], 'readwrite');
            const store = transaction.objectStore(storeName);
            const request = store.put(data);
            
            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }

    // 从IndexedDB获取
    async getFromIndexedDB(storeName, key) {
        if (!this.indexedDB) return null;
        
        return new Promise((resolve, reject) => {
            const transaction = this.indexedDB.transaction([storeName], 'readonly');
            const store = transaction.objectStore(storeName);
            const request = store.get(key);
            
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    // 会话管理
    async createSession(userId, sessionData = {}) {
        const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        const session = {
            id: sessionId,
            userId: userId,
            data: sessionData,
            createdAt: Date.now(),
            lastAccessAt: Date.now(),
            expiresAt: Date.now() + 24 * 60 * 60 * 1000, // 24小时
            isActive: true
        };
        
        await this.updateState(`sessions.${sessionId}`, session, {
            persist: true,
            broadcast: true
        });
        
        console.log(`✅ 会话创建: ${sessionId}`);
        return sessionId;
    }

    // 更新会话
    async updateSession(sessionId, updates) {
        const session = await this.getState(`sessions.${sessionId}`);
        
        if (!session) {
            throw new Error(`会话不存在: ${sessionId}`);
        }
        
        const updatedSession = {
            ...session,
            ...updates,
            lastAccessAt: Date.now()
        };
        
        await this.updateState(`sessions.${sessionId}`, updatedSession, {
            persist: true,
            broadcast: true
        });
        
        return updatedSession;
    }

    // 缓存管理
    async setCache(key, value, ttl = 3600000) { // 默认1小时
        const cacheData = {
            value: value,
            timestamp: Date.now(),
            ttl: ttl,
            hits: 0
        };
        
        await this.updateState(`cache.${key}`, cacheData, {
            persist: false, // 缓存不持久化
            broadcast: false
        });
    }

    // 获取缓存
    async getCache(key) {
        const cacheData = await this.getState(`cache.${key}`, { fromStorage: false });
        
        if (!cacheData) {
            this.stats.cacheMisses++;
            return undefined;
        }
        
        // 检查是否过期
        if (cacheData.ttl > 0 && Date.now() - cacheData.timestamp > cacheData.ttl) {
            await this.deleteState(`cache.${key}`, { fromStorage: false });
            this.stats.cacheMisses++;
            return undefined;
        }
        
        // 更新命中次数
        cacheData.hits++;
        this.stats.cacheHits++;
        
        return cacheData.value;
    }

    // 广播状态变更
    async broadcastStateChange(key, value, action = 'updated') {
        await window.ANPNetwork.broadcast('state_changed', {
            key: key,
            value: value,
            action: action,
            timestamp: Date.now(),
            source: this.agentId
        });
    }

    // 启动同步服务
    startSyncServices() {
        // 状态同步
        setInterval(() => {
            this.syncStates();
        }, this.syncConfig.intervals.state);
        
        // 缓存清理
        setInterval(() => {
            this.cleanupCache();
        }, this.syncConfig.intervals.cache);
        
        // 数据清理
        setInterval(() => {
            this.cleanupExpiredData();
        }, this.syncConfig.intervals.cleanup);
    }

    // 同步状态
    async syncStates() {
        try {
            // 同步关键状态到持久化存储
            const criticalStates = ['agents', 'system'];
            
            for (const stateKey of criticalStates) {
                const state = await this.getState(stateKey);
                if (state) {
                    await this.persistState(stateKey, state);
                }
            }
            
            this.stats.syncOperations++;
            
        } catch (error) {
            console.error('状态同步失败:', error);
            this.stats.errors++;
        }
    }

    // 清理缓存
    cleanupCache() {
        const cache = this.globalState.cache || {};
        const now = Date.now();
        let cleanedCount = 0;
        
        for (const [key, data] of Object.entries(cache)) {
            if (data.ttl > 0 && now - data.timestamp > data.ttl) {
                delete cache[key];
                cleanedCount++;
            }
        }
        
        if (cleanedCount > 0) {
            console.log(`🧹 清理过期缓存: ${cleanedCount} 项`);
        }
    }

    // 清理过期数据
    cleanupExpiredData() {
        // 清理过期会话
        const sessions = this.globalState.sessions || {};
        const now = Date.now();
        let cleanedSessions = 0;
        
        for (const [sessionId, session] of Object.entries(sessions)) {
            if (session.expiresAt && now > session.expiresAt) {
                delete sessions[sessionId];
                cleanedSessions++;
            }
        }
        
        if (cleanedSessions > 0) {
            console.log(`🧹 清理过期会话: ${cleanedSessions} 个`);
        }
    }

    // 恢复持久化状态
    async restorePersistedState() {
        try {
            // 恢复系统状态
            const systemState = await this.getPersistedState('system');
            if (systemState) {
                this.globalState.system = { ...this.globalState.system, ...systemState };
            }
            
            // 恢复Agent状态
            const agentStates = await this.getPersistedState('agents');
            if (agentStates) {
                this.globalState.agents = agentStates;
            }
            
            console.log('📥 持久化状态恢复完成');
            
        } catch (error) {
            console.error('持久化状态恢复失败:', error);
        }
    }

    // 工具方法
    setNestedValue(obj, path, value) {
        const keys = path.split('.');
        let current = obj;
        
        for (let i = 0; i < keys.length - 1; i++) {
            const key = keys[i];
            if (!(key in current) || typeof current[key] !== 'object') {
                current[key] = {};
            }
            current = current[key];
        }
        
        current[keys[keys.length - 1]] = value;
    }

    getNestedValue(obj, path) {
        const keys = path.split('.');
        let current = obj;
        
        for (const key of keys) {
            if (current === null || current === undefined || !(key in current)) {
                return undefined;
            }
            current = current[key];
        }
        
        return current;
    }

    deleteNestedValue(obj, path) {
        const keys = path.split('.');
        let current = obj;
        
        for (let i = 0; i < keys.length - 1; i++) {
            const key = keys[i];
            if (!(key in current) || typeof current[key] !== 'object') {
                return;
            }
            current = current[key];
        }
        
        delete current[keys[keys.length - 1]];
    }

    isExpired(data) {
        return data.ttl > 0 && Date.now() - data.timestamp > data.ttl;
    }

    decompressData(data) {
        // 简化的解压缩实现
        return data.compressed ? data.value : data.value;
    }

    // 处理ANP消息
    async handleMessage(message) {
        switch (message.action) {
            case 'update_state':
                const { key, value, options } = message.payload;
                return await this.updateState(key, value, options);
            
            case 'get_state':
                return await this.getState(message.payload.key, message.payload.options);
            
            case 'delete_state':
                return await this.deleteState(message.payload.key, message.payload.options);
            
            case 'create_session':
                return await this.createSession(message.payload.userId, message.payload.sessionData);
            
            case 'update_session':
                return await this.updateSession(message.payload.sessionId, message.payload.updates);
            
            case 'set_cache':
                return await this.setCache(message.payload.key, message.payload.value, message.payload.ttl);
            
            case 'get_cache':
                return await this.getCache(message.payload.key);
            
            case 'ping':
                return { action: 'pong', timestamp: Date.now(), agent: this.agentId };
            
            case 'get_status':
                return {
                    action: 'status_response',
                    status: this.status,
                    role: this.role,
                    capabilities: this.capabilities,
                    stats: this.stats,
                    storage: this.storageSupport,
                    globalState: {
                        agents: Object.keys(this.globalState.agents || {}).length,
                        sessions: Object.keys(this.globalState.sessions || {}).length,
                        cache: Object.keys(this.globalState.cache || {}).length
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
            stats: this.stats,
            storage: this.storageSupport,
            globalState: {
                agents: Object.keys(this.globalState.agents || {}).length,
                sessions: Object.keys(this.globalState.sessions || {}).length,
                cache: Object.keys(this.globalState.cache || {}).length
            }
        };
    }
}

// 创建全局Agent D实例
window.AgentD = new AgentD();

// 自动初始化
document.addEventListener('DOMContentLoaded', () => {
    window.AgentD.initialize();
});

// 导出供其他模块使用
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AgentD;
}