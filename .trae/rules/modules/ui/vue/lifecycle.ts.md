---
module_name: VueLifecycle
type: guide
description: Vue 生命周期最佳实践
version: 1.0.0
---

# Vue 生命周期最佳实践

```typescript
/**
 * Vue 生命周期
 */
export interface VueLifecycle {
  /** 阶段 */
  phases: {
    creation: "beforeCreate, created";
    mounting: "beforeMount, mounted";
    updating: "beforeUpdate, updated";
    destruction: "beforeUnmount, unmounted";
  };
  /** 最佳实践 */
  practices: {
    dataFetch: "created / mounted";
    domAccess: "mounted";
    cleanup: "beforeUnmount";
  };
}
```

> 摘要: 各生命周期钩子的正确使用场景与注意事项

## 1. 核心要点 (Key Points)

### 生命周期钩子一览
| 钩子 | 时机 | 典型用途 |
|------|------|----------|
| `beforeCreate` | 实例创建前 | 初始化工作（少用） |
| `created` | 实例创建后 | 数据请求、API 调用 |
| `beforeMount` | DOM 挂载前 | 最后准备（少用） |
| `mounted` | DOM 挂载后 | DOM 操作、事件监听 |
| `beforeUpdate` | 数据更新前 | 更新前准备 |
| `updated` | 数据更新后 | DOM 依赖操作 |
| `beforeUnmount` | 卸载前 | **清理资源** |
| `unmounted` | 卸载后 | 最终清理 |

### 最佳实践

#### 数据请求
```javascript
// ✅ created 或 mounted
async created() {
  this.data = await this.fetchData()
}
```

#### DOM 操作
```javascript
// ✅ mounted（DOM 已存在）
mounted() {
  this.$refs.input.focus()
  window.addEventListener('resize', this.handleResize)
}
```

#### 资源清理（关键！）
```javascript
beforeUnmount() {
  // 清理事件监听
  window.removeEventListener('resize', this.handleResize)
  
  // 清理定时器
  clearTimeout(this.timer)
  clearInterval(this.interval)
  
  // 清理第三方库
  this.chart?.destroy()
}
```

### 注意事项
- ❌ 避免在生命周期中执行重计算
- ❌ `updated` 中避免修改响应式数据（可能无限循环）
- ✅ 使用 `nextTick` 等待 DOM 更新完成

## 2. 适用场景 (Use Cases)
- 组件初始化逻辑
- 资源管理
- DOM 操作时机

## 3. 代码/配置示例 (Examples)
```javascript
export default {
  data() {
    return {
      timer: null,
      chart: null
    }
  },
  
  async created() {
    this.data = await this.fetchData()
  },
  
  mounted() {
    this.initChart()
    this.timer = setInterval(this.poll, 5000)
  },
  
  beforeUnmount() {
    clearInterval(this.timer)
    this.chart?.destroy()
  },
  
  methods: {
    async fetchData() { /* ... */ },
    initChart() { /* ... */ },
    poll() { /* ... */ }
  }
}
```
