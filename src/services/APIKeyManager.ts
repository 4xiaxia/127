// API多Key管理系统 - 军工品质，极简高效
// 遵循剃刀原则，专注核心功能

export interface APIKey {
  id: string;
  name: string;
  key: string;
  provider: 'minimax' | 'gemini' | 'openai' | 'custom';
  status: 'active' | 'inactive' | 'exhausted';
  quota: {
    daily: number;
    used: number;
    remaining: number;
  };
  rate_limit: {
    requests_per_minute: number;
    requests_per_hour: number;
  };
  cost: {
    per_request: number;
    currency: 'CNY';
  };
  last_used: string;
  created_at: string;
}

export interface APIUsageStats {
  total_requests: number;
  total_cost: number;
  success_rate: number;
  average_response_time: number;
  provider_breakdown: {
    [provider: string]: {
      requests: number;
      cost: number;
      success_rate: number;
    };
  };
}

class APIKeyManager {
  private keys: APIKey[] = [];
  private currentKeyIndex: number = 0;
  private usageStats: APIUsageStats;

  constructor() {
    this.usageStats = {
      total_requests: 0,
      total_cost: 0,
      success_rate: 0,
      average_response_time: 0,
      provider_breakdown: {}
    };
    this.initializeKeys();
  }

  // 初始化API密钥 - 硬编码演示版
  private initializeKeys(): void {
    this.keys = [
      {
        id: 'minimax_primary',
        name: 'MiniMax主密钥',
        key: 'sk-xxxxxxxxxxxxxxxx',
        provider: 'minimax',
        status: 'active',
        quota: {
          daily: 1000,
          used: 156,
          remaining: 844
        },
        rate_limit: {
          requests_per_minute: 60,
          requests_per_hour: 1000
        },
        cost: {
          per_request: 0.01,
          currency: 'CNY'
        },
        last_used: new Date().toISOString(),
        created_at: '2024-01-01T00:00:00Z'
      },
      {
        id: 'gemini_primary',
        name: 'Gemini主密钥',
        key: 'AIzaSyxxxxxxxxxxxxxxxx',
        provider: 'gemini',
        status: 'active',
        quota: {
          daily: 500,
          used: 89,
          remaining: 411
        },
        rate_limit: {
          requests_per_minute: 30,
          requests_per_hour: 500
        },
        cost: {
          per_request: 0.02,
          currency: 'CNY'
        },
        last_used: new Date(Date.now() - 300000).toISOString(),
        created_at: '2024-01-01T00:00:00Z'
      },
      {
        id: 'openai_backup',
        name: 'OpenAI备用密钥',
        key: 'sk-xxxxxxxxxxxxxxxx',
        provider: 'openai',
        status: 'inactive',
        quota: {
          daily: 200,
          used: 0,
          remaining: 200
        },
        rate_limit: {
          requests_per_minute: 20,
          requests_per_hour: 200
        },
        cost: {
          per_request: 0.05,
          currency: 'CNY'
        },
        last_used: new Date(Date.now() - 3600000).toISOString(),
        created_at: '2024-01-01T00:00:00Z'
      }
    ];
  }

  // 获取最佳API密钥 - 智能选择策略
  public getOptimalKey(provider?: string): APIKey | null {
    const availableKeys = this.keys.filter(key => {
      if (provider && key.provider !== provider) return false;
      return key.status === 'active' && key.quota.remaining > 0;
    });

    if (availableKeys.length === 0) return null;

    // 优先级：剩余配额 > 成本 > 最后使用时间
    availableKeys.sort((a, b) => {
      const scoreA = this.calculateKeyScore(a);
      const scoreB = this.calculateKeyScore(b);
      return scoreB - scoreA;
    });

    return availableKeys[0];
  }

