## Architecture Overview

本系统是一个自部署的小红书矩阵运营工具，采用前后端分离架构。后端为 Node.js + Express REST API 服务，前端为 React SPA，通过 Playwright 实现浏览器自动化发布，通过 Claude CLI 实现 LLM 文案生成。

**关键架构决策：**
1. **单体服务 + 后台 Worker**：API Server 与定时任务调度运行在同一进程，通过 node-cron 触发、BullMQ + Redis 管理任务队列，降低部署复杂度（MVP 阶段 SQLite 不适合多进程写入）
2. **平台适配器模式**：所有小红书相关操作抽象为 `PlatformAdapter` 接口，MVP 仅实现 `XiaohongshuAdapter`，后续可扩展知乎等平台
3. **选择器配置化**：DOM 选择器存储于数据库而非硬编码，支持热更新和版本回滚
4. **SSE 实时推送**：发布状态变化、Cookie 告警通过 Server-Sent Events 推送到前端
5. **Cookie 加密存储**：使用 AES-256-GCM 加密，密钥由环境变量提供

## Tech Stack

| Layer | Technology | Rationale |
|-------|-----------|-----------|
| Language | TypeScript (strict) | PRD 约束，类型安全 |
| Frontend | React 18 + Vite + Tailwind CSS | PRD 约束，快速开发 |
| UI Components | Headless UI + Radix UI | 无样式组件库，配合 Tailwind 灵活定制 |
| Calendar/DnD | @dnd-kit/core + date-fns | 排期日历拖拽排序 |
| Charts | Recharts | 轻量级 Dashboard 图表 |
| Code Editor | @uiw/react-codemirror | 选择器 JSON 编辑器 |
| Backend | Express.js | PRD 约束，成熟稳定 |
| Database | SQLite (better-sqlite3) | PRD 约束，自部署友好 |
| ORM | Drizzle ORM | 类型安全，SQLite 原生支持，轻量 |
| Task Queue | BullMQ + IORedis | 定时发布任务的可靠调度，支持重试和延迟 |
| Scheduler | node-cron | Cookie 心跳检测等周期任务 |
| Browser Automation | Playwright + playwright-extra + stealth plugin | PRD 约束，反检测 |
| LLM | Claude CLI (`claude -p`) | PRD 约束 |
| Encryption | Node.js crypto (AES-256-GCM) | Cookie 加密存储 |
| File Upload | Multer | 图片上传处理 |
| Validation | Zod | 请求/响应校验 |
| SSE | express-sse 或手写 | 实时事件推送 |
| Container | Docker + docker-compose | 部署（含 Chromium 依赖） |

## Module Breakdown

### Module: core
- **Responsibility**: 应用启动、配置加载、中间件注册、数据库初始化、全局错误处理
- **Key Interfaces**:
  - `AppConfig` — 应用配置类型（端口、密钥、数据库路径等）
  - `initDatabase()` — 数据库初始化与迁移
  - `createApp()` — Express 应用工厂
- **Covers**: F-001, F-002, F-003, F-004, F-005, F-006, F-007, F-008, F-009

### Module: accounts
- **Responsibility**: 账号 CRUD、Cookie 导入/校验/加密存储、扫码登录流程、Cookie 心跳检测
- **Key Interfaces**:
  - `AccountService` — 账号管理业务逻辑
  - `CookieEncryptor` — Cookie 加密/解密
  - `CookieHealthChecker` — 定时心跳检测（node-cron 每30分钟）
  - `QRLoginService` — 扫码登录会话管理（Playwright 打开小红书登录页抓取二维码）
- **API Endpoints**: `/accounts`, `/accounts/:id`, `/accounts/:id/cookie`, `/accounts/qr-login/*`
- **Covers**: F-001

### Module: topics
- **Responsibility**: 账号主题方向配置的 CRUD、预设主题管理
- **Key Interfaces**:
  - `TopicConfigService` — 主题配置读写
  - `PresetTopicProvider` — 预设主题数据源
- **API Endpoints**: `/accounts/:id/topic-config`, `/topics/presets`
- **Covers**: F-002

