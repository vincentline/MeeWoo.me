# MeeWoo 项目功能索引
## 项目概述

MeeWoo 是一个 SVGA 动画预览与转换工具，支持多种动画格式的预览、编辑、转换和导出，提供素材替换、GIF 导出、MP4 转换等核心功能。

## 功能索引

### 1. 主要应用页面 (docs/)

| 文件路径 | 功能描述 | 关键词 |
|---------|---------|--------|
| `docs/index.html` | 主应用页面，包含 SVGA 预览、编辑和转换功能 | 主页面、SVGA 预览、动画编辑 |
| `docs/sth_auto.html` | 素材自助页面，用于 SVGA 素材替换和导出 | 素材自助、素材替换、SVGA 导出 |
| `docs/coi-serviceworker.js` | COI Service Worker，用于启用 SharedArrayBuffer 支持 | COI、Service Worker、SharedArrayBuffer |
| `docs/favicon.png` | 网站图标 | 网站图标、favicon |
| `docs/svga.proto` | SVGA 文件格式的 Protocol Buffers 定义 | SVGA 格式、Protocol Buffers |
| `docs/help.md` | 帮助文档，包含功能说明和使用指南 | 帮助文档、使用指南 |

### 2. 核心功能模块 (docs/assets/js/core/)

| 文件路径 | 功能描述 | 关键词 |
|---------|---------|--------|
| `docs/assets/js/core/app.js` | 应用核心逻辑，包含 SVGA 播放器初始化和管理 | 应用核心、SVGA 播放器、初始化 |
| `docs/assets/js/core/material-editor.js` | 素材编辑器，支持 SVGA 素材的编辑功能 | 素材编辑、素材管理、编辑器 |
| `docs/assets/js/core/material-operations.js` | 素材操作逻辑，包含素材替换、保存等功能 | 素材操作、替换逻辑、保存逻辑 |
| `docs/assets/js/core/material-state.js` | 素材状态管理，记录素材编辑状态 | 状态管理、素材状态、编辑状态 |
| `docs/assets/js/core/material-image.js` | 素材图片处理，包含图片加载和处理功能 | 图片处理、素材加载、图像处理 |
| `docs/assets/js/core/konva-*.js` | Konva 画布相关功能，用于素材编辑的画布操作 | Konva、画布操作、图形编辑 |

### 3. 组件模块 (docs/assets/js/components/)

| 文件路径 | 功能描述 | 关键词 |
|---------|---------|--------|
| `docs/assets/js/components/chromakey-panel.js` | 绿幕抠图面板组件 | 绿幕抠图、面板组件、视频编辑 |
| `docs/assets/js/components/dual-channel-panel.js` | 双通道 MP4 转换面板 | 双通道、MP4 转换、面板组件 |
| `docs/assets/js/components/gif-panel.js` | GIF 导出面板组件 | GIF 导出、面板组件、动画转换 |
| `docs/assets/js/components/material-panel.js` | 素材管理面板组件 | 素材管理、面板组件、素材替换 |
| `docs/assets/js/components/standard-mp4-panel.js` | 标准 MP4 转换面板 | 标准 MP4、转换面板、视频转换 |
| `docs/assets/js/components/to-svga-panel.js` | 转 SVGA 面板组件 | SVGA 转换、面板组件、格式转换 |

### 4. 混合模块 (docs/assets/js/mixins/)

| 文件路径 | 功能描述 | 关键词 |
|---------|---------|--------|
| `docs/assets/js/mixins/panel-mixin.js` | 右侧面板管理 Mixin，负责面板状态和业务逻辑 | 面板管理、Mixin、状态管理 |

### 5. 控制器模块 (docs/assets/js/controllers/)

| 文件路径 | 功能描述 | 关键词 |
|---------|---------|--------|
| `docs/assets/js/controllers/ad-controller.js` | 广告控制器，管理广告位和广告显示 | 广告管理、广告控制、广告位 |
| `docs/assets/js/controllers/input-controller.js` | 输入控制器，处理用户输入事件 | 输入处理、事件管理、用户交互 |
| `docs/assets/js/controllers/player-controller.js` | 播放器控制器，管理 SVGA 播放器状态 | 播放器管理、状态控制、播放控制 |
| `docs/assets/js/controllers/view-controller.js` | 视图控制器，管理页面视图状态 | 视图管理、状态控制、页面布局 |

