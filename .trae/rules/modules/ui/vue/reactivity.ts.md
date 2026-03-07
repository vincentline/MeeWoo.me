---
module_name: VueReactivity
type: reference
description: Vue 响应式系统原理与差异
version: 1.0.0
---

# Vue 响应式系统原理与差异

```typescript
/**
 * Vue 响应式系统
 */
export interface VueReactivity {
  /** Vue 2 vs Vue 3 */
  comparison: {
    vue2: "Object.defineProperty (Limitations on add/delete)";
    vue3: "Proxy (Full support)";
  };
  /** 解决方案 */
  workarounds: {
    propertyAdd: "Vue.set / this.$set";
    arrayIndex: "Vue.set / this.$set";
    arrayLength: "splice";
  };
}
```

> 摘要: Vue 2 与 Vue 3 响应式实现机制对比

## 1. 核心要点 (Key Points)

### Vue 2 响应式（Object.defineProperty）
- **原理**: 遍历对象属性，转换为 getter/setter
- **限制**: 
  - 无法检测属性添加/删除
  - 无法检测数组索引直接赋值
  - 无法检测数组长度修改
- **解决方案**: `Vue.set()` / `this.$set()`

### Vue 3 响应式（Proxy）
- **原理**: 使用 Proxy 代理整个对象
- **优势**:
  - 可检测属性添加/删除
  - 可检测数组索引和长度修改
  - 性能更好（大数据集）
- **API**: `reactive()`, `ref()`

### 响应式系统三要素
| 要素 | 职责 |
|------|------|
| Observer | 遍历数据对象，转换为 getter/setter |
| Dep | 收集依赖该属性的 Watcher |
| Watcher | 订阅变化，触发组件更新 |

### 依赖收集流程
```
1. 组件渲染时访问 data 属性
   ↓
2. getter 触发，收集当前 Watcher 到 Dep
   ↓
3. 属性变化时 setter 触发
   ↓
4. Dep 通知所有 Watcher
   ↓
5. Watcher 触发组件重新渲染
```

## 2. 适用场景 (Use Cases)
- 理解 Vue 数据更新机制
- 排查视图不更新问题
- Vue 2 迁移到 Vue 3

## 3. 代码/配置示例 (Examples)
```javascript
// Vue 2: 无法检测的情况
this.user.age = 25           // ❌ 属性新增
this.items[0] = 'new'        // ❌ 数组索引
this.items.length = 0        // ❌ 数组长度

// Vue 2: 正确方式
this.$set(this.user, 'age', 25)
this.$set(this.items, 0, 'new')
this.items.splice(0)

// Vue 3: 全部可检测
this.user.age = 25           // ✅
this.items[0] = 'new'        // ✅
this.items.length = 0        // ✅
```
