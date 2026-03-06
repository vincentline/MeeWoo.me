---
name: knowledge-gardener
description: 负责将开发经验快速提取并暂存到 Inbox（海马体）中。不直接修改长期规则库。
version: 2.0.0
---

# Knowledge Gardener Skill (速记员)

此技能模仿人脑的“海马体”功能，用于在开发过程中快速捕捉、提取并暂存经验碎片。

## 核心指令 (Core Instructions)

当用户请求总结经验或你识别到有价值的经验时，按以下步骤执行：

### 1. 经验提取与切分 (Extraction & Pre-slicing)
分析当前对话历史或输入文档。
- **预切分 (Pre-slicing)**: 如果输入内容包含多个独立主题（如同时包含“规范”、“测试”和“部署”），**必须**将其拆分为多个独立的经验碎片。禁止将所有内容塞入一个文件。
- **模板选择**:
    - **问题/Bug 修复**: 读取 `.trae/skills/knowledge-gardener/templates/inbox_note.md`。
    - **纯知识/通识**: 读取 `.trae/skills/knowledge-gardener/templates/inbox_knowledge.md`。

### 2. 碎片化存储 (Inbox Storage)
- **生成文件名**: 使用 kebab-case 命名，格式为 `{模块}-{主题}-{类型}.md`。
    - 示例: `canvas-drag-performance-fix.md`
    - 示例: `ffmpeg-wasm-init-error.md`
- **生成内容**: 按照模板结构填充经验内容，保持简洁明了。
- **写入文件**: 将内容写入 `.trae/rules/inbox/<文件名>`。

### 3. 索引同步 (Indexing)
- **读取索引**: 读取 `.trae/rules/inbox/index.md`。
- **追加条目**: 在表格末尾添加一行：
    `| [<文件名>](<文件名>) | <关键词> | <简短摘要> | <今天日期> |`
- **注意**: 不需要去修改 `modules/` 下的长期规则文件，那是 Librarian 的工作。
