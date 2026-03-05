---
name: knowledge-gardener
description: 负责将开发经验快速提取并暂存到 Inbox（海马体）中。不直接修改长期规则库。
version: 2.0.0
---

# Knowledge Gardener Skill (速记员)

此技能模仿人脑的“海马体”功能，用于在开发过程中快速捕捉、提取并暂存经验碎片。

## 核心指令 (Core Instructions)

当用户请求总结经验或你识别到有价值的经验时，按以下步骤执行：

### 1. 经验提取 (Extraction)
分析当前对话历史，提取“问题-原因-解决方案”三元组或“最佳实践”。

### 2. 碎片化存储 (Inbox Storage)
- **生成文件名**: 使用 kebab-case 命名，格式为 `{模块}-{主题}-{类型}.md`。
    - 示例: `canvas-drag-performance-fix.md`
    - 示例: `ffmpeg-wasm-init-error.md`
- **写入文件**: 将经验内容写入 `.trae/rules/inbox/<文件名>`。内容应简洁明了，包含上下文和核心结论。

### 3. 索引同步 (Indexing)
- **读取索引**: 读取 `.trae/rules/inbox/index.md`。
- **追加条目**: 在表格末尾添加一行：
    `| [<文件名>](<文件名>) | <关键词> | <简短摘要> | <今天日期> |`
- **注意**: 不需要去修改 `modules/` 下的长期规则文件，那是 Librarian 的工作。
