## 更新日志 (UPDATE_LOG)

> 本日志由 Coder Skill 自动维护，禁止手动编辑。
> 详细规则请参阅 [.trae/rules/core/workflows.ts.md](../rules/core/workflows.ts.md)

## 记录列表

[2026-03-05 21:33:23] 【修改文件】 : src/index.html - 同步引入 protobuf.min.js 和 pako.min.js，消除 SVGA 音频解析时的库动态加载延迟
[2026-03-05 21:33:23] 【修改文件】 : src/assets/js/core/app.js - 优化 SVGA 加载性能：1) 移除 parseSvgaAudioData 中的库动态加载调用；2) 内联 svga.proto 定义，避免网络请求；3) 添加无音频 SVGA 的智能跳过逻辑
[2026-03-05 21:33:23] 【新增文件】 : .trae/documents/svga_load_optimization_plan.md - SVGA 加载性能优化计划文档
[2026-03-05 21:22:22] 【修改文件】 : docs/404.html - 同步更新 404 页面
[2026-03-05 21:22:22] 【修改文件】 : docs/assets/index-DEbU6qBq.css - 同步更新构建后的样式文件
[2026-03-05 21:22:22] 【修改文件】 : docs/assets/js/core/app.js - 同步更新构建后的核心应用文件
[2026-03-05 21:22:22] 【修改文件】 : docs/assets/png_compression-CqcJW1Sj.css - 同步更新构建后的 PNG 压缩页面样式
[2026-03-05 21:22:22] 【修改文件】 : docs/assets/styles-CxEh8Cq_.css - 同步更新构建后的主样式文件
[2026-03-05 21:22:22] 【修改文件】 : docs/index.html - 同步更新构建后的主页面
[2026-03-05 21:22:22] 【修改文件】 : src/index.html - 更新源文件
[2026-03-05 21:22:22] 【新增文件】 : .trae/documents/svga_load_optimization_plan.md - 新增 SVGA 加载优化计划文档
[2026-03-05 02:41:02] 【删除文件夹】 : src/assets/js/lib/ffmpeg/ - 删除本地 FFmpeg Core 目录，已改用腾讯云 CDN 加速，不再需要本地文件
[2026-03-05 02:30:09] 【修改文件】 : src/assets/js/service/ffmpeg/ffmpeg-service.js - 将 FFmpeg Core Path 改为腾讯云CDN地址 https://blog-1258489735.cos.ap-chengdu.myqcloud.com/other/lib/ffmpeg/ffmpeg-core.js
[2026-03-05 02:09:05] 【新增文件】 : src/assets/js/lib/ffmpeg/ffmpeg-core.js - FFmpeg Core 主文件（从 unpkg @ffmpeg/core@0.11.0 下载）
[2026-03-05 02:09:05] 【新增文件】 : src/assets/js/lib/ffmpeg/ffmpeg-core.worker.js - FFmpeg Core Worker 文件（从 unpkg @ffmpeg/core@0.11.0 下载）
[2026-03-05 02:09:05] 【新增文件】 : src/assets/js/lib/ffmpeg/ffmpeg-core.wasm - FFmpeg Core WASM 文件（从 unpkg @ffmpeg/core@0.11.0 下载，约25MB）
[2026-03-05 02:09:05] 【修改文件】 : src/assets/js/service/ffmpeg/ffmpeg-service.js - 将 FFmpeg Core Path 从 unpkg CDN 改为本地路径 assets/js/lib/ffmpeg/ffmpeg-core.js，支持部署到腾讯云CDN加速
[2026-03-05 02:09:05] 【修改文件】 : src/assets/js/service/library-loader.js - 将 ffmpeg 库主URL改为本地路径，unpkg CDN 作为备用
[2026-03-05 16:30:00] 【修改文件】 : src/index.html - 引入 frame-capture-service.js 脚本，更新 app.js 版本号以强制刷新缓存
[2026-03-05 16:30:00] 【新增文件】 : src/assets/js/service/frame-capture-service.js - 新增帧捕获服务 FrameCaptureService，统一处理动画帧的跳转、等待、捕获逻辑，提供流式回调接口，支持 WebP/GIF/序列帧导出
[2026-03-05 16:30:00] 【修改文件】 : src/assets/js/service/frames/frames-exporter.js - 重构序列帧导出器，移除内部循环录制逻辑，适配 FrameCaptureService 的流式写入模式
[2026-03-05 16:30:00] 【修改文件】 : src/assets/js/core/app.js - 重构序列帧、WebP、GIF 导出功能，集成 FrameCaptureService，修复序列帧导出只获取第一帧的 Bug，统一导出逻辑
[2026-03-05 16:30:00] 【修改文件】 : INDEX.md - 更新功能索引，添加 FrameCaptureService 服务
[2026-03-03 03:55:53] 【修改文件】 : src/assets/js/core/material-editor.js - 恢复使用 Konva listening 属性控制图层交互：选中底图层时设置文字层 listening(false) 使事件穿透，点击空白区域或选中文案层时恢复 listening(true)，切换选择需要点击两次
[2026-03-03 03:46:14] 【修改文件】 : src/assets/js/core/material-editor.js - 修复素材编辑器拖动卡顿问题：在 mousedown 时临时禁用所有图层的 draggable，避免 Konva 原生拖动机制与手动拖动逻辑冲突，mouseup/mouseleave 时恢复原状态
[2026-03-03 03:36:05] 【修改文件】 : src/assets/js/core/material-editor.js - 重构素材编辑器图层交互：完全重写点击/拖动判断逻辑，在 mouseup 时判断点击（时间<300ms 且 位移<5px），在 mousemove 时判断拖动（位移≥5px），解决拖动卡顿问题，实现流畅的穿透拖动交互
[2026-03-03 03:17:50] 【修改文件】 : src/assets/js/core/material-editor.js - 优化素材编辑器图层交互：基于移动距离阈值(5px)区分点击和拖动操作，点击选中文案层，拖动则移动已选中的底图层，实现精准的交互区分
[2026-03-03 03:07:30] 【修改文件】 : src/assets/js/core/material-editor.js - 优化素材编辑器图层交互：选中底图层时在文案层上点击可选中文案层，拖动则转发到底图层，实现点击选中上层、拖动操作下层的智能交互
[2026-03-03 02:54:38] 【修改文件】 : src/assets/js/core/material-editor.js - 修复素材编辑器图层遮挡问题：选中底图层时设置文字层 listening(false) 使事件穿透，选中文字层或点击空白区域时恢复 listening(true)
[2026-03-02 13:25:25] 【修改文件】 : src/assets/js/core/app.js - 修复双通道MP4恢复播放问题：在 restorePlayback 函数中保存并恢复 YYEVA 的 isYyeva 和 yyevaData 数据，确保带key的双通道MP4在恢复播放后仍然保持 YYEVA 播放模式
[2026-03-02 13:17:10] 【修改文件】 : src/index.html - 引入 material-editor 服务模块脚本（text-renderer.js、image-transformer.js、material-composer.js、material-editor-service.js、index.js），确保 Mixin 可访问服务模块
[2026-03-02 13:17:10] 【修改文件】 : docs/index.html - 同步引入 material-editor 服务模块脚本
[2026-03-02 13:15:42] 【修改文件】 : src/assets/js/core/material-operations.js - 重构：移除已迁移到 TextRenderer 的 filterTextStyle 和 convertStylesToCssString 方法，更新文件头部注释说明迁移路径
[2026-03-02 13:15:42] 【修改文件】 : src/assets/js/core/material-editor.js - 更新样式处理方法调用，从 MaterialOperations 改为 TextRenderer 服务
[2026-03-02 13:04:15] 【新增文件】 : src/assets/js/components/material-editor-ui.js - 新增素材编辑器 UI 组件，挂载到 MeeWoo.Components.MaterialEditorUI，提供 open/close 方法，集成 MaterialEditorService 实现底图上传、文字编辑、图片变换等功能
[2026-03-02 12:55:04] 【新增文件】 : src/assets/js/service/material-editor/material-editor-service.js - 新增素材编辑器服务主类，组合 TextRenderer、ImageTransformer、MaterialComposer 三个服务，提供统一的编辑器实例管理
[2026-03-02 12:48:22] 【新增文件】 : src/assets/js/service/material-editor/text-renderer.js - 新增文字渲染服务，支持CSS样式过滤、渐变填充、文字阴影、文字描边等特效，返回PNG格式DataURL
[2026-03-02 12:47:06] 【新增文件】 : src/assets/js/service/material-editor/image-transformer.js - 新增图片变换服务，支持 URL/Blob/Base64 图片加载，提供 cover/contain 两种填充模式的图片变换功能
[2026-03-02 02:49:55] 【修改文件】 : src/assets/js/components/yyeva-key-panel.js - YYEVA key素材替换功能扩展：支持MP4视频上传，预览区显示中间帧，hover时自动播放视频，新增视频替换相关的数据管理和交互逻辑
[2026-03-02 02:49:55] 【修改文件】 : src/assets/js/service/yyeva/yyeva-renderer.js - 新增视频渲染支持：实现 _renderVideo 和 _renderVideoWithMask 方法，支持视频帧渲染与蒙版透明度应用，保持与图片渲染相同的cover缩放模式和蒙版处理机制
[2026-03-02 02:49:55] 【修改文件】 : src/assets/js/core/app.js - 新增替换视频的同步控制功能：实现视频元素生命周期管理（_createReplacedVideoElement、_cleanupReplacedVideos、_removeReplacedVideo）、播放状态同步（_syncReplacedVideosPlayState）、时间同步（_syncReplacedVideosTime）及相关的事件处理方法（handleYyevaVideoReplaced、handleYyevaVideoRestored），在模块清理时释放资源
[2026-03-02 02:49:55] 【修改文件】 : src/assets/js/controllers/player-controller.js -双通道MP4播放适配器：在播放、暂停、进度跳转时同步控制所有替换视频元素，保持与主播放器完全一致的播放状态和时间进度
[2026-03-02 02:49:55] 【修改文件】 : src/assets/css/panel.css - 新增YYEVA视频替换的预览样式：支持 .yyeva-key-thumb-video视频元素展示，添加 .yyeva-key-thumb-badge视频角标标识，优化 .yyeva-key-meta-video 类型信息文本样式，包含深色模式适配
[2026-03-02 02:49:55] 【修改文件】 : src/index.html - 为 YYEVA Key面板组件新增属性绑定和事件处理：添加 replaced-videos 数据属性，增加 video-replaced 和 video-restored 事件监听器，实现完整视频替换功能的数据流传递
[2026-03-02 02:49:55] 【修改文件】 : docs/index.html - 与 src/index.html 保持一致的修改
[2026-03-02 14:30:00] 【修改文件】 : src/coi-serviceworker.js - 参考官方coi-serviceworker重写：credentialless模式不需要为资源设置CORP头，同时解决GIF Worker和FFmpeg wasm加载问题
[2026-03-02 14:30:00] 【修改文件】 : src/index.html - Service Worker版本号升级到v=13
[2026-03-02 14:00:00] 【修改文件】 : src/coi-serviceworker.js - 修复线上FFmpeg加载失败：对CDN请求改用显式fetch透传模式（而非跳过），解决COEP环境下跨域wasm加载问题
[2026-03-02 14:00:00] 【修改文件】 : src/index.html - Service Worker版本号升级到v=12
[2026-03-02 13:30:00] 【修改文件】 : src/coi-serviceworker.js - 修复GitHub Pages线上GIF导出卡在编码中：扩大CORP头适用范围至所有同源JS/WASM文件，使用same-origin策略
[2026-03-02 13:30:00] 【修改文件】 : src/index.html - Service Worker版本号升级到v=11
[2026-03-02 13:30:00] 【修改文件】 : vite.config.js - 优化开发服务器CORS中间件，为所有JS/WASM文件添加CORP头
[2026-03-02 02:00:00] 【修改文件】 : vercel.json - 修复线上GIF导出卡在50%：将COEP/COOP/CORP响应头配置添加到根目录vercel.json（Vercel使用根目录配置）
[2026-03-02 01:00:00] 【修改文件】 : src/coi-serviceworker.js - 修复Worker脚本被COEP策略阻止加载：为Worker请求添加CORP响应头
[2026-03-02 01:00:00] 【修改文件】 : docs/coi-serviceworker.js - 同步修复
[2026-03-02 01:00:00] 【修改文件】 : src/index.html - Service Worker版本号升级到v=10
[2026-03-02 01:00:00] 【修改文件】 : docs/index.html - Service Worker版本号升级到v=10
[2026-03-02 00:30:00] 【修改文件】 : src/vercel.json - 修复线上GIF导出卡在50%问题：添加Cross-Origin-Resource-Policy响应头，解决Worker被COEP策略阻止
[2026-03-02 00:30:00] 【修改文件】 : docs/vercel.json - 修复线上GIF导出卡在50%问题：添加Cross-Origin-Resource-Policy响应头
[2026-02-28 10:47:24] 【修改文件】 : src/index.html - 为MP4、Lottie、序列帧、双通道MP4模式底部浮层添加更多导出按钮及hover菜单，统一导出功能入口，提升界面一致性
[2026-02-28 10:08:43] 【修改文件】 : src/index.html - SVGA模式底部浮层增加更多导出按钮，hover展开菜单显示转序列帧/转GIF/转webp选项，优化界面布局
[2026-02-28 10:08:43] 【修改文件】 : src/assets/css/styles.css - 新增更多导出按钮及hover菜单样式，包含浅色/暗黑模式适配，44x44方形按钮使用output_more图标
[2026-02-28 04:15:00] 【新增文件】 : src/assets/js/service/yyeva/yyeva-render-worker.js - 新增 YYEVA 渲染 Web Worker，实现双通道 MP4 像素合成的后台线程处理，使用查找表优化和 Transferable Objects 零拷贝传输
[2026-02-28 04:15:00] 【修改文件】 : src/assets/js/core/app.js - 双通道 MP4 渲染性能优化：集成 Web Worker 后台渲染模式，添加智能动态渲染频率（≤30fps使用视频帧率，>30fps使用60fps），实现主线程回退机制
[2026-02-28 02:57:21] 【修改文件】 : src/assets/js/core/material-interactions.js - 修复 SVGA 模式编辑素材图弹窗的视图模式切换按钮问题：使用 getClientRect() 实现正确的居中逻辑，1:1 和适应画布按钮都能正确居中显示
[2026-02-28 02:57:21] 【修改文件】 : src/assets/js/core/material-editor.js - 修复素材图编辑弹窗第一次拖动画布无响应的问题：添加 mouseenter 事件监听器实现无感激活舞台拖拽，初始化时启用 draggable 并使用 batchDraw() 确保图层交互状态
[2026-02-28 01:30:03] 【修改文件】 : src/assets/js/service/gif/gif-exporter.js - 使用 TimerService 管理 URL 清理，替换 setTimeout 为 createDelay，分组 ID 为'gif-export'
[2026-02-28 01:30:03] 【修改文件】 : src/assets/js/service/svga/svga-builder.js - 使用 TimerService 管理 SVGA 帧提取时的 URL 清理，替换 setTimeout 为 createDelay，分组 ID 为'svga-frame-extract'
[2026-02-27 01:18:00] 【修改文件】 : src/assets/css/panel.css - 修复 yyeva-key-text-field 输入框背景透明问题，添加组合选择器提高优先级覆盖 base-input 的透明背景
[2026-02-27 01:12:00] 【修改文件】 : src/assets/js/core/material-editor.js - 添加完整的代码注释，包括 data、computed、watch、methods 各部分的中文注释
[2026-02-27 01:05:00] 【修改文件】 : src/assets/js/core/material-editor.js - 修复素材编辑弹窗图层选择后另一图层仍可拖动的问题，选中时取消另一图层的draggable状态
[2026-02-27 00:36:30] 【修改文件】 : src/assets/css/styles.css - 修改帮助文档h1和h2标题字重为400
[2026-02-26 23:54:42] 【修改文件】 : src/assets/css/styles.css - 添加帮助文档h1和h2标题样式，h1字号1.7em，h2字号1.3em
[2026-02-26 23:54:42] 【修改文件】 : src/help.md - 在特色功能部分添加带key的双通道MP4功能说明
[2026-02-26 19:25:00] 【修改文件】 : src/assets/js/service/yyeva/yyeva-renderer.js - 修复三个问题：1)图片再次替换不更新（setImage时清除图片缓存）；2)文本恢复默认不生效（setText空对象时删除text属性）；3)文本 key默认显示 ID改为空字符串
[2026-02-26 19:15:00] 【修改文件】 : src/assets/js/components/yyeva-key-panel.js - 修复key素材替换弹窗上传图片后预览区不更新问题，使用Vue2的$set/$delete方法确保响应式更新
[2026-02-26 19:10:00] 【修改文件】 : src/index.html - 序列帧模式和Lottie模式底部浮层去掉"下载文件..."按钮
[2026-02-26 18:40:00] 【修改文件】 : .trae/documents/侧边弹窗开发经验文档.md - 添加 Vue Mixin 方法被 app.js 覆盖问题案例，更新开发检查清单和经验教训总结
[2026-02-26 18:35:00] 【修改文件】 : src/assets/js/core/app.js - 删除冗余的 openMaterialEditor 方法定义，该方法覆盖了 material-editor.js mixin 中的同名方法，导致 Konva 初始化逻辑丢失
[2026-02-26 18:35:00] 【修改文件】 : ai_protocol_hub/tool_guides/EXPERIENCES.md - 添加 Vue Mixin 方法覆盖问题的开发经验
[2026-02-26 17:30:00] 【修改文件】 : src/assets/js/core/material-editor.js - 修复素材图编辑弹窗Konva渲染问题：1) 添加容器尺寸有效性检查，尺寸为0时自动延迟重试；2) 延迟初始化时机，确保CSS过渡动画完成后才初始化；3) 统一图片渲染逻辑，修复initKonvaBaseImage和updateKonvaBaseImage中的尺寸计算和偏移设置不一致问题
[2026-02-26 16:05:00] 【修改文件】 : src/assets/js/core/app.js - 修复YYEVA图片key蒙版不生效问题：传递完整视频帧数据用于提取蒙版形状
[2026-02-26 16:05:00] 【修改文件】 : src/assets/js/service/yyeva/yyeva-renderer.js - 实现真正的YYEVA蒙版提取和应用逻辑：从outputFrame位置提取蒙版并应用到替换图片
[2026-02-26 02:18:49] 【修改文件】 : src/index.html - 帮助按钮改为点击弹出浮层，添加遮罩层和关闭按钮
[2026-02-26 02:18:49] 【修改文件】 : src/assets/css/styles.css - 帮助浮层改为居中显示，宽度70%，添加标题栏和关闭按钮样式
[2026-02-26 02:18:49] 【修改文件】 : src/assets/js/core/app.js - 新增 showHelp 状态、toggleHelp/closeHelp 方法
[2026-02-26 02:15:43] 【修改文件】 : src/help.md - 重构帮助文档大纲：改为快捷操作、格式转换、格式支持情况、特色功能、使用注意五大板块；补充SVGA导出序列帧/WebP、MP4绿幕抠图、多段变速等功能说明
[2026-02-26 01:49:21] 【修改文件】 : copy-static.py - 添加已压缩JS文件排除规则，避免对gif.js和gif.worker.js进行二次压缩
[2026-02-26 01:49:21] 【修改文件】 : src/assets/js/service/gif/gif-exporter.js - 移除调试代码，关闭debug模式
[2026-02-25 13:28:00] 【修改文件】 : src/assets/js/core/material-editor.js - 实现显示区域与导出区域分离：Stage尺寸改为容器尺寸，添加蓝色虚线参考线标识导出区域，导出时创建临时Stage
[2026-02-25 13:28:00] 【修改文件】 : src/assets/js/core/material-editor.js - 实现文案canvas动态尺寸：根据文案实际尺寸自动调整canvas区域，支持对齐方式变化时正确偏移
[2026-02-25 13:28:00] 【修改文件】 : src/assets/js/core/material-editor.js - 实现底图和文案的选中状态：添加Konva Transformer手柄支持比例缩放，选中后才可移动
[2026-02-25 13:28:00] 【修改文件】 : src/assets/js/core/material-state.js - 新增exportAreaX/Y状态，记录导出区域在画布中的位置
[2026-02-25 13:28:00] 【修改文件】 : src/index.html - 素材编辑器容器改为100%尺寸，移除固定尺寸和transform缩放
[2026-02-25 13:28:00] 【新增文件】 : .trae/skills/konva/references/experience.md - 新增Konva开发经验总结文档，包含6条实际开发经验
[2026-02-25 13:28:00] 【修改文件】 : .trae/skills/konva/SKILL.md - 添加经验文档引用
[2026-02-25 13:28:00] 【新增文件】 : .trae/skills/webapp-testing/examples/konva_editor_testing.py - 新增Konva素材编辑器测试模板
[2026-02-25 13:28:00] 【修改文件】 : .trae/skills/webapp-testing/SKILL.md - 添加konva_editor_testing.py测试模板引用
[2026-02-25 10:23:00] 【修改文件】 : src/assets/js/core/material-operations.js - 修复素材编辑器重新打开时不渲染的问题：打开编辑器前重置baseImage为null确保Vue $watch触发
[2026-02-15 02:10:00] 【修改文件】 : src/assets/js/core/app.js - 新增 resetExportPanelSizes 方法；在 clearAll、restorePlayback、handleFile、handleFiles 中调用，实现文件状态重置时清空尺寸配置
[2026-02-15 02:10:00] 【修改文件】 : src/assets/js/components/gif-panel.js - 修改尺寸初始化逻辑：优先使用用户上次修改的尺寸，仅在配置无效时才使用原始尺寸
[2026-02-15 02:10:00] 【修改文件】 : src/assets/js/components/frames-panel.js - 修改尺寸初始化逻辑：优先使用用户上次修改的尺寸
[2026-02-15 02:10:00] 【修改文件】 : src/assets/js/components/webp-panel.js - 修改尺寸初始化逻辑：优先使用用户上次修改的尺寸
[2026-02-15 02:10:00] 【修改文件】 : src/assets/js/components/standard-mp4-panel.js - 修改尺寸初始化逻辑：优先使用用户上次修改的尺寸
[2026-02-15 02:10:00] 【修改文件】 : src/assets/js/components/dual-channel-panel.js - 修改尺寸初始化逻辑：优先使用用户上次修改的尺寸
[2026-02-15 02:10:00] 【修改文件】 : src/assets/js/components/to-svga-panel.js - 修改尺寸初始化逻辑：优先使用用户上次修改的尺寸
[2026-02-15 01:55:00] 【修改文件】 : src/assets/js/components/frames-panel.js - 修复尺寸无法修改问题：移除 initialConfig 的 deep watcher，避免 config-change 触发重置
[2026-02-15 01:55:00] 【修改文件】 : src/assets/js/components/webp-panel.js - 修复尺寸无法修改问题：移除 initialConfig 的 deep watcher，避免 config-change 触发重置
[2026-02-15 01:50:00] 【修改文件】 : src/assets/js/core/app.js - 给 toSvgaSourceInfo 添加 width/height 属性，修复双通道MP4模式下转SVGA默认尺寸显示0的问题
[2026-02-15 01:50:00] 【修改文件】 : src/assets/js/components/frames-panel.js - 添加 aspectRatio 保护，修复尺寸输入问题
[2026-02-15 01:50:00] 【修改文件】 : src/assets/js/components/webp-panel.js - 添加 aspectRatio 保护，修复尺寸输入问题
[2026-02-15 01:50:00] 【修改文件】 : src/assets/js/components/to-svga-panel.js - 添加尺寸范围验证（1-3000）和 aspectRatio 保护
[2026-02-15 01:45:00] 【修改文件】 : src/assets/js/core/app.js - 修复WebP导出不支持变速的问题：添加帧映射表支持，使变速后的MP4能正确导出为WebP动画
[2026-02-15 01:40:00] 【修改文件】 : src/assets/js/components/webp-panel.js - 修复尺寸比例误差：始终使用原始文件比例；尺寸不再保存上次输入
[2026-02-15 01:40:00] 【修改文件】 : src/assets/js/components/gif-panel.js - 尺寸不再保存上次输入，始终使用当前文件原始尺寸
[2026-02-15 01:40:00] 【修改文件】 : src/assets/js/components/frames-panel.js - 修复尺寸比例误差；尺寸不再保存上次输入
[2026-02-15 01:40:00] 【修改文件】 : src/assets/js/components/standard-mp4-panel.js - 尺寸不再保存上次输入，始终使用当前文件原始尺寸
[2026-02-15 01:40:00] 【修改文件】 : src/assets/js/components/dual-channel-panel.js - 修复尺寸比例误差；尺寸不再保存上次输入
[2026-02-15 01:40:00] 【修改文件】 : src/assets/js/components/to-svga-panel.js - 修复尺寸比例误差；尺寸不再保存上次输入
[2026-02-15 01:35:00] 【修改文件】 : src/assets/js/service/image-compression-service.js - 清理PNG压缩冗余日志：移除oxipng/pako/browser压缩成功的console.log，保留失败日志
[2026-02-15 01:30:00] 【修改文件】 : src/index.html - 底部浮层播放时间显示加上总时长，格式如"1.51s/9.00s"
[2026-02-15 01:25:00] 【修改文件】 : src/assets/js/core/app.js - 清理转SVGA/双通道相关冗余调试日志：帧提取进度、音频变速预处理等console.log
[2026-02-15 01:20:00] 【修改文件】 : src/assets/js/core/app.js - 删除转SVGA冗余代码：移除closeYyeva/Mp4/LottieToSvgaPanel、cancel、onWidthChange/onHeightChange等方法（已由panel-mixin统一处理）
[2026-02-15 01:15:00] 【修改文件】 : src/assets/js/components/gif-panel.js - 新增 sourceFormatName prop 用于弹窗标题显示
[2026-02-15 01:15:00] 【修改文件】 : src/assets/js/components/frames-panel.js - 新增 sourceFormatName prop 用于弹窗标题显示
[2026-02-15 01:15:00] 【修改文件】 : src/assets/js/components/webp-panel.js - 新增 sourceFormatName prop 用于弹窗标题显示
[2026-02-15 01:15:00] 【修改文件】 : src/index.html - 给GIF/序列帧/WebP组件传递 source-format-name 属性
[2026-02-15 01:10:00] 【修改文件】 : src/assets/js/core/app.js - 新增 sourceFormatName 计算属性，用于转格式弹窗标题显示
[2026-02-15 01:10:00] 【修改文件】 : src/index.html - 优化转格式弹窗标题，改为"源格式 →→ 目标格式"形式（GIF/序列帧/WebP/双通道MP4/普通MP4/SVGA）
[2026-02-15 01:10:00] 【修改文件】 : src/assets/js/components/standard-mp4-panel.js - 弹窗标题改为"源格式 →→ MP4"，新增 sourceFormatName prop
[2026-02-15 01:10:00] 【修改文件】 : src/assets/js/components/dual-channel-panel.js - 弹窗标题改为"源格式 →→ 双通道MP4"，新增 sourceFormatName prop
[2026-02-15 01:10:00] 【修改文件】 : src/assets/js/components/to-svga-panel.js - 弹窗标题改为"源格式 →→ SVGA"，新增 sourceFormatName prop
[2026-02-15 00:50:00] 【修改文件】 : src/assets/js/core/app.js - 修复mini模式下PlayerController未创建问题：移除进度条存在的硬性要求，进度条和音量滑块改为可选
[2026-02-15 00:50:00] 【修改文件】 : src/assets/js/controllers/player-controller.js - 修复切换沉浸模式SVGA音频丢失：SvgaPlayerAdapter.destroy()不再卸载音频
[2026-02-15 00:35:00] 【修改文件】 : src/index.html - 架构优化：沉浸模式音量滑块改用ref引用，移除内联事件绑定
[2026-02-15 00:35:00] 【修改文件】 : src/assets/js/core/app.js - 架构优化：音量控制统一交给PlayerController，删除冗余的startVolumeDrag/updateVolume/stopVolumeDrag方法和isDraggingVolume状态
[2026-02-15 00:20:00] 【修改文件】 : src/assets/js/core/app.js - 体验优化：ViewportController初始化的zoomStep从0.1调整为0.05
[2026-02-15 00:15:00] 【修改文件】 : src/assets/js/core/app.js - 修复双通道MP4转SVGA报错：OffscreenCanvas使用convertToBlob()而非toBlob()，兼容两种 Canvas类型
[2026-02-15 00:05:00] 【修改文件】 : src/assets/js/controllers/viewport-controller.js - 体验优化：画布缩放步进从10%调整为5%
[2026-02-14 23:50:00] 【修改文件】 : src/index.html - 序列帧面板：修复按钮进度数字显示（乘100转百分比），移除重复的export-progress区域
[2026-02-14 23:40:00] 【修改文件】 : src/index.html - GIF面板：修复按钮进度数字显示（乘100转百分比），移除重复的export-progress区域
[2026-02-14 23:30:00] 【修改文件】 : src/index.html - WebP面板：修复按钮进度数字显示（乘100转百分比），移除重复的export-progress区域
[2026-02-14 23:15:00] 【新增文件】 : src/assets/js/service/webp/index.js - WebP服务索引文件
[2026-02-14 23:15:00] 【修改文件】 : README.md - 添加webpxmux.js到技术栈列表，更新WebP导出功能说明
[2026-02-14 22:10:00] 【新增文件夹】 : src/assets/js/lib/webpxmux/ - 新增webpxmux库目录
[2026-02-14 22:10:00] 【新增文件】 : src/assets/js/lib/webpxmux/webpxmux.min.js - webpxmux JS库文件
[2026-02-14 22:10:00] 【新增文件】 : src/assets/js/lib/webpxmux/webpxmux.wasm - webpxmux WASM文件
[2026-02-14 22:10:00] 【修改文件】 : src/assets/js/service/library-loader.js - 添加webpxmux库配置
[2026-02-14 22:10:00] 【修改文件】 : src/assets/js/service/webp/webp-exporter.js - 重写WebP导出器，从FFmpeg切换到webpxmux.js，修复帧叠加问题，支持透明背景
[2026-02-14 22:30:00] 【修改文件】 : src/assets/js/service/webp/webp-exporter.js - 重写WebP导出器，使用FFmpeg WASM编码动画WebP（修复只导出第一帧的bug）
[2026-02-14 22:30:00] 【修改文件】 : src/assets/js/components/webp-panel.js - 添加预估文件大小计算功能（computed属性estimatedInfo、formatBytes方法）
[2026-02-14 22:30:00] 【修改文件】 : src/index.html - 更新WebP面板模板，显示预估帧数和预估文件大小
[2026-02-14 22:30:00] 【修改文件】 : src/assets/js/core/app.js - WebP导出添加限制检查（时长>20秒或预估>10MB弹窗警告），初始化FFmpeg，传递totalFrames参数
[2026-02-14 18:00:00] 【修改文件】 : src/assets/js/service/gif/gif-exporter.js - 清理冗余调试日志，关闭debug模式
[2026-02-14 18:00:00] 【修改文件】 : src/assets/js/core/app.js - 清理双通道MP4转换流程的调试日志
[2026-02-14 18:00:00] 【修改文件】 : src/assets/js/service/dual-channel/dual-channel-composer.js - 清理Worker初始化调试日志
[2026-02-14 18:00:00] 【修改文件】 : src/assets/js/service/dual-channel/dual-channel-worker.js - 清理Worker启动确认日志
[2026-02-14 18:00:00] 【修改文件】 : src/assets/js/components/standard-mp4-panel.js - 清理组件挂载调试日志
[2026-02-14 18:00:00] 【修改文件】 : src/assets/js/components/webp-panel.js - 清理组件调试日志
[2026-02-14 18:00:00] 【修改文件】 : src/assets/js/service/webp/webp-exporter.js - 清理帧数据调试日志
[2026-02-14 18:00:00] 【删除文件】 : src/assets/js/mixins/panel-mixin copy.js - 删除冗余备份文件
[2026-02-14 17:30:00] 【修改文件】 : vite.config.js - 修复Vite开发模式Worker加载问题：添加中间件插件为Worker脚本添加CORS响应头
[2026-02-14 17:30:00] 【修改文件】 : src/assets/js/service/gif/gif-exporter.js - 启用gif.js的debug模式以获取完整Worker日志
[2026-02-14 17:30:00] 【修改文件】 : src/assets/js/lib/gif.js - 恢复原版0.2.0版本（带版本注释和sourcemap引用）
[2026-02-14 17:30:00] 【修改文件】 : src/_headers - 添加Cross-Origin-Resource-Policy响应头
[2026-02-14 17:30:00] 【修改文件】 : .trae/documents/侧边弹窗开发经验文档.md - 添加Vite开发服务器Worker加载问题案例（6.6章节）
[2026-02-14 17:30:00] 【修改文件】 : .trae/skills/web-worker/SKILL.md - 添加Vite开发服务器Worker加载问题排查章节（4.4）
[2026-02-14 17:30:00] 【修改文件】 : .trae/skills/web-worker/references/skill_checklist.md - 添加Vite Worker加载问题排查章节（4.4）
[2026-02-14 13:00:00] 【修改文件】 : src/assets/js/core/app.js - 修复SVGA转MP4弹窗宽高联动失效问题：standardMp4SourceInfo补充width/height/fps字段
[2026-02-14 12:45:00] 【修改文件】 : src/assets/js/components/standard-mp4-panel.js - 修复SVGA转MP4弹窗组件：添加quality/muted配置、添加start/cancel方法
[2026-02-14 12:30:00] 【修改文件】 : src/assets/js/components/standard-mp4-panel.js - 修复SVGA转MP4弹窗输入控件bug：宽高范围从0-3000改为1-3000，帧率范围从1-60改为1-120
[2026-02-11 20:30:00] 【修改文件】 : src/assets/js/controllers/player-controller.js - 清理调试代码，移除所有不必要的console.log语句，保留错误处理信息
[2026-02-10 16:48:29] 【修改文件】 : src/assets/js/components/dual-channel-panel.js - 清理调试日志，保留必要的错误信息
[2026-02-10 16:48:29] 【修改文件】 : src/assets/js/mixins/panel-mixin.js - 清理调试日志，移除所有不必要的控制台输出
[2026-02-10 16:48:29] 【修改文件】 : src/assets/js/core/app.js - 修复命名空间一致性问题，添加Components变量映射，更新组件注册代码
[2026-02-06 17:14:37] 【修改文件】 : INDEX.md - 更新功能索引，添加webp-panel和frames-panel组件的索引，并更新版本信息
[2026-02-06 17:14:37] 【修改文件】 : README.md - 更新功能概览，添加WebP导出功能的说明，包括SVGA模块和双通道MP4模块的WebP导出支持
[2026-02-06 17:14:37] 【新增文件】 : .trae/documents/弹窗开发问题分析与总结.md - 新增弹窗开发问题分析与总结文档，记录webp面板开发过程中遇到的问题和解决方案
[2026-02-06 17:14:37] 【修改文件】 : .trae/documents/侧边弹窗开发经验文档.md - 更新侧边弹窗开发经验文档，添加webp面板开发案例和相关最佳实践
[2026-02-06 02:58:58] 【新增文件】 : .trae/documents/项目文件管理规范.md - 新增项目文件管理规范文档，规范项目文件组织和命名，为AI生成文件和管理文件提供参考标准
[2026-02-05 16:00:00] 【修改文件】 : src/assets/js/mixins/panel-mixin.js - 添加插队加载ffmpeg的逻辑，当用户打开转SVGA弹窗时立即优先加载ffmpeg库
[2026-02-05 16:00:00] 【修改文件】 : src/assets/js/service/ffmpeg/ffmpeg-service.js - 移除备用线路的逻辑，确保固定使用主线路，不使用备用方案
[2026-02-05 16:00:00] 【修改文件】 : src/assets/js/core/app.js - 添加extractYyevaFramesOptimized方法，使用FFmpeg批量提取帧，移除降级到原始方法的逻辑，确保FFmpeg加载失败时直接报错
[2026-02-05 16:00:00] 【修改文件】 : src/assets/js/service/library-loader.js - 修改ffmpeg的配置，移除fallbackUrls，并修改loadSingleLibrary方法，确保当库没有fallbackUrls时，加载失败会直接报错而不是尝试其他URL
[2026-02-05 16:00:00] 【修改文件】 : README.md - 添加性能优化的相关内容，包括双通道MP4转SVGA的性能优化措施
[2026-02-05 16:00:00] 【修改文件】 : INDEX.md - 更新功能索引，添加extractYyevaFramesOptimized方法的索引，并更新版本信息
[2026-02-05 17:00:00] 【修改文件】 : src/assets/js/mixins/panel-mixin.js - 添加调试日志，优化插队加载ffmpeg的逻辑
[2026-02-05 17:00:00] 【修改文件】 : src/assets/js/service/ffmpeg/ffmpeg-service.js - 添加调试日志，确保固定使用ffmpeg的逻辑正确
[2026-02-05 17:00:00] 【修改文件】 : src/assets/js/core/app.js - 添加调试日志，修复extractYyevaFramesOptimized方法中的变量引用错误
[2026-02-05 17:00:00] 【修改文件】 : INDEX.md - 更新版本信息，从1.1.4更新到1.1.5
[2026-02-04 19:42:49] 【修改文件】 : src/assets/js/service/site-config-loader.js - 修改本地开发模式配置加载逻辑，尝试加载本地 site-config.json 文件，确保未登录用户侧边栏按钮被正确隐藏
[2026-02-04 19:17:41] 【修改文件】 : src/assets/js/controllers/user-type-controller.js - 实现响应式登录状态管理，添加观察者模式和登录状态轮询检测机制，扩展元素控制 API
[2026-02-04 19:17:41] 【修改文件】 : src/assets/js/core/app.js - 移除手动调用 UserTypeController.refresh() 的代码，使用自动登录状态轮询检测
[2026-03-01 21:06:18] 【新增文件】 : ai_protocol_hub/skill_specs/vite-guide.json - 新增 Vite 开发指南 skill 文件，基于项目实际配置，包含配置、构建、性能优化和常见问题解决方案
[2026-02-04 09:10:45] 【修改文件】 : src/assets/js/service/dual-channel/dual-channel-composer.js - 修复双通道合成器Web Worker加载问题，实现内联代码方式加载Worker，解决内存配额问题，添加分批处理机制
[2026-02-04 03:40:21] 【新增文件】 : copy-static.py - 新增 Python 版静态资源复制和压缩脚本
[2026-02-04 03:40:21] 【修改文件】 : package.json - 更新 copy-static 脚本为 Python 版本
[2026-02-04 02:50:24] 【新增文件】 : vite.config.js - 新增 Vite 构建配置文件
[2026-02-04 02:50:24] 【新增文件】 : copy-static.ps1 - 新增静态资源复制和压缩脚本
[2026-02-04 02:50:24] 【修改文件】 : package.json - 更新构建脚本和依赖，添加 Vite 相关配置
[2026-02-04 02:50:24] 【修改文件】 : src/assets/js/service/library-loader.js - 修复 ES 模块语法错误，替换 import() 为传统脚本加载
[2026-02-04 02:50:24] 【修改文件】 : README.md - 更新项目文档，添加 Vite 构建化相关信息
[2026-02-04 02:50:24] 【修改文件】 : INDEX.md - 更新文件路径索引，从 docs/ 改为 src/
[2026-01-01 09:30:00] 【新增文件】 : UPDATE_LOG.md - 新增文件
[2026-03-07 15:01:01] 【修改文件】 : .trae/skills/coder/scripts/log_change.py - 为日志脚本添加详细的中文注释和文档说明
[2026-03-07 15:05:00] 【修改文件】 : .trae/skills/coder/scripts/log_change.py - 修复 datetime.utcnow() 弃用警告
[2026-03-07 15:14:42] 【修改文件】 : .trae/logs/UPDATE_LOG.md - 清理冗余的规则说明文档，仅保留日志数据记录。 相关规则已迁移至 .trae/rules/core/workflows.ts.md，日志维护完全由 Coder Skill 自动化接管。
