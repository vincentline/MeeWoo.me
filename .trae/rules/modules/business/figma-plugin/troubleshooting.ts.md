---
module_name: FigmaPluginTroubleshooting
type: reference
description: Figma 插件常见问题与最佳实践
version: 1.0.0
---

# Figma 插件常见问题与最佳实践

```typescript
/**
 * Figma 插件问题排查
 */
export interface FigmaPluginTroubleshooting {
  /** 常见问题 */
  issues: {
    fontLoading: "Must loadFontAsync before editing text";
    uiNotShowing: "Check manifest ui path";
    messagePassing: "Use parent.postMessage in UI";
    permissions: "Check manifest permissions";
  };
  /** 性能优化 */
  performance: {
    asyncApi: "Use Async variants";
    batching: "Combine operations";
  };
}
```

> 摘要: 字体加载、消息传递、性能优化等高频问题

## 1. 核心要点 (Key Points)

### 高频问题

#### 1. 字体加载失败
```javascript
// ❌ 错误：未加载字体就修改文本
textNode.characters = "Hello";

// ✅ 正确：先加载字体
await figma.loadFontAsync({ family: "Inter", style: "Regular" });
textNode.fontName = { family: "Inter", style: "Regular" };
textNode.characters = "Hello";
```

#### 2. UI 不显示
- 确保 `figma.showUI(__html__)` 被调用
- 检查 manifest.json 中 `ui` 路径正确

#### 3. 消息传递失败
```javascript
// UI 端发送
parent.postMessage({ pluginMessage: { type: 'action' } }, '*');

// 逻辑端接收
figma.ui.onmessage = (msg) => {
  if (msg.type === 'action') { /* ... */ }
};
```
