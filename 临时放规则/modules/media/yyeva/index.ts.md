---
module_name: YyevaIndex
type: index
description: YYEVA 模块索引
version: 1.0.0
---

# YYEVA 模块索引

```typescript
/**
 * YYEVA 知识模块索引
 */
export interface YyevaIndex {
  modules: {
    structure: "数据结构与坐标系统";
    metadata: "Metadata 解析流程";
    rendering: "动态元素渲染实现";
    troubleshooting: "常见问题与解决方案";
  };
}
```

## 1. 模块概览
- [数据结构 (Structure)](structure.ts.md): YYEVA 核心数据模型与坐标系。
- [解析流程 (Metadata)](metadata.ts.md): Base64/zlib 解码流程。
- [渲染实现 (Rendering)](rendering.ts.md): 动态元素与蒙版应用逻辑。
- [问题排查 (Troubleshooting)](troubleshooting.ts.md): 常见错误与解决方案。
