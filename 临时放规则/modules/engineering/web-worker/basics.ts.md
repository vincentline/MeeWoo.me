---
module_name: WebWorkerBasics
type: reference
description: Web Worker 基础概念与限制
version: 1.0.0
---

# Web Worker 基础概念与限制

```typescript
/**
 * WebWorker基础概念与限制Rules
 */
export interface WebWorkerBasics {
  /** 
   * 核心概念 
   */
  concepts: {
    dedicated: boolean;
    shared: boolean;
    serviceWorker: boolean;
  };
  /**
   * 核心限制
   */
  limitations: {
    domAccess: false;
    sameOrigin: true;
    fileAccess: false;
  };
}
```

> 摘要: Web Worker 的类型、运行机制与核心限制

## 1. 核心要点 (Key Points)

### Worker 类型
| 类型 | 用途 | 生命周期 |
|------|------|----------|
| Dedicated Worker | 只能被创建它的脚本使用 | 由创建者控制 |
| Shared Worker | 可被多个脚本共享 | 与连接数相关 |
| Service Worker | 缓存、离线功能、推送通知 | 独立于页面 |

### 运行机制
- 独立线程，拥有自己的执行上下文
- 通过消息传递与主线程通信，**不共享内存**
- 生命周期由创建者控制或 self.close() 自行终止

### 核心限制（重要！）
| 限制 | 说明 |
|------|------|
| 同源限制 | Worker 脚本必须与主线程脚本同源 |
| DOM 限制 | **无法直接操作 DOM** |
| 全局对象 | 无法访问 window、document、parent、top |
| 文件限制 | 无法读取本地文件，只能加载网络脚本 |
| 用户交互 | 不支持 alert、confirm、prompt |

### 支持的 API
- **网络请求**: fetch、XMLHttpRequest
- **存储**: IndexedDB
- **文件处理**: FileReader、FileReaderSync（仅 Worker 可用）
- **其他**: console、navigator、location（只读）、performance

## 2. 适用场景 (Use Cases)
- **适合**: 计算密集型任务、加密/解密、图像处理、大数据分析
- **不适合**: DOM 操作、频繁短任务、依赖主线程上下文

## 3. 代码/配置示例 (Examples)
```javascript
// 基础使用
const worker = new Worker('worker.js');

// 主线程发送消息
worker.postMessage({ type: 'task', data: someData });

// 主线程接收消息
worker.onmessage = function(e) {
  console.log('Result:', e.data);
};

// 错误处理
worker.onerror = function(e) {
  console.error('Worker error:', e);
};

// 终止 Worker
worker.terminate();
```
