---
module_name: FigmaPluginIndex
type: index
description: Figma 插件开发索引
version: 1.0.0
---

# Figma 插件开发索引

```typescript
/**
 * Figma 插件知识模块索引
 */
export interface FigmaPluginIndex {
  modules: {
    architecture: "架构与通信";
    nodes: "节点类型";
    api: "常用 API";
    troubleshooting: "常见问题";
  };
}
```

## 1. 模块概览
- [架构与通信 (Architecture)](architecture.ts.md): 运行环境与双向通信机制。
- [节点类型 (Nodes)](nodes.ts.md): 文档结构与节点属性。
- [常用 API (API)](api.ts.md): 节点操作与样式创建。
- [常见问题 (Troubleshooting)](troubleshooting.ts.md): 字体加载与性能优化。
