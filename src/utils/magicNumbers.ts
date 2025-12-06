// 常量定义 - 避免魔法数字

// 时间相关常量（毫秒）
export const TIME_CONSTANTS = {
  ONE_MINUTE_MS: 60 * 1000,
  FIVE_MINUTES_MS: 5 * 60 * 1000,
  TWO_SECONDS_MS: 2000,
  ONE_HOUR_MS: 60 * 60 * 1000,
  ONE_DAY_MS: 24 * 60 * 60 * 1000,
  THIRTY_DAYS: 30,
} as const;

// 音频相关常量
export const AUDIO_CONSTANTS = {
  INT16_MAX: 32768,
  DEFAULT_AUDIO_DURATION: 60,
  DEFAULT_QUALITY: 0.8,
} as const;

// API相关常量
export const API_CONSTANTS = {
  DEFAULT_DAILY_QUOTA: 1000,
  MINUTE_RATE_LIMIT: 60,
  HOUR_RATE_LIMIT: 1000,
  COST_THRESHOLD: 0.05,
} as const;

// 地图坐标常量（示例位置）
export const MAP_CONSTANTS = {
  DEFAULT_LAT: 25.123,
  DEFAULT_LNG: 118.456,
  CONFIDENCE_THRESHOLD: 0.8,
} as const;

// 图像处理常量
export const IMAGE_CONSTANTS = {
  DEFAULT_WIDTH: 400,
  DEFAULT_HEIGHT: 600,
  TARGET_RATIO_DIVISOR: 3,
} as const;