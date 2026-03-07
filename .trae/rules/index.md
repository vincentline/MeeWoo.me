# 项目规则路由 (Rules Router)

> 本文档采用**混合索引 (Hybrid Indexing)**。Layer 1 仅展示核心规范和领域入口，Layer 2 规则请在对应领域目录下使用 `LS` 查找。

## 1. 核心规范 (Core)
| 规范名称 | 文件路径 | 关键词 |
| :--- | :--- | :--- |
| **技术栈** | [tech-stack.ts.md](core/tech-stack.ts.md) | `stack`, `vue`, `vite` |
| **代码风格** | [coding-style.ts.md](core/coding-style.ts.md) | `style`, `naming` |
| **工作流** | [workflows.ts.md](core/workflows.ts.md) | `git`, `commit`, `log` |

## 2. 领域索引 (Domain Index)
| 领域 (Domain) | 目录入口 | 包含内容 |
| :--- | :--- | :--- |
| **图形与交互** | [modules/graphics/](modules/graphics/) | Canvas, Konva, WebGL, 3D |
| **多媒体处理** | [modules/media/](modules/media/) | FFmpeg, YYEVA, Audio, Video, GIF, 压缩 |
| **UI 与组件** | [modules/ui/](modules/ui/) | Vue 组件, 布局, 样式, Mixin |
| **工程化** | [modules/engineering/](modules/engineering/) | Build, Deploy, CI/CD, Web Worker |
| **核心架构** | [modules/core/](modules/core/) | 系统设计, 错误处理, 插件机制 |
| **数据与协议** | [modules/data/](modules/data/) | JSON Schema, Protobuf, Store, API |
| **业务规则** | [modules/business/](modules/business/) | 计费, 权限, 埋点, 导出限制 |

> **Instruction for Coder**:
> 1.  Identify the domain of the user request.
> 2.  Navigate to the corresponding `modules/<domain>/` directory.
> 3.  Execute `LS` to list rule files and sub-directories.
> 4.  **Index Pattern**: If you see a sub-directory (e.g. `canvas/`), read its `index.ts.md` entry point first.
> 5.  Otherwise, read the relevant `.ts.md` file directly.

## 3. 日志与记录 (Logs)
| 日志名称 | 文件路径 | 关键词 |
| :--- | :--- | :--- |
| **错误日志** | [error-log.md](logs/error-log.md) | `bug`, `fix` |
| **决策日志** | [decision-log.md](logs/decision-log.md) | `adr`, `arch` |
| **变更日志** | [UPDATE_LOG.md](../logs/UPDATE_LOG.md) | `log`, `change` |
