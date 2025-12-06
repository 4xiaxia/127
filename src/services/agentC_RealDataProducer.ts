// Agent C - 数据生产者 (基于真实数据)
import { 
  SharedDataCache, 
  DatabaseConnection, 
  SpotInfo, 
  StructuredSpotData,
  SearchIndex
} from './highPerformanceDataAccess';

// 真实数据类型定义
export interface RealSpotData {
  id: string;
  name: string;
  local_name: string;
  type: string;
  images: string[];
  map_image?: string;
  intro: string;
  story: string;
  audio_url?: string;
  can_bookmark: boolean;
  location: string;
}

export interface RealRedCultureData {
  id: string;
  name: string;
  local_name: string;
  type: string;
  images: string[];
  map_image?: string;
  intro: string;
  story: string;
  audio_url?: string;
  can_bookmark: boolean;
  location: string;
}

export interface VillageFigure {
  id: string;
  name: string;
  birth_death: string;
  images: string[];
  title: string;
  deed: string;
  related_spot: string[];
}

// 数据加载器
export class RealDataLoader {
  // 加载景点数据
  static async loadScenicSpots(): Promise<RealSpotData[]> {
    try {
      const response = await fetch('/data/scenic_spots.json');
      const data = await response.json();
      return data.spots || [];
    } catch (error) {
      console.error('Failed to load scenic spots:', error);
      return [];
    }
  }

  // 加载红色文化数据
  static async loadRedCulture(): Promise<RealRedCultureData[]> {
    try {
      const response = await fetch('/data/red_culture.json');
      const data = await response.json();
      return data.spots || [];
    } catch (error) {
      console.error('Failed to load red culture data:', error);
      return [];
    }
  }

  // 加载村镇人物数据
  static async loadVillageFigures(): Promise<VillageFigure[]> {
    try {
      const response = await fetch('/data/village_figures.json');
      const data = await response.json();
      const allFigures: VillageFigure[] = [];
      
      // 合并所有分类的人物
      data.classifications?.forEach((classification: any) => {
        if (classification.figures) {
          allFigures.push(...classification.figures);
        }
      });
      
      return allFigures;
    } catch (error) {
      console.error('Failed to load village figures:', error);
      return [];
    }
  }

  // 加载事件公告数据
  static async loadEventAnnouncements(): Promise<any[]> {
    try {
      const response = await fetch('/data/event_announcements.json');
      const data = await response.json();
      return data.events || [];
    } catch (error) {
      console.error('Failed to load event announcements:', error);
      return [];
    }
  }

  // 加载自媒体数据
  static async loadSelfMedia(): Promise<any[]> {
    try {
      const response = await fetch('/data/self_media.json');
      const data = await response.json();
      return data.articles || [];
    } catch (error) {
      console.error('Failed to load self media data:', error);
      return [];
    }
  }
}

// 数据转换器
export class DataTransformer {
  // 将真实数据转换为标准SpotInfo格式
  static transformToSpotInfo(realData: RealSpotData | RealRedCultureData, category: string): SpotInfo {
    return {
      id: realData.id,
      name: realData.name,
      category: category,
      description: realData.intro,
      location: this.parseLocation(realData.location),
      images: realData.images,
      audio: realData.audio_url,
      tags: this.extractTags(realData),
      popularity: this.calculatePopularity(realData)
    };
  }

