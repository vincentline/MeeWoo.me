# 技术调研报告

## 📋 调研目标
为 A-viewer 项目的阶段2、3功能开发提供技术方案支持。

---

## 1. YYEVA-MP4 格式规范 🎬

### 1.1 格式定义
**YYEVA** (YY Effect Video Animation) 是一种在普通 MP4 视频中嵌入透明通道的格式方案。

### 1.2 技术原理
```
┌─────────────────────────────┐
│   原始带透明通道的动画       │
└──────────┬──────────────────┘
           │
           ▼
    ┌──────────────┐
    │  序列帧提取   │
    └──────┬───────┘
           │
    ┌──────▼───────────────────┐
    │  每帧分离彩色 + Alpha     │
    └──────┬───────────────────┘
           │
    ┌──────▼───────────────────┐
    │  合成双通道画布           │
    │  ┌────────┬────────┐     │
    │  │ Color  │ Alpha  │     │
    │  │ (RGB)  │ (灰度) │     │
    │  └────────┴────────┘     │
    └──────┬───────────────────┘
           │
    ┌──────▼───────────────────┐
    │  编码为标准 MP4           │
    └──────────────────────────┘
```

### 1.3 布局方式

#### 方式1：左右并排（推荐）
```
┌─────────────────────┐
│         │           │
│  Color  │   Alpha   │
│  通道   │   通道    │
│         │           │
└─────────────────────┘
宽度：原始宽度 × 2
高度：原始高度
```

#### 方式2：上下并排
```
┌─────────────────────┐
│      Color 通道      │
├─────────────────────┤
│      Alpha 通道      │
└─────────────────────┘
宽度：原始宽度
高度：原始高度 × 2
```

### 1.4 解析流程
```javascript
// 1. 加载视频
const video = document.createElement('video');
video.src = 'yyeva-video.mp4';

// 2. 监听每帧
video.addEventListener('timeupdate', () => {
    // 绘制到 Canvas
    ctx.drawImage(video, 0, 0);
    
    // 提取双通道
    const fullData = ctx.getImageData(0, 0, video.videoWidth, video.videoHeight);
    const halfWidth = video.videoWidth / 2;
    
    // 分离彩色和 Alpha
    const colorData = ctx.getImageData(0, 0, halfWidth, video.videoHeight);
    const alphaData = ctx.getImageData(halfWidth, 0, halfWidth, video.videoHeight);
    
    // 合成
    for (let i = 0; i < colorData.data.length; i += 4) {
        colorData.data[i + 3] = alphaData.data[i]; // 使用 R 通道作为 Alpha
    }
    
    // 绘制最终结果
    finalCtx.putImageData(colorData, 0, 0);
});
```

### 1.5 可用库
| 库名 | 来源 | 特点 | 推荐度 |
|------|------|------|--------|
| 原生 Canvas + Video | W3C 标准 | 无依赖，性能好 | ⭐⭐⭐⭐⭐ |
| YYEVA 官方库 | 腾讯开源（需验证） | 可能提供更完整的解析 | ⭐⭐⭐⭐ |

**推荐方案**：优先使用原生 Canvas API，简单高效。

### 1.6 Demo 文件
已创建演示文件：`demo-yyeva-format.html`
- ✅ 模拟双通道视频
- ✅ 通道分离
- ✅ 合成透明效果

---

## 2. 序列帧提取方案 🎞️

### 2.1 方案对比

#### 方案 A：Canvas API（推荐）
```javascript
// 从 SVGA/Video 提取帧
function extractFrame(player, frameIndex) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    canvas.width = player.videoItem.videoSize.width;
    canvas.height = player.videoItem.videoSize.height;
    
    // 跳转到指定帧
    player.stepToFrame(frameIndex);
    
    // 绘制到 Canvas
    ctx.drawImage(player.canvas, 0, 0);
    
    // 提取数据
    return ctx.getImageData(0, 0, canvas.width, canvas.height);
}
```

**优点**：
- ✅ 无需额外库
- ✅ 性能优秀
- ✅ 完全控制每一帧

**缺点**：
- ⚠️ 需要手动遍历每一帧
- ⚠️ 大尺寸动画可能占用内存

---

