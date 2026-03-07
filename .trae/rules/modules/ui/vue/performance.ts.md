---
module_name: VuePerformance
type: guide
description: Vue 渲染性能优化策略
version: 1.0.0
---

# Vue 渲染性能优化策略

```typescript
/**
 * Vue 性能优化
 */
export interface VuePerformance {
  /** 组件级 */
  component: {
    functional: boolean;
    keepAlive: boolean;
    vOnce: boolean;
    vMemo: boolean;
  };
  /** 构建级 */
  build: {
    treeShaking: boolean;
    codeSplitting: boolean;
  };
}
```

> 摘要: 组件级、状态管理、构建层面的性能优化方法

## 1. 核心要点 (Key Points)

### 组件级优化
| 技术 | 用途 | 效果 |
|------|------|------|
| 函数式组件 | 无状态展示组件 | 更快渲染、更小体积 |
| keep-alive | 缓存组件实例 | 避免重复挂载 |
| v-once | 静态内容 | 跳过 diff |
| v-memo (Vue 3.2+) | 缓存模板片段 | 按依赖更新 |
| 正确的 key | 列表渲染 | 高效 diff |

### Props 传递优化
```vue
<!-- ❌ 传递大对象 -->
<user-card :user="user"></user-card>

<!-- ✅ 只传需要的属性 -->
<user-card :name="user.name" :avatar="user.avatar"></user-card>
```

### 状态管理选择
| 应用规模 | 推荐方案 |
|----------|----------|
| 小型 (1-10 组件) | Vue 内置响应式 |
| 中型 (10-50 组件) | Pinia |
| 大型 (50+ 组件) | Pinia + 模块化 |

### 构建优化
- **Tree Shaking**: 移除未使用代码
- **Code Splitting**: 路由级/组件级懒加载
- **资源优化**: 图片压缩、WebP、字体子集化

### 运行时优化
- 避免模板内联函数（每次渲染创建新实例）
- 使用事件委托减少监听器
- 使用 `requestAnimationFrame` 替代 `setInterval` 动画
- 滚动事件使用 `.passive` 修饰符

## 2. 适用场景 (Use Cases)
- 组件频繁重渲染
- 首屏加载慢
- 大数据列表卡顿

## 3. 代码/配置示例 (Examples)
```vue
<!-- 路由懒加载 -->
const routes = [
  { path: '/', component: () => import('./Home.vue') }
]

<!-- 组件懒加载 -->
const HeavyComponent = defineAsyncComponent({
  loader: () => import('./HeavyComponent.vue'),
  delay: 200,
  timeout: 3000
})

<!-- v-memo 缓存 -->
<div v-memo="[selectedId]">
  <user-details :user-id="selectedId"></user-details>
</div>
```