### Module: content
- **Responsibility**: LLM 文案生成、Prompt 模板管理、草稿 CRUD
- **Key Interfaces**:
  - `ContentGenerator` — 调用 Claude CLI 生成文案
  - `PromptBuilder` — 根据主题配置和模板组装完整 Prompt
  - `DraftService` — 草稿管理
  - `PromptTemplateService` — Prompt 模板 CRUD
- **API Endpoints**: `/content/generate`, `/content/drafts/*`, `/content/prompt-templates/*`
- **Covers**: F-003

### Module: images
- **Responsibility**: 图片上传、存储、分类管理、缩略图生成
- **Key Interfaces**:
  - `ImageService` — 图片元数据 CRUD
  - `ImageStorage` — 本地文件存储（`uploads/` 目录）
  - `ThumbnailGenerator` — Sharp 生成缩略图
- **API Endpoints**: `/images`, `/images/batch`, `/images/:id`, `/images/categories`
- **Covers**: F-004

### Module: schedules
- **Responsibility**: 排期生成、冲突检测、排期 CRUD、推荐时段
- **Key Interfaces**:
  - `ScheduleService` — 排期 CRUD 与冲突检测
  - `ScheduleGenerator` — 根据规则自动生成排期
  - `ConflictDetector` — 检测时间间隔冲突
  - `TimeSlotRecommender` — 推荐发布时段
- **API Endpoints**: `/schedules`, `/schedules/generate`, `/schedules/confirm`, `/schedules/:id`, `/schedules/recommended-slots`
- **Covers**: F-005

### Module: publisher
- **Responsibility**: Playwright 浏览器自动化发布、反检测措施、失败截图、任务队列
- **Key Interfaces**:
  - `PublishExecutor` — 执行发布流程（加载 Cookie → 打开发布页 → 填写内容 → 上传图片 → 提交）
  - `PlatformAdapter` (interface) — 平台操作抽象（login, publish, validate）
  - `XiaohongshuAdapter` — 小红书平台适配器实现
  - `StealthBrowser` — Playwright + stealth plugin 封装（随机延迟、鼠标轨迹）
  - `PublishQueue` — BullMQ 发布任务队列
  - `PublishScheduler` — node-cron 扫描到期排期并入队
  - `ScreenshotCapture` — 失败时截图保存
- **API Endpoints**: `/publish/:scheduleId/execute`, `/publish/:scheduleId/retry`, `/publish/logs/*`, `/publish/screenshots/*`
- **Covers**: F-006, F-007, F-008

### Module: dashboard
- **Responsibility**: 聚合统计数据、告警管理、SSE 实时推送
- **Key Interfaces**:
  - `DashboardService` — 概览数据聚合
  - `StatsAggregator` — 发布统计（按时段/账号）
  - `AlertService` — 告警生成与管理
  - `SSEManager` — Server-Sent Events 连接管理与事件广播
- **API Endpoints**: `/dashboard/overview`, `/dashboard/stats`, `/dashboard/alerts/*`, `/events`
- **Covers**: F-007

### Module: settings
- **Responsibility**: 安全策略配置（全局/账号级）、选择器配置热更新与版本管理
- **Key Interfaces**:
  - `SafetyConfigService` — 安全策略 CRUD（含账号级覆盖合并逻辑）
  - `SelectorConfigService` — 选择器配置 CRUD + 版本管理
  - `SelectorVersionManager` — 版本历史与回滚
- **API Endpoints**: `/settings/safety`, `/settings/safety/accounts/:id`, `/settings/selectors`, `/settings/selectors/versions/*`
- **Covers**: F-008, F-009

### Module: frontend
- **Responsibility**: React SPA，包含所有 UI 组件和页面
- **Key Interfaces**:
  - Pages: Dashboard, ContentGeneration, ImageLibrary, ScheduleManagement, Settings, AccountConfig
  - API Client: 基于 fetch 封装的类型安全 API 客户端
  - SSE Hook: `useSSE()` 订阅实时事件
  - State Management: React Query (TanStack Query) 管理服务端状态
