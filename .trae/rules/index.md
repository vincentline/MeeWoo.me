# 项目规则路由 (Rules Router)

本文档作为项目开发规则的统一入口和智能路由表。

## 核心规范 (Core Rules)

| 规范名称 | 文件路径 | 关键词 (Keywords) | 描述 |
| :--- | :--- | :--- | :--- |
| **技术栈** | [tech-stack.ts.md](core/tech-stack.ts.md) | `stack`, `vue`, `konva`, `vite`, `lib` | 项目使用的框架、语言、库版本及用途说明 |
| **代码风格** | [coding-style.ts.md](core/coding-style.ts.md) | `style`, `naming`, `comment`, `structure` | 命名规范、代码组织结构、注释要求等 |
| **工作流** | [workflows.ts.md](core/workflows.ts.md) | `git`, `commit`, `log`, `release`, `test` | Git 提交、变更日志记录 (`UPDATE_LOG.md`)、发布与测试流程 |

## 模块规范 (Module Rules)

| 模块名称 | 文件路径 | 关键词 (Keywords) | 描述 |
| :--- | :--- | :--- | :--- |
| **Canvas 交互** | [canvas.ts.md](modules/canvas.ts.md) | `canvas`, `drag`, `layer`, `performance` | Konva 画布交互、图层管理、性能优化规则 |
| **媒体处理** | [media.ts.md](modules/media.ts.md) | `media`, `ffmpeg`, `video`, `audio`, `wasm` | FFmpeg 转码、SVGA/Lottie 渲染、素材合成规则 |
| **图片压缩** | [image-compression.ts.md](modules/image-compression.ts.md) | `image`, `compress`, `tinypng`, `wasm` | TinyPNG 集成、WASM 配置、压缩策略 |
| **UI 组件** | [ui.ts.md](modules/ui.ts.md) | `ui`, `panel`, `mixin`, `component` | 右侧面板交互、Mixin 复用、组件通信规范 |

## 日志与记录 (Logs)

| 日志名称 | 文件路径 | 关键词 (Keywords) | 描述 |
| :--- | :--- | :--- | :--- |
| **错误日志** | [error-log.md](logs/error-log.md) | `error`, `bug`, `fix`, `solution` | 记录复杂报错、根本原因及解决方案 |
| **决策日志** | [decision-log.md](logs/decision-log.md) | `adr`, `decision`, `arch` | 记录重大架构决策 (ADR) 及其背景 |
