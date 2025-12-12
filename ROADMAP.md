# A-viewer 开发路线图

## 项目概述
构建支持 SVGA、YYEVA-MP4、Lottie 三种动画格式的在线预览与转换工具。

---

## 阶段1：基础预览功能 ✅
**状态：已完成**

### 已实现功能
- ✅ SVGA 文件预览与播放控制
- ✅ 基础UI框架（顶部播放区 + 底部浮层）
- ✅ 暗黑/白天主题切换
- ✅ 背景色切换（6种颜色 + 透明网格）
- ✅ 画布缩放与拖拽
- ✅ 1:1 显示、居中显示
- ✅ 拖拽上传文件
- ✅ 播放进度条与帧数显示
- ✅ 模块切换（SVGA/YYEVA/Lottie）

---

## 阶段2：SVGA 高级功能
**目标：完善 SVGA 模块的导出与转换能力**

### 2.1 素材替换功能
**优先级：高**

#### 功能描述
- 允许用户替换 SVGA 动画中的图片素材
- 预览替换后的效果
- 支持重新导出替换后的 SVGA 文件

#### 技术要点
- 使用 `SVGAParser` 解析 SVGA 文件结构
- 识别可替换的图片元素（`imageKey`）
- 提供图片上传界面
- 重新打包 SVGA 文件（需研究 SVGA 文件格式规范）

#### 待调研
- [ ] SVGA 文件内部结构（Protobuf 格式）
- [ ] 素材映射关系
- [ ] 是否有现成的编辑库

---

### 2.2 导出 GIF 功能
**优先级：高**

#### 功能描述
- 将 SVGA 动画导出为 GIF 格式
- 支持自定义帧率、尺寸、质量
- 显示导出进度

#### 技术方案
```
SVGA → Canvas 逐帧渲染 → GIF 编码器 → 下载
```

#### 推荐库
- **gif.js**: 纯前端 GIF 编码器，使用 Web Worker
- **gifshot**: 更简单的 API，但体积较大

#### 实现步骤
1. 遍历 SVGA 每一帧，使用 Canvas 渲染
2. 将每帧 Canvas 数据传递给 GIF 编码器
3. 合成 GIF 并触发下载

#### 技术挑战
- 性能优化（使用 Web Worker）
- 内存管理（大尺寸动画可能占用大量内存）
- 进度反馈

---

### 2.3 转 YYEVA-MP4 功能
**优先级：中**

#### 功能描述
- 将 SVGA 转换为 YYEVA 格式的 MP4 视频
- YYEVA 格式：彩色通道 + Alpha 通道并排的视频

#### 技术方案
```
SVGA → Canvas 逐帧渲染 
     ↓
提取彩色像素 + Alpha 像素
     ↓
合成双通道 Canvas（左彩色/右Alpha）
     ↓
使用 ffmpeg.wasm 编码为 MP4
     ↓
下载
```

#### 推荐库
- **ffmpeg.wasm**: 在浏览器中运行的 FFmpeg（需要加载较大 WASM 文件）
- 或使用 **MediaRecorder API**（需要浏览器支持）

#### 实现步骤
1. 渲染每帧 SVGA 到 Canvas
2. 提取彩色数据和 Alpha 数据
3. 合成双通道画布（左右并排或上下并排）
4. 使用 ffmpeg.wasm 编码为 MP4
5. 下载文件

#### 技术挑战
- ffmpeg.wasm 体积大（约 25MB），需要 CDN 加速
- 编码速度较慢，需要进度提示
- 内存占用高

---

## 阶段3：YYEVA-MP4 与 Lottie 模块
**目标：完成多格式支持，实现格式互转**

### 3.1 YYEVA-MP4 模块

#### 3.1.1 文件解析与预览
**功能描述**
- 加载带 Alpha 通道的 MP4 文件
- 解析双通道视频（左彩色/右Alpha 或 上彩色/下Alpha）
- 在 Canvas 上合成显示

**技术方案**
```
MP4 视频 → <video> 元素加载
         ↓
每帧绘制到 Canvas
         ↓
分离左右（或上下）通道
         ↓
彩色 + Alpha 合成最终图像
         ↓
显示到预览区
```

**推荐库**
- 原生 `<video>` 元素 + Canvas
- 或使用 **YYEVA** 官方库（如果有）

---

#### 3.1.2 播放控制
- 播放/暂停
- 拖拽进度条
- 帧数显示
- 循环播放

**技术要点**
- 监听 `<video>` 的 `timeupdate` 事件
- 通过 `requestAnimationFrame` 同步 Canvas 渲染

---

#### 3.1.3 转 SVGA 功能
**功能描述**
- 将 YYEVA-MP4 转换为 SVGA 格式

**技术方案**
```
MP4 视频 → 逐帧提取彩色 + Alpha
         ↓
生成序列帧（PNG 带透明）
         ↓
重新打包为 SVGA 文件
         ↓
下载
```

**技术挑战**
- SVGA 文件格式需要深度研究
- 可能需要后端支持（或使用现成库）

---

### 3.2 Lottie 模块

