---
name: knowledge-gardener
description: 负责将开发经验快速提取并暂存到 Inbox（海马体）中。
version: 3.1.0
---

# Knowledge Gardener Skill (速记员 v3.1)

此技能模仿人脑的“海马体”功能，用于在开发过程中快速捕捉、提取并暂存经验碎片。

## 触发机制 (Trigger)
当用户输入以下意图时触发：
- "把这个记下来" / "记录经验" / "生成笔记"
- "有个 bug 修复了" / "记录问题"
- "总结经验" / "保存到 inbox"

## 核心指令 (Core Instructions)

此技能采用 **Agent (大脑) + Script (手臂)** 协同工作模式。Agent 负责思考和决策，Script 负责执行和落地。

### 1. 认知层：信息分析与决策
分析用户的输入意图和当前的上下文信息：

- **场景 A：指令明确 (Direct Mode)**
  - 用户提供了明确的标题、类型和内容。
  - **Action**: 直接调用脚本创建笔记。
  - `python .trae/skills/knowledge-gardener/scripts/gardener.py new --type [bug|knowledge] --title "[Title]" --content "[Content]" --tags "[Tags]"`

- **场景 B：指令模糊 (Interactive Mode)**
  - 用户指令模糊（如“把这个记下来”），缺少标题或类型。
  - **Action**: 调用 `AskUserQuestion` 工具询问必要信息，获取回答后再调用脚本。

- **场景 C：长内容/复杂格式 (File Mode)**
  - 经验内容包含大量代码块、特殊字符或超过命令行长度限制。
  - **Action**: 
    1. 将整理好的 Markdown 内容写入临时文件（如 `.trae/temp/_temp_note.md`）。
    2. 调用脚本: `python .trae/skills/knowledge-gardener/scripts/gardener.py new --type [type] --title "[Title]" --content-file .trae/temp/_temp_note.md`
    3. 脚本会自动删除临时文件。

### 2. 执行层：调用脚本
- **脚本位置**: `.trae/skills/knowledge-gardener/scripts/gardener.py`
- **注意事项**: 
  - 始终优先使用 `gardener.py`，禁止手动构造 `Write` 和 `SearchReplace` 来操作 Inbox 文件和索引。
  - 遇到潜在重复（脚本返回 WARN），请自行判断是否继续或修改标题。

### 3. 查重校验 (可选)
- 在创建前，可先调用 `check` 命令检查关键词。
- `python .trae/skills/knowledge-gardener/scripts/gardener.py check --keywords "keyword1,keyword2"`

## 模板体系 (Templates)

脚本会自动根据 `--type` 选择对应的 Markdown 模板：

- **Bug 修复 (`--type bug`)**: 使用 `inbox_note.md`
  - 结构: Context -> Root Cause -> Solution -> Related Rules
- **通用知识 (`--type knowledge`)**: 使用 `inbox_knowledge.md`
  - 结构: Key Points -> Use Cases -> Examples -> Meta

> **注意**: 在 File Mode 下，Agent 应该预先按照上述模板结构整理内容，再写入临时文件。

## 脚本参数速查 (Reference)

| 参数 | 说明 | 示例 |
| :--- | :--- | :--- |
| `new` | 创建新笔记 | `python gardener.py new ...` |
| `--type` | 笔记类型 | `bug`, `knowledge` |
| `--title` | 笔记标题 | "Konva Performance Tips" |
| `--tags` | 标签 (可选) | "konva,performance" |
| `--content` | 内容字符串 | "Use caching..." |
| `--content-file` | 内容文件路径 | `.trae/temp/note.md` |
| `--raw` | 使用原始内容 | (不添加标准头部) |
| `check` | 检查重复 | `python gardener.py check ...` |
| `--keywords` | 检查关键词 | "konva,cache" |
