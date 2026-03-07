---
module_name: FigmaApi
type: reference
description: Figma 插件常用 API 方法
version: 1.0.0
---

# Figma 插件常用 API 方法

```typescript
/**
 * Figma API
 */
export interface FigmaApi {
  /** 创建 */
  create: "createRectangle, createText, createFrame, createComponent";
  /** 查找 */
  find: "getNodeByIdAsync, findAll, findOne";
  /** 操作 */
  manipulate: "appendChild, resize, remove, clone";
  /** UI */
  ui: "showUI, notify, closePlugin";
}
```

> 摘要: 节点创建、查找、样式操作等核心 API

## 1. 核心要点 (Key Points)

### 节点创建
| 方法 | 说明 |
|------|------|
| `figma.createRectangle()` | 创建矩形 |
| `figma.createText()` | 创建文本 |
| `figma.createFrame()` | 创建框架 |

### 字体处理（关键！）
```javascript
// 修改文本前必须加载字体
await figma.loadFontAsync({ family: "Inter", style: "Regular" });
textNode.fontName = { family: "Inter", style: "Regular" };
textNode.characters = "Hello";
```
