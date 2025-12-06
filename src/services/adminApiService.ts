/**
 * Admin后台API服务
 * 处理AdminSubmissionForm等组件的API调用
 */

import { ADMIN_API_CONFIG, API_REQUEST_CONFIG } from './config';
import { DraftSubmission } from './offlineDb';

// API响应类型定义
interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// 通用API请求函数
async function makeApiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const url = `${API_REQUEST_CONFIG.BASE_URL}${endpoint}`;
  
  const config: RequestInit = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  };

  let lastError: Error;

  // 重试机制
  for (let attempt = 1; attempt <= API_REQUEST_CONFIG.RETRY_ATTEMPTS; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), API_REQUEST_CONFIG.TIMEOUT);

      const response = await fetch(url, {
        ...config,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      return result;

    } catch (error) {
      lastError = error as Error;
      console.warn(`API请求失败 (尝试 ${attempt}/${API_REQUEST_CONFIG.RETRY_ATTEMPTS}):`, error);
      
      if (attempt < API_REQUEST_CONFIG.RETRY_ATTEMPTS) {
        await new Promise(resolve => setTimeout(resolve, API_REQUEST_CONFIG.RETRY_DELAY));
      }
    }
  }

  throw lastError!;
}

// 内容提交API
export const contentApi = {
  // 提交新内容
  submitContent: async (contentData: {
    name: string;
    type: 'red' | 'ecology' | 'folk' | 'food' | 'celebrity';
    desc: string;
    location_desc: string;
    recommender_name: string;
    image?: string;
  }) => {
    return makeApiRequest(ADMIN_API_CONFIG.SUBMIT_CONTENT, {
      method: 'POST',
      body: JSON.stringify(contentData),
    });
  },

  // 更新内容
  updateContent: async (id: string, contentData: any) => {
    return makeApiRequest(`${ADMIN_API_CONFIG.SUBMIT_CONTENT}/${id}`, {
      method: 'PUT',
      body: JSON.stringify(contentData),
    });
  },

  // 删除内容
  deleteContent: async (id: string) => {
    return makeApiRequest(`${ADMIN_API_CONFIG.SUBMIT_CONTENT}/${id}`, {
      method: 'DELETE',
    });
  },
};

// 草稿管理API
export const draftsApi = {
  // 获取所有草稿
  getAllDrafts: async (params?: PaginationParams) => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params?.sortOrder) queryParams.append('sortOrder', params.sortOrder);

    const url = `${ADMIN_API_CONFIG.DRAFTS.GET_ALL}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return makeApiRequest<DraftSubmission[]>(url);
  },

  // 保存草稿
  saveDraft: async (draft: DraftSubmission) => {
    return makeApiRequest(ADMIN_API_CONFIG.DRAFTS.SAVE, {
      method: 'POST',
      body: JSON.stringify(draft),
    });
  },

  // 更新草稿
  updateDraft: async (id: string, draft: Partial<DraftSubmission>) => {
    return makeApiRequest(`${ADMIN_API_CONFIG.DRAFTS.SAVE}/${id}`, {
      method: 'PUT',
      body: JSON.stringify(draft),
    });
  },

  // 删除草稿
  deleteDraft: async (id: string) => {
    return makeApiRequest(`${ADMIN_API_CONFIG.DRAFTS.DELETE}/${id}`, {
      method: 'DELETE',
    });
  },

  // 发布草稿
  publishDraft: async (id: string) => {
    return makeApiRequest(`${ADMIN_API_CONFIG.DRAFTS.PUBLISH}/${id}`, {
      method: 'POST',
    });
  },
};

// 用户管理API
export const usersApi = {
  // 获取用户列表
  getUsers: async (params?: PaginationParams & { status?: string }) => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.status) queryParams.append('status', params.status);
    if (params?.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params?.sortOrder) queryParams.append('sortOrder', params.sortOrder);

    const url = `${ADMIN_API_CONFIG.USERS.GET_LIST}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return makeApiRequest(url);
  },

  // 更新用户状态
  updateUserStatus: async (userId: string, status: string, reason?: string) => {
    return makeApiRequest(ADMIN_API_CONFIG.USERS.UPDATE_STATUS, {
      method: 'PUT',
      body: JSON.stringify({ userId, status, reason }),
    });
  },

  // 获取用户统计
  getUserStats: async (timeRange?: '7d' | '30d' | '90d') => {
    const queryParams = timeRange ? `?timeRange=${timeRange}` : '';
    return makeApiRequest(`${ADMIN_API_CONFIG.USERS.GET_STATS}${queryParams}`);
  },
};