  // 解析位置信息
  private static parseLocation(locationStr: string): { lat: number; lng: number } {
    // 东里村的大致坐标范围
    const baseCoords = { lat: 25.123, lng: 118.456 };
    
    // 根据位置描述生成相对坐标
    const locationMap: Record<string, { lat: number; lng: number }> = {
      '仙灵山深处': { lat: 25.130, lng: 118.460 },
      '豆磨山顶': { lat: 25.125, lng: 118.465 },
      '南部农业示范区': { lat: 25.115, lng: 118.450 },
      '西北部池头区域': { lat: 25.128, lng: 118.445 },
      '中部溪流之上': { lat: 25.123, lng: 118.456 },
      '西北水口处': { lat: 25.130, lng: 118.440 },
      '后门坑生态农场内': { lat: 25.135, lng: 118.470 },
      '北部山区': { lat: 25.140, lng: 118.465 }
    };

    // 查找匹配的位置
    for (const [key, coords] of Object.entries(locationMap)) {
      if (locationStr.includes(key)) {
        return coords;
      }
    }

    // 默认返回基础坐标
    return baseCoords;
  }

  // 提取标签
  private static extractTags(data: RealSpotData | RealRedCultureData): string[] {
    const tags: string[] = [];
    
    // 根据类型添加标签
    switch (data.type) {
      case 'natural':
        tags.push('自然景观', '生态');
        break;
      case 'natural_historic':
        tags.push('自然景观', '历史文化');
        break;
      case 'agricultural':
        tags.push('农业体验', '科普教育');
        break;
      case 'folk':
        tags.push('民俗文化', '传统建筑');
        break;
      case 'historic':
        tags.push('历史文化', '古建筑');
        break;
      case 'folk_religious':
        tags.push('民俗文化', '宗教文化');
        break;
      case 'leisure':
        tags.push('休闲娱乐', '户外活动');
        break;
      case 'red_culture':
        tags.push('红色文化', '爱国教育');
        break;
    }

    // 从名称和描述中提取关键词
    const text = `${data.name} ${data.intro}`.toLowerCase();
    const keywords = ['瀑布', '古寨', '农业', '民居', '廊桥', '宫庙', '露营', '水库', '纪念馆', '革命'];
    
    keywords.forEach(keyword => {
      if (text.includes(keyword)) {
        tags.push(keyword);
      }
    });

    return [...new Set(tags)]; // 去重
  }

  // 计算热度
  private static calculatePopularity(data: RealSpotData | RealRedCultureData): number {
    let popularity = 50; // 基础分数

    // 根据类型调整
    if (data.type === 'red_culture') popularity += 20;
    if (data.type === 'natural') popularity += 15;
    if (data.type === 'historic') popularity += 10;

    // 根据是否有音频调整
    if (data.audio_url) popularity += 10;

    // 根据图片数量调整
    popularity += data.images.length * 5;

    // 根据描述长度调整
    if (data.intro.length > 100) popularity += 5;
    if (data.story.length > 200) popularity += 5;

    return Math.min(popularity, 100); // 最高100分
  }
}

// 增强的Agent C - 真实数据生产者
export class AgentC_RealDataProducer {
  private sharedCache: SharedDataCache;
  private refreshInterval: NodeJS.Timeout | null = null;
  private lastDataUpdate: number = 0;

  constructor(sharedCache: SharedDataCache) {
    this.sharedCache = sharedCache;
    this.setupDataProduction();
  }

  // 启动数据生产
  private setupDataProduction(): void {
    // 立即执行一次数据加载
    this.refreshAllRealData();
    
    // 定期刷新 (30分钟，因为是静态数据)
    this.refreshInterval = setInterval(() => {
      this.refreshAllRealData();
    }, 30 * 60 * 1000);

    console.log('Agent C (Real Data Producer) started');
  }

  // 刷新所有真实数据
  private async refreshAllRealData(): Promise<void> {
    try {
      const startTime = Date.now();
      
      await Promise.all([
        this.loadAndCacheScenicSpots(),
        this.loadAndCacheRedCulture(),
        this.loadAndCacheVillageFigures(),
        this.loadAndCacheEvents(),
        this.loadAndCacheSelfMedia(),
        this.buildCombinedSearchIndex()
      ]);

      this.lastDataUpdate = Date.now();
      const duration = Date.now() - startTime;
      
      console.log(`Real data refresh completed in ${duration}ms at`, new Date().toISOString());
      
      // 通知数据更新
      await this.sharedCache.publish('data:updated', {
        type: 'all_real_data',
        timestamp: this.lastDataUpdate,
        duration
      });
      
    } catch (error) {
      console.error('Real data refresh failed:', error);
    }
  }

