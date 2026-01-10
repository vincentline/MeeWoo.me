我已完成代码分析，准备进行第三步第三批的重构。

### 重构目标
将所有“转双通道MP4”相关功能的 FFmpeg 核心编码逻辑迁移到 `FFmpegService`，统一管理资源、进度和错误处理。

### 涉及功能
1. **SVGA 转 双通道MP4** (`startMP4Conversion`)
2. **MP4 转 双通道MP4** (`startMp4ToDualChannelConversion`)
3. **Lottie 转 双通道MP4** (`startLottieToDualChannelConversion`)
4. **序列帧 转 双通道MP4** (`startFramesToDualChannelConversion`)

### 具体计划

#### 1. 扩展 `ffmpeg-service.js`
新增 `convertFramesToMp4` 方法，统一处理序列帧转视频的逻辑：
- **输入**：JPEG/PNG 帧数据数组、音频数据、FPS、质量参数。
- **功能**：
  - 自动将帧数据写入 FFmpeg 虚拟文件系统。
  - 处理音频合并（支持无音频、静音）。
  - 构建优化的 FFmpeg 命令（CRF 质量控制、预设优化）。
  - 执行编码并返回 MP4 Blob。
  - 自动清理临时文件。
- **优势**：消除 `app.js` 中重复的编码逻辑（目前有 `encodeToMP4` 和 `encodeMp4DualChannel` 两套相似代码）。

#### 2. 改造 `app.js`
- **SVGA 转 双通道MP4**：
  - 移除 `encodeToMP4` 函数。
  - 修改 `startMP4Conversion`，调用 `FFmpegService.convertFramesToMp4`。
  - 移除 `loadFFmpeg` 中的重复初始化逻辑，使用 `FFmpegService.init`。
- **MP4/Lottie/序列帧 转 双通道MP4**：
  - 移除 `encodeMp4DualChannel` 函数。
  - 修改 `startMp4ToDualChannelConversion` 等函数，调用 `FFmpegService.convertFramesToMp4`。

#### 3. 清理与验证
- 删除 `app.js` 中不再使用的旧编码函数。
- 验证音频提取与变速逻辑是否在所有场景下正常工作。
- 确保进度条和取消按钮功能正常。

### 预计修改文件
- `docs/assets/js/ffmpeg-service.js`
- `docs/assets/js/app.js`

请确认是否开始执行此计划？