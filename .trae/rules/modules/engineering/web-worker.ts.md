# Web Worker 基础概念与限制


/**
 * WebWorker基础概念与限制Rules
 * @description Generated from web-worker-basics.md
 */
export interface WebWorker基础概念与限制Rules {
  /** 
   * 规则描述 
   */
  description: string;
}


# Web Worker 基础概念与限制
> 摘要: Web Worker 的类型、运行机制与核心限制
> 类型: Reference

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

## 4. 关联信息 (Meta)
- 来源: ai_protocol_hub/skill_specs/web-worker
- 建议归档位置: `modules/engineering/web-worker.ts.md`


## Web Worker 数据传输优化 (Merged)

# Web Worker 数据传输优化
> 摘要: Transferable Objects 与消息传递优化策略
> 类型: Guide

## 1. 核心要点 (Key Points)

### 数据传输机制
- **Structured Clone Algorithm**: 默认方式，数据被复制
- **Transferable Objects**: 所有权转移，零拷贝

### Transferable Objects 使用
```javascript
// 默认方式（复制）
worker.postMessage({ buffer: largeArrayBuffer });

// Transferable 方式（转移所有权，零拷贝）
worker.postMessage({ buffer: largeArrayBuffer }, [largeArrayBuffer]);
// 注意：转移后主线程无法再访问该 ArrayBuffer
```

### 支持的 Transferable 类型
- ArrayBuffer
- MessagePort
- ImageBitmap
- ReadableStream
- WritableStream
- TransformStream

### 优化策略
| 策略 | 说明 |
|------|------|
| Transferable Objects | 大数据零拷贝传输 |
| 分批传输 | 大型数据集分批发送 |
| 数据压缩 | 传输前压缩数据 |
| 消息格式优化 | 简洁格式，减少冗余 |

## 2. 适用场景 (Use Cases)
- 大文件处理（图片、视频）
- 大数据量计算
- 实时数据流处理

## 3. 代码/配置示例 (Examples)
```javascript
// 主线程：发送大 ArrayBuffer
const largeBuffer = new ArrayBuffer(1024 * 1024 * 10); // 10MB
worker.postMessage({ type: 'process', data: largeBuffer }, [largeBuffer]);

// Worker 端接收
self.onmessage = function(e) {
  const { type, data } = e.data;
  // data 现在归 Worker 所有
  const result = processBuffer(data);
  // 返回结果时也可以转移
  self.postMessage({ result }, [result]);
};
```

## 4. 关联信息 (Meta)
- 来源: ai_protocol_hub/skill_specs/web-worker
- 建议归档位置: `modules/engineering/web-worker.ts.md`



## Vite 开发环境 Worker 加载问题 (Merged)

# Vite 开发环境 Worker 加载问题
> 摘要: 解决 Vite dev server 下 Worker 被 COEP 策略阻止的问题
> 类型: Guide

## 1. 核心要点 (Key Points)

### 问题现象
- Worker 在生产环境正常，但 `npm run dev` 下被阻止
- Network 面板显示 `ERR_BLOCKED_BY_RESPONSE`
- GIF/图片编码卡在某个百分比
- `vite.config.js` 的 `server.headers` 配置不生效

### 根本原因
Vite 开发服务器对 JS 文件有特殊处理（模块转换、HMR 等），可能覆盖或忽略自定义 headers 配置。

### 解决方案：使用 Vite 中间件插件
```javascript
// vite.config.js
export default defineConfig({
  plugins: [
    // 其他插件...
    {
      name: 'worker-cors-headers',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          if (req.url && req.url.includes('.worker.js')) {
            res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
            res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');
          }
          next();
        });
      }
    }
  ]
});
```

### 诊断步骤
1. 检查 Network 面板是否有 `ERR_BLOCKED_BY_RESPONSE` 错误
2. 对比开发环境和生产构建的行为差异
3. 验证 Worker 脚本响应头是否包含 `Cross-Origin-Resource-Policy`

## 2. 适用场景 (Use Cases)
- Vite 项目中使用 Web Worker
- 开发环境 Worker 加载失败排查
- COEP/COOP 策略相关问题

## 3. 代码/配置示例 (Examples)
```javascript
// Vite 中创建 Worker 的推荐方式
// 方式1: 使用 new URL
const worker = new Worker(new URL('./worker.js', import.meta.url));

// 方式2: 使用 ?worker 后缀
import MyWorker from './worker.js?worker';
const worker = new MyWorker();
```

## 4. 关联信息 (Meta)
- 来源: ai_protocol_hub/skill_specs/web-worker
- 建议归档位置: `modules/engineering/web-worker.ts.md`



## Web Worker Pool 实现模式 (Merged)

# Web Worker Pool 实现模式
> 摘要: Worker 池的设计与实现，优化并发任务处理
> 类型: Guide

## 1. 核心要点 (Key Points)

### 为什么需要 Worker Pool
- 避免频繁创建/销毁 Worker 的开销
- 控制并发 Worker 数量，防止资源耗尽
- 任务队列管理，按需分配

### 核心设计
```
┌─────────────────────────────────────┐
│           Worker Pool               │
├─────────────────────────────────────┤
│  ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐   │
│  │ W1  │ │ W2  │ │ W3  │ │ W4  │   │  ← Worker 实例池
│  └─────┘ └─────┘ └─────┘ └─────┘   │
├─────────────────────────────────────┤
│  Task Queue: [T1, T2, T3, ...]      │  ← 任务队列
└─────────────────────────────────────┘
```

### 关键实现要点
1. **任务队列**: 待处理任务存入队列
2. **Worker 状态管理**: 跟踪 busy/idle 状态
3. **自动调度**: Worker 空闲时自动处理下一个任务
4. **错误恢复**: Worker 出错时自动替换
5. **资源清理**: terminate() 释放所有资源

### API 设计
```javascript
const pool = new WorkerPool('worker.js', 4);  // 创建 4 个 Worker
pool.runTask({ type: 'compute', data: [...] })  // 返回 Promise
  .then(result => console.log(result));
pool.terminate();  // 清理资源
```

## 2. 适用场景 (Use Cases)
- 并发处理多个独立任务
- 图片批量处理
- 大数据并行计算

## 3. 代码/配置示例 (Examples)
```javascript
class WorkerPool {
  constructor(workerScript, size = 4) {
    this.workers = [];
    this.taskQueue = [];
    this.initialize(size, workerScript);
  }

  runTask(taskData) {
    return new Promise((resolve, reject) => {
      this.taskQueue.push({ data: taskData, resolve, reject });
      this.processQueue();
    });
  }

  processQueue() {
    const availableWorker = this.workers.find(w => !w.busy);
    if (availableWorker && this.taskQueue.length > 0) {
      const task = this.taskQueue.shift();
      availableWorker.busy = true;
      availableWorker.worker.postMessage(task.data);
    }
  }

  terminate() {
    this.workers.forEach(w => w.worker.terminate());
    this.workers = [];
  }
}
```

## 4. 关联信息 (Meta)
- 来源: ai_protocol_hub/skill_specs/web-worker/scripts/worker_pool.js
- 建议归档位置: `modules/engineering/web-worker.ts.md`



## Web Worker 常见问题与调试 (Merged)

# Web Worker 常见问题与调试
> 摘要: Worker 开发中的常见坑点与调试技巧
> 类型: Reference

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

// 发送任务
worker.postMessage({ type: 'task', data: someData });
```

## 4. 关联信息 (Meta)
- 来源: ai_protocol_hub/skill_specs/web-worker
- 建议归档位置: `modules/engineering/web-worker.ts.md`

