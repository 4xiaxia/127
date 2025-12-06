// 基于甲方需求的Agent接口重新定义

export type AgentRole = 'FRONTEND' | 'TOOLS' | 'CONTENT' | 'MONITOR';
export type AgentID = string;

// 基础数据类型定义 - 统一的用户交互类型
export interface UserInteraction {
  id: string;
  sessionId: string;
  timestamp: number;
  type: 'page_view' | 'spot_click' | 'voice_input' | 'chat_message' | 'audio_play' | 'check_in' | 'figure_view' | 'photo_capture' | 'recommendation_click';
  data: {
    page?: string;
    spotId?: string;
    figureId?: string;
    contentId?: string;
    category?: string;
    input?: string;
    action?: string;
    duration?: number;
    [key: string]: any;
  };
  userAgent?: string;
  location?: {
    lat?: number;
    lng?: number;
  };
}

// 统一的系统错误类型
export interface SystemError {
  id: string;
  timestamp: number;
  agent: AgentRole;
  level: 'info' | 'warn' | 'error' | 'fatal';
  message: string;
  stack?: string;
  context?: any;
  sessionId?: string;
}

// 甲方业务相关的数据类型
export interface CheckInBookmark {
  id: string;
  spotId: string;
  spotName: string;
  userId: string;
  timestamp: number;
  qrCode: string; // 唯一二维码
  image: string; // 打卡照片
  status: 'success' | 'pending' | 'failed';
}

export interface VoiceGuide {
  id: string;
  figureId: string; // 名人ID
  content: string; // 导读内容
  audioUrl: string; // 语音文件URL
  duration: number; // 时长(秒)
  language: 'zh-CN';
}

export interface PersonalizedRecommendation {
  type: 'spot' | 'figure' | 'article' | 'route';
  items: any[];
  reason: string; // 推荐理由
  confidence: number; // 推荐置信度
}

export interface UserJourney {
  sessionId: string;
  userId?: string;
  startTime: number;
  currentSpot?: string;
  visitedSpots: string[];
  checkedInSpots: string[];
  listenedGuides: string[];
  interactions: UserInteraction[];
  preferences: UserPreferences;
}



export interface UserPreferences {
  favoriteCategories: string[]; // 偏好分类
  visitDuration: number; // 平均访问时长
  interactionStyle: 'visual' | 'audio' | 'mixed'; // 交互偏好
  interests: string[]; // 兴趣标签
}

// Agent A - 前台交互服务接口
export interface AgentA_FrontendService {
  role: 'FRONTEND';
  
  // 用户界面管理
  ui: {
    navigateToPage(page: string, params?: any): Promise<void>;
    displayContent(content: any): Promise<void>;
    showBookmark(bookmark: CheckInBookmark): Promise<void>;
    playVoiceGuide(guide: VoiceGuide): Promise<void>;
  };
  
  // 高德地图集成
  map: {
    initializeMap(containerId: string): Promise<void>;
    navigateToSpot(spotId: string, coordinates: { lat: number; lng: number }): Promise<void>;
    getCurrentLocation(): Promise<{ lat: number; lng: number }>;
    showSpotMarkers(spots: any[]): Promise<void>;
  };
  
  // 用户输入处理
  input: {
    captureVoiceInput(): Promise<string>; // 返回语音转文字结果
    capturePhotoInput(): Promise<string>; // 返回base64图片
    captureTextInput(text: string): Promise<void>;
  };
  
  // 打卡功能
  checkIn: {
    initiatePhotoCheckIn(spotId: string): Promise<CheckInBookmark>;
    initiateAudioCheckIn(figureId: string): Promise<boolean>; // 听完导读
    generateBookmark(spotId: string, photo: string): Promise<CheckInBookmark>;
  };
  
  // 用户行为监听
  tracking: {
    onPageView(page: string, data?: any): void;
    onSpotView(spotId: string): void;
    onUserAction(action: string, data?: any): void;
    onCheckInComplete(bookmark: CheckInBookmark): void;
  };
  
  // 消息发送
  messaging: {
    sendUserContext(context: UserContextMessage): Promise<void>;
    requestAIResponse(question: string): Promise<void>;
    requestRecommendations(type: string): Promise<void>;
  };
}

