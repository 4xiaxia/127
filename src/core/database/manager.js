// 数据库管理器 - 军工级数据持久化层
// 支持 IndexedDB + LocalStorage + SessionStorage 混合存储

export class DatabaseManager {
    constructor() {
        this.dbName = 'ANP_VillageGuide';
        this.version = 1;
        this.db = null;
        this.isInitialized = false;
        
        // 存储配置
        this.config = {
            indexedDB: {
                maxSize: 50 * 1024 * 1024, // 50MB
                timeout: 10000
            },
            localStorage: {
                prefix: 'anp_db_',
                maxSize: 5 * 1024 * 1024 // 5MB
            },
            sessionStorage: {
                prefix: 'anp_session_',
                maxSize: 2 * 1024 * 1024 // 2MB
            }
        };
        
        // 数据表结构
        this.stores = {
            users: {
                keyPath: 'id',
                indexes: ['sessionId', 'createdAt', 'lastLoginAt']
            },
            sessions: {
                keyPath: 'id',
                indexes: ['userId', 'createdAt', 'expiresAt', 'isActive']
            },
            messages: {
                keyPath: 'id',
                indexes: ['sessionId', 'userId', 'timestamp', 'type', 'source', 'target']
            },
            spots: {
                keyPath: 'id',
                indexes: ['category', 'status', 'createdAt']
            },
            routes: {
                keyPath: 'id',
                indexes: ['difficulty', 'duration', 'createdAt']
            },
            celebrities: {
                keyPath: 'id',
                indexes: ['period', 'category', 'createdAt']
            },
            specialties: {
                keyPath: 'id',
                indexes: ['category', 'price', 'createdAt']
            },
            cache: {
                keyPath: 'key',
                indexes: ['expiresAt', 'createdAt', 'category']
            },
            logs: {
                keyPath: 'id',
                indexes: ['level', 'timestamp', 'source', 'action']
            },
            analytics: {
                keyPath: 'id',
                indexes: ['sessionId', 'timestamp', 'eventType', 'userId']
            }
        };
        
        // 统计信息
        this.stats = {
            totalOperations: 0,
            readOperations: 0,
            writeOperations: 0,
            deleteOperations: 0,
            errors: 0,
            cacheHits: 0,
            cacheMisses: 0
        };
        
        // 内存缓存
        this.memoryCache = new Map();
        this.cacheConfig = {
            maxSize: 1000,
            ttl: 300000 // 5分钟
        };
    }

    // 初始化数据库
    async initialize() {
        if (this.isInitialized) {
            console.warn('DatabaseManager already initialized');
            return true;
        }

        try {
            console.log('🗄️ 初始化数据库管理器...');
            
            // 检查存储支持
            this.checkStorageSupport();
            
            // 初始化 IndexedDB
            if (this.storageSupport.indexedDB) {
                await this.initializeIndexedDB();
            }
            
            // 初始化内存缓存
            this.initializeCache();
            
            // 清理过期数据
            await this.cleanupExpiredData();
            
            this.isInitialized = true;
            console.log('✅ 数据库管理器初始化完成');
            
            return true;
            
        } catch (error) {
            console.error('❌ 数据库管理器初始化失败:', error);
            throw error;
        }
    }

    // 检查存储支持
    checkStorageSupport() {
        this.storageSupport = {
            indexedDB: typeof window.indexedDB !== 'undefined',
            localStorage: typeof window.localStorage !== 'undefined',
            sessionStorage: typeof window.sessionStorage !== 'undefined'
        };
        
        console.log('💾 存储支持检查:', this.storageSupport);
        
        if (!this.storageSupport.indexedDB) {
            console.warn('⚠️ IndexedDB 不支持，将使用 LocalStorage 备用方案');
        }
    }