// 数据统计API
export const analyticsApi = {
  // 获取仪表板数据
  getDashboard: async () => {
    return makeApiRequest(ADMIN_API_CONFIG.ANALYTICS.GET_DASHBOARD);
  },

  // 获取内容统计
  getContentStats: async (params?: {
    startDate?: string;
    endDate?: string;
    contentType?: string;
  }) => {
    const queryParams = new URLSearchParams();
    if (params?.startDate) queryParams.append('startDate', params.startDate);
    if (params?.endDate) queryParams.append('endDate', params.endDate);
    if (params?.contentType) queryParams.append('contentType', params.contentType);

    const url = `${ADMIN_API_CONFIG.ANALYTICS.GET_CONTENT_STATS}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return makeApiRequest(url);
  },

  // 获取用户行为数据
  getUserBehavior: async (params?: {
    userId?: string;
    startDate?: string;
    endDate?: string;
    eventType?: string;
  }) => {
    const queryParams = new URLSearchParams();
    if (params?.userId) queryParams.append('userId', params.userId);
    if (params?.startDate) queryParams.append('startDate', params.startDate);
    if (params?.endDate) queryParams.append('endDate', params.endDate);
    if (params?.eventType) queryParams.append('eventType', params.eventType);

    const url = `${ADMIN_API_CONFIG.ANALYTICS.GET_USER_BEHAVIOR}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return makeApiRequest(url);
  },
};

// 系统配置API
export const systemApi = {
  // 获取系统配置
  getConfig: async () => {
    return makeApiRequest(ADMIN_API_CONFIG.SYSTEM.GET_CONFIG);
  },

  // 更新系统配置
  updateConfig: async (config: Record<string, any>) => {
    return makeApiRequest(ADMIN_API_CONFIG.SYSTEM.UPDATE_CONFIG, {
      method: 'PUT',
      body: JSON.stringify(config),
    });
  },

  // 获取系统状态
  getStatus: async () => {
    return makeApiRequest(ADMIN_API_CONFIG.SYSTEM.GET_STATUS);
  },
};

// 文件上传API
export const uploadApi = {
  // 上传单个图片
  uploadImage: async (file: File, options?: {
    compress?: boolean;
    maxWidth?: number;
    maxHeight?: number;
    quality?: number;
  }) => {
    const formData = new FormData();
    formData.append('image', file);
    
    if (options) {
      formData.append('options', JSON.stringify(options));
    }

    return makeApiRequest<{ url: string; size: number; dimensions: { width: number; height: number } }>(
      ADMIN_API_CONFIG.UPLOAD.IMAGE,
      {
        method: 'POST',
        headers: {}, // 让浏览器自动设置Content-Type
        body: formData,
      }
    );
  },

  // 批量上传
  uploadBatch: async (files: File[], options?: any) => {
    const formData = new FormData();
    files.forEach((file, index) => {
      formData.append(`files[${index}]`, file);
    });
    
    if (options) {
      formData.append('options', JSON.stringify(options));
    }

    return makeApiRequest<{ results: any[]; errors: any[] }>(
      ADMIN_API_CONFIG.UPLOAD.BATCH,
      {
        method: 'POST',
        headers: {},
        body: formData,
      }
    );
  },
};

// 内容审核API
export const moderationApi = {
  // 获取待审核内容
  getPendingItems: async (params?: PaginationParams) => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());

    const url = `${ADMIN_API_CONFIG.MODERATION.GET_PENDING}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return makeApiRequest(url);
  },

  // 批准内容
  approveItem: async (id: string, reviewerNote?: string) => {
    return makeApiRequest(`${ADMIN_API_CONFIG.MODERATION.APPROVE}/${id}`, {
      method: 'POST',
      body: JSON.stringify({ reviewerNote }),
    });
  },

  // 拒绝内容
  rejectItem: async (id: string, reason: string, reviewerNote?: string) => {
    return makeApiRequest(`${ADMIN_API_CONFIG.MODERATION.REJECT}/${id}`, {
      method: 'POST',
      body: JSON.stringify({ reason, reviewerNote }),
    });
  },

  // 举报内容
  reportItem: async (id: string, reason: string, details?: string) => {
    return makeApiRequest(`${ADMIN_API_CONFIG.MODERATION.REPORT}/${id}`, {
      method: 'POST',
      body: JSON.stringify({ reason, details }),
    });
  },
};

// 错误处理工具
export class ApiError extends Error {
  constructor(
    message: string,
    public status?: number,
    public code?: string,
    public details?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// 网络状态检查
export const networkUtils = {
  // 检查网络连接
  isOnline: () => navigator.onLine,

  // 监听网络状态变化
  onNetworkChange: (callback: (isOnline: boolean) => void) => {
    const handler = () => callback(navigator.onLine);
    window.addEventListener('online', handler);
    window.addEventListener('offline', handler);
    
    return () => {
      window.removeEventListener('online', handler);
      window.removeEventListener('offline', handler);
    };
  },

  // 测试API连接
  testConnection: async () => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      const response = await fetch(`${API_REQUEST_CONFIG.BASE_URL}/api/health`, {
        method: 'GET',
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      return response.ok;
    } catch {
      return false;
    }
  },
};

// 导出所有API服务
export const adminApi = {
  content: contentApi,
  drafts: draftsApi,
  users: usersApi,
  analytics: analyticsApi,
  system: systemApi,
  upload: uploadApi,
  moderation: moderationApi,
  utils: networkUtils,
  error: ApiError,
};
