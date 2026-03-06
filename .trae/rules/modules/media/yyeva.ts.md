# YYEVA 数据结构与坐标系统


/**
 * Yyeva数据结构与坐标系统Rules
 * @description Generated from yyeva-data-structure.md
 */
export interface Yyeva数据结构与坐标系统Rules {
  /** 
   * 规则描述 
   */
  description: string;
}


# YYEVA 数据结构与坐标系统
> 摘要: YYEVA 双通道 MP4 的核心数据模型与坐标系统解析
> 类型: Reference

## 1. 核心要点 (Key Points)

### 数据存储位置
- YYEVA 数据存储在 MP4 的 `moov > udta > meta` box 中
- 标记: `yyeffectmp4json`
- 格式: `[[Base64(zlib压缩的JSON)]]`

### 顶层结构
```javascript
{
  descript: { ... },  // 资源基本信息
  effect: { ... },    // 动态元素配置
  datas: [ ... ]      // 每帧位置数据
}
```

### descript 关键字段
- `isEffect`: 必须为 1 才是 YYEVA 格式
- `width / 2`: 得到实际显示宽度
- `rgbFrame / alphaFrame`: 双通道布局 [x, y, w, h]

### effect 元素类型
- `effectType: "txt"` - 文本元素
- `effectType: "img"` - 图片元素
- `effectTag`: 用户 API 调用时使用的 key

### 坐标系统（关键！）
```
┌─────────────────┬─────────────────┐ ← y=0
│   RGB 区域      │   Alpha 区域    │
│   colorX=0      │   alphaX=half   │
├─────────────────┴─────────────────┤ ← y=displayHeight
│        蒙版数据存储区域             │
│   outputFrame 指向这里！           │
└───────────────────────────────────┘ ← y=videoHeight
```

**关键区分：**
- `renderFrame`: 元素在画面上的**实际渲染位置**（相对于 RGB 区域）
- `outputFrame`: 蒙版在视频帧中的位置（指向底部区域，y > displayHeight）

## 2. 适用场景 (Use Cases)
- 解析 YYEVA 格式的 MP4 文件
- 理解动态元素坐标计算
- 排查渲染位置偏移问题

## 3. 代码/配置示例 (Examples)
```javascript
// 检测 YYEVA 格式
if (jsonData.descript && jsonData.descript.isEffect === 1) {
  return jsonData; // 确认是 YYEVA
}

// 计算实际显示尺寸
const displayWidth = descript.width / 2;
const displayHeight = descript.height;
```

## 4. 关联信息 (Meta)
- 来源: ai_protocol_hub/skill_specs/yyeva
- 建议归档位置: `modules/media/yyeva.ts.md`


## YYEVA Metadata 解析流程 (Merged)

# YYEVA Metadata 解析流程
> 摘要: YYEVA 数据的提取、解码、解压完整流程
> 类型: Guide

## 1. 核心要点 (Key Points)

### 解析流程
```
1. 搜索标记 "yyeffectmp4json"
   ↓
2. 提取 Base64 数据 [[...]]
   ↓
3. Base64 解码
   ↓
4. zlib 解压（需要 pako 库）
   ↓
5. JSON 解析
```

### 依赖库
- **pako**: zlib 解压必需，需确保加载
- Web SDK 未开源，需自行实现

### 解析代码
```javascript
function parseYyevaMetadata(buffer) {
  var YYEVA_MARKER = 'yyeffectmp4json';
  
  // 1. 搜索标记位置
  var markerIndex = findMarker(buffer, markerBytes);
  if (markerIndex === -1) return null;
  
  // 2. 提取 Base64 数据
  var dataStart = markerIndex + YYEVA_MARKER.length;
  var str = bufferToString(buffer, dataStart, 50000);
  var base64Match = str.match(/\[\[([A-Za-z0-9+/=]+)\]\]/);
  
  // 3. Base64 解码
  var compressed = base64Decode(base64Match[1]);
  
  // 4. zlib 解压
  var decompressed = pako.inflate(compressed);
  
  // 5. JSON 解析
  return JSON.parse(new TextDecoder('utf-8').decode(decompressed));
}
```

## 2. 适用场景 (Use Cases)
- 检测文件是否为 YYEVA 格式
- 提取动态元素配置
- 排查解析失败问题

## 3. 代码/配置示例 (Examples)
```javascript
// 确保 pako 已加载
if (typeof pako === 'undefined') {
  await window.MeeWoo.Core.libraryLoader.load('pako', true);
}

// 检查 zlib header（调试用）
// zlib 格式: 0x78 0x9C (默认压缩) 或 0x78 0x01 (最快压缩)
console.log('zlib header:', compressed[0].toString(16), compressed[1].toString(16));
```

## 4. 关联信息 (Meta)
- 来源: ai_protocol_hub/skill_specs/yyeva
- 建议归档位置: `modules/media/yyeva.ts.md`



## YYEVA 动态元素渲染实现 (Merged)

# YYEVA 动态元素渲染实现
> 摘要: YYEVA 文本/图片动态元素的渲染流程与蒙版应用
> 类型: Guide

## 1. 核心要点 (Key Points)

