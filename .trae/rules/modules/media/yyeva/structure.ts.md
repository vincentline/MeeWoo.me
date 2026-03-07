---
module_name: YyevaStructure
type: reference
description: YYEVA 数据结构与坐标系统
version: 1.0.0
---

# YYEVA 数据结构与坐标系统

```typescript
/**
 * Yyeva数据结构与坐标系统Rules
 */
export interface YyevaStructure {
  /** 
   * 数据存储
   */
  storage: {
    location: "moov > udta > meta";
    marker: "yyeffectmp4json";
    format: "Base64(zlib(JSON))";
  };
  /**
   * 坐标系统
   */
  coordinateSystem: {
    rgbArea: "Left Half";
    alphaArea: "Right Half";
    outputFrame: "Mask Position (y > displayHeight)";
  };
}
```

> 摘要: YYEVA 双通道 MP4 的核心数据模型与坐标系统解析

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
