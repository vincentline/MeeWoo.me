---
module_name: FigmaPluginArchitecture
type: reference
description: Figma 插件架构与通信机制
version: 1.0.0
---

# Figma 插件架构与通信机制

```typescript
/**
 * Figma 插件架构
 */
export interface FigmaPluginArchitecture {
  /** 运行环境 */
  environment: {
    mainThread: "code.js (Logic, Figma API)";
    uiThread: "ui.html (Iframe, Browser API)";
  };
  /** 通信机制 */
  communication: {
    uiToLogic: "parent.postMessage -> figma.ui.onmessage";
    logicToUi: "figma.ui.postMessage -> window.onmessage";
  };
}
```

> 摘要: 插件运行机制与 UI-逻辑双向通信

## 1. 核心要点 (Key Points)

### 插件运行架构
```
┌─────────────────────────────────────┐
│           Figma 主线程              │
│  ┌─────────────────────────────┐    │
│  │  code.js (插件逻辑)          │    │
│  │  - 访问 Figma API            │    │
│  │  - 操作文档节点              │    │
│  └─────────────────────────────┘    │
│              ↕ postMessage           │
│  ┌─────────────────────────────┐    │
│  │  ui.html (iframe)            │    │
│  │  - 用户界面                  │    │
│  │  - 访问浏览器 API            │    │
│  └─────────────────────────────┘    │
└─────────────────────────────────────┘
```

### 双向通信
| 方向 | 发送方法 | 接收方法 |
|------|----------|----------|
| UI → 逻辑 | `parent.postMessage({ pluginMessage: {...} }, '*')` | `figma.ui.onmessage = (msg) => {}` |
| 逻辑 → UI | `figma.ui.postMessage({...})` | `window.onmessage = (e) => e.data.pluginMessage` |

### 关键限制
- **无法后台运行**: 插件必须由用户启动，一次只能运行一个
- **沙箱隔离**: UI 在 iframe 中，无法直接访问 Figma API