  // 计算密钥评分 - 极简算法
  private calculateKeyScore(key: APIKey): number {
    const quotaScore = (key.quota.remaining / key.quota.daily) * 100;
    const costScore = (0.05 - key.cost.per_request) / 0.05 * 50; // 成本越低分数越高
    const timeScore = Date.now() - new Date(key.last_used).getTime() > 60000 ? 10 : 0; // 1分钟未使用加分
    return quotaScore + costScore + timeScore;
  }

  // 记录API调用 - 精准统计
  public recordUsage(keyId: string, success: boolean, responseTime: number): void {
    const key = this.keys.find(k => k.id === keyId);
    if (!key) return;

    // 更新密钥使用情况
    key.quota.used++;
    key.quota.remaining = key.quota.daily - key.quota.used;
    key.last_used = new Date().toISOString();

    // 检查配额耗尽
    if (key.quota.remaining <= 0) {
      key.status = 'exhausted';
    }

    // 更新全局统计
    this.usageStats.total_requests++;
    this.usageStats.total_cost += key.cost.per_request;
    this.usageStats.average_response_time = 
      (this.usageStats.average_response_time * (this.usageStats.total_requests - 1) + responseTime) / 
      this.usageStats.total_requests;

    // 更新提供商统计
    if (!this.usageStats.provider_breakdown[key.provider]) {
      this.usageStats.provider_breakdown[key.provider] = {
        requests: 0,
        cost: 0,
        success_rate: 0
      };
    }

    const providerStats = this.usageStats.provider_breakdown[key.provider];
    providerStats.requests++;
    providerStats.cost += key.cost.per_request;
    
    const totalProviderRequests = this.keys
      .filter(k => k.provider === key.provider)
      .reduce((sum, k) => sum + k.quota.used, 0);
    
    providerStats.success_rate = success ? 
      (providerStats.success_rate * (totalProviderRequests - 1) + 1) / totalProviderRequests :
      (providerStats.success_rate * (totalProviderRequests - 1)) / totalProviderRequests;

    this.usageStats.success_rate = success ?
      (this.usageStats.success_rate * (this.usageStats.total_requests - 1) + 1) / this.usageStats.total_requests :
      (this.usageStats.success_rate * (this.usageStats.total_requests - 1)) / this.usageStats.total_requests;
  }

  // 获取所有密钥状态
  public getAllKeys(): APIKey[] {
    return [...this.keys];
  }

  // 获取使用统计
  public getUsageStats(): APIUsageStats {
    return { ...this.usageStats };
  }

  // 切换密钥状态
  public toggleKeyStatus(keyId: string): boolean {
    const key = this.keys.find(k => k.id === keyId);
    if (!key) return false;

    if (key.status === 'exhausted') {
      // 重置配额（演示用）
      key.quota.used = 0;
      key.quota.remaining = key.quota.daily;
      key.status = 'active';
    } else {
      key.status = key.status === 'active' ? 'inactive' : 'active';
    }

    return true;
  }

  // 重置密钥配额 - 管理功能
  public resetKeyQuota(keyId: string): boolean {
    const key = this.keys.find(k => k.id === keyId);
    if (!key) return false;

    key.quota.used = 0;
    key.quota.remaining = key.quota.daily;
    key.status = 'active';
    return true;
  }

  // 获取成本分析
  public getCostAnalysis(): {
    total_cost: number;
    cost_by_provider: { [provider: string]: number };
    projected_monthly_cost: number;
  } {
    const costByProvider: { [provider: string]: number } = {};
    let totalCost = 0;

    this.keys.forEach(key => {
      if (!costByProvider[key.provider]) {
        costByProvider[key.provider] = 0;
      }
      costByProvider[key.provider] += key.quota.used * key.cost.per_request;
      totalCost += key.quota.used * key.cost.per_request;
    });

    // 按日使用量预测月成本
    const projectedMonthlyCost = totalCost * 30;

    return {
      total_cost: totalCost,
      cost_by_provider: costByProvider,
      projected_monthly_cost: projectedMonthlyCost
    };
  }
}

// 全局单例实例 - 军工级统一管理
const apiKeyManager = new APIKeyManager();

export default apiKeyManager;
