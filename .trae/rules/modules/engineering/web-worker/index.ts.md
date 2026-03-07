---
module_name: WebWorkerIndex
type: index
description: Web Worker 模块索引
version: 1.0.0
---

# Web Worker 模块索引

```typescript
/**
 * Web Worker 知识模块索引
 */
export interface WebWorkerIndex {
  modules: {
    basics: "基础概念与限制";
    dataTransfer: "数据传输优化";
    pool: "Worker Pool 实现模式";
    troubleshooting: "常见问题与调试";
  };
}
```

## 1. 模块概览
- [基础概念 (Basics)](basics.ts.md): Worker 类型、运行机制与核心限制。
- [数据传输 (Data Transfer)](data-transfer.ts.md): Transferable Objects 与性能优化。
- [Worker Pool](pool.ts.md): 线程池设计模式与实现。
- [问题排查 (Troubleshooting)](troubleshooting.ts.md): 常见错误、调试技巧及 Vite 环境配置。