  // 加载并缓存景点数据
  private async loadAndCacheScenicSpots(): Promise<void> {
    const scenicSpots = await RealDataLoader.loadScenicSpots();
    const transformedSpots = scenicSpots.map(spot => 
      DataTransformer.transformToSpotInfo(spot, '风景景点')
    );

    // 缓存原始数据
    await this.sharedCache.set('scenic_spots:raw', scenicSpots, { ttl: 3600 });
    
    // 缓存转换后的数据
    await this.sharedCache.set('scenic_spots:transformed', transformedSpots, { ttl: 3600 });
    
    // 按类型分组缓存
    const groupedByType = this.groupByType(scenicSpots);
    await this.sharedCache.set('scenic_spots:by_type', groupedByType, { ttl: 3600 });

    // 单个景点缓存
    for (const spot of transformedSpots) {
      await this.sharedCache.set(`spot:${spot.id}`, spot, { 
        ttl: 3600, 
        tags: ['spots', 'scenic', spot.category] 
      });
    }

    console.log(`Loaded ${scenicSpots.length} scenic spots`);
  }

  // 加载并缓存红色文化数据
  private async loadAndCacheRedCulture(): Promise<void> {
    const redCultureSpots = await RealDataLoader.loadRedCulture();
    const transformedSpots = redCultureSpots.map(spot => 
      DataTransformer.transformToSpotInfo(spot, '红色文化')
    );

    await this.sharedCache.set('red_culture:raw', redCultureSpots, { ttl: 3600 });
    await this.sharedCache.set('red_culture:transformed', transformedSpots, { ttl: 3600 });

    // 单个景点缓存
    for (const spot of transformedSpots) {
      await this.sharedCache.set(`spot:${spot.id}`, spot, { 
        ttl: 3600, 
        tags: ['spots', 'red_culture', spot.category] 
      });
    }

    console.log(`Loaded ${redCultureSpots.length} red culture spots`);
  }

  // 加载并缓存村镇人物数据
  private async loadAndCacheVillageFigures(): Promise<void> {
    const figures = await RealDataLoader.loadVillageFigures();
    
    await this.sharedCache.set('village_figures:all', figures, { ttl: 3600 });
    
    // 按类型分组
    const figuresByType = this.groupFiguresByType(figures);
    await this.sharedCache.set('village_figures:by_type', figuresByType, { ttl: 3600 });

    // 单个人物缓存
    for (const figure of figures) {
      await this.sharedCache.set(`figure:${figure.id}`, figure, { 
        ttl: 3600, 
        tags: ['figures'] 
      });
    }

    console.log(`Loaded ${figures.length} village figures`);
  }

  // 加载并缓存事件数据
  private async loadAndCacheEvents(): Promise<void> {
    const events = await RealDataLoader.loadEventAnnouncements();
    await this.sharedCache.set('events:all', events, { ttl: 1800 }); // 30分钟缓存
    console.log(`Loaded ${events.length} events`);
  }

  // 加载并缓存自媒体数据
  private async loadAndCacheSelfMedia(): Promise<void> {
    const articles = await RealDataLoader.loadSelfMedia();
    await this.sharedCache.set('self_media:all', articles, { ttl: 1800 });
    console.log(`Loaded ${articles.length} self media articles`);
  }

  // 构建综合搜索索引
  private async buildCombinedSearchIndex(): Promise<void> {
    const [scenicSpots, redCultureSpots, figures] = await Promise.all([
      this.sharedCache.get<SpotInfo[]>('scenic_spots:transformed'),
      this.sharedCache.get<SpotInfo[]>('red_culture:transformed'),
      this.sharedCache.get<VillageFigure[]>('village_figures:all')
    ]);

    const allSpots = [...(scenicSpots || []), ...(redCultureSpots || [])];
    const searchIndex = this.buildSearchIndex(allSpots, figures || []);
    
    await this.sharedCache.set('search_index:combined', searchIndex, { ttl: 3600 });
    console.log('Built combined search index');
  }