// Agent B - 智能工具服务接口
export interface AgentB_IntelligentTools {
  role: 'TOOLS';
  
  // AI对话服务
  ai: {
    processQuestion(question: string, context: UserJourney): Promise<string>;
    generatePersonalizedResponse(question: string, preferences: UserPreferences): Promise<string>;
    analyzeUserIntent(input: string): Promise<{ intent: string; entities: any[] }>;
  };
  
  // 语音处理服务
  voice: {
    speechToText(audioData: string): Promise<string>;
    textToSpeech(text: string, voice?: string): Promise<string>; // 返回音频URL
    generateVoiceGuide(figureId: string, content: string): Promise<VoiceGuide>;
  };
  
  // 图像处理服务
  image: {
    recognizeSpot(imageData: string): Promise<{ spotId: string; confidence: number }>;
    generateQRCode(data: string): Promise<string>;
    createBookmark(spotId: string, photo: string, qrCode: string): Promise<string>; // 返回书签图片URL
  };
  
  // 推荐引擎
  recommendation: {
    recommendSpots(userJourney: UserJourney): Promise<PersonalizedRecommendation>;
    recommendFigures(userJourney: UserJourney): Promise<PersonalizedRecommendation>;
    recommendArticles(userJourney: UserJourney): Promise<PersonalizedRecommendation>;
    recommendRoutes(userJourney: UserJourney): Promise<PersonalizedRecommendation>;
  };
  
  // 外部API调用
  external: {
    callSiliconFlowAPI(prompt: string, model?: string): Promise<string>;
    callMinimaxAPI(text: string, voice?: string): Promise<string>;
    callAmapAPI(action: string, params: any): Promise<any>;
  };
  
  // 消息处理
  messaging: {
    onUserContextUpdate(context: UserContextMessage): Promise<void>;
    processToolRequest(request: ToolRequest): Promise<ToolResponse>;
  };
}

// Agent C - 内容数据服务接口
export interface AgentC_ContentData {
  role: 'CONTENT';
  
  // 静态内容管理
  content: {
    getVillageIntroduction(): Promise<any>;
    getSpotDetails(spotId: string): Promise<any>;
    getFigureProfile(figureId: string): Promise<any>;
    getMediaArticles(category?: string): Promise<any[]>;
    getEventAnnouncements(): Promise<any[]>;
  };
  
  // 数据查询服务
  query: {
    searchSpots(keyword: string, filters?: any): Promise<any[]>;
    searchFigures(keyword: string): Promise<any[]>;
    searchArticles(keyword: string): Promise<any[]>;
    getSpotsByCategory(category: string): Promise<any[]>;
    getFiguresByType(type: string): Promise<any[]>;
  };
  
  // 数据聚合服务
  aggregation: {
    getPopularSpots(limit?: number): Promise<any[]>;
    getRecentArticles(limit?: number): Promise<any[]>;
    getUpcomingEvents(limit?: number): Promise<any[]>;
    getRelatedContent(contentId: string, type: string): Promise<any[]>;
  };
  
  // 缓存管理
  cache: {
    preloadHotData(): Promise<void>;
    refreshDataCache(): Promise<void>;
    invalidateCache(pattern: string): Promise<void>;
    getCacheStats(): Promise<any>;
  };
  
  // 数据源管理
  dataSource: {
    loadScenicSpots(): Promise<any[]>;
    loadRedCulture(): Promise<any[]>;
    loadVillageFigures(): Promise<any[]>;
    loadSelfMedia(): Promise<any[]>;
    loadEventAnnouncements(): Promise<any[]>;
  };
}

// Agent D - 监控分析服务接口
export interface AgentD_MonitoringAnalytics {
  role: 'MONITOR';
  
  // 用户行为分析
  userAnalytics: {
    recordUserInteraction(interaction: UserInteraction): Promise<void>;
    recordCheckInEvent(checkIn: CheckInBookmark): Promise<void>;
    recordVoiceGuideCompletion(figureId: string, userId: string): Promise<void>;
    analyzeUserJourney(sessionId: string): Promise<UserJourneyAnalysis>;
  };
  
