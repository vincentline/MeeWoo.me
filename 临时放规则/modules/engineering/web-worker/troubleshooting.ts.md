---
module_name: WebWorkerTroubleshooting
type: reference
description: Web Worker 常见问题与调试
version: 1.0.0
---

# Web Worker 常见问题与调试

```typescript
/**
 * Web Worker 调试与问题排查
 */
export interface WebWorkerTroubleshooting {
  /** 常见问题 */
  commonIssues: {
    scriptLoading: string;
    messagePassing: string;
    viteDevServer: string;
  };
  /** 调试技巧 */
  debugging: {
    browserTools: boolean;
    logging: boolean;
    errorHandling: boolean;
  };
}
```

> 摘要: Worker 开发中的常见坑点、调试技巧及 Vite 环境下的特殊问题

## 1. 核心要点 (Key Points)

### 常见错误类型
| 错误类型 | 原因 | 解决方案 |
|----------|------|----------|
| 脚本加载错误 | 路径错误、同源策略 | 检查路径、确保同源 |
| 消息传递错误 | 数据格式错误、循环引用 | 简化消息格式、避免循环引用 |
| 执行错误 | 语法错误、运行时错误 | 使用 try-catch |
| 资源错误 | 内存不足、Worker 数量限制 | 控制 Worker 数量、及时释放 |

### 高频问题

#### 1. Worker 不执行
- 检查脚本路径是否正确
- 检查同源策略
- 检查浏览器兼容性

#### 2. 消息不传递
- 检查 postMessage 调用
- 检查事件监听器设置
- 检查数据是否包含循环引用

#### 3. 内存泄漏
- 任务完成后调用 terminate()
- 组件卸载时清理 Worker 实例
- 避免创建过多 Worker 实例

### Vite 开发环境特殊问题 (COEP/COOP)
- **现象**: Worker 在生产环境正常，但 `npm run dev` 下被阻止，Network 面板显示 `ERR_BLOCKED_BY_RESPONSE`。
- **原因**: Vite 开发服务器对 JS 文件有特殊处理，可能覆盖或忽略自定义 headers 配置。
- **解决方案**: 使用 Vite 中间件插件手动添加 `Cross-Origin-Resource-Policy` 和 `Cross-Origin-Embedder-Policy`。

### 调试方法
| 浏览器 | 调试位置 |
|--------|----------|
| Chrome | Sources 面板 → Threads |
| Firefox | Debugger 面板 → Worker |
| Safari | Develop 菜单 → Sources 面板 |

### 调试技巧
```javascript
// Worker 内部日志
console.log('[Worker]', 'Processing:', data);

// 错误传递到主线程
try {
  // ... 处理逻辑
} catch (error) {
  self.postMessage({ type: 'error', message: error.message });
}

// 主线程错误监听
worker.onerror = function(e) {
  console.error('Worker error:', e.message, e.filename, e.lineno);
};
```

## 2. 适用场景 (Use Cases)
- Worker 行为异常排查
- 性能问题诊断
- 内存泄漏排查
- Vite 开发环境调试

## 3. 代码/配置示例 (Examples)
```javascript
// 完整的错误处理模式
const worker = new Worker('worker.js');

worker.onmessage = function(e) {
  const { type, data, error } = e.data;
  if (type === 'error') {
    console.error('Worker reported error:', error);
    return;
  }
  // 处理正常结果
};

worker.onerror = function(e) {
  console.error('Worker runtime error:', e.message);
  e.preventDefault(); // 阻止默认错误传播
};
```
