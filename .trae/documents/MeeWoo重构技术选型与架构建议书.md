# MeeWoo 重构技术选型与架构建议书

## 1. 项目定位与核心挑战
MeeWoo 是一个集 **多格式动画预览**（SVGA/Lottie/MP4）、**可视化编辑**（素材替换/抠图）、**格式转换导出** 于一体的纯前端高性能工具站。

**核心技术挑战：**
*   **渲染压力大**：需要同时支持 Canvas (SVGA/Lottie)、Video (MP4)、WebGL (Konva) 多种渲染上下文。
*   **计算密集型**：前端进行 FFmpeg 转码、GIF 生成、关键帧提取，对内存和 CPU 占用极高。
*   **交互复杂度**：无限画布、多选拖拽、时间轴编辑、属性面板，状态管理极易混乱。

---

## 2. 推荐技术栈 (Tech Stack)

### 2.1 核心框架
*   **框架**：**Vue 3.4+** (Script Setup + Composition API)
    *   *理由*：相比 Vue 2，Vue 3 的 Proxy 响应式系统性能更强，且 Composition API 能完美解决旧项目中 Mixins 满天飞导致的逻辑混乱问题，非常适合抽取“播放器逻辑”、“画布逻辑”等复用模块。
*   **语言**：**TypeScript 5.x**
    *   *理由*：项目中存在大量复杂的二进制数据处理（SVGA Protobuf、文件流），TS 的类型系统能避免 90% 的“undefined”运行时错误，是重构稳定性的基石。
*   **构建工具**：**Vite 5.x**
    *   *理由*：保持现状，但需深度配置 WASM 支持（为 FFmpeg 准备）和 Worker 插件。

### 2.2 状态与路由
*   **状态管理**：**Pinia**
    *   *理由*：轻量、直观，完美支持 TS。建议采用 **Store 分治策略**（如 `usePlayerStore`, `useCanvasStore`, `useExportStore`），避免出现类似旧版 `app.js` 的上帝对象。
*   **路由**：**Vue Router 4**
    *   *理由*：标准配置，用于管理“首页”、“独立工具页”等。

### 2.3 图形与交互（重构核心）
*   **画布引擎**：**Konva.js + vue-konva**
    *   *理由*：针对你提出的“无限画布、拖拽缩放、多选变换”，Konva 是目前 Canvas 2D 领域最成熟的库。它自带的对象树管理、事件系统、选择器逻辑，能让你少写几千行底层代码。
*   **UI 组件库**：**Naive UI** 或 **TDesign Vue Next**
    *   *理由*：
        *   **Naive UI**：组件丰富，定制性强，TypeScript 支持极好，自带“暗黑模式”完美匹配设计需求。
        *   **TDesign**：腾讯出品，设计感强，适合做中后台/工具类产品。
    *   *建议*：**Naive UI**（因其无样式的原子化设计思想更适合高度定制的工具站）。

### 2.4 核心算法库
*   **多媒体处理**：**@ffmpeg/ffmpeg (WASM)** - 保持不变，升级到最新版。
*   **动画解析**：
    *   **svga-player-web** (继续沿用，或封装为组件)
    *   **lottie-web**
*   **工具库**：**VueUse**
    *   *理由*：提供大量现成的 Composition API，如 `useDropZone`（文件拖入）、`useClipboard`（复制）、`useWebWorker` 等，大幅减少手写工具函数。

---

## 3. 目录结构建议 (Directory Structure)

采用 **“特性文件夹 (Feature-First)”** 架构，将业务逻辑聚合，而不是按文件类型分散。

```text
src/
├── assets/                 # 静态资源
├── components/             # 通用基础组件 (BaseButton, BaseInput...)
│
├── core/                   # 核心引擎 (独立于 UI 的纯逻辑)
│   ├── canvas/             # Konva 画布管理器
│   │   ├── CanvasManager.ts
│   │   ├── SelectionManager.ts # 多选逻辑
│   │   └── ZoomManager.ts      # 无限画布缩放
│   ├── player/             # 统一播放控制器 (适配 SVGA/MP4/Lottie)
│   │   ├── PlayerAdapter.ts    # 播放器接口定义
│   │   ├── SvgaAdapter.ts
│   │   └── Mp4Adapter.ts
│   └── export/             # 导出管线
│       ├── TaskQueue.ts        # 任务队列
│       └── FFmpegWorker.ts
│
├── features/               # 业务功能模块 (包含 UI + Store + Logic)
│   ├── editor/             # 主编辑器模块
│   │   ├── components/     # 画布、属性面板、底部栏
│   │   ├── composables/    # useEditorState.ts
│   │   └── editor.store.ts
│   ├── preview/            # 预览模块
│   └── material/           # 素材管理模块
│
├── hooks/                  # 通用 Hooks (useTheme, useDrag)
├── layouts/                # 布局组件 (MainLayout)
├── types/                  # TS 类型定义 (*.d.ts)
├── utils/                  # 纯工具函数
├── App.vue
└── main.ts
```

---

## 4. 关键重构策略

### 4.1 无限画布与渲染层重构
*   **现状**：直接操作 DOM 元素 (`div.viewer-container`) 进行定位。
*   **新方案**：
    *   使用 `<v-stage>` (Konva) 作为唯一渲染容器。
    *   每个预览的动画（SVGA/MP4）封装为一个 **Konva 自定义图形 (Shape)** 或 **HTML 覆盖层**。
    *   **无限画布实现**：监听鼠标滚轮和拖拽事件，修改 `Stage` 的 `scale` 和 `position` 属性，而不是修改 DOM 元素的 CSS transform。

### 4.2 统一播放控制 (The Player Interface)
设计一个统一的 `IPlayer` 接口，抹平不同格式的差异：
```typescript
interface IPlayer {
  play(): void;
  pause(): void;
  seek(progress: number): void;
  destroy(): void;
  // 统一输出画面给导出器
  getFrame(time: number): Promise<Blob | ImageData>;
}
```
*   `SvgaPlayer` 实现该接口
*   `LottiePlayer` 实现该接口
*   `VideoPlayer` 实现该接口
*   **UI 层**（底部进度条、播放按钮）只认 `IPlayer` 接口，完全解耦具体格式。

### 4.3 状态管理模式 (Pinia)
*   `WorkspaceStore`：管理画布上的所有元素（位置、大小、选中状态）。
*   `SelectionStore`：管理当前选中的元素 ID 列表（支持 Shift 多选）。
*   `ExportStore`：管理导出任务队列和进度。

---

## 5. 开发路线图建议

1.  **脚手架搭建**：初始化 Vue 3 + TS + Pinia + Vite 项目。
2.  **核心迁移**：将 `src/assets/js/service` 下的算法文件（如 SVGA 解析、GIF 编码）迁移到新项目 `core/` 目录，并补充 TS 类型。
3.  **画布原型**：使用 Konva 实现一个简单的画布，支持拖入图片并缩放/移动（验证无限画布交互）。
4.  **播放器适配**：实现 `SvgaAdapter`，使其能渲染在 Konva 画布之上。
5.  **UI 组装**：开发底部浮层组件，对接 `SelectionStore` 实现多选操作。
6.  **功能补全**：逐步迁移导出、素材替换等高级功能。

---

此方案兼顾了开发效率（利用 Vue 3 生态）和运行性能（逻辑分层、WASM 优化），非常适合 MeeWoo 这种重交互的工具类应用。
