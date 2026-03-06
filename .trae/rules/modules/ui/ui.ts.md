# UI 组件规则

/**
 * UiRules
 * Auto-generated interface for legacy rule file.
 */
export interface UiRules {
  /** 
   * 规则描述 
   * @description 请将下方的 Markdown 内容逐步迁移到此结构化字段中
   */
  description: string;
}



## 概述
UI 组件基于 **Vue 2** 构建，并遵循基于 Mixin 的架构来处理共享逻辑（特别是侧边面板）。
组件注册在 `MeeWoo.Components` 下，Mixin 注册在 `MeeWoo.Mixins` 下。

## 核心接口

### PanelMixin
右侧面板（素材、导出、设置）的共享逻辑。

```typescript
// namespace MeeWoo.Mixins
interface PanelMixin {
  data: {
    /**
     * 控制当前可见的面板
     * 取值: 'to-svga', 'dual-channel', 'gif', 'material', 'frames', 'webp', 等
     */
    activeRightPanel: string | null;

    // 统一转换器配置
    dualChannelConfig: ConverterConfig;
    toSvgaConfig: ConverterConfig;
    
    // 状态标志
    isConvertingToSvga: boolean;
    isConvertingToDualChannel: boolean;
    // ...
  };

  methods: {
    /**
     * 打开面板的统一入口
     * 关闭其他面板并处理切换逻辑
     */
    openRightPanel(panelName: string): void;

    /**
     * 关闭当前面板 (如果忙碌则提示确认)
     */
    closeRightPanel(): void;

    // 特定面板打开器 (包装 openRightPanel 或设置逻辑)
    openToSvgaPanel(): void;
    openDualChannelPanel(): void;
  };
}

interface ConverterConfig {
  width: number;
  height: number;
  fps: number;
  quality: number;
  muted: boolean;
  aspectRatio: number;
  // ...
}
```

### MaterialPanel (示例组件)
显示可编辑素材列表。

```typescript
// namespace MeeWoo.Components
interface MaterialPanelProps {
  visible: boolean;
  list: MaterialItem[];
  replacedImages: Record<string, string>; // 映射 imageKey -> url
  isCompressing: boolean;
  compressProgress: number;
}

interface MaterialPanelEvents {
  /**
   * 点击关闭按钮时触发
   */
  (e: 'close'): void;

  /**
   * 请求替换素材时触发
   * @param index 列表中的原始索引
   */
  (e: 'replace', index: number): void;

  /**
   * 恢复原始素材时触发
   */
  (e: 'restore', index: number): void;

  /**
   * 打开素材编辑器时触发
   */
  (e: 'edit', item: MaterialItem): void;
}
```

## 实现规则
```typescript
  /**
   * 组件架构
   * @pattern Mixin 模式 (Vue 2)
   * @description 使用 Mixin 复用面板状态逻辑
   */
  architecture: {
    mixin: "PanelMixin";
    store: "Shared Object (MeeWoo.PanelState)";
    communication: "Event Bus ($emit/$on)";
  };

  /**
   * 面板交互规范
   */
  interaction: {
    /** 打开面板 */
    open: "Set isActive=true, Emit 'panel:open'";
    /** 关闭面板 */
    close: "Set isActive=false, Emit 'panel:close'";
    /** 切换面板 (互斥) */
    toggle: "Close others, Open target";
  };

  /**
   * 命名空间规范
   */
  namespace: {
    components: "MeeWoo.Components.*";
    mixins: "MeeWoo.Mixins.*";
    events: "kebab-case (e.g., 'export-start')";
  };

## Vue 响应式系统原理与差异 (Merged)

# Vue 响应式系统原理与差异
> 摘要: Vue 2 与 Vue 3 响应式实现机制对比
> 类型: Reference

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

## 4. 关联信息 (Meta)
- 来源: ai_protocol_hub/skill_specs/vue-rendering
- 建议归档位置: `modules/ui/vue-reactivity.ts.md`



## Vue 渲染性能优化策略 (Merged)

# Vue 渲染性能优化策略
> 摘要: 组件级、状态管理、构建层面的性能优化方法
> 类型: Guide

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

## 4. 关联信息 (Meta)
- 来源: ai_protocol_hub/skill_specs/vue-rendering
- 建议归档位置: `modules/ui/vue-performance.ts.md`



## Vue 常见渲染问题排查 (Merged)

# Vue 常见渲染问题排查
> 摘要: 数据更新视图不刷新、内存泄漏、v-if/v-for 等高频问题
> 类型: Reference

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

## 4. 关联信息 (Meta)
- 来源: ai_protocol_hub/skill_specs/vue-rendering
- 建议归档位置: `modules/ui/vue-troubleshooting.ts.md`



## Vue 生命周期最佳实践 (Merged)

# Vue 生命周期最佳实践
> 摘要: 各生命周期钩子的正确使用场景与注意事项
> 类型: Guide

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

## 4. 关联信息 (Meta)
- 来源: ai_protocol_hub/skill_specs/vue-rendering
- 建议归档位置: `modules/ui/vue-lifecycle.ts.md`

