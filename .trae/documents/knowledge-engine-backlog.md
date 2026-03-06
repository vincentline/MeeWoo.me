# 知识引擎优化清单 (Knowledge Engine Backlog)

本文档用于记录 MeeWoo 知识引擎的使用反馈、优化建议及迭代计划。

## 1. 待优化项 (Backlog)

### [P0] 架构升级：类脑记忆机制 (Brain-Inspired Memory)
- **核心理念**: 模仿人脑的工作记忆、海马体（短期）和皮层（长期）机制。
- **组件分工**:
    - **Inbox (海马体)**: 存放碎片化、未整理的经验 (`.trae/rules/inbox/`)。
    - **Rules (皮层)**: 存放结构化、长期有效的规范 (`.trae/rules/modules/`)。
- **角色调整**:
    - **Knowledge-Gardener (采集员)**: 只负责写入 Inbox，不直接修改 Rules。
    - **coder (执行者)**: 同时查阅 Rules (长期) 和 Inbox Index (短期)。
    - **Knowledge-Librarian (图书管理员)**: 新增角色，负责定期将 Inbox 内容归档进 Rules (睡眠整理)。
- **来源**: 2026-03-06 架构研讨

### [P1] Inbox 索引化 (Indexed Inbox)
- **文件结构**: 创建 `.trae/rules/inbox/index.md`。
- **命名规范**: 碎片文件使用 kebab-case (如 `canvas-drag-fix.md`)。
- **索引内容**: 包含文件名、关键词、摘要、创建日期。
- **来源**: 2026-03-06 架构研讨

### [P1] 知识裂变机制 (Cell Division)
- **单文件阈值**: 当 Rules 文件超过 300 行时，Librarian 需将其拆分为子目录。
- **日志归档**: 当 `error-log.md` 过长时，按月归档。
- **来源**: 2026-03-06 架构研讨

### [P1] coder 体验优化
- **问题**: `<thinking>` 块的显性输出影响对话流畅性，且 Agent 倾向于内化思考。
- **方案**: 
    - 将 `<thinking>` 标记为 **Internal Thought** (内部思维)，允许 Agent 在内心演练。
    - 仅在 **Checklist (自检清单)** 环节要求显性输出。
- **来源**: 2026-03-05 访谈反馈

### [P1] 规则路由增强
- **问题**: `index.md` 仅为列表，Agent 需多轮调用才能定位规则，检索效率低。
- **方案**: 
    - 升级 `index.md` 为 **路由表**，增加 `keywords` 字段。
    - 示例: `| **媒体处理** | [media.ts.md] | 关键词: ffmpeg, video, audio, wasm, 格式转换 |`
    - 在 `coder` Prompt 中内置 “关键词 -> 规则文件” 映射表。
- **来源**: 2026-03-05 访谈反馈

### [P2] Knowledge-Gardener 格式灵活性
- **问题**: 强制要求 TS Interface 格式导致 `error-log.md` (Markdown 列表) 更新困难，且“查重”缺乏工具支持。
- **方案**: 
    - **分场景格式规范**: 
        - 模块规范 (Reference Doc) -> 使用 TS Interface。
        - 日志记录 (Log Doc) -> 使用 Markdown Item。
    - **引入检索工具**: 提示 Agent 使用 `Grep` 检查关键词进行查重。
- **来源**: 2026-03-05 访谈反馈

### [P2] 规则的可执行性增强
- **问题**: 目前规则多为文本描述，缺乏可直接引用的代码。
- **方案**: 
    - 在规则文件中增加 **Code Snippet (代码片段)** 或 **Validator Script (校验脚本)**。
    - 示例: 在 `image-compression.ts.md` 中提供 `validateParams` 函数供 coder 直接引用。
- **来源**: 2026-03-05 访谈反馈

## 2. 已完成 (Done)
- [x] 创建 `knowledge-engine-backlog.md` (2026-03-05)

## 3. 访谈记录 (Interviews)

### 2026-03-05 Agent 自省访谈
**背景**: 基于实际执行“优化 Canvas 拖拽性能”及“WASM 配置”任务后的体验反馈。

**核心观点**:
1.  **coder**: 成功强制查阅文档避免了配置错误，但 `<thinking>` 输出过于僵硬，规则定位成本高。
2.  **Knowledge-Gardener**: 闭环思维非常有价值，防止了经验丢失，但格式要求过于死板 (TS vs Markdown)，查重困难。
3.  **Rules 系统**: `index.md` 需要升级为带关键词的路由表；规则文件应包含可执行代码片段。

**结论**: 系统已形成正向循环，主要改进点在于 **减少认知负担 (自动路由)** 和 **增加格式灵活性**。
