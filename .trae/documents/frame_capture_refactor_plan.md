# 帧捕获服务重构计划

## 1. 目标

解决序列帧导出功能中“只获取到同一帧”的 Bug，并将 WebP、序列帧导出的核心逻辑（帧控制与捕获）统一抽象为 `FrameCaptureService` 服务，以提高代码复用性、可维护性和性能。

## 2. 核心变更

### 2.1 新增 `FrameCaptureService`

创建 `src/assets/js/service/frame-capture-service.js`，负责：

* 统一的帧循环控制（支持 FPS 和总帧数）

* 统一的跳转等待机制（解决渲染延迟）

* 统一的截图接口（支持 OffscreenCanvas 和 Worker 优化准备）

* 错误重试与进度回调

### 2.2 重构 `FramesExporter`

修改 `src/assets/js/service/frames/frames-exporter.js`：

* 移除内部的 `requestAnimationFrame` 循环录制逻辑。

* 改为接受外部传入的帧数据（`addFrame` 接口）。

* 配合 `FrameCaptureService` 使用，实现“请求帧 -> 接收帧 -> 写入 ZIP”的流式处理。

### 2.3 适配 `App.js`

修改 `src/assets/js/core/app.js`：

* 引入 `FrameCaptureService`。

* 重构 `runFramesExport` 方法，使用新服务进行序列帧导出。

* 重构 `runWebpExport` 和 `runGifExport` 方法，统一使用 `FrameCaptureService` 进行帧获取与分发，彻底移除旧的循环跳转逻辑。

## 3. 详细步骤

### 阶段一：基础设施建设

1. **创建** **`FrameCaptureService`**

   * 实现 `capture(options)` 方法。

   * 参数：`fps`, `totalFrames`, `onSeek` (异步), `onCapture` (同步/异步), `onFrame` (回调), `onProgress`。

   * 内部实现：

     * `for` 循环控制。

     * `await onSeek(i)` 跳转。

     * `await sleep(50)` 等待渲染。

     * `await onCapture()` 获取数据。

     * `await onFrame(data)` 分发数据。

   * 性能优化点：使用 `canvas.toBlob` 替代 `toDataURL`（如果下游支持）。

### 阶段二：修复序列帧导出 (Frames Export)

1. **改造** **`FramesExporter`**

   * 移除 `captureFrames` 中的定时器循环。

   * 新增 `addFrame(blob, index)` 方法，将 Blob 直接写入 ZIP。

   * 保持 `generateZip` 和 `downloadZip` 逻辑不变。

2. **集成到** **`App.js`**

   * 在 `runFramesExport` 中：

     * 实例化 `FramesExporter`。

     * 调用 `FrameCaptureService.capture`。

     * `onSeek`: 调用 `this.seekToFrame`。

     * `onCapture`: 调用 `this.getCurrentFrameCanvas` 并转为 Blob。

     * `onFrame`: 调用 `exporter.addFrame`。

     * `onComplete`: 调用 `exporter.generateZip`。

### 阶段三：验证与文档

1. **测试验证**

   * 导出 SVGA 为序列帧，检查 ZIP 包内图片是否为连续动画帧（非同一张）。

   * 检查内存占用是否平稳（验证流式处理效果）。

2. **更新文档**

   * 更新 `README.md`（如果涉及架构调整）。

   * 更新 `INDEX.md`（注册新服务）。

   * 更新 `UPDATE_LOG.md`（记录变更）。

## 4. 性能优化策略（在代码中体现）

* **对象复用**：在 `FrameCaptureService` 中维护一个共享的 `tempCanvas`，避免每帧创建。

* **Blob 传输**：优先使用 `toBlob` 获取二进制数据，减少 Base64 字符串转换开销。

* **及时释放**：在 `onFrame` 处理完后，立即释放中间产生的 Blob 或 URL 对象。

