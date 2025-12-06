// 缓存通知服务 - 知识库更新时通知相关缓存和前台
// 军工品质，极简高效

import React from 'react';
import { sharedCache } from './highPerformanceDataAccess';
import { agentCoordinator } from './AgentCoordinationManager';

// 缓存更新操作类型
export enum CacheUpdateType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  BATCH_UPDATE = 'batch_update',
  BATCH_DELETE = 'batch_delete'
}

// 缓存更新通知接口
export interface CacheUpdateNotification {
  type: CacheUpdateType;
  knowledgeIds: string[];
  content?: any;
  timestamp: number;
  source: 'admin' | 'system' | 'api';
}

// 前台通知回调类型
export type FrontendNotificationCallback = (notification: CacheUpdateNotification) => void;

class CacheNotificationService {
  private static instance: CacheNotificationService;
  private frontendCallbacks: Set<FrontendNotificationCallback> = new Set();
  private notificationQueue: CacheUpdateNotification[] = [];
  private isProcessing = false;

  static getInstance(): CacheNotificationService {
    if (!CacheNotificationService.instance) {
      CacheNotificationService.instance = new CacheNotificationService();
    }
    return CacheNotificationService.instance;
  }

  // 注册前台通知回调
  registerFrontendCallback(callback: FrontendNotificationCallback): () => void {
    this.frontendCallbacks.add(callback);
    
    // 返回取消注册函数
    return () => {
      this.frontendCallbacks.delete(callback);
    };
  }

  // 通知缓存更新（Admin知识库更新时调用）
  async notifyCacheUpdate(notification: CacheUpdateNotification): Promise<void> {
    try {
      console.log('🔄 缓存更新通知:', notification);
      
      // 1. 立即更新相关缓存
      await this.updateRelatedCaches(notification);
      
      // 2. 通知所有前台组件
      await this.notifyFrontend(notification);
      
      // 3. 记录更新日志
      this.logUpdate(notification);
      
    } catch (error) {
      console.error('缓存更新通知失败:', error);
    }
  }

  // 更新相关缓存
  private async updateRelatedCaches(notification: CacheUpdateNotification): Promise<void> {
    const { type, knowledgeIds, content } = notification;
    
    switch (type) {
      case CacheUpdateType.CREATE:
      case CacheUpdateType.UPDATE:
        // 新增或更新：清理相关缓存，强制重新加载
        await this.clearRelatedCache(knowledgeIds);
        if (content) {
          await this.preloadNewContent(content);
        }
        break;
        
      case CacheUpdateType.DELETE:
        // 删除：直接清理相关缓存
        await this.clearRelatedCache(knowledgeIds);
        break;
        
      case CacheUpdateType.BATCH_UPDATE:
        // 批量更新：清理所有相关缓存，重新预加载
        await this.clearAllRelatedCache();
        if (Array.isArray(content)) {
          await this.preloadBatchContent(content);
        }
        break;
        
      case CacheUpdateType.BATCH_DELETE:
        // 批量删除：清理所有相关缓存
        await this.clearAllRelatedCache();
        break;
    }
  }

  // 清理相关缓存
  private async clearRelatedCache(knowledgeIds: string[]): Promise<void> {
    try {
      // 1. 清理精确匹配的缓存
      for (const id of knowledgeIds) {
        const exactKey = `knowledge:${id}`;
        // 使用内存清理方式（假设sharedCache有清理方法）
        if ((sharedCache as any).delete) {
          await (sharedCache as any).delete(exactKey);
        }
      }
      
      // 2. 清理相似度匹配缓存（因为可能影响相似度计算）
      const similarityKeys = await this.getSimilarityCacheKeys();
      for (const key of similarityKeys) {
        if ((sharedCache as any).delete) {
          await (sharedCache as any).delete(key);
        }
      }
      
      // 3. 清理热点问题缓存
      const hotKeys = await this.getHotCacheKeys();
      for (const key of hotKeys) {
        if ((sharedCache as any).delete) {
          await (sharedCache as any).delete(key);
        }
      }
      
      console.log(`✅ 已清理 ${knowledgeIds.length} 个知识项的相关缓存`);
      
    } catch (error) {
      console.error('清理相关缓存失败:', error);
    }
  }

  // 清理所有相关缓存
  private async clearAllRelatedCache(): Promise<void> {
    try {
      // 1. 清理所有知识相关缓存
      const allKeys = await this.getAllKnowledgeCacheKeys();
      for (const key of allKeys) {
        if ((sharedCache as any).delete) {
          await (sharedCache as any).delete(key);
        }
      }
      
      // 2. 通知Agent统筹管理器清理内部缓存
      await agentCoordinator.clearCache();
      
      console.log('✅ 已清理所有知识相关缓存');
      
    } catch (error) {
      console.error('清理所有缓存失败:', error);
    }
  }

  // 预加载新内容
  private async preloadNewContent(content: any): Promise<void> {
    try {
      if (content.question && content.answer) {
        // 预加载到缓存
        const cacheKey = `knowledge:${content.id}`;
        await sharedCache.set(cacheKey, {
          ...content,
          cached: true,
          preloaded: true,
          preloadTime: Date.now()
        }, { ttl: 7200 }); // 2小时
        
        console.log(`✅ 已预加载新内容: ${content.question}`);
      }
    } catch (error) {
      console.error('预加载新内容失败:', error);
    }
  }