    // 初始化 IndexedDB
    async initializeIndexedDB() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.version);
            
            request.onerror = () => {
                console.error('IndexedDB 打开失败:', request.error);
                reject(request.error);
            };
            
            request.onsuccess = () => {
                this.db = request.result;
                console.log('✅ IndexedDB 初始化成功');
                resolve();
            };
            
            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                
                console.log('🔄 IndexedDB 升级中...');
                
                // 创建对象存储
                Object.entries(this.stores).forEach(([storeName, config]) => {
                    if (!db.objectStoreNames.contains(storeName)) {
                        const store = db.createObjectStore(storeName, {
                            keyPath: config.keyPath
                        });
                        
                        // 创建索引
                        if (config.indexes) {
                            config.indexes.forEach(indexName => {
                                store.createIndex(indexName, indexName, {
                                    unique: false
                                });
                            });
                        }
                        
                        console.log(`📋 创建存储表: ${storeName}`);
                    }
                });
            };
        });
    }

    // 初始化缓存
    initializeCache() {
        this.cache = new Map();
        this.cacheStats = {
            hits: 0,
            misses: 0,
            evictions: 0
        };
    }

    // 通用 CRUD 操作

    // 创建记录
    async create(storeName, data, options = {}) {
        const startTime = Date.now();
        
        try {
            // 生成ID（如果没有）
            if (!data.id) {
                data.id = this.generateId();
            }
            
            // 添加时间戳
            data.createdAt = data.createdAt || Date.now();
            data.updatedAt = Date.now();
            
            let result;
            
            // 优先使用 IndexedDB
            if (this.storageSupport.indexedDB && this.db) {
                result = await this.createIndexedDB(storeName, data);
            } else if (this.storageSupport.localStorage) {
                result = await this.createLocalStorage(storeName, data);
            } else {
                throw new Error('没有可用的存储系统');
            }
            
            // 更新缓存
            if (options.cache !== false) {
                this.setCache(`${storeName}_${data.id}`, data);
            }
            
            // 更新统计
            this.stats.totalOperations++;
            this.stats.writeOperations++;
            
            const latency = Date.now() - startTime;
            console.log(`✅ 创建记录完成: ${storeName}.${data.id} (${latency}ms)`);
            
            return result;
            
        } catch (error) {
            this.stats.errors++;
            console.error(`❌ 创建记录失败: ${storeName}`, error);
            throw error;
        }
    }

    // 读取记录
    async read(storeName, id, options = {}) {
        const startTime = Date.now();
        
        try {
            // 检查缓存
            const cacheKey = `${storeName}_${id}`;
            if (options.cache !== false) {
                const cached = this.getCache(cacheKey);
                if (cached) {
                    this.stats.cacheHits++;
                    return cached;
                }
            }
            
            this.stats.cacheMisses++;
            
            let result;
            
            // 优先使用 IndexedDB
            if (this.storageSupport.indexedDB && this.db) {
                result = await this.readIndexedDB(storeName, id);
            } else if (this.storageSupport.localStorage) {
                result = await this.readLocalStorage(storeName, id);
            } else {
                throw new Error('没有可用的存储系统');
            }
            
            // 更新缓存
            if (result && options.cache !== false) {
                this.setCache(cacheKey, result);
            }
            
            // 更新统计
            this.stats.totalOperations++;
            this.stats.readOperations++;
            
            const latency = Date.now() - startTime;
            console.log(`✅ 读取记录完成: ${storeName}.${id} (${latency}ms)`);
            
            return result;
            
        } catch (error) {
            this.stats.errors++;
            console.error(`❌ 读取记录失败: ${storeName}.${id}`, error);
            throw error;
        }
    }

    // 更新记录
    async update(storeName, id, updates, options = {}) {
        const startTime = Date.now();
        
        try {
            // 添加更新时间戳
            updates.updatedAt = Date.now();
            
            let result;
            
            // 优先使用 IndexedDB
            if (this.storageSupport.indexedDB && this.db) {
                result = await this.updateIndexedDB(storeName, id, updates);
            } else if (this.storageSupport.localStorage) {
                result = await this.updateLocalStorage(storeName, id, updates);
            } else {
                throw new Error('没有可用的存储系统');
            }
            
            // 更新缓存
            if (options.cache !== false) {
                const cacheKey = `${storeName}_${id}`;
                const cached = this.getCache(cacheKey);
                if (cached) {
                    Object.assign(cached, updates);
                    this.setCache(cacheKey, cached);
                }
            }
            
            // 更新统计
            this.stats.totalOperations++;
            this.stats.writeOperations++;
            
            const latency = Date.now() - startTime;
            console.log(`✅ 更新记录完成: ${storeName}.${id} (${latency}ms)`);
            
            return result;
            
        } catch (error) {
            this.stats.errors++;
            console.error(`❌ 更新记录失败: ${storeName}.${id}`, error);
            throw error;
        }
    }

    // 删除记录
    async delete(storeName, id, options = {}) {
        const startTime = Date.now();
        
        try {
            // 优先使用 IndexedDB
            if (this.storageSupport.indexedDB && this.db) {
                await this.deleteIndexedDB(storeName, id);
            } else if (this.storageSupport.localStorage) {
                await this.deleteLocalStorage(storeName, id);
            } else {
                throw new Error('没有可用的存储系统');
            }
            
            // 删除缓存
            if (options.cache !== false) {
                this.deleteCache(`${storeName}_${id}`);
            }
            
            // 更新统计
            this.stats.totalOperations++;
            this.stats.deleteOperations++;
            
            const latency = Date.now() - startTime;
            console.log(`✅ 删除记录完成: ${storeName}.${id} (${latency}ms)`);
            
            return true;
            
        } catch (error) {
            this.stats.errors++;
            console.error(`❌ 删除记录失败: ${storeName}.${id}`, error);
            throw error;
        }
    }

    // 查询记录
    async query(storeName, query = {}, options = {}) {
        const startTime = Date.now();
        
        try {
            let results = [];
            
            // 优先使用 IndexedDB
            if (this.storageSupport.indexedDB && this.db) {
                results = await this.queryIndexedDB(storeName, query, options);
            } else if (this.storageSupport.localStorage) {
                results = await this.queryLocalStorage(storeName, query, options);
            } else {
                throw new Error('没有可用的存储系统');
            }
            
            // 应用分页
            if (options.limit || options.offset) {
                const offset = options.offset || 0;
                const limit = options.limit || results.length;
                results = results.slice(offset, offset + limit);
            }
            
            // 应用排序
            if (options.sort) {
                results = this.sortResults(results, options.sort);
            }
            
            const latency = Date.now() - startTime;
            console.log(`✅ 查询记录完成: ${storeName} (${results.length}条记录, ${latency}ms)`);
            
            return results;
            
        } catch (error) {
            this.stats.errors++;
            console.error(`❌ 查询记录失败: ${storeName}`, error);
            throw error;
        }
    }

    // IndexedDB 操作
    async createIndexedDB(storeName, data) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([storeName], 'readwrite');
            const store = transaction.objectStore(storeName);
            const request = store.add(data);
            
            request.onsuccess = () => resolve(data);
            request.onerror = () => reject(request.error);
        });
    }

    async readIndexedDB(storeName, id) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([storeName], 'readonly');
            const store = transaction.objectStore(storeName);
            const request = store.get(id);
            
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async updateIndexedDB(storeName, id, updates) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([storeName], 'readwrite');
            const store = transaction.objectStore(storeName);
            const request = store.get(id);
            
            request.onsuccess = () => {
                const data = request.result;
                if (data) {
                    Object.assign(data, updates);
                    const updateRequest = store.put(data);
                    updateRequest.onsuccess = () => resolve(data);
                    updateRequest.onerror = () => reject(updateRequest.error);
                } else {
                    reject(new Error(`记录不存在: ${id}`));
                }
            };
            
            request.onerror = () => reject(request.error);
        });
    }

    async deleteIndexedDB(storeName, id) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([storeName], 'readwrite');
            const store = transaction.objectStore(storeName);
            const request = store.delete(id);
            
            request.onsuccess = () => resolve(true);
            request.onerror = () => reject(request.error);
        });
    }

    async queryIndexedDB(storeName, query, options = {}) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([storeName], 'readonly');
            const store = transaction.objectStore(storeName);
            
            let request;
            
            // 如果有索引查询，使用索引
            if (query.index && options.index) {
                const index = store.index(options.index);
                if (query.range) {
                    request = index.openCursor(query.range);
                } else {
                    request = index.getAll(query.value);
                }
            } else {
                request = store.getAll();
            }
            
            request.onsuccess = () => {
                let results = request.result || [];
                
                // 应用过滤
                if (query.filter) {
                    results = results.filter(query.filter);
                }
                
                resolve(results);
            };
            
            request.onerror = () => reject(request.error);
        });
    }

    // LocalStorage 操作
    async createLocalStorage(storeName, data) {
        const key = this.getLocalStorageKey(storeName, data.id);
        localStorage.setItem(key, JSON.stringify(data));
        return data;
    }

    async readLocalStorage(storeName, id) {
        const key = this.getLocalStorageKey(storeName, id);
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : null;
    }

    async updateLocalStorage(storeName, id, updates) {
        const key = this.getLocalStorageKey(storeName, id);
        const data = JSON.parse(localStorage.getItem(key));
        if (data) {
            Object.assign(data, updates);
            localStorage.setItem(key, JSON.stringify(data));
            return data;
        }
        throw new Error(`记录不存在: ${id}`);
    }

    async deleteLocalStorage(storeName, id) {
        const key = this.getLocalStorageKey(storeName, id);
        localStorage.removeItem(key);
        return true;
    }

    async queryLocalStorage(storeName, query = {}) {
        const prefix = this.config.localStorage.prefix + storeName + '_';
        const results = [];
        
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith(prefix)) {
                const data = JSON.parse(localStorage.getItem(key));
                
                // 应用过滤
                if (!query.filter || query.filter(data)) {
                    results.push(data);
                }
            }
        }
        
        return results;
    }

    // 工具方法
    getLocalStorageKey(storeName, id) {
        return `${this.config.localStorage.prefix}${storeName}_${id}`;
    }

    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    sortResults(results, sort) {
        return results.sort((a, b) => {
            const aValue = this.getNestedValue(a, sort.field);
            const bValue = this.getNestedValue(b, sort.field);
            
            if (aValue < bValue) return sort.order === 'desc' ? 1 : -1;
            if (aValue > bValue) return sort.order === 'desc' ? -1 : 1;
            return 0;
        });
    }

    getNestedValue(obj, path) {
        const keys = path.split('.');
        let current = obj;
        
        for (const key of keys) {
            if (current === null || current === undefined) return undefined;
            current = current[key];
        }
        
        return current;
    }

    // 缓存管理
    setCache(key, value) {
        // 检查缓存大小
        if (this.cache.size >= this.cacheConfig.maxSize) {
            this.evictOldestCache();
        }
        
        this.cache.set(key, {
            value: value,
            timestamp: Date.now()
        });
    }

    getCache(key) {
        const cached = this.cache.get(key);
        
        if (!cached) {
            this.cacheStats.misses++;
            return undefined;
        }
        
        // 检查是否过期
        if (Date.now() - cached.timestamp > this.cacheConfig.ttl) {
            this.cache.delete(key);
            this.cacheStats.misses++;
            return undefined;
        }
        
        this.cacheStats.hits++;
        return cached.value;
    }

    deleteCache(key) {
        return this.cache.delete(key);
    }

    evictOldestCache() {
        let oldestKey = null;
        let oldestTime = Date.now();
        
        for (const [key, cached] of this.cache.entries()) {
            if (cached.timestamp < oldestTime) {
                oldestTime = cached.timestamp;
                oldestKey = key;
            }
        }
        
        if (oldestKey) {
            this.cache.delete(oldestKey);
            this.cacheStats.evictions++;
        }
    }

    // 数据清理
    async cleanupExpiredData() {
        console.log('🧹 清理过期数据...');
        
        const now = Date.now();
        let cleanedCount = 0;
        
        try {
            // 清理过期会话
            const expiredSessions = await this.query('sessions', {
                filter: session => session.expiresAt && session.expiresAt < now
            });
            
            for (const session of expiredSessions) {
                await this.delete('sessions', session.id);
                cleanedCount++;
            }
            
            // 清理过期缓存
            for (const [key, cached] of this.cache.entries()) {
                if (now - cached.timestamp > this.cacheConfig.ttl) {
                    this.cache.delete(key);
                    cleanedCount++;
                }
            }
            
            console.log(`✅ 清理完成: ${cleanedCount} 条过期数据`);
            
        } catch (error) {
            console.error('❌ 数据清理失败:', error);
        }
    }

    // 会话管理
    async createSession(userId, sessionData = {}) {
        const sessionId = this.generateId();
        
        const session = {
            id: sessionId,
            userId: userId,
            data: sessionData,
            createdAt: Date.now(),
            lastAccessAt: Date.now(),
            expiresAt: Date.now() + 24 * 60 * 60 * 1000, // 24小时
            isActive: true
        };
        
        await this.create('sessions', session);
        return sessionId;
    }

    async updateSession(sessionId, updates) {
        const session = await this.read('sessions', sessionId);
        if (!session) {
            throw new Error(`会话不存在: ${sessionId}`);
        }
        
        const updatedSession = {
            ...session,
            ...updates,
            lastAccessAt: Date.now()
        };
        
        return await this.update('sessions', sessionId, updatedSession);
    }

    async getSession(sessionId) {
        const session = await this.read('sessions', sessionId);
        
        if (!session || session.expiresAt < Date.now()) {
            return null;
        }
        
        // 更新最后访问时间
        await this.updateSession(sessionId, { lastAccessAt: Date.now() });
        
        return session;
    }

    // 消息管理
    async saveMessage(message) {
        return await this.create('messages', {
            sessionId: message.sessionId,
            userId: message.userId,
            type: message.type,
            source: message.source,
            target: message.target,
            content: message.content,
            timestamp: message.timestamp || Date.now(),
            metadata: message.metadata || {}
        });
    }

    async getMessages(sessionId, options = {}) {
        const query = {
            filter: message => message.sessionId === sessionId
        };
        
        const sort = {
            field: 'timestamp',
            order: 'asc'
        };
        
        return await this.query('messages', query, { ...options, sort });
    }

    // 统计信息
    getStats() {
        return {
            ...this.stats,
            cacheStats: this.cacheStats,
            cacheSize: this.cache.size,
            isInitialized: this.isInitialized,
            storageSupport: this.storageSupport,
            uptime: Date.now() - (this.startTime || Date.now())
        };
    }

    // 清理数据库
    async clear(storeName) {
        if (this.storageSupport.indexedDB && this.db) {
            const transaction = this.db.transaction([storeName], 'readwrite');
            const store = transaction.objectStore(storeName);
            await store.clear();
        } else if (this.storageSupport.localStorage) {
            const prefix = this.config.localStorage.prefix + storeName + '_';
            const keysToRemove = [];
            
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && key.startsWith(prefix)) {
                    keysToRemove.push(key);
                }
            }
            
            keysToRemove.forEach(key => localStorage.removeItem(key));
        }
        
        // 清理缓存
        for (const key of this.cache.keys()) {
            if (key.startsWith(storeName + '_')) {
                this.cache.delete(key);
            }
        }
        
        console.log(`✅ 清理存储表完成: ${storeName}`);
    }

    // 关闭数据库
    async close() {
        if (this.db) {
            this.db.close();
            this.db = null;
        }
        
        this.cache.clear();
        this.isInitialized = false;
        
        console.log('✅ 数据库管理器已关闭');
    }
}

// 导出单例实例
export const DatabaseManager = new DatabaseManager();
