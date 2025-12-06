// 高性能数据访问架构实现

import { AgentRole, SimpleANPMessage } from '../types/simple-agent-protocol';

// 共享数据缓存接口
export interface SharedDataCache {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T, options?: CacheOptions): Promise<void>;
  mget<T>(keys: string[]): Promise<(T | null)[]>;
  mset(entries: [string, any][]): Promise<void>;
  del(key: string): Promise<void>;
  keys(pattern: string): Promise<string[]>;
  publish(channel: string, message: any): Promise<void>;
  subscribe(channel: string, handler: (message: any) => void): Promise<void>;
}

interface CacheOptions {
  ttl?: number; // 生存时间(秒)
  tags?: string[]; // 缓存标签，用于批量失效
}

// 结构化数据类型
export interface StructuredSpotData {
  byId: Map<string, SpotInfo>;
  byCategory: Map<string, SpotInfo[]>;
  searchIndex: SearchIndex;
  lastUpdated: number;
}

export interface SearchIndex {
  keywords: Map<string, string[]>; // 关键词 -> 景点ID列表
  fulltext: Map<string, number>; // 全文搜索权重
}

export interface SpotInfo {
  id: string;
  name: string;
  category: string;
  description: string;
  location: { lat: number; lng: number };
  images: string[];
  audio?: string;
  tags: string[];
  popularity: number;
}

// 内存共享缓存实现
export class MemorySharedCache implements SharedDataCache {
  private cache = new Map<string, { value: any; expires?: number; tags?: string[] }>();
  private subscribers = new Map<string, ((message: any) => void)[]>();

  async get<T>(key: string): Promise<T | null> {
    const entry = this.cache.get(key);
    if (!entry) return null;
    
    if (entry.expires && Date.now() > entry.expires) {
      this.cache.delete(key);
      return null;
    }
    
    return entry.value;
  }

  async set<T>(key: string, value: T, options?: CacheOptions): Promise<void> {
    const expires = options?.ttl ? Date.now() + options.ttl * 1000 : undefined;
    this.cache.set(key, { 
      value, 
      expires, 
      tags: options?.tags 
    });
  }

  async mget<T>(keys: string[]): Promise<(T | null)[]> {
    return Promise.all(keys.map(key => this.get<T>(key)));
  }

  async mset(entries: [string, any][]): Promise<void> {
    for (const [key, value] of entries) {
      await this.set(key, value);
    }
  }

  async del(key: string): Promise<void> {
    this.cache.delete(key);
  }

  async keys(pattern: string): Promise<string[]> {
    const regex = new RegExp(pattern.replace(/\*/g, '.*'));
    return Array.from(this.cache.keys()).filter(key => regex.test(key));
  }

  async publish(channel: string, message: any): Promise<void> {
    const handlers = this.subscribers.get(channel) || [];
    handlers.forEach(handler => {
      try {
        handler(message);
      } catch (error) {
        console.error('Error in subscriber handler:', error);
      }
    });
  }

  async subscribe(channel: string, handler: (message: any) => void): Promise<void> {
    if (!this.subscribers.has(channel)) {
      this.subscribers.set(channel, []);
    }
    this.subscribers.get(channel)!.push(handler);
  }

  // 按标签批量删除
  async deleteByTags(tags: string[]): Promise<void> {
    for (const [key, entry] of this.cache.entries()) {
      if (entry.tags && entry.tags.some(tag => tags.includes(tag))) {
        this.cache.delete(key);
      }
    }
  }

  // 获取缓存统计
  getStats(): { size: number; hitRate: number } {
    return {
      size: this.cache.size,
      hitRate: 0.85 // 模拟命中率
    };
  }
}

// 数据库连接接口
export interface DatabaseConnection {
  query<T = any>(sql: string, params?: any[]): Promise<T[]>;
  queryOne<T = any>(sql: string, params?: any[]): Promise<T | null>;
  transaction<T>(callback: (tx: DatabaseConnection) => Promise<T>): Promise<T>;
}

// 模拟数据库实现
export class MockDatabase implements DatabaseConnection {
  private spots: SpotInfo[] = [
    {
      id: 'spot1',
      name: '红军长征纪念馆',
      category: '红色文化',
      description: '展示红军长征历史的重要场所',
      location: { lat: 25.123, lng: 110.456 },
      images: ['image1.jpg'],
      tags: ['红色', '历史', '教育'],
      popularity: 95
    },
    {
      id: 'spot2', 
      name: '生态茶园',
      category: '生态旅游',
      description: '原生态茶园，体验采茶乐趣',
      location: { lat: 25.234, lng: 110.567 },
      images: ['image2.jpg'],
      tags: ['生态', '茶文化', '体验'],
      popularity: 88
    }
  ];

  async query<T = any>(sql: string, params?: any[]): Promise<T[]> {
    // 模拟SQL查询
    if (sql.includes('SELECT * FROM spots')) {
      return this.spots as T[];
    }
    if (sql.includes('WHERE id = ?')) {
      const id = params?.[0];
      const spot = this.spots.find(s => s.id === id);
      return spot ? [spot as T] : [];
    }
    if (sql.includes('MATCH') && sql.includes('AGAINST')) {
      const query = params?.[0]?.toLowerCase() || '';
      const results = this.spots.filter(spot => 
        spot.name.toLowerCase().includes(query) ||
        spot.description.toLowerCase().includes(query) ||
        spot.tags.some(tag => tag.toLowerCase().includes(query))
      );
      return results as T[];
    }
    return [];
  }

