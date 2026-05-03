---
module_name: YyevaRendering
type: guide
description: YYEVA 动态元素渲染实现
version: 1.0.0
---

# YYEVA 动态元素渲染实现

```typescript
/**
 * YYEVA 动态元素渲染
 */
export interface YyevaRendering {
  /** 渲染流程 */
  flow: {
    step1: "Base Rendering (RGB+Alpha)";
    step2: "Dynamic Element Draw";
    step3: "Mask Application";
  };
  /** 关键技术 */
  techniques: {
    textRendering: "Canvas Text + Mask";
    imageRendering: "Cover Mode + Mask";
    masking: "R-Channel Alpha";
  };
}
```

> 摘要: YYEVA 文本/图片动态元素的渲染流程与蒙版应用

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
