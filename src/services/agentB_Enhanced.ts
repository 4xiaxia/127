// Agent B - 高性能直接数据访问实现

import { 
  SharedDataCache, 
  DatabaseConnection, 
  SpotInfo, 
  StructuredSpotData,
  sharedCache,
  mockDatabase 
} from './highPerformanceDataAccess';
import { SimpleANPMessage, UserContextMessage } from '../types/simple-agent-protocol';

// 查询性能监控
interface QueryMetrics {
  totalQueries: number;
  cacheHits: number;
  cacheMisses: number;
  avgResponseTime: number;
  errorCount: number;
}

// 智能数据访问策略
export class SmartDataAccessStrategy {
  private metrics: QueryMetrics = {
    totalQueries: 0,
    cacheHits: 0,
    cacheMisses: 0,
    avgResponseTime: 0,
    errorCount: 0
  };

  // 判断是否为热点数据
  isHotData(query: string): boolean {
    const hotPatterns = [
      /^spot:/, // 单个景点查询
      /^spots:(popular|featured)/, // 热门景点
      /^knowledge:(faq|common)/ // 常见问题
    ];
    return hotPatterns.some(pattern => pattern.test(query));
  }

  // 判断是否为简单查询
  isSimpleQuery(sql: string): boolean {
    const simplePatterns = [
      /^SELECT \* FROM \w+ WHERE id = \?$/, // 按ID查询
      /^SELECT \* FROM \w+ WHERE category = \?$/, // 按分类查询
      /^SELECT COUNT\(\*\) FROM \w+/ // 计数查询
    ];
    return simplePatterns.some(pattern => pattern.test(sql.trim()));
  }

  // 判断是否为复杂分析
  isComplexAnalysis(sql: string): boolean {
    const complexPatterns = [
      /JOIN/i, // 多表关联
      /GROUP BY.*HAVING/i, // 分组聚合
      /WINDOW|PARTITION/i, // 窗口函数
      /RECURSIVE/i // 递归查询
    ];
    return complexPatterns.some(pattern => pattern.test(sql));
  }

  // 更新性能指标
  updateMetrics(responseTime: number, cacheHit: boolean, error?: boolean): void {
    this.metrics.totalQueries++;
    if (cacheHit) this.metrics.cacheHits++;
    else this.metrics.cacheMisses++;
    if (error) this.metrics.errorCount++;
    
    // 计算平均响应时间
    this.metrics.avgResponseTime = 
      (this.metrics.avgResponseTime * (this.metrics.totalQueries - 1) + responseTime) / 
      this.metrics.totalQueries;
  }

  getMetrics(): QueryMetrics {
    return { ...this.metrics };
  }

  getCacheHitRate(): number {
    return this.metrics.totalQueries > 0 
      ? this.metrics.cacheHits / this.metrics.totalQueries 
      : 0;
  }
}

// Agent B - 增强版工具服务
export class AgentB_Enhanced {
  private sharedCache: SharedDataCache;
  private database: DatabaseConnection;
  private accessStrategy: SmartDataAccessStrategy;
  private currentUserContext: UserContextMessage['data'] | null = null;

  constructor(
    sharedCacheInstance?: SharedDataCache,
    databaseInstance?: DatabaseConnection
  ) {
    this.sharedCache = sharedCacheInstance || sharedCache;
    this.database = databaseInstance || mockDatabase;
    this.accessStrategy = new SmartDataAccessStrategy();
    this.setupCacheSubscriptions();
  }

  // 设置缓存订阅
  private setupCacheSubscriptions(): void {
    this.sharedCache.subscribe('data:updated', (message) => {
      console.log('Data updated:', message);
      // 可以在这里预热相关缓存
      this.preloadRelatedData(message.type);
    });
  }

  // 接收用户上下文更新
  async onUserContextUpdate(context: UserContextMessage['data']): Promise<void> {
    this.currentUserContext = context;
    
    // 根据用户上下文预加载数据
    if (context.currentSpot) {
      await this.preloadSpotData(context.currentSpot);
    }
    
    if (context.currentCategory) {
      await this.preloadCategoryData(context.currentCategory);
    }
  }

  // 高性能景点信息获取
  async getSpotInfo(spotId: string): Promise<SpotInfo | null> {
    const startTime = Date.now();
    let cacheHit = false;
    
    try {
      // 1. 尝试缓存
      const cacheKey = `spot:${spotId}`;
      if (this.accessStrategy.isHotData(cacheKey)) {
        const cached = await this.sharedCache.get<SpotInfo>(cacheKey);
        if (cached) {
          cacheHit = true;
          this.accessStrategy.updateMetrics(Date.now() - startTime, true);
          return cached;
        }
      }

      // 2. 直接查询数据库
      const spot = await this.database.queryOne<SpotInfo>(
        'SELECT * FROM spots WHERE id = ?',
        [spotId]
      );

      if (spot) {
        // 异步更新缓存
        this.sharedCache.set(cacheKey, spot, { ttl: 3600, tags: ['spots', spot.category] });
      }

      this.accessStrategy.updateMetrics(Date.now() - startTime, false);
      return spot;

    } catch (error) {
      this.accessStrategy.updateMetrics(Date.now() - startTime, cacheHit, true);
      console.error('Error getting spot info:', error);
      return null;
    }
  }

