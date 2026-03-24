## User Journeys

### Flow 1: Onboarding & Account Setup (First-time Use)
**Covers: F-001**

```
Landing/Login → Dashboard (empty state) → 点击「添加账号」→ 选择登录方式（扫码/Cookie导入）
  → [扫码] 展示小红书扫码二维码 → 等待扫码确认 → Cookie 自动抓取 → 保存成功
  → [Cookie] 打开 Cookie 导入弹窗 → 粘贴 Cookie → 校验有效性 → 保存成功
→ 账号卡片出现在 Dashboard → 状态标记「在线」
```

**异常路径：**
- 扫码超时（2分钟）→ 提示重试
- Cookie 无效 → 错误提示 + 高亮输入框
- 账号数已达上限(5个) → 添加按钮禁用 + tooltip 说明

---

### Flow 2: Topic & Style Configuration
**Covers: F-002**

```
Dashboard → 点击账号卡片「配置」→ 进入账号设置页
→ 主题方向 Tab → 选择预设主题标签（美妆/穿搭/美食/...）或输入自定义主题
→ 添加关键词（tag input，回车添加）
→ 填写风格描述（textarea，placeholder 示例）
→ 保存配置 → Toast 成功提示 → 返回 Dashboard
```

---

### Flow 3: Content Generation & Preview
**Covers: F-003**

```
Dashboard → 侧边栏「内容生成」→ 内容生成页面
→ Step 1: 选择目标账号（下拉选择）
→ Step 2: 确认/微调主题参数（自动填充账号配置）
→ Step 3: 选择 Prompt 模板（内置默认 / 用户自定义）
→ 点击「生成文案」→ Loading 状态（骨架屏 + 进度提示）
→ 生成完成 → 预览卡片展示（标题 + 正文 + 话题标签）
→ 用户可编辑（inline editing）→ 字数实时统计（标题≤20字，正文≤1000字）
→ 点击「保存到草稿」或「立即排期」
```

**异常路径：**
- LLM 调用失败 → 错误提示 + 重试按钮
- 标题超字数 → 红色警告 + 阻止保存
- 未配置主题 → 引导跳转到账号配置

---

### Flow 4: Image Library Management
**Covers: F-004**

```
Dashboard → 侧边栏「素材库」→ 素材库页面
→ 顶部筛选栏：按账号/主题分类过滤
→ 点击「上传图片」→ 文件选择器（支持多选，JPG/PNG/WEBP，≤10MB）
→ 上传中进度条 → 上传完成 → 图片缩略图网格展示
→ 图片操作：分类标签编辑 / 删除 / 预览大图
```

**关联流程：发布时选图**
```
排期编辑 → 点击「选择配图」→ 弹出素材库 Drawer
→ 网格选图（1-9张）→ 已选图片支持拖拽排序 → 确认选择
```

**异常路径：**
- 文件格式不支持 → 上传前校验 + 提示
- 文件超过 10MB → 阻止上传 + 大小提示
- 选图超过 9 张 → 禁用更多选择 + 计数器提示

---

### Flow 5: Schedule & Batch Planning
**Covers: F-005**

```
Dashboard → 侧边栏「排期管理」→ 排期页面（日历视图）
→ 点击「自动排期」→ 排期规则弹窗：
    - 选择账号（多选）
    - 每天篇数（1-2，默认2）
    - 发布时段（多选推荐时段 / 自定义时间）
    - 排期周期（默认一周）
→ 点击「生成排期」→ 日历上出现排期卡片（待分配内容）
→ 点击排期卡片 → 侧边抽屉：关联草稿内容 + 选择配图
→ 手动调整：拖拽卡片更换日期/时间
→ 确认排期 → 状态变为「待发布」
```

**异常路径：**
- 排期冲突（间隔<2小时）→ 黄色警告 + 自动调整建议
- 无可用草稿 → 提示先生成内容
- 账号 Cookie 失效 → 排期卡片标红 + 提示重新登录

---

### Flow 6: Automated Publishing
**Covers: F-006, F-008**

```
排期到达发布时间 → 后台自动触发：
→ 检查 Cookie 有效性 → [失效] 跳过 + 通知用户
→ [有效] Playwright 启动 headless 浏览器
→ 加载 Cookie → 打开小红书发布页
→ 模拟操作：上传图片 → 填写标题 → 填写正文 → 添加话题标签
→ 随机延迟 → 点击发布 → 确认发布成功
→ 更新状态为「成功」→ Dashboard 实时更新
```