### 6. 服务模块 (docs/assets/js/service/)

| 文件路径 | 功能描述 | 关键词 |
|---------|---------|--------|
| `docs/assets/js/service/config-loader.js` | 配置加载器，加载应用配置 | 配置管理、配置加载、应用配置 |
| `docs/assets/js/service/dual-channel-*.js` | 双通道 MP4 相关服务 | 双通道、MP4 服务、视频处理 |
| `docs/assets/js/service/ffmpeg/` | FFmpeg 相关服务，用于视频转换 | FFmpeg、视频转换、服务模块 |
| `docs/assets/js/service/gif/` | GIF 导出相关服务 | GIF 导出、服务模块、动画处理 |
| `docs/assets/js/service/image-compression-service.js` | 图片压缩服务，用于素材图片压缩 | 图片压缩、服务模块、图像处理 |
| `docs/assets/js/service/library-loader.js` | 库加载器，动态加载第三方库 | 库管理、动态加载、第三方库 |
| `docs/assets/js/service/resource-manager.js` | 资源管理器，管理应用资源 | 资源管理、资源加载、资源释放 |
| `docs/assets/js/service/site-config-loader.js` | 站点配置加载器，加载站点配置 | 站点配置、配置加载、服务模块 |
| `docs/assets/js/service/svga/` | SVGA 相关服务，用于 SVGA 处理 | SVGA 服务、格式处理、动画服务 |
| `docs/assets/js/service/task-manager.js` | 任务管理器，管理应用任务 | 任务管理、异步任务、任务调度 |

### 7. 工具模块 (docs/assets/js/utils/)

| 文件路径 | 功能描述 | 关键词 |
|---------|---------|--------|
| `docs/assets/js/utils/file-validator.js` | 文件验证工具，验证上传文件的合法性 | 文件验证、上传验证、合法性检查 |
| `docs/assets/js/utils/utils.js` | 通用工具函数，包含各种辅助功能 | 工具函数、辅助功能、通用工具 |

### 8. 库文件 (docs/assets/js/lib/)

| 文件路径 | 功能描述 | 关键词 |
|---------|---------|--------|
| `docs/assets/js/lib/ffmpeg.min.js` | FFmpeg 库，用于视频转换 | FFmpeg、视频转换、第三方库 |
| `docs/assets/js/lib/gif.js` | GIF 编码器，用于 GIF 导出 | GIF 编码、第三方库、动画处理 |
| `docs/assets/js/lib/howler.min.js` | 音频库，用于音频处理 | 音频处理、第三方库、音效 |
| `docs/assets/js/lib/konva.min.js` | Konva 图形库，用于画布操作 | Konva、图形库、画布操作 |
| `docs/assets/js/lib/lottie.min.js` | Lottie 动画库，用于 Lottie 动画播放 | Lottie、动画库、动画播放 |
| `docs/assets/js/lib/pako.min.js` | 压缩库，用于 SVGA 文件压缩和解压缩 | 压缩库、SVGA 处理、第三方库 |
| `docs/assets/js/lib/protobuf.min.js` | Protocol Buffers 库，用于 SVGA 文件解析 | Protocol Buffers、SVGA 解析、第三方库 |
| `docs/assets/js/lib/svga.min.js` | SVGA 播放器库，用于 SVGA 动画播放 | SVGA 播放器、动画播放、第三方库 |
| `docs/assets/js/lib/vue.min.js` | Vue.js 框架，用于页面交互和组件管理 | Vue.js、框架、组件管理 |

### 8. 样式与资源文件

| 文件路径 | 功能描述 | 关键词 |
|---------|---------|--------|
| `docs/assets/css/` | 样式文件目录，包含应用的 CSS 样式 | 样式文件、CSS、样式设计 |
| `docs/assets/img/` | 图片资源目录，包含应用使用的各种图标和图片 | 图片资源、图标、静态资源 |
| `docs/assets/fonts/` | 字体资源目录，包含应用使用的字体文件 | 字体资源、字体文件、静态资源 |
| `docs/assets/mingren_gift_1photo/` | 名人礼物相关资源 | 名人礼物、资源文件、静态资源 |
| `docs/assets/sth_auto_img/` | 素材自助相关图片资源 | 素材自助、图片资源、静态资源 |
| `docs/assets/svga/` | SVGA 示例文件目录 | SVGA 示例、示例文件、静态资源 |