  async queryOne<T = any>(sql: string, params?: any[]): Promise<T | null> {
    const results = await this.query<T>(sql, params);
    return results[0] || null;
  }

  async transaction<T>(callback: (tx: DatabaseConnection) => Promise<T>): Promise<T> {
    return callback(this);
  }
}

// Agent C - 数据生产者
export class AgentC_DataProducer {
  private sharedCache: SharedDataCache;
  private database: DatabaseConnection;
  private refreshInterval: NodeJS.Timeout | null = null;

  constructor(sharedCache: SharedDataCache, database: DatabaseConnection) {
    this.sharedCache = sharedCache;
    this.database = database;
    this.setupDataProduction();
  }

  // 启动数据生产
  private setupDataProduction(): void {
    // 立即执行一次
    this.refreshAllData();
    
    // 定期刷新 (5分钟)
    this.refreshInterval = setInterval(() => {
      this.refreshAllData();
    }, 5 * 60 * 1000);

    // 监听数据更新事件
    this.sharedCache.subscribe('data:invalidate', async (message) => {
      await this.handleDataInvalidation(message);
    });
  }

  // 刷新所有数据
  private async refreshAllData(): Promise<void> {
    try {
      await Promise.all([
        this.refreshSpotData(),
        this.refreshKnowledgeIndex(),
        this.refreshPopularityData()
      ]);
      
      console.log('Data refresh completed at', new Date().toISOString());
    } catch (error) {
      console.error('Data refresh failed:', error);
    }
  }

  // 刷新景点数据
  private async refreshSpotData(): Promise<void> {
    const spots = await this.database.query<SpotInfo>('SELECT * FROM spots');
    
    // 结构化数据
    const structuredData: StructuredSpotData = {
      byId: new Map(spots.map(spot => [spot.id, spot])),
      byCategory: this.groupByCategory(spots),
      searchIndex: this.buildSearchIndex(spots),
      lastUpdated: Date.now()
    };

    // 存储到缓存 - 修复类型错误
    const cacheEntries: [string, any][] = [
      ['spots:all', spots],
      ['spots:structured', structuredData],
      ['spots:by_category', Object.fromEntries(structuredData.byCategory)],
      ['spots:search_index', structuredData.searchIndex]
    ];
    await this.sharedCache.mset(cacheEntries);

    // 单个景点缓存
    for (const spot of spots) {
      await this.sharedCache.set(`spot:${spot.id}`, spot, { 
        ttl: 3600, 
        tags: ['spots', spot.category] 
      });
    }

    // 通知数据更新
    await this.sharedCache.publish('data:updated', {
      type: 'spots',
      timestamp: Date.now(),
      count: spots.length
    });
  }

  // 按分类分组
  private groupByCategory(spots: SpotInfo[]): Map<string, SpotInfo[]> {
    const groups = new Map<string, SpotInfo[]>();
    for (const spot of spots) {
      if (!groups.has(spot.category)) {
        groups.set(spot.category, []);
      }
      groups.get(spot.category)!.push(spot);
    }
    return groups;
  }

  // 构建搜索索引
  private buildSearchIndex(spots: SpotInfo[]): SearchIndex {
    const keywords = new Map<string, string[]>();
    const fulltext = new Map<string, number>();

    for (const spot of spots) {
      // 关键词索引
      const allKeywords = [
        ...spot.tags,
        spot.category,
        ...spot.name.split(''),
        ...spot.description.split('')
      ];

      for (const keyword of allKeywords) {
        if (!keywords.has(keyword)) {
          keywords.set(keyword, []);
        }
        keywords.get(keyword)!.push(spot.id);
      }

      // 全文搜索权重
      const text = `${spot.name} ${spot.description} ${spot.tags.join(' ')}`;
      fulltext.set(spot.id, text.length + spot.popularity);
    }

    return { keywords, fulltext };
  }

  // 处理数据失效
  private async handleDataInvalidation(message: any): Promise<void> {
    const { type, tags } = message;
    
    if (type === 'spots') {
      await this.refreshSpotData();
    } else if (tags) {
      // 按标签删除缓存
      if (this.sharedCache instanceof MemorySharedCache) {
        await this.sharedCache.deleteByTags(tags);
      }
    }
  }

  // 刷新知识索引
  private async refreshKnowledgeIndex(): Promise<void> {
    // 模拟知识库数据
    const knowledge = [
      { id: 'k1', title: '红色文化介绍', content: '革命历史文化...', tags: ['红色', '历史'] },
      { id: 'k2', title: '生态旅游指南', content: '生态保护与旅游...', tags: ['生态', '旅游'] }
    ];

    await this.sharedCache.set('knowledge:all', knowledge, { ttl: 7200 });
  }

  // 刷新热度数据
  private async refreshPopularityData(): Promise<void> {
    // 模拟热门景点统计
    const popularSpots = await this.database.query(`
      SELECT spot_id, COUNT(*) as visit_count 
      FROM user_visits 
      WHERE created_at > DATE_SUB(NOW(), INTERVAL 7 DAY)
      GROUP BY spot_id 
      ORDER BY visit_count DESC 
      LIMIT 20
    `);

    await this.sharedCache.set('spots:popular', popularSpots, { ttl: 1800 });
  }

  // 停止数据生产
  stop(): void {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
      this.refreshInterval = null;
    }
  }
}

// 全局实例
export const sharedCache = new MemorySharedCache();
export const mockDatabase = new MockDatabase();
export const agentC_Producer = new AgentC_DataProducer(sharedCache, mockDatabase);