### 渲染流程
```
1. 基础双通道渲染（RGB + Alpha 合成）
   ↓
2. 根据 currentFrame 查找 datas[frameIndex]
   ↓
3. 遍历该帧的动态元素数据
   ↓
4. 在 renderFrame 位置绘制动态元素
   ↓
5. 应用 outputFrame 蒙版透明度
```

### 文本渲染
- 创建临时 Canvas 绘制文本
- 应用蒙版透明度（R 通道灰度值控制）
- 绘制到主 Canvas

### 图片渲染（关键！）
- 使用 **cover 模式**：保持比例，短边填满，长边居中裁剪
- 从视频帧底部 `outputFrame` 位置提取蒙版
- 蒙版 R 通道灰度值控制透明度动画

### 蒙版应用核心逻辑
```javascript
// 应用蒙版：R通道灰度值控制透明度
for (var i = 0; i < pixels.length; i += 4) {
  var maskAlpha = maskPixels[i]; // R通道代表透明度
  pixels[i + 3] = Math.floor((pixels[i + 3] * maskAlpha) / 255);
}
```

### maskContext 必须包含完整视频帧
```javascript
var maskContext = {
  ctx: tempCtx,                  // 完整视频帧的上下文
  videoWidth: video.videoWidth,  // 视频宽度（包含蒙版区域）
  videoHeight: video.videoHeight,// 视频高度（包含蒙版区域）
  displayWidth: displayWidth,
  displayHeight: displayHeight
};
```

## 2. 适用场景 (Use Cases)
- 实现动态元素替换渲染
- 排查蒙版不生效问题
- 优化渲染性能

## 3. 代码/配置示例 (Examples)
```javascript
// 图片 cover 模式绘制
function drawImageCover(ctx, img, x, y, w, h) {
  var imgRatio = img.width / img.height;
  var targetRatio = w / h;
  
  if (imgRatio > targetRatio) {
    srcW = img.height * targetRatio;
    srcX = (img.width - srcW) / 2;
  } else {
    srcH = img.width / targetRatio;
    srcY = (img.height - srcH) / 2;
  }
  ctx.drawImage(img, srcX, srcY, srcW, srcH, x, y, w, h);
}

// API 调用
app.setYyevaText('text_01', { text: '替换文本', fontColor: '#ff0000' });
app.setYyevaImage('avatar_01', imageElement);
```

## 4. 关联信息 (Meta)
- 来源: ai_protocol_hub/skill_specs/yyeva
- 建议归档位置: `modules/media/yyeva.ts.md`



## YYEVA 常见问题与解决方案 (Merged)

# YYEVA 常见问题与解决方案
> 摘要: YYEVA 解析、渲染、性能问题的排查指南
> 类型: Reference

## 1. 核心要点 (Key Points)

### 解析问题

| 问题 | 原因 | 解决方案 |
|------|------|----------|
| pako 未加载 | 动态加载未完成 | 解析前检查并加载 pako |
| 找不到标记 | 非YYEVA/文件损坏 | 检查 `yyeffectmp4json` 标记 |
| Base64 解码失败 | 数据截断 | 增加提取长度到 100KB |
| zlib 解压失败 | 格式/数据损坏 | 检查 zlib header: 0x78 0x9C |

### 渲染问题（高频！）

| 问题 | 原因 | 解决方案 |
|------|------|----------|
| **图片蒙版不生效** | maskContext 不完整 | 必须传递完整视频帧上下文 |
| currentFrame 未定义 | 变量作用域错误 | 使用 `this.currentFrame` |
| 元素位置偏移 | 坐标系统理解错误 | renderFrame 相对 RGB 区域 |
| 图片不显示 | 未加载完成 | 使用缓存 + onload 回调 |

### 蒙版不生效的根因
- `outputFrame` 指向视频帧**底部**（y > displayHeight）
- 如果只截取显示区域，蒙版数据会丢失
- **必须传递完整视频帧的上下文**

### 性能优化
```javascript
// 1. 预处理帧数据索引
var frameIndex = {};
yyevaData.datas.forEach(frame => frameIndex[frame.frameIndex] = frame.data);

// 2. 缓存图片对象
var imageCache = {};

// 3. 切换文件时清理缓存
function cleanupYyeva() {
  imageCache = {};
  frameIndex = null;
}
```

## 2. 适用场景 (Use Cases)
- 排查 YYEVA 解析失败
- 解决蒙版渲染问题
- 优化播放性能

## 3. 代码/配置示例 (Examples)
```javascript
// 调试：打印 YYEVA 数据结构
console.log('descript:', JSON.stringify(yyevaData.descript, null, 2));
console.log('effect keys:', Object.keys(yyevaData.effect));
console.log('frame count:', yyevaData.datas.length);

// 调试：打印特定帧数据
function printFrameData(yyevaData, frameIndex) {
  var frame = yyevaData.datas.find(f => f.frameIndex === frameIndex);
  frame.data.forEach(item => {
    var effect = yyevaData.effect[item.effectId];
    console.log(effect.effectTag, effect.effectType, item.outputFrame);
  });
}
```

## 4. 关联信息 (Meta)
- 来源: ai_protocol_hub/skill_specs/yyeva
- 建议归档位置: `modules/media/yyeva.ts.md`