- **Covers**: F-001, F-002, F-003, F-004, F-005, F-006, F-007, F-008, F-009

## Implementation Tasks

| ID | Task | Module | Covers Features | Priority |
|---|---|---|---|---|
| T-001 | 项目脚手架搭建：monorepo 结构（packages/server + packages/web）、TypeScript 配置、ESLint、Docker 基础配置 | core | F-001, F-002, F-003, F-004, F-005, F-006, F-007, F-008, F-009 | 1 |
| T-002 | 数据库 schema 设计与 Drizzle ORM 配置：accounts、topic_configs、drafts、prompt_templates、images、schedules、publish_logs、alerts、safety_configs、selector_configs、selector_versions 表 | core | F-001, F-002, F-003, F-004, F-005, F-007, F-008, F-009 | 2 |
| T-003 | Express 应用骨架：路由注册、全局错误处理中间件、Zod 请求校验中间件、CORS、静态文件服务 | core | F-001, F-002, F-003, F-004, F-005, F-006, F-007, F-008, F-009 | 3 |
| T-004 | Cookie 加密模块：AES-256-GCM 加密/解密封装，密钥从环境变量读取 | accounts | F-001 | 4 |
| T-005 | 账号管理 API：CRUD 端点 + Cookie 导入 + 账号上限校验（≤5） | accounts | F-001 | 5 |
| T-006 | 扫码登录流程：Playwright 打开小红书登录页获取二维码、会话轮询、Cookie 自动抓取 | accounts | F-001 | 6 |
| T-007 | Cookie 心跳检测：node-cron 每30分钟检测所有账号 Cookie 有效性（Playwright 访问小红书验证） | accounts | F-001 | 7 |
| T-008 | 主题配置 API：账号主题 CRUD + 预设主题列表 | topics | F-002 | 8 |
| T-009 | Prompt 模板管理：内置默认模板 + 自定义模板 CRUD | content | F-003 | 9 |
| T-010 | LLM 文案生成：Claude CLI 调用封装、Prompt 组装（主题+关键词+风格+模板→完整 Prompt）、结果解析（标题/正文/标签） | content | F-003 | 10 |
| T-011 | 草稿管理 API：CRUD + 状态流转（draft→scheduled→published）+ 分页筛选 | content | F-003 | 11 |
| T-012 | 图片上传与存储：Multer 文件上传、格式/大小校验、Sharp 缩略图生成、本地文件存储 | images | F-004 | 12 |
| T-013 | 图片管理 API：分类标签 CRUD、批量上传、分类列表聚合 | images | F-004 | 13 |
| T-014 | 排期生成引擎：根据规则（账号、频次、时段）自动生成排期 + 冲突检测（间隔≥2小时）+ 推荐时段 | schedules | F-005 | 14 |
| T-015 | 排期管理 API：CRUD + 确认批量保存 + 日历范围查询 | schedules | F-005 | 15 |
| T-016 | 安全策略配置 API：全局配置 CRUD + 账号级覆盖 + 合并逻辑（账号级 > 全局级） | settings | F-008 | 16 |
| T-017 | 选择器配置 API：配置 CRUD + JSON 语法校验 + 版本历史 + 回滚 | settings | F-009 | 17 |
| T-018 | Playwright 浏览器自动化核心：stealth plugin 集成、Cookie 加载、随机延迟（200-2000ms）、鼠标轨迹模拟 | publisher | F-006, F-008 | 18 |
| T-019 | 小红书平台适配器：实现 PlatformAdapter 接口（打开发布页→上传图片→填写标题/正文→添加话题→提交），选择器从数据库读取 | publisher | F-006, F-009 | 19 |
| T-020 | 发布任务队列：BullMQ 队列 + Worker + 失败截图保存 + 重试逻辑（1次自动重试） | publisher | F-006 | 20 |
| T-021 | 发布调度器：node-cron 每分钟扫描到期排期并入队 + 安全策略频率控制 | publisher | F-005, F-006, F-008 | 21 |
| T-022 | 发布监控 API：发布记录列表 + 详情（含截图）+ 手动执行 + 重试 | publisher | F-006, F-007 | 22 |
| T-023 | SSE 实时事件推送：连接管理 + publish-status / cookie-alert / schedule-update 事件广播 | dashboard | F-007 | 23 |
| T-024 | Dashboard API：概览聚合 + 发布统计（today/week/month）+ 告警管理 | dashboard | F-007 | 24 |
| T-025 | 前端项目搭建：Vite + React + Tailwind + React Router + TanStack Query + API Client 封装 | frontend | F-001, F-002, F-003, F-004, F-005, F-006, F-007, F-008, F-009 | 25 |
| T-026 | 前端 Layout 组件：AppShell + Sidebar（可折叠）+ TopBar（告警 Banner 插槽）+ PageHeader | frontend | F-007 | 26 |
| T-027 | 前端账号管理页：AccountGrid + AccountCard + QRCodeLoginModal + CookieImportModal + CookieStatusBanner | frontend | F-001 | 27 |
| T-028 | 前端主题配置页：TopicConfigPanel + TagInput + PresetTopicSelector | frontend | F-002 | 28 |
| T-029 | 前端内容生成页：ContentGeneratorWizard（步骤条）+ PromptTemplateSelector + ContentPreviewCard + InlineEditor | frontend | F-003 | 29 |
| T-030 | 前端素材库页：ImageUploader（拖拽）+ ImageGrid + ImagePickerDrawer + ImageSortableList + CategoryFilter | frontend | F-004 | 30 |
| T-031 | 前端排期管理页：ScheduleCalendar（周视图+拖拽）+ ScheduleRuleModal + ScheduleCard + TimeSlotPicker + ConflictWarning | frontend | F-005 | 31 |
| T-032 | 前端 Dashboard 页：DashboardOverview + StatsCard + SuccessRateChart + PublishLogTable + FailureDetailPanel + ScreenshotViewer | frontend | F-007 | 32 |
| T-033 | 前端设置页：SafetyConfigForm + RiskDisclaimerBanner + SelectorEditor（CodeMirror）+ SelectorVersionHistory | frontend | F-008, F-009 | 33 |
| T-034 | 前端 SSE 集成：useSSE hook + 实时状态更新 + Toast 通知 | frontend | F-007 | 34 |
| T-035 | Docker 部署配置：Dockerfile（含 Chromium 依赖）+ docker-compose（app + Redis）+ 环境变量模板 | core | F-006 | 35 |