#### 方案 B：ffmpeg.wasm
```javascript
import { createFFmpeg, fetchFile } from '@ffmpeg/ffmpeg';

const ffmpeg = createFFmpeg({ log: true });
await ffmpeg.load();

// 提取帧
ffmpeg.FS('writeFile', 'input.mp4', await fetchFile(videoFile));
await ffmpeg.run('-i', 'input.mp4', '-vf', 'fps=30', 'frame_%04d.png');

// 读取帧
const frames = [];
for (let i = 1; i <= frameCount; i++) {
    const data = ffmpeg.FS('readFile', `frame_${String(i).padStart(4, '0')}.png`);
    frames.push(data);
}
```

**优点**：
- ✅ 功能强大，支持多种格式
- ✅ 可以处理复杂视频

**缺点**：
- ⚠️ 体积大（约 25MB）
- ⚠️ 加载慢
- ⚠️ 性能较差

---

### 2.2 推荐方案
| 场景 | 推荐方案 |
|------|----------|
| SVGA → GIF | Canvas API |
| SVGA → MP4 | Canvas API + ffmpeg.wasm |
| MP4 → SVGA | Canvas API |
| Lottie → GIF | Canvas API |

---

## 3. GIF 导出方案 🎨

### 3.1 库选型

#### gif.js（推荐 ⭐⭐⭐⭐⭐）
```javascript
import GIF from 'gif.js';

const gif = new GIF({
    workers: 2,          // Web Worker 数量
    quality: 10,         // 1-30，越小越好但越慢
    width: 300,
    height: 300,
    workerScript: 'gif.worker.js'
});

// 添加帧
for (let i = 0; i < totalFrames; i++) {
    gif.addFrame(canvas, { delay: 100, copy: true });
}

// 渲染
gif.on('finished', (blob) => {
    // 下载或预览
    const url = URL.createObjectURL(blob);
    downloadFile(url, 'animation.gif');
});

gif.render();
```

**特点**：
- ✅ 体积小（约 50KB）
- ✅ 支持 Web Worker（不阻塞 UI）
- ✅ API 简单
- ✅ 性能优秀

**CDN 引入**：
```html
<script src="https://cdn.jsdelivr.net/npm/gif.js@0.2.0/dist/gif.js"></script>
```

---

#### gifshot
```javascript
gifshot.createGIF({
    images: [canvas1, canvas2, canvas3],
    gifWidth: 300,
    gifHeight: 300,
    interval: 0.1,
    numFrames: 30
}, (obj) => {
    if (!obj.error) {
        const image = obj.image;
        downloadFile(image, 'animation.gif');
    }
});
```

**特点**：
- ✅ API 更简单
- ⚠️ 体积较大（约 200KB）
- ⚠️ 性能一般

---

### 3.2 最佳实践

#### 优化建议
1. **限制尺寸**：GIF 文件大小与宽高成正比
   ```javascript
   const maxSize = 600;
   if (width > maxSize || height > maxSize) {
       const scale = maxSize / Math.max(width, height);
       width *= scale;
       height *= scale;
   }
   ```

2. **限制帧数**：减少帧数可显著降低文件大小
   ```javascript
   const maxFrames = 60;
   const step = Math.ceil(totalFrames / maxFrames);
   for (let i = 0; i < totalFrames; i += step) {
       gif.addFrame(canvas, { delay: 100 * step });
   }
   ```

3. **使用 Web Worker**：避免阻塞 UI
   ```javascript
   const gif = new GIF({ workers: 4 });
   ```

4. **显示进度**：
   ```javascript
   gif.on('progress', (p) => {
       progressBar.style.width = (p * 100) + '%';
   });
   ```

### 3.3 Demo 文件
已创建演示文件：`demo-gif-export.html`
- ✅ Canvas 动画预览
- ✅ GIF 导出功能
- ✅ 进度显示
- ✅ 文件下载

---

## 4. MP4 合成方案（双通道） 📹

### 4.1 方案对比

#### 方案 A：ffmpeg.wasm（推荐）
```javascript
import { createFFmpeg, fetchFile } from '@ffmpeg/ffmpeg';

const ffmpeg = createFFmpeg({ 
    log: true,
    corePath: 'https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.11.0/dist/ffmpeg-core.js'
});

await ffmpeg.load();

// 1. 准备左右通道视频
// 这里需要先将序列帧转为两个视频流

// 2. 使用 hstack 合并左右
await ffmpeg.run(
    '-i', 'color.mp4',
    '-i', 'alpha.mp4',
    '-filter_complex', '[0:v][1:v]hstack',
    '-c:v', 'libx264',
    '-preset', 'fast',
    'output.mp4'
);

// 3. 读取结果
const data = ffmpeg.FS('readFile', 'output.mp4');
const blob = new Blob([data.buffer], { type: 'video/mp4' });
```