### 9. 小工具集合 (docs/gadgets/)

| 文件路径 | 功能描述 | 关键词 |
|---------|---------|--------|
| `docs/gadgets/png_compression.html` | PNG 压缩工具页面 | PNG 压缩、小工具、图片优化 |
| `docs/gadgets/png_compression.js` | PNG 压缩工具的 JavaScript 逻辑 | PNG 压缩、JavaScript、图片处理 |
| `docs/gadgets/png_compression.css` | PNG 压缩工具的样式文件 | PNG 压缩、CSS、样式设计 |
| `docs/gadgets/fix_garbled_text.html` | 修复中文乱码工具页面 | 中文乱码、修复工具、字符编码 |
| `docs/gadgets/fix_garbled_logic.js` | 修复中文乱码的核心逻辑 | 中文乱码、修复逻辑、字符编码 |
| `docs/gadgets/common_chars.js` | 常用字符集数据 | 字符集、数据文件、字符编码 |
| `docs/gadgets/encoding-indexes.js` | 编码索引数据 | 编码索引、数据文件、字符编码 |

### 10. 根目录文档和配置文件

| 文件路径 | 功能描述 | 关键词 |
|---------|---------|--------|
| `README.md` | 项目主 README，包含功能概览和使用说明 | 项目说明、功能概览、使用指南 |
| `CODE_STYLE.md` | 代码风格规范文档 | 代码规范、编码标准、风格指南 |
| `DEVELOPMENT_FLOW.md` | 开发流程文档 | 开发流程、工作流、开发规范 |
| `UPDATE_LOG.md` | 更新日志，记录版本更新内容 | 更新日志、版本记录、变更历史 |
| `ROADMAP.md` | 项目 roadmap，包含未来规划 | 项目规划、roadmap、未来计划 |
| `SVGA-TO-MP4-TECHNICAL-DOCUMENTATION.md` | SVGA 转 MP4 功能的技术文档 | SVGA 转 MP4、技术文档、实现说明 |
| `SVGA_AUDIO_IMPL.md` | SVGA 音频实现技术文档 | SVGA 音频、技术文档、实现说明 |
| `TECH-RESEARCH.md` | 技术研究文档，包含各种技术调研结果 | 技术研究、调研文档、技术分析 |
| `site-config.json` | 站点配置文件 | 站点配置、配置文件、应用配置 |
| `.gitignore` | Git 忽略文件配置 | Git、忽略文件、版本控制 |
| `.traerc` | Trae 配置文件 | Trae、配置文件、开发工具 |
| `CNAME` | 域名配置文件 | 域名配置、CNAME、部署配置 |

### 11. 其他工具和脚本

| 文件路径 | 功能描述 | 关键词 |
|---------|---------|--------|
| `generate-sprite.py` | 生成 sprite 图片的脚本 | Sprite 生成、脚本工具、图片处理 |
| `csv_to_json.py` | CSV 转 JSON 的脚本 | CSV 转换、JSON、脚本工具 |
| `start_server.py` | 启动本地服务器的脚本 | 服务器启动、本地开发、脚本工具 |
| `download_libs.ps1` | 下载第三方库的 PowerShell 脚本 | 库下载、PowerShell、脚本工具 |
| `deploy.ps1` | 部署脚本，用于应用部署 | 部署脚本、PowerShell、部署工具 |
| `git-push.ps1` | Git 推送脚本，用于代码推送 | Git、推送脚本、版本控制 |
| `run-*.ps1` | 运行脚本，用于本地开发和测试 | 运行脚本、本地开发、测试工具 |

## 使用说明

1. **按关键词查找**：通过关键词列可以快速定位相关功能
2. **按模块查找**：根据模块分类查找相关功能
3. **按文件路径查找**：直接通过文件路径定位具体文件

## 维护指南

- 新增功能时，请在对应模块下添加索引条目
- 修改功能时，请及时更新索引描述
- 删除功能时，请同步删除对应的索引条目

## 版本信息

- 索引版本：1.0.0
- 最后更新：[2026-01-25 07:00:09]
- 适用项目版本：v1.0.0