## Data Model

```
┌──────────────┐       ┌──────────────────┐
│   accounts   │───1:1─│  topic_configs   │
│──────────────│       │──────────────────│
│ id (PK)      │       │ id (PK)          │
│ platform     │       │ account_id (FK)  │
│ nickname     │       │ topics (JSON)    │
│ avatar       │       │ keywords (JSON)  │
│ cookie_enc   │       │ style_desc       │
│ cookie_status│       │ updated_at       │
│ last_check   │       └──────────────────┘
│ created_at   │
│ updated_at   │
└──────┬───────┘
       │
       │ 1:N
       ▼
┌──────────────┐       ┌──────────────────┐
│    drafts    │       │ prompt_templates  │
│──────────────│       │──────────────────│
│ id (PK)      │       │ id (PK)          │
│ account_id   │       │ name             │
│ title        │       │ description      │
│ body         │       │ template         │
│ hashtags JSON│       │ is_builtin       │
│ image_ids JSON       │ created_at       │
│ status       │       └──────────────────┘
│ created_at   │
│ updated_at   │
└──────────────┘
       │
       │ 1:1 (via draft_id)
       ▼
┌──────────────────┐      ┌──────────────────┐
│   schedules      │──1:1─│  publish_logs    │
│──────────────────│      │──────────────────│
│ id (PK)          │      │ id (PK)          │
│ account_id (FK)  │      │ schedule_id (FK) │
│ draft_id (FK?)   │      │ account_id       │
│ scheduled_at     │      │ status           │
│ status           │      │ title            │
│ image_ids (JSON) │      │ started_at       │
│ publish_log_id   │      │ completed_at     │
│ created_at       │      │ duration_ms      │
│ updated_at       │      │ error (JSON)     │
└──────────────────┘      │ retry_count      │
                          │ created_at       │
                          └──────────────────┘

┌──────────────┐      ┌────────────────────┐
│    images    │      │    alerts          │
│──────────────│      │────────────────────│
│ id (PK)      │      │ id (PK)            │
│ filename     │      │ type               │
│ path         │      │ severity           │
│ thumbnail    │      │ account_id         │
│ mime_type    │      │ message            │
│ size         │      │ action_url         │
│ width/height │      │ created_at         │
│ account_id   │      │ dismissed_at       │
│ category     │      └────────────────────┘
│ tags (JSON)  │
│ created_at   │
└──────────────┘

┌────────────────────┐    ┌────────────────────────┐
│  safety_configs    │    │  selector_configs      │
│────────────────────│    │────────────────────────│
│ id (PK)            │    │ id (PK)                │
│ account_id (NULL=  │    │ platform               │
│   global)          │    │ version                │
│ max_posts_per_day  │    │ selectors (JSON)       │
│ min_interval_min   │    │ updated_at             │
│ random_delay_min   │    └────────────────────────┘
│ random_delay_max   │
│ updated_at         │    ┌────────────────────────┐
└────────────────────┘    │  selector_versions     │
                          │────────────────────────│
                          │ id (PK)                │
                          │ version                │
                          │ selectors (JSON)       │
                          │ comment                │
                          │ diff (TEXT)            │
                          │ created_at             │
                          └────────────────────────┘

┌──────────────────┐
│  qr_login_sessions│
│──────────────────│
│ id (PK)          │
│ qr_code_url      │
│ status           │
│ account_id       │
│ expires_at       │
│ created_at       │
└──────────────────┘
```

