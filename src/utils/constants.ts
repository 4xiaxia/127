
// [MODULE] Global Constants
// Centralized Asset Management to prevent 404s and path errors

export const ASSETS = {
  // Core Avatar: Ensure public/upload/img/A.png exists
  AVATAR_A: '/upload/img/A.png',
  
  // High quality fallback if local image fails - Using a neutral professional avatar icon
  // Changing to a more "friendly" generic avatar to avoid "unwelcoming" feeling if local image breaks
  FALLBACK_AVATAR: 'https://cdn-icons-png.flaticon.com/512/4140/4140048.png',
  
  // Default login background
  DEFAULT_BG: "https://images.unsplash.com/photo-1599839575945-a9e5af0c3fa5?q=80&w=1920&auto=format&fit=crop"
};

// [ADMIN CONFIG] Simulated Backend Configuration Tree
// In a real app, this would be fetched from an API
export const PAGE_HOOKS_CONFIG: Record<string, string[]> = {
    'home': ['推荐路线', '名人故事', '必买特产', '洗手间在哪'],
    'spot_detail': ['背后的故事', '最佳拍照点', '历史传说', '附近美食'],
    'article_celebrity': ['生平事迹', '革命贡献', '家族后代'],
    'specials_feed': ['价格多少', '哪里能买', '快递发货'],
    'map_view': ['最近的厕所', '停车场', '游览车']
};