**用户侧感知：**
```
Dashboard 发布卡片状态实时变化：
待发布(灰) → 发布中(蓝/动画) → 成功(绿) / 失败(红)
```

**异常路径：**
- 选择器找不到元素 → 截图保存 + 标记失败 + 通知
- 页面加载超时 → 重试1次 → 失败则截图保存
- 反风控触发 → 截图 + 暂停该账号后续任务 + 紧急通知

---

### Flow 7: Monitoring & Troubleshooting
**Covers: F-007**

```
Dashboard（默认视图）→ 概览面板：
  - 各账号状态卡片（在线/离线/发布中）
  - 今日发布统计（成功/失败/待发布）
  - 成功率环形图
→ 点击「查看详情」→ 发布记录列表（支持按状态/账号/日期筛选）
→ 点击失败记录 → 展开详情：失败原因 + 截图预览 + 重试按钮
→ Cookie 状态告警 → 顶部 Banner（账号X Cookie即将过期 / 已失效）→ 点击跳转重新登录
```

---

### Flow 8: Safety & Selector Configuration
**Covers: F-008, F-009**

```
Dashboard → 侧边栏「系统设置」→ 设置页面
→ Tab: 安全策略
  - 全局设置：每日发布上限 / 最小间隔 / 随机延迟范围
  - 账号级覆盖：选择账号 → 单独配置
  - 合规风险提示 Banner（始终可见）
→ Tab: 选择器配置
  - 展示当前选择器 JSON（代码编辑器展示）
  - 支持编辑 + 语法校验 + 保存
  - 版本历史列表 → 支持回滚
→ 保存 → 即时生效 → Toast 确认
```

---

## Interaction Rules

### 表单校验
- **实时校验（on blur）**：账号名称、主题关键词、文案标题字数、正文字数
- **提交校验**：Cookie 格式完整性、图片文件格式/大小、排期时间冲突
- **校验反馈**：输入框下方红色文字 + 输入框红色边框，提交时滚动到第一个错误字段

### 错误展示模式
- **字段级错误**：输入框下方 inline 红色文字
- **操作级错误**：页面顶部 Toast notification（自动消失 5s）
- **系统级错误**：顶部持久 Banner（需手动关闭或问题解决后消失）
- **发布失败**：卡片内嵌错误详情 + 截图缩略图

### Loading 状态
- **LLM 文案生成**：骨架屏 + "AI 正在创作中..." 文字 + 预估耗时
- **图片上传**：进度条（百分比）
- **发布执行**：状态 badge 动画（脉冲蓝色圆点）
- **页面加载**：全局 spinner（首次加载） / 局部骨架屏（数据刷新）
- **排期生成**：日历区域 shimmer 效果

### 导航模式
- **左侧固定侧边栏**：Dashboard / 内容生成 / 素材库 / 排期管理 / 系统设置
- **面包屑**：仅在二级页面展示（如账号详情配置）
- **Modal/Drawer**：非页面切换的操作（选图、排期规则配置）使用 Drawer 侧滑

### 通知模式
- **Cookie 失效**：Dashboard 顶部红色 Banner + 侧边栏账号图标变灰
- **发布失败**：Dashboard 内 Toast + 失败计数 Badge
- **排期提醒**：排期日历中即将发布的任务高亮

### 确认与危险操作
- **删除账号**：二次确认 Dialog（输入账号名确认）
- **批量排期**：预览排期表 → 确认后生效
- **清空素材库分类**：二次确认 Dialog
- **选择器编辑**：保存前 diff 预览

### 响应式规则
- MVP 仅 Web 端，最小支持宽度 1280px
- 侧边栏可折叠为图标模式
- 日历视图在窄屏切换为列表视图

---

## Component Inventory

### Layout 组件
- **AppShell**: 应用外壳，包含侧边栏 + 顶部栏 + 主内容区
- **Sidebar**: 左侧固定导航栏，含折叠功能，导航项带图标和 Badge
- **TopBar**: 顶部栏，含全局告警 Banner 插槽和用户信息
- **PageHeader**: 页面标题 + 面包屑 + 操作按钮区