  // 批量预加载内容
  private async preloadBatchContent(contents: any[]): Promise<void> {
    try {
      for (const content of contents) {
        if (content.question && content.answer) {
          const cacheKey = `knowledge:${content.id}`;
          await sharedCache.set(cacheKey, {
            ...content,
            cached: true,
            preloaded: true,
            preloadTime: Date.now()
          }, { ttl: 7200 });
        }
      }
      
      console.log(`✅ 已批量预加载 ${contents.length} 个内容`);
      
    } catch (error) {
      console.error('批量预加载失败:', error);
    }
  }

  // 通知前台组件
  private async notifyFrontend(notification: CacheUpdateNotification): Promise<void> {
    // 添加到通知队列
    this.notificationQueue.push(notification);
    
    // 异步处理通知队列
    if (!this.isProcessing) {
      this.processNotificationQueue();
    }
  }

  // 处理通知队列
  private async processNotificationQueue(): Promise<void> {
    if (this.isProcessing || this.notificationQueue.length === 0) {
      return;
    }
    
    this.isProcessing = true;
    
    try {
      while (this.notificationQueue.length > 0) {
        const notification = this.notificationQueue.shift()!;
        
        // 通知所有注册的回调
        for (const callback of this.frontendCallbacks) {
          try {
            await callback(notification);
          } catch (error) {
            console.error('前台通知回调执行失败:', error);
          }
        }
        
        // 防止阻塞，添加小延迟
        await new Promise(resolve => setTimeout(resolve, 10));
      }
    } finally {
      this.isProcessing = false;
      
      // 如果队列中还有新通知，继续处理
      if (this.notificationQueue.length > 0) {
        setTimeout(() => this.processNotificationQueue(), 100);
      }
    }
  }

  // 获取所有知识缓存键
  private async getAllKnowledgeCacheKeys(): Promise<string[]> {
    // 这里需要根据实际的缓存系统实现
    // 假设sharedCache有获取所有键的方法
    const allKeys = ['query:*', 'hot:*', 'similarity:*']; // 示例
    return allKeys;
  }

  // 获取相似度缓存键
  private async getSimilarityCacheKeys(): Promise<string[]> {
    return ['similarity:*']; // 示例
  }

  // 获取热点缓存键
  private async getHotCacheKeys(): Promise<string[]> {
    return ['hot:*']; // 示例
  }

  // 记录更新日志
  private logUpdate(notification: CacheUpdateNotification): void {
    const logEntry = {
      timestamp: notification.timestamp,
      type: notification.type,
      knowledgeIds: notification.knowledgeIds,
      source: notification.source,
      summary: this.generateUpdateSummary(notification)
    };
    
    console.log('📝 缓存更新日志:', logEntry);
    
    // 实际项目中这里应该发送到日志系统
    // this.sendToLogSystem(logEntry);
  }

  // 生成更新摘要
  private generateUpdateSummary(notification: CacheUpdateNotification): string {
    const { type, knowledgeIds } = notification;
    const count = knowledgeIds.length;
    
    switch (type) {
      case CacheUpdateType.CREATE:
        return `新增 ${count} 个知识项`;
      case CacheUpdateType.UPDATE:
        return `更新 ${count} 个知识项`;
      case CacheUpdateType.DELETE:
        return `删除 ${count} 个知识项`;
      case CacheUpdateType.BATCH_UPDATE:
        return `批量更新 ${count} 个知识项`;
      case CacheUpdateType.BATCH_DELETE:
        return `批量删除 ${count} 个知识项`;
      default:
        return `未知操作 ${count} 个知识项`;
    }
  }

  // 获取缓存统计信息
  async getCacheStats(): Promise<{
    totalKnowledgeCache: number;
    similarityCache: number;
    hotCache: number;
    lastUpdateTime: number;
  }> {
    try {
      const allKeys = await this.getAllKnowledgeCacheKeys();
      const similarityKeys = await this.getSimilarityCacheKeys();
      const hotKeys = await this.getHotCacheKeys();
      
      return {
        totalKnowledgeCache: allKeys.length,
        similarityCache: similarityKeys.length,
        hotCache: hotKeys.length,
        lastUpdateTime: Date.now()
      };
    } catch (error) {
      console.error('获取缓存统计失败:', error);
      return {
        totalKnowledgeCache: 0,
        similarityCache: 0,
        hotCache: 0,
        lastUpdateTime: 0
      };
    }
  }
}

// 导出单例
export const cacheNotificationService = CacheNotificationService.getInstance();

// 导出便捷函数
export const notifyKnowledgeUpdate = async (
  type: CacheUpdateType,
  knowledgeIds: string[],
  content?: any,
  source: 'admin' | 'system' | 'api' = 'admin'
): Promise<void> => {
  const notification: CacheUpdateNotification = {
    type,
    knowledgeIds,
    content,
    timestamp: Date.now(),
    source
  };
  
  await cacheNotificationService.notifyCacheUpdate(notification);
};

// React Hook for frontend components
export const useCacheNotification = (callback: FrontendNotificationCallback) => {
  React.useEffect(() => {
    // 注册通知回调
    const unsubscribe = cacheNotificationService.registerFrontendCallback(callback);
    
    // 组件卸载时取消注册
    return unsubscribe;
  }, [callback]);
};
