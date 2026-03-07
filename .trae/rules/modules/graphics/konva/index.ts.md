---
module_name: KonvaIndex
type: index
description: Konva 模块索引
version: 1.0.0
---

# Konva 模块索引

```typescript
/**
 * Konva 知识模块索引
 */
export interface KonvaIndex {
  modules: {
    transformer: "分层遮挡修复";
    export: "导出架构设计";
    interaction: "交互模式";
    integration: "Vue 集成";
    rendering: "动态渲染";
    coordinates: "坐标模型";
  };
}
```

## 1. 模块概览
- [分层修复 (Transformer)](transformer.ts.md): 解决 Transformer 遮挡问题。
- [导出架构 (Export)](export.ts.md): 显示/导出分离的双 Stage 设计。
- [交互模式 (Interaction)](interaction.ts.md): 锚点、拖拽、缩放的最佳实践。
- [Vue 集成 (Integration)](integration.ts.md): 响应式问题排查。
- [动态渲染 (Rendering)](rendering.ts.md): 离屏 Canvas 文字渲染。
- [坐标模型 (Coordinates)](coordinates.ts.md): 相对坐标系设计。
