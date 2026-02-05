# 双通道MP4转SVGA性能优化实施计划

## 项目现状分析

经过代码分析，项目已经具备以下基础：
- **FFmpeg集成**：完整的FFmpegService实现，支持音频提取、视频转换等功能
- **Web Workers**：现有的dual-channel-worker.js实现，支持并行像素处理
- **内存管理**：内存池和工作线程池管理
- **错误处理**：完善的错误处理和进度回调机制

## 优化实施计划

### 第一阶段：FFmpeg批量提取帧

**目标**：使用FFmpeg替代逐帧跳转，实现批量帧提取

**实施步骤**：

1. **扩展FFmpegService**：
   - 在`service/ffmpeg/ffmpeg-service.js`中添加`extractFrames`方法
   - 实现批量提取帧的核心逻辑

2. **修改extractYyevaFrames**：
   - 修改`core/app.js`中的`extractYyevaFrames`方法
   - 替换逐帧跳转逻辑为FFmpeg批量提取

3. **实现帧处理**：
   - 处理FFmpeg提取的帧数据
   - 支持双通道分离和像素合成

### 第二阶段：集成Web Workers并行处理

**目标**：将像素级操作移至Web Worker，提升并行处理能力

**实施步骤**：

1. **创建像素处理Worker**：
   - 在`service/svga/`目录下创建`svga-pixel-worker.js`
   - 实现像素级操作的并行处理

2. **实现Worker管理**：
   - 创建`service/svga/worker-manager.js`
   - 管理Worker生命周期和任务分发

3. **修改帧处理逻辑**：
   - 将像素处理移至Web Worker
   - 主线程只负责任务分发和结果收集

### 第三阶段：内存优化和批处理策略

**目标**：减少内存使用，改善UI流畅度

**实施步骤**：

1. **应用内存优化**：
   - 使用OffscreenCanvas减少DOM开销
   - 实现帧数据的流式处理

2. **实现批处理策略**：
   - 批量处理帧数据
   - 批量更新进度显示

3. **集成到现有代码**：
   - 修改`core/app.js`中的`startSVGAConversion`方法
   - 集成所有优化方案

## 关键技术点

### 1. FFmpeg批量提取帧

```javascript
// 核心实现逻辑
extractFrames: async function(options) {
  // 使用FFmpeg命令批量提取帧
  const args = [
    '-i', 'input.mp4',
    '-vf', `fps=${options.fps}`,
    '-f', 'image2',
    'frame_%d.png'
  ];
  
  // 执行命令并读取结果
  await this.ffmpeg.run.apply(this.ffmpeg, args);
  
  // 读取所有帧数据
  const frames = [];
  for (let i = 1; i <= totalFrames; i++) {
    const frameData = this.ffmpeg.FS('readFile', `frame_${i}.png`);
    frames.push(frameData);
  }
  
  return frames;
}
```

### 2. Web Workers并行处理

```javascript
// Worker核心逻辑
self.onmessage = function(e) {
  const task = e.data;
  
  switch(task.type) {
    case 'processFrames':
      // 并行处理多帧
      const processedFrames = task.frames.map(processFrame);
      // 返回结果
      self.postMessage({ processedFrames });
      break;
  }
};
```

### 3. 内存优化

- **OffscreenCanvas**：使用离屏画布减少DOM操作
- **内存池**：复用缓冲区减少内存分配
- **流式处理**：分批处理帧数据，避免一次性加载全部

## 集成方案

### 文件结构

```
src/assets/js/
├── core/
│   └── app.js          # 修改extractYyevaFrames和startSVGAConversion
├── service/
│   ├── ffmpeg/
│   │   └── ffmpeg-service.js  # 扩展extractFrames方法
│   └── svga/
│       ├── svga-pixel-worker.js  # 新创建：像素处理Worker
│       └── worker-manager.js     # 新创建：Worker管理器
└── utils/
    └── frame-utils.js  # 新创建：帧处理工具函数
```

### 关键修改点

1. **core/app.js**：
   - 修改`extractYyevaFrames`方法
   - 修改`startSVGAConversion`方法

2. **service/ffmpeg/ffmpeg-service.js**：
   - 添加`extractFrames`方法

3. **service/svga/**：
   - 创建新的Worker和管理器

## 预期效果

- **转换速度**：3-5倍提升
- **内存使用**：减少50-70%
- **UI流畅度**：显著改善
- **可靠性**：减少浏览器崩溃风险

## 风险评估

1. **FFmpeg加载时间**：首次加载需要25MB左右的核心文件
2. **浏览器兼容性**：部分旧浏览器可能不支持Web Workers
3. **内存限制**：大视频仍可能触发内存限制

**应对策略**：
- 延迟加载FFmpeg核心
- 实现降级方案（不支持时使用原始实现）
- 监控内存使用，超过阈值时自动降级

## 测试计划

1. **性能测试**：使用不同长度和分辨率的视频测试转换速度
2. **内存测试**：监控转换过程中的内存使用
3. **兼容性测试**：在主流浏览器中测试功能
4. **用户体验测试**：评估转换过程的流畅度和响应性

## 实施时间线

- **第一阶段**：2天
- **第二阶段**：1天
- **第三阶段**：1天
- **测试与调优**：1天

## 结论

通过本次优化，双通道MP4转SVGA的性能将得到显著提升，用户体验将得到极大改善。优化方案充分利用了项目现有的FFmpeg和Web Workers基础设施，同时引入了新的内存优化和批处理策略，确保在提升性能的同时保持系统的稳定性和可靠性。