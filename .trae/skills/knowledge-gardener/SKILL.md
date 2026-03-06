---
name: knowledge-gardener
description: 负责将开发经验快速提取并暂存到 Inbox（海马体）中。不直接修改长期规则库。
version: 3.0.0
---

# Knowledge Gardener Skill (速记员)

此技能模仿人脑的“海马体”功能，用于在开发过程中快速捕捉、提取并暂存经验碎片。

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
    1. 将整理好的 Markdown 内容写入临时文件（如 `_temp_note.md`）。
    2. 调用脚本: `python .trae/skills/knowledge-gardener/scripts/gardener.py new --type [type] --title "[Title]" --content-file _temp_note.md`
    3. 删除临时文件。

### 2. 执行层：调用脚本
- **脚本位置**: `.trae/skills/knowledge-gardener/scripts/gardener.py`
- **注意事项**: 
  - 始终优先使用 `gardener.py`，禁止手动构造 `Write` 和 `SearchReplace` 来操作 Inbox 文件和索引。
  - 遇到潜在重复（脚本返回 WARN），请自行判断是否继续或修改标题。

### 3. 查重校验 (可选)
- 在创建前，可先调用 `check` 命令检查关键词。
- `python .trae/skills/knowledge-gardener/scripts/gardener.py check --keywords "keyword1,keyword2"`
