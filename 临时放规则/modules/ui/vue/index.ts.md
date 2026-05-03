---
module_name: VueIndex
type: index
description: Vue 开发知识索引
version: 1.0.0
---

# Vue 开发知识索引

```typescript
/**
 * Vue 知识模块索引
 */
export interface VueIndex {
  modules: {
    reactivity: "响应式原理";
    performance: "性能优化";
    troubleshooting: "常见问题";
    lifecycle: "生命周期";
  };
}
```

## 1. 模块概览
- [响应式原理 (Reactivity)](reactivity.ts.md): Vue 2 vs Vue 3 机制对比。
- [性能优化 (Performance)](performance.ts.md): 组件与构建优化策略。
- [常见问题 (Troubleshooting)](troubleshooting.ts.md): 渲染与内存泄漏排查。
- [生命周期 (Lifecycle)](lifecycle.ts.md): 钩子函数最佳实践。
