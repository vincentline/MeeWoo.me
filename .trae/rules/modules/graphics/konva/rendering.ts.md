---
module_name: KonvaRendering
type: snippet
description: Konva 动态文字 Canvas 渲染
version: 1.0.0
---

# Konva 动态文字 Canvas 渲染

```typescript
/**
 * Konva 自定义渲染
 */
export interface KonvaCustomRendering {
  /** 技术 */
  technique: "Offscreen Canvas";
  /** 用途 */
  usage: "Dynamic Text Measurement & Rendering";
}
```

> 摘要: 使用临时 Canvas 测量并绘制动态尺寸文字，解决内容截断问题

## 1. 核心要点 (Key Points)
- 使用离屏 Canvas Context (`measureText`) 预先计算多行文字的宽度。
- 根据总行高和宽度动态设置 Canvas 尺寸，并预留 Padding。
- 将生成的 Canvas 作为 `Konva.Image` 的 `image` 源。

## 2. 适用场景 (Use Cases)
- 需要自定义复杂文字渲染（如特殊字体、阴影、背景）且 Konva.Text 无法满足时。
- 避免固定尺寸 Canvas 导致的文字截断或留白过多。

## 3. 代码/配置示例 (Examples)
```javascript
const canvas = document.createElement('canvas');
canvas.width = Math.ceil(maxWidth + padding * 2);
canvas.height = Math.ceil(totalHeight + padding * 2);
// ... context.fillText() ...
return canvas;
```