### 账号管理组件 (F-001)
- **AccountCard**: 账号信息卡片，展示头像、昵称、平台、Cookie 状态指示灯（绿/黄/红）
- **AccountGrid**: 账号卡片网格容器，含空状态引导和添加按钮
- **QRCodeLoginModal**: 扫码登录弹窗，展示二维码 + 倒计时 + 状态轮询
- **CookieImportModal**: Cookie 粘贴导入弹窗，含格式说明和校验反馈
- **CookieStatusBanner**: 全局 Cookie 失效告警 Banner，含跳转操作

### 主题配置组件 (F-002)
- **TopicConfigPanel**: 账号主题配置面板，含主题标签选择、关键词输入、风格描述
- **TagInput**: 标签输入组件，回车添加 + 点击删除 + 预设建议
- **PresetTopicSelector**: 预设主题网格选择器（美妆/穿搭/美食等）

### 内容生成组件 (F-003)
- **ContentGeneratorWizard**: 内容生成向导（步骤条引导：选账号 → 确认参数 → 选模板 → 生成）
- **PromptTemplateSelector**: Prompt 模板选择器，含内置模板和自定义模板管理
- **ContentPreviewCard**: 生成内容预览卡片，模拟小红书笔记样式
- **InlineEditor**: 内联文案编辑器，含实时字数统计和超限警告
- **GenerationLoadingSkeleton**: 文案生成等待骨架屏

### 素材库组件 (F-004)
- **ImageUploader**: 图片上传区域，支持拖拽 + 点击，含格式/大小校验
- **ImageGrid**: 图片缩略图网格，支持多选 + 分类筛选
- **ImagePickerDrawer**: 发布选图侧滑抽屉，含已选计数和拖拽排序
- **ImageSortableList**: 已选图片拖拽排序列表（1-9张）
- **CategoryFilter**: 按账号/主题的分类筛选栏

### 排期管理组件 (F-005)
- **ScheduleCalendar**: 排期日历视图（周视图为主），卡片可拖拽调整
- **ScheduleRuleModal**: 自动排期规则配置弹窗（账号、频次、时段选择）
- **ScheduleCard**: 日历内的排期任务卡片，含状态 badge 和内容摘要
- **TimeSlotPicker**: 发布时段选择器，高亮推荐时段
- **ConflictWarning**: 排期冲突警告提示组件

### 发布相关组件 (F-006)
- **PublishStatusBadge**: 发布状态 badge（待发布/发布中/成功/失败），含颜色和动画
- **PublishProgressCard**: 发布进度实时展示卡片

### 监控 Dashboard 组件 (F-007)
- **DashboardOverview**: Dashboard 概览面板，聚合统计信息
- **StatsCard**: 统计数据卡片（今日发布数、成功率等）
- **SuccessRateChart**: 成功率环形图组件
- **PublishLogTable**: 发布记录表格，支持筛选和分页
- **FailureDetailPanel**: 失败详情展开面板，含截图查看器和重试按钮
- **ScreenshotViewer**: 失败截图查看器（点击放大）

### 设置组件 (F-008, F-009)
- **SafetyConfigForm**: 安全策略配置表单（全局/账号级参数）
- **RiskDisclaimerBanner**: 合规风险提示 Banner（始终展示在设置页）
- **SelectorEditor**: 选择器 JSON 编辑器，含语法高亮和校验
- **SelectorVersionHistory**: 选择器版本历史列表 + 回滚操作
- **NumberRangeInput**: 数值范围输入组件（用于延迟范围、频率限制等）

### 通用组件
- **Toast**: 全局 Toast 通知组件
- **ConfirmDialog**: 二次确认对话框（支持输入确认模式）
- **EmptyState**: 空状态引导组件（插画 + 描述 + 操作按钮）
- **StatusDot**: 状态指示圆点（绿/黄/红/蓝脉冲）
- **LoadingSpinner**: 全局/局部加载指示器
- **Breadcrumb**: 面包屑导航
- **Badge**: 数字/文字 Badge（用于导航项通知计数）
- **Drawer**: 侧滑抽屉容器
- **StepIndicator**: 步骤条指示器（用于向导流程）
- **FilterBar**: 通用筛选栏（下拉 + 标签 + 搜索）