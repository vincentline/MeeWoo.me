---
module_name: YyevaTroubleshooting
type: reference
description: YYEVA 常见问题与解决方案
version: 1.0.0
---

# YYEVA 常见问题与解决方案

```typescript
/**
 * YYEVA 问题排查
 */
export interface YyevaTroubleshooting {
  /** 解析问题 */
  parsingIssues: {
    pakoMissing: string;
    markerNotFound: string;
    base64Error: string;
  };
  /** 渲染问题 */
  renderingIssues: {
    maskNotWorking: string;
    offsetError: string;
    imageNotShowing: string;
  };
}
```

> 摘要: YYEVA 解析、渲染、性能问题的排查指南

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