#### 3.2.1 Lottie JSON 解析与预览
**当前状态**
- 已引入 `lottie-web` 库
- 拖入 `.json` 文件会切换到 Lottie 模块，但只是占位

**待实现**
- 使用 `lottie.loadAnimation()` 加载 JSON
- 在预览区渲染 Lottie 动画
- 支持播放控制

**技术参考**
```javascript
const animation = lottie.loadAnimation({
  container: element,
  renderer: 'canvas', // 或 'svg'
  loop: true,
  autoplay: true,
  animationData: jsonData
});
```

---

#### 3.2.2 播放控制与功能完善
- 播放/暂停
- 进度条拖拽
- 帧数显示
- 导出功能（可选）

---

## 技术准备清单

### 1. YYEVA-MP4 格式规范
**调研内容**
- YYEVA 格式定义（腾讯开源？）
- 双通道布局方式（左右并排 vs 上下并排）
- 是否有官方解析库

**参考资源**
- GitHub 搜索 "YYEVA"
- 查看腾讯开源项目

---

### 2. 序列帧提取方案
**方案对比**

| 方案 | 优点 | 缺点 | 适用场景 |
|------|------|------|----------|
| Canvas API | 原生支持，无依赖 | 需手动编码 | 简单场景 |
| ffmpeg.wasm | 功能强大，支持多种格式 | 体积大（25MB+） | 复杂转换 |

**推荐**：优先使用 Canvas API，复杂场景再引入 ffmpeg.wasm

---

### 3. GIF 导出方案
**库对比**

| 库名 | 大小 | 特点 | GitHub Stars |
|------|------|------|--------------|
| gif.js | ~50KB | Web Worker 支持 | 4.8k+ |
| gifshot | ~200KB | API 简单 | 3.9k+ |

**推荐**：gif.js（体积小，性能好）

**CDN 引入**
```html
<script src="https://cdn.jsdelivr.net/npm/gif.js@0.2.0/dist/gif.js"></script>
```

---

### 4. MP4 合成方案
**方案对比**

| 方案 | 优点 | 缺点 |
|------|------|------|
| ffmpeg.wasm | 功能完整，格式支持全 | 体积大，速度慢 |
| MediaRecorder API | 浏览器原生，无依赖 | 兼容性差，格式受限 |

**推荐**：ffmpeg.wasm（兼容性更好）

**引入方式**
```javascript
import { createFFmpeg, fetchFile } from '@ffmpeg/ffmpeg';
const ffmpeg = createFFmpeg({ log: true });
await ffmpeg.load();
```

---

## 开发优先级建议

### 第一批（高优先级）
1. ✅ 技术调研（YYEVA、GIF、序列帧、MP4 合成）
2. 🔄 SVGA 导出 GIF
3. 🔄 Lottie 预览功能

### 第二批（中优先级）
4. SVGA 素材替换
5. YYEVA-MP4 预览与播放控制

### 第三批（低优先级）
6. SVGA 转 YYEVA-MP4
7. YYEVA-MP4 转 SVGA

---

## 依赖包规划

### 当前依赖
```json
{
  "dependencies": {
    "element-ui": "^2.15.1"
  },
  "devDependencies": {
    "vuepress": "^1.8.2"
  }
}
```

### 计划新增（CDN 方式引入，无需安装）
- `gif.js` - GIF 导出
- `@ffmpeg/ffmpeg` - MP4 合成
- `lottie-web` - 已引入

---

## 风险评估

### 技术风险
1. **ffmpeg.wasm 性能问题**
   - 影响：编码速度慢，用户等待时间长
   - 缓解：显示详细进度条，考虑后端支持

2. **内存占用**
   - 影响：大尺寸动画可能导致页面崩溃
   - 缓解：限制最大尺寸，分块处理

3. **SVGA 格式解析复杂性**
   - 影响：素材替换和转换功能难以实现
   - 缓解：深入研究 Protobuf 格式，或寻求社区支持

### 兼容性风险
- Web Worker 支持（GIF 导出）
- WASM 支持（ffmpeg.wasm）
- Canvas API 性能（低端设备）

---

## 下一步行动

### 立即开始
1. 调研 YYEVA-MP4 格式规范
2. 验证 gif.js 库的可行性（创建 Demo）
3. 验证 ffmpeg.wasm 的性能（测试编码速度）

### 本周目标
- 完成所有技术调研
- 产出技术方案文档
- 实现 GIF 导出原型

---

## 参考资源

### SVGA 相关
- [SVGAPlayer-Web](https://github.com/svga/SVGAPlayer-Web)
- [SVGA 格式规范](https://github.com/svga/SVGA-Format)

### YYEVA 相关
- 待补充（需要调研）

### GIF 导出
- [gif.js](https://github.com/jnordberg/gif.js)
- [gifshot](https://github.com/yahoo/gifshot)

### MP4 合成
- [ffmpeg.wasm](https://github.com/ffmpegwasm/ffmpeg.wasm)

### Lottie
- [lottie-web](https://github.com/airbnb/lottie-web)
- [Lottie 官方文档](https://airbnb.io/lottie/)

---

*最后更新：2024-12-12*
