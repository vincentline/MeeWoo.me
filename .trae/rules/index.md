# 项目规则索引 (Rules Index)

本文档作为项目开发规则的统一入口，所有开发者在进行开发前必须查阅相关规范。

## 核心规范 (Core Rules)

| 规范名称 | 文件路径 | 描述 |
| :--- | :--- | :--- |
| **技术栈** | [tech-stack.ts.md](core/tech-stack.ts.md) | 项目使用的框架、语言、库版本及用途说明 |
| **代码风格** | [coding-style.ts.md](core/coding-style.ts.md) | 命名规范、代码组织结构、注释要求等 |
| **工作流** | [workflows.ts.md](core/workflows.ts.md) | Git 提交、变更日志记录 (`UPDATE_LOG.md`)、发布与测试流程 |

## 模块规范 (Module Rules)

| 模块名称 | 文件路径 | 描述 |
| :--- | :--- | :--- |
| **Canvas 交互** | [canvas.ts.md](modules/canvas.ts.md) | Konva 画布交互、图层管理、性能优化规则 |
| **媒体处理** | [media.ts.md](modules/media.ts.md) | FFmpeg 转码、SVGA/Lottie 渲染、素材合成规则 |
| **UI 组件** | [ui.ts.md](modules/ui.ts.md) | 右侧面板交互、Mixin 复用、组件通信规范 |

## 日志与记录 (Logs)

| 日志名称 | 文件路径 | 描述 |
| :--- | :--- | :--- |
| **错误日志** | [error-log.md](logs/error-log.md) | 记录复杂报错、根本原因及解决方案 |
| **决策日志** | [decision-log.md](logs/decision-log.md) | 记录重大架构决策 (ADR) 及其背景 |
