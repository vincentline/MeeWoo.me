---
module_name: VueTroubleshooting
type: reference
description: Vue 常见渲染问题排查
version: 1.0.0
---

# Vue 常见渲染问题排查

```typescript
/**
 * Vue 问题排查
 */
export interface VueTroubleshooting {
  /** 常见问题 */
  issues: {
    notUpdating: "Reactivity Caveats";
    renderOrder: "Async Data / v-if";
    memoryLeak: "Event Listeners / Timers";
    vIfVFor: "Priority Conflict";
  };
}
```

> 摘要: 数据更新视图不刷新、内存泄漏、v-if/v-for 等高频问题

## 1. 核心要点 (Key Points)

### 问题 1: 数据更新但视图不刷新
| 原因 | Vue 2 解决方案 | Vue 3 |
|------|----------------|-------|
| 对象新增属性 | `this.$set(obj, key, val)` | 自动检测 |
| 数组索引赋值 | `this.$set(arr, idx, val)` | 自动检测 |
| 数组长度修改 | `arr.splice(0)` | 自动检测 |
| 深层对象变化 | `watch` 添加 `deep: true` | 同 Vue 2 |

### 问题 2: 组件渲染顺序问题
- **症状**: 子组件渲染时未收到父组件数据
- **原因**: 异步数据加载时机问题
- **解决**: 使用 `v-if` 等待数据、Suspense (Vue 3)

### 问题 3: 内存泄漏
| 泄漏源 | 清理位置 |
|--------|----------|
| 事件监听器 | `beforeUnmount` |
| 定时器 | `beforeUnmount` |
| 第三方库 | `beforeUnmount` 调用 destroy |

### 问题 4: v-if 与 v-for 混用
```vue
<!-- ❌ Vue 2: v-for 优先级高于 v-if -->
<li v-for="item in items" v-if="item.active">

<!-- ✅ 使用 computed 过滤 -->
<li v-for="item in activeItems" :key="item.id">

<!-- ✅ Vue 3: v-if 优先级更高，可嵌套 -->
<template v-for="item in items" :key="item.id">
  <li v-if="item.active">{{ item.name }}</li>
</template>
```

### 问题 5: 组件重渲染过多
- **原因**: 父组件重渲染触发子组件重渲染
- **解决**: computed 缓存、v-memo、避免内联对象/函数

### 问题 6: SSR 水合不匹配
- **原因**: 服务端和客户端渲染内容不一致
- **解决**: 避免在 SSR 中使用 `window`、`Date.now()` 等

## 2. 适用场景 (Use Cases)
- 视图不更新排查
- 内存泄漏诊断
- 性能问题定位

## 3. 代码/配置示例 (Examples)
```javascript
// 内存泄漏防护
export default {
  mounted() {
    window.addEventListener('resize', this.handleResize)
    this.timer = setInterval(this.poll, 5000)
  },
  beforeUnmount() {
    window.removeEventListener('resize', this.handleResize)
    clearInterval(this.timer)
  }
}

// 深层 watch
watch: {
  user: {
    handler(newUser) { /* ... */ },
    deep: true  // 关键！
  }
}
```
