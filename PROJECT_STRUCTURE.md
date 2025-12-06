# 东里村智能导游系统 - 项目结构说明

## 🎯 项目概述
基于ANP协议的东里村智能导游系统，实现多智能体协作的乡村AI导览服务。

## 📁 项目结构

```
village-guide-clean/
├── 📄 核心配置文件
│   ├── package.json          # 项目依赖配置
│   ├── tsconfig.json         # TypeScript配置
│   ├── vite.config.ts        # Vite构建配置
│   ├── .gitignore           # Git忽略文件
│   ├── index.html           # HTML入口文件
│   ├── index.tsx            # React应用入口
│   ├── App.tsx              # 主应用组件
│   └── index.css            # 全局样式
│
├── 📂 src/                    # 源代码目录
│   ├── 📂 components/           # React组件
│   │   ├── 🎯 核心业务组件
│   │   │   ├── App.tsx              # 主应用组件
│   │   │   ├── Login.tsx            # 登录组件
│   │   │   ├── Home.tsx             # 首页组件
│   │   │   ├── Dashboard.tsx        # 仪表板
│   │   │   ├── BottomChatWidget.tsx # 底部聊天组件
│   │   │   └── SpotDetail.tsx       # 景点详情
│   │   ├── 🎨 通用组件
│   │   │   ├── common/
│   │   │   │   ├── Icon.tsx         # 图标组件
│   │   │   │   ├── Spinner.tsx      # 加载动画
│   │   │   │   └── UncleAvatar.tsx  # AI助手头像
│   │   │   └── ...
│   │   └── 🗺️ 功能组件
│   │       ├── MapView.tsx          # 地图视图
│   │       ├── TourGuide.tsx        # 导览组件
│   │       └── VoiceDemo.tsx       # 语音演示
│   │
│   ├── 📂 core/                   # ANP多智能体核心系统
│   │   ├── 📂 anp/                  # ANP协议实现
│   │   │   ├── network.js          # ANP网络核心
│   │   │   └── 📂 agents/           # 智能体实现
│   │   │       ├── agent-a.js       # Agent A - 门面协调器
│   │   │       ├── agent-b.js       # Agent B - 工具执行器
│   │   │       ├── agent-c.js       # Agent C - 信息处理器
│   │   │       └── agent-d.js       # Agent D - 数据管理器
│   │   ├── 📂 database/             # 数据库管理
│   │   │   └── manager.js          # 数据库管理器
│   │   └── 📂 mcp/                  # MCP工具注册
│   │       └── registry.js          # 工具注册表
│   │
│   ├── 📂 services/               # 服务层
│   │   ├── config.ts              # AI服务配置
│   │   ├── staticData.ts          # 静态数据服务
│   │   ├── minimaxService.ts      # MiniMax语音服务
│   │   ├── agentSystem.ts         # Agent系统服务
│   │   └── ...                    # 其他服务文件
│   │
│   ├── 📂 utils/                  # 工具函数
│   │   ├── audioUtils.ts          # 音频处理工具
│   │   ├── constants.ts           # 常量定义
│   │   ├── imageProcessor.ts      # 图片处理工具
│   │   └── mapUtils.ts            # 地图工具
│   │
│   ├── 📂 hooks/                  # React钩子
│   │   └── useGeolocation.ts      # 地理位置钩子
│   │
│   └── 📂 types/                  # TypeScript类型定义
│       ├── anp-protocol.ts        # ANP协议类型
│       ├── business-agent-protocol.ts # 业务Agent协议
│       └── simple-agent-protocol.ts   # 简单Agent协议
│
├── 📂 data/                     # 数据文件
│   ├── village_figures.json     # 村庄人物数据
│   ├── scenic_spots.json        # 景点数据
│   ├── red_culture.json         # 红色文化数据
│   ├── event_announcements.json # 活动公告数据
│   └── self_media.json          # 自媒体数据
│
├── 📂 assets/                   # 静态资源
│   ├── 📂 images/                # 图片资源
│   │   ├── 📂 figures/            # 人物图片
│   │   ├── 📂 scenic/             # 景点图片
│   │   ├── 📂 red_culture/        # 红色文化图片
│   │   └── 📂 media/              # 媒体图片
│   └── 📂 audio/                 # 音频资源
│
└── 📂 public/                   # 公共资源
    └── manifest.json            # PWA配置文件
```

## 🤖 ANP多智能体系统架构

### Agent职责划分
- **Agent A (门面协调器)**: 用户接口、意图识别、任务协调
- **Agent B (工具执行器)**: 地图导航、天气查询、外部API调用
- **Agent C (信息处理器)**: 景点介绍、历史文化、内容生成
- **Agent D (数据管理器)**: 数据存储、状态管理、上下文维护

### 通信机制
- 基于ANP协议的消息传递
- 支持同步/异步通信
- 内置重试和错误处理机制
- 实时性能监控

## 🎯 核心功能模块

### 1. 智能导览服务
- AI问答导览 (基于大模型)
- 语音交互 (MiniMax语音服务)
- 图像识别 (景点打卡)
- 地图导航 (高德地图集成)
- 个性化推荐

### 2. 内容管理
- 村子介绍
- 景点信息 (红色景点、风景名胜)
- 东里名人 (革命先辈、名人乡贤、青年学生)
- 自媒体视频号
- 活动打卡

### 3. 用户交互
- 登录系统
- 聊天界面
- 语音交互
- 地图浏览
- 个性化书签

## 🔧 技术栈

### 前端框架
- React 18.3.1 + TypeScript
- Ant Design Mobile 5.41.1
- Vite 5.2.11 (构建工具)

### AI服务
- 硅基流动API (Qwen3-8B模型)
- MiniMax语音服务
- 备选：智谱AI GLM-4

### 地图服务
- 高德地图API
- Leaflet地图库

### 数据存储
- 浏览器本地存储 (localStorage)
- IndexedDB (离线数据)

## 🚀 快速开始

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 预览构建结果
npm run preview
```

## 📱 主要页面路由

1. **登录页** (`/login`) - 用户登录界面
2. **首页** (`/home`) - 功能导航首页
3. **仪表板** (`/dashboard`) - 主要功能面板
4. **景点列表** (`/spots`) - 景点浏览列表
5. **景点详情** (`/spot/:id`) - 景点详细信息
6. **地图视图** (`/map`) - 交互式地图
7. **人物志** (`/people`) - 村庄人物介绍

## 🔄 Agent通信流程

```
用户输入 → Agent A (意图识别) → Agent B/C (执行) → Agent D (数据管理) → 返回结果
```

## 📝 开发规范

1. **组件开发**: 使用TypeScript + React Hooks
2. **样式管理**: CSS Modules + Ant Design Mobile
3. **状态管理**: 本地状态 + ANP Agent通信
4. **错误处理**: 统一错误边界 + Agent重试机制
5. **性能优化**: 懒加载 + 缓存策略

## 🎨 UI/UX设计原则

1. **移动优先**: 响应式设计，适配移动设备
2. **简洁易用**: 直观的用户界面和交互流程
3. **文化元素**: 融入当地文化特色的设计元素
4. **无障碍**: 支持语音交互和辅助功能

## 🔍 调试和测试

- Agent通信调试: 浏览器开发者工具
- 网络请求: Network面板监控
- 性能分析: Performance API
- 单元测试: Jest + React Testing Library

## 📈 性能监控

- ANP网络性能指标
- Agent响应时间统计
- 用户行为分析
- 错误率监控

---

**注意**: 这是演示版本，支持硬编码实现，优先考虑项目落地而非安全防护。
