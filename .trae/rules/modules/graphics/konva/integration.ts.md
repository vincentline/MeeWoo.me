---
module_name: KonvaVueIntegration
type: troubleshooting
description: Konva 与 Vue 响应式配合问题
version: 1.0.0
---

# Konva 与 Vue 响应式配合问题

```typescript
/**
 * Konva-Vue 集成问题
 */
export interface KonvaVueIntegration {
  /** 问题 */
  issue: "Watch not triggering on same value";
  /** 解决方案 */
  solution: "Reset to null before assignment";
}
```

> 摘要: 解决 Vue watch 监听相同值不触发导致 Konva 不刷新的问题

## 1. 问题背景 (Context)
- **场景**: 重新打开编辑器加载相同的图片 URL
- **现象**: Vue 的 watch 监听器未触发，导致 Konva 画布未更新/未渲染

## 2. 根本原因 (Root Cause)
- Vue 的响应式机制优化：当新值与旧值全等 (`===`) 时，不会触发 watcher 回调

## 3. 解决方案 (Solution)
- 在赋值前先强制重置为 null，制造状态变更
```javascript
// 先重置再赋值，确保触发 watch
this.editor.baseImage = null;
this.$nextTick(() => {
    this.editor.baseImage = imgUrl; 
});
```