  // 高性能知识搜索
  async searchKnowledge(query: string): Promise<any[]> {
    const startTime = Date.now();
    let cacheHit = false;

    try {
      // 1. 检查搜索缓存
      const cacheKey = `search:${query}`;
      const cached = await this.sharedCache.get<any[]>(cacheKey);
      if (cached) {
        cacheHit = true;
        this.accessStrategy.updateMetrics(Date.now() - startTime, true);
        return cached;
      }

      // 2. 使用搜索索引
      const searchIndex = await this.sharedCache.get('spots:search_index');
      if (searchIndex) {
        const results = this.searchWithIndex(query, searchIndex);
        if (results.length > 0) {
          // 缓存搜索结果
          await this.sharedCache.set(cacheKey, results, { ttl: 1800 });
          this.accessStrategy.updateMetrics(Date.now() - startTime, false);
          return results;
        }
      }

      // 3. 直接数据库全文搜索
      const dbResults = await this.database.query(`
        SELECT *, 
               MATCH(name, description) AGAINST(? IN NATURAL LANGUAGE MODE) as relevance
        FROM spots 
        WHERE MATCH(name, description) AGAINST(? IN NATURAL LANGUAGE MODE)
        ORDER BY relevance DESC, popularity DESC
        LIMIT 10
      `, [query, query]);

      // 缓存结果
      await this.sharedCache.set(cacheKey, dbResults, { ttl: 1800 });
      this.accessStrategy.updateMetrics(Date.now() - startTime, false);
      return dbResults;

    } catch (error) {
      this.accessStrategy.updateMetrics(Date.now() - startTime, cacheHit, true);
      console.error('Error searching knowledge:', error);
      return [];
    }
  }

  // 使用搜索索引进行搜索
  private searchWithIndex(query: string, searchIndex: any): any[] {
    const keywords = query.toLowerCase().split(' ');
    const matchedSpotIds = new Set<string>();

    // 关键词匹配
    for (const keyword of keywords) {
      const spotIds = searchIndex.keywords.get(keyword) || [];
      spotIds.forEach((id: string) => matchedSpotIds.add(id));
    }

    // 转换为结果数组 (这里简化处理)
    return Array.from(matchedSpotIds).slice(0, 10).map(id => ({ id, relevance: 1 }));
  }

  // 批量获取景点信息
  async getBatchSpotInfo(spotIds: string[]): Promise<SpotInfo[]> {
    const startTime = Date.now();
    
    // 1. 批量检查缓存
    const cacheKeys = spotIds.map(id => `spot:${id}`);
    const cachedResults = await this.sharedCache.mget<SpotInfo>(cacheKeys);
    
    // 2. 找出缓存未命中的ID
    const missedIds: string[] = [];
    const results: SpotInfo[] = [];
    
    cachedResults.forEach((cached, index) => {
      if (cached) {
        results.push(cached);
      } else {
        missedIds.push(spotIds[index]);
      }
    });

    // 3. 批量查询未命中的数据
    if (missedIds.length > 0) {
      const placeholders = missedIds.map(() => '?').join(',');
      const dbResults = await this.database.query<SpotInfo>(
        `SELECT * FROM spots WHERE id IN (${placeholders})`,
        missedIds
      );

      // 4. 批量更新缓存
      const cacheEntries: [string, SpotInfo][] = dbResults.map(spot => 
        [`spot:${spot.id}`, spot]
      );
      await this.sharedCache.mset(cacheEntries);

      results.push(...dbResults);
    }

    const cacheHitRate = (spotIds.length - missedIds.length) / spotIds.length;
    this.accessStrategy.updateMetrics(Date.now() - startTime, cacheHitRate > 0.5);
    
    return results;
  }

  // 获取分类景点
  async getSpotsByCategory(category: string): Promise<SpotInfo[]> {
    const cacheKey = `spots:category:${category}`;
    
    // 尝试缓存
    const cached = await this.sharedCache.get<SpotInfo[]>(cacheKey);
    if (cached) {
      return cached;
    }

    // 查询数据库
    const spots = await this.database.query<SpotInfo>(
      'SELECT * FROM spots WHERE category = ? ORDER BY popularity DESC',
      [category]
    );

    // 更新缓存
    await this.sharedCache.set(cacheKey, spots, { ttl: 3600, tags: ['spots', category] });
    
    return spots;
  }

  // 预加载景点数据
  private async preloadSpotData(spotId: string): Promise<void> {
    // 异步预加载，不阻塞主流程
    setTimeout(async () => {
      await this.getSpotInfo(spotId);
      
      // 预加载相关景点
      const spot = await this.sharedCache.get<SpotInfo>(`spot:${spotId}`);
      if (spot) {
        const relatedSpots = await this.getSpotsByCategory(spot.category);
        // 预加载前3个相关景点
        const relatedIds = relatedSpots.slice(0, 3).map(s => s.id);
        await this.getBatchSpotInfo(relatedIds);
      }
    }, 0);
  }

  // 预加载分类数据
  private async preloadCategoryData(category: string): Promise<void> {
    setTimeout(async () => {
      await this.getSpotsByCategory(category);
    }, 0);
  }

  // 预加载相关数据
  private async preloadRelatedData(dataType: string): Promise<void> {
    if (dataType === 'spots' && this.currentUserContext?.currentCategory) {
      await this.preloadCategoryData(this.currentUserContext.currentCategory);
    }
  }

  // 获取性能指标
  getPerformanceMetrics(): QueryMetrics & { cacheHitRate: number } {
    return {
      ...this.accessStrategy.getMetrics(),
      cacheHitRate: this.accessStrategy.getCacheHitRate()
    };
  }

  // 清理缓存
  async clearCache(pattern?: string): Promise<void> {
    if (pattern) {
      const keys = await this.sharedCache.keys(pattern);
      for (const key of keys) {
        await this.sharedCache.del(key);
      }
    }
  }
}

// 全局实例
export const agentB_Enhanced = new AgentB_Enhanced();