---
module_name: CoreIndex
type: index
description: 核心架构模块索引
version: 1.0.0
---

# 核心架构模块索引 (Core Architecture)

```typescript
/**
 * 核心架构索引
 */
export interface CoreIndex {
  modules: {
    knowledgeEngine: "知识引擎配置与索引机制 (v6.0 + Doctor v1)";
  };
}
```

## 1. 模块概览
- [知识引擎 (Knowledge Engine)](knowledge-engine.ts.md): 混合索引、目录结构、Librarian/Doctor 技能规范。