  // 构建搜索索引
  private buildSearchIndex(spots: SpotInfo[], figures: VillageFigure[]): SearchIndex {
    const keywords = new Map<string, string[]>();
    const fulltext = new Map<string, number>();

    // 索引景点
    for (const spot of spots) {
      const allKeywords = [
        ...spot.tags,
        spot.category,
        ...spot.name.split(''),
        ...spot.description.split('')
      ];

      for (const keyword of allKeywords) {
        if (keyword.trim()) {
          if (!keywords.has(keyword)) {
            keywords.set(keyword, []);
          }
          keywords.get(keyword)!.push(spot.id);
        }
      }

      const text = `${spot.name} ${spot.description} ${spot.tags.join(' ')}`;
      fulltext.set(spot.id, text.length + spot.popularity);
    }

    // 索引人物
    for (const figure of figures) {
      const allKeywords = [
        figure.name,
        figure.title,
        ...figure.deed.split(''),
        ...figure.related_spot
      ];

      for (const keyword of allKeywords) {
        if (keyword.trim()) {
          if (!keywords.has(keyword)) {
            keywords.set(keyword, []);
          }
          keywords.get(keyword)!.push(figure.id);
        }
      }

      const text = `${figure.name} ${figure.title} ${figure.deed}`;
      fulltext.set(figure.id, text.length);
    }

    return { keywords, fulltext };
  }

  // 按类型分组
  private groupByType(spots: RealSpotData[]): Record<string, RealSpotData[]> {
    const groups: Record<string, RealSpotData[]> = {};
    for (const spot of spots) {
      if (!groups[spot.type]) {
        groups[spot.type] = [];
      }
      groups[spot.type].push(spot);
    }
    return groups;
  }

  // 按类型分组人物
  private groupFiguresByType(figures: VillageFigure[]): Record<string, VillageFigure[]> {
    const groups: Record<string, VillageFigure[]> = {};
    
    // 根据ID前缀分组
    for (const figure of figures) {
      let type = 'other';
      if (figure.id.includes('rev')) type = 'revolutionary';
      else if (figure.id.includes('xian')) type = 'scholar';
      
      if (!groups[type]) {
        groups[type] = [];
      }
      groups[type].push(figure);
    }
    
    return groups;
  }

  // 获取数据统计
  async getDataStats(): Promise<any> {
    const [scenicData, redData, figureData] = await Promise.all([
      this.sharedCache.get<any[]>('scenic_spots:transformed'),
      this.sharedCache.get<any[]>('red_culture:transformed'),
      this.sharedCache.get<any[]>('village_figures:all')
    ]);

    const scenicCount = scenicData?.length || 0;
    const redCount = redData?.length || 0;
    const figureCount = figureData?.length || 0;

    return {
      lastUpdate: this.lastDataUpdate,
      counts: {
        scenicSpots: scenicCount,
        redCultureSpots: redCount,
        villageFigures: figureCount
      },
      cacheKeys: await this.sharedCache.keys('*')
    };
  }

  // 停止数据生产
  stop(): void {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
      this.refreshInterval = null;
    }
    console.log('Agent C (Real Data Producer) stopped');
  }
}

// 导出全局实例
// 导出全局实例（稍后在主程序中初始化）
export let agentC_RealDataProducer: AgentC_RealDataProducer | null = null;

// 初始化函数
export function initializeAgentC(sharedCache: SharedDataCache): AgentC_RealDataProducer {
  agentC_RealDataProducer = new AgentC_RealDataProducer(sharedCache);
  return agentC_RealDataProducer;
}