  // 系统性能监控
  systemMonitoring: {
    recordAgentHealth(agentRole: AgentRole, health: AgentHealth): Promise<void>;
    recordAPIPerformance(api: string, responseTime: number, success: boolean): Promise<void>;
    recordError(error: SystemError): Promise<void>;
    getSystemStatus(): Promise<SystemStatus>;
  };
  
  // 业务指标统计
  businessMetrics: {
    getPopularSpotsStats(timeRange?: string): Promise<PopularityStats>;
    getCheckInSuccessRate(timeRange?: string): Promise<number>;
    getUserEngagementMetrics(timeRange?: string): Promise<EngagementMetrics>;
    getContentPopularityStats(timeRange?: string): Promise<ContentStats>;
  };
  
  // 告警和通知
  alerting: {
    sendSystemAlert(alert: SystemAlert): Promise<void>;
    sendBusinessAlert(alert: BusinessAlert): Promise<void>;
    sendWebhookNotification(webhook: WebhookNotification): Promise<void>;
    configureAlertRules(rules: AlertRule[]): Promise<void>;
  };
  
  // 数据导出
  dataExport: {
    exportUserJourneys(timeRange: string): Promise<string>; // 返回CSV数据
    exportCheckInStats(timeRange: string): Promise<string>;
    exportSystemLogs(timeRange: string): Promise<string>;
    exportBusinessMetrics(timeRange: string): Promise<string>;
  };
}

// 消息类型定义
export interface UserContextMessage {
  type: 'USER_CONTEXT_UPDATE';
  data: {
    sessionId: string;
    currentPage: string;
    currentSpot?: string;
    currentFigure?: string;
    userJourney: UserJourney;
    timestamp: number;
    source: 'page_change' | 'spot_view' | 'figure_view' | 'user_action';
  };
}

export interface ToolRequest {
  type: 'TOOL_REQUEST';
  tool: 'ai_chat' | 'voice_synthesis' | 'image_recognition' | 'recommendation';
  params: any;
  correlationId: string;
}

export interface ToolResponse {
  type: 'TOOL_RESPONSE';
  result: any;
  success: boolean;
  error?: string;
  correlationId: string;
}

// 分析和统计相关类型
export interface UserJourneyAnalysis {
  sessionId: string;
  totalDuration: number;
  spotsVisited: number;
  checkInsCompleted: number;
  guidesListened: number;
  engagementScore: number;
  preferredCategories: string[];
  recommendations: string[];
}

export interface AgentHealth {
  status: 'healthy' | 'degraded' | 'unhealthy';
  responseTime: number;
  errorRate: number;
  lastCheck: number;
  details?: any;
}

export interface SystemStatus {
  overall: 'healthy' | 'degraded' | 'unhealthy';
  agents: Record<AgentRole, AgentHealth>;
  apis: Record<string, { status: string; responseTime: number }>;
  timestamp: number;
}

export interface PopularityStats {
  spots: Array<{ id: string; name: string; visits: number; checkIns: number }>;
  figures: Array<{ id: string; name: string; listens: number; completions: number }>;
  timeRange: string;
}

export interface EngagementMetrics {
  totalSessions: number;
  averageSessionDuration: number;
  checkInRate: number;
  voiceGuideCompletionRate: number;
  returnVisitorRate: number;
}

export interface ContentStats {
  articles: Array<{ id: string; title: string; views: number; engagement: number }>;
  events: Array<{ id: string; title: string; registrations: number; attendance: number }>;
}

export interface SystemAlert {
  level: 'info' | 'warning' | 'error' | 'critical';
  message: string;
  component: string;
  timestamp: number;
  details?: any;
}

export interface BusinessAlert {
  type: 'low_engagement' | 'high_error_rate' | 'popular_content' | 'system_overload';
  message: string;
  metrics: any;
  timestamp: number;
}

export interface WebhookNotification {
  url: string;
  payload: {
    timestamp: string;
    service: string;
    alert: string;
    details?: any;
  };
}

export interface AlertRule {
  id: string;
  name: string;
  condition: string;
  threshold: number;
  action: 'webhook' | 'log' | 'email';
  enabled: boolean;
}