**优点**：
- ✅ 功能完整，格式支持全
- ✅ 质量高
- ✅ 浏览器兼容性好

**缺点**：
- ⚠️ 体积大（25MB+）
- ⚠️ 加载慢
- ⚠️ 编码速度慢

---

#### 方案 B：MediaRecorder API
```javascript
const stream = canvas.captureStream(30); // 30fps
const recorder = new MediaRecorder(stream, {
    mimeType: 'video/webm;codecs=vp9'
});

const chunks = [];
recorder.ondataavailable = (e) => chunks.push(e.data);
recorder.onstop = () => {
    const blob = new Blob(chunks, { type: 'video/webm' });
    downloadFile(URL.createObjectURL(blob), 'video.webm');
};

recorder.start();
// 播放动画，Canvas 会自动录制
setTimeout(() => recorder.stop(), duration);
```

**优点**：
- ✅ 浏览器原生，无需额外库
- ✅ 性能好

**缺点**：
- ⚠️ 只支持 WebM 格式（不是 MP4）
- ⚠️ 兼容性较差（Safari 不支持）
- ⚠️ 难以控制双通道布局

---

### 4.2 推荐方案
**优先使用 ffmpeg.wasm**，因为：
1. 输出标准 MP4 格式
2. 兼容性更好
3. 可以精确控制双通道布局

**优化建议**：
- 懒加载 ffmpeg.wasm（仅在需要时加载）
- 使用 CDN 加速
- 显示详细进度条
- 考虑服务端转换（未来优化）

---

## 5. 技术栈总结

### 5.1 核心依赖（CDN 引入）
```json
{
  "gif.js": "0.2.0",           // GIF 导出
  "@ffmpeg/ffmpeg": "0.11.0",  // MP4 合成
  "lottie-web": "5.7.6",       // Lottie 播放（已引入）
  "svgaplayerweb": "2.3.1"     // SVGA 播放（已引入）
}
```

### 5.2 浏览器兼容性
| 功能 | Chrome | Firefox | Safari | Edge |
|------|--------|---------|--------|------|
| Canvas API | ✅ | ✅ | ✅ | ✅ |
| Web Worker | ✅ | ✅ | ✅ | ✅ |
| WASM | ✅ | ✅ | ✅ | ✅ |
| Video API | ✅ | ✅ | ✅ | ✅ |

**结论**：所有核心功能在现代浏览器中均可用。

---

## 6. 风险评估

### 6.1 性能风险
| 风险点 | 影响 | 缓解措施 |
|--------|------|----------|
| 大尺寸动画内存占用 | 高 | 限制最大尺寸，分块处理 |
| ffmpeg.wasm 编码慢 | 中 | 显示进度，使用 Web Worker |
| GIF 文件过大 | 低 | 限制帧数和尺寸 |

### 6.2 兼容性风险
| 风险点 | 影响 | 缓解措施 |
|--------|------|----------|
| 低版本浏览器 | 低 | 显示升级提示 |
| 移动端性能 | 中 | 降低默认质量 |

---

## 7. Demo 文件清单

| 文件 | 功能 | 状态 |
|------|------|------|
| `demo-gif-export.html` | GIF 导出测试 | ✅ 已完成 |
| `demo-yyeva-format.html` | YYEVA 格式解析测试 | ✅ 已完成 |
| `demo-ffmpeg-wasm.html` | MP4 合成测试 | ⏳ 待创建 |
| `demo-svga-material.html` | SVGA 素材替换测试 | ⏳ 待创建 |

---

## 8. 下一步行动

### 立即执行
- [x] 创建 GIF 导出 Demo
- [x] 创建 YYEVA 格式 Demo
- [ ] 创建 ffmpeg.wasm Demo
- [ ] 验证 SVGA 素材替换可行性

### 本周目标
- [ ] 完成所有 Demo
- [ ] 更新技术方案到 ROADMAP
- [ ] 开始阶段2开发（GIF 导出功能）

---

*最后更新：2024-12-12*
