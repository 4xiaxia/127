
// Configuration constants
// Extracted for clarity and easier environment management

export const AI_CONFIG = {
  WEBHOOK_URL: 'https://api.day.app/p2CPtgzAMNGQCqQYEz86AV', // Bark notification endpoint
  
  SILICON_FLOW: {
    BASE_URL: 'https://api.siliconflow.cn/v1',
    API_KEY: process.env.SILICON_FLOW_API_KEY || 'sk-xwmofaucrbykmzwwtbdwannjoxzxhssbwcfeafxykkdoouwe',
    MODELS: {
      // Updated to Qwen3-8B for better compatibility
      TEXT: 'Qwen/Qwen2.5-7B-Instruct', 
      REASONING: 'Qwen/Qwen3-8B',
      IMAGE: 'Kwai-Kolors/Kolors',
    }
  },
  ZHIPU: {
    BASE_URL: 'https://api.zhipuai.cn/api/paas/v4',
    API_KEY: process.env.ZHIPU_API_KEY || 'bc262191017642bead0ec8942a8e3483.eVAChDpn8uJtyhat',
    MODELS: {
      // Free and fast models
      TEXT: 'GLM-4-Flash',
      VISION: 'GLM-4V-Flash' // Supports image understanding
    }
  },
  MINIMAX: {
    BASE_URL: 'https://api.minimax.chat/v1',
    // Fallback to hardcoded values if process.env injection fails
    API_KEY: process.env.MINIMAX_API_KEY || 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJHcm91cE5hbWUiOiJscyBsbGx5eXlzc3MiLCJVc2VyTmFtZSI6ImxzIGxsbHl5eXNzcyIsIkFjY291bnQiOiIiLCJTdWJqZWN0SUQiOiIxOTE4Nzk2Mjk4NDAwNTY3NDkyIiwiUGhvbmUiOiIiLCJHcm91cElEIjoiMTkxODc5NjI5ODM5NjM3MzE4OCIsIlBhZ2VOYW1lIjoiIiwiTWFpbCI6ImxsbC55eXkuc3NzLjc3QGdtYWlsLmNvbSIsIkNyZWF0ZVRpbWUiOiIyMDI1LTExLTIwIDE1OjUxOjQwIiwiVG9rZW5UeXBlIjoxLCJpc3MiOiJtaW5pbWF4In0.Nvc6I_x53hQk_OSankcxU1uyb2Cek9-EhZoNO44mS1wsyiR2TNiof8FA9JmELCEBjnkomCCho1cxseEb098hAebTNklqRL5PlVl4rxaj4spAZt-1oloxojSSU3g-NoiurR-4dPcSMp43KOp0mc3Ci_piLylbxOG9H2WT3iN4Eaaj_558q7DgsbmpwLmpf3vOiy_j_qBEF5QztVN4gF8xhPasjXWAmT_hox7fmjTubn4PcQMbaAHKVBj95uP8l4VwbrjRpLaajyMIKHGoTS_0JAhmBH2psw49I2CouBNLggZGsOQS9XLepjX7euCtrMPJC7V0kPsUGJuxddLnYLrzJw', 
    GROUP_ID: process.env.MINIMAX_GROUP_ID || '1918796298396373188', 
    MODELS: {
      TEXT: 'abab6.5s-chat',
      AUDIO: 'speech-01-turbo'
    }
  }
};

export const AMAP_CONFIG = {
  MCP_URL: 'https://mcp.api-inference.modelscope.net/d19a443b23994d/mcp'
};

// Admin后台API配置
export const ADMIN_API_CONFIG = {
  // 内容提交API
  SUBMIT_CONTENT: '/api/admin/content/submit',
  
  // 草稿管理API
  DRAFTS: {
    GET_ALL: '/api/admin/drafts',
    SAVE: '/api/admin/drafts/save',
    DELETE: '/api/admin/drafts/delete',
    PUBLISH: '/api/admin/drafts/publish'
  },
  
  // 用户管理API
  USERS: {
    GET_LIST: '/api/admin/users',
    UPDATE_STATUS: '/api/admin/users/update',
    GET_STATS: '/api/admin/users/stats'
  },
  
  // 数据统计API
  ANALYTICS: {
    GET_DASHBOARD: '/api/admin/analytics/dashboard',
    GET_CONTENT_STATS: '/api/admin/analytics/content',
    GET_USER_BEHAVIOR: '/api/admin/analytics/behavior'
  },
  
  // 系统配置API
  SYSTEM: {
    GET_CONFIG: '/api/admin/system/config',
    UPDATE_CONFIG: '/api/admin/system/update',
    GET_STATUS: '/api/admin/system/status'
  },
  
  // 文件上传API
  UPLOAD: {
    IMAGE: '/api/admin/upload/image',
    BATCH: '/api/admin/upload/batch'
  },
  
  // 内容审核API
  MODERATION: {
    GET_PENDING: '/api/admin/moderation/pending',
    APPROVE: '/api/admin/moderation/approve',
    REJECT: '/api/admin/moderation/reject',
    REPORT: '/api/admin/moderation/report'
  }
};

// API请求配置
export const API_REQUEST_CONFIG = {
  TIMEOUT: 10000,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000,
  BASE_URL: process.env.ADMIN_API_URL || 'http://localhost:3001'
};

// 数据库配置
export const DB_CONFIG = {
  COLLECTIONS: {
    SUBMISSIONS: 'submissions',
    DRAFTS: 'drafts', 
    USERS: 'users',
    ANALYTICS: 'analytics',
    MODERATION: 'moderation_queue',
    SYSTEM_CONFIG: 'system_config'
  },
  
  INDEXES: {
    SUBMISSIONS_BY_TYPE: 'type_1',
    DRAFTS_BY_USER: 'user_id_1',
    USERS_BY_STATUS: 'status_1',
    ANALYTICS_BY_DATE: 'date_1'
  }
};