**关键关系：**
- `accounts` 1:1 `topic_configs` — 每个账号一套主题配置
- `accounts` 1:N `drafts` — 每个账号多个草稿
- `accounts` 1:N `schedules` — 每个账号多个排期
- `schedules` 1:1 `publish_logs` — 每个排期对应一条发布记录
- `schedules` N:1 `drafts` — 排期关联一个草稿
- `safety_configs` — account_id=NULL 表示全局配置，非 NULL 表示账号级覆盖
- `images` 与 `drafts`/`schedules` 通过 JSON 数组字段 `image_ids` 关联（避免多对多表，MVP 简化）

## Non-Functional Requirements

### Performance
- API 响应时间 p95 < 200ms（除 LLM 生成接口）
- LLM 文案生成 < 30s（Claude CLI 调用）
- SSE 事件推送延迟 < 1s
- 图片上传单张 < 5s（本地存储）
- 支持 5 个账号同时管理，日发布量 ≤ 10 篇

### Security
- Cookie 使用 AES-256-GCM 加密存储，密钥通过 `COOKIE_ENCRYPTION_KEY` 环境变量注入
- 所有用户输入经 Zod schema 校验，防止注入
- 上传文件格式白名单（JPG/PNG/WEBP）+ 大小限制（10MB）
- 产品内始终展示合规风险提示 Banner（浏览器自动化处于平台 ToS 灰色地带）
- 单用户系统（MVP），无需认证鉴权（本地部署信任模型）
- `.env` 文件纳入 `.gitignore`，提供 `.env.example` 模板

### Scalability
- 平台适配器模式（`PlatformAdapter` 接口）预留多平台扩展
- 选择器配置化存储，DOM 变化时无需改代码
- Prompt 模板化，支持用户自定义，易于调整生成风格
- BullMQ 队列支持后续水平扩展（多 Worker 实例）
- SQLite 适配 MVP 单实例部署，后续可迁移至 PostgreSQL

### Reliability
- 发布失败自动截图保存现场
- 发布任务自动重试 1 次
- Cookie 失效自动告警通知
- 排期冲突自动检测和建议
- 反风控策略默认保守（每账号每天 ≤2 篇，间隔 ≥2 小时）