---
name: knowledge-librarian
description: 负责将 Inbox（海马体）中的经验碎片整理、归档到长期规则库（皮层）中。
version: 6.0.0
---

# Knowledge Librarian Skill (图书管理员 v6.0)

此技能模仿人脑的“睡眠整理”功能，负责将短期记忆转化为长期记忆。
v6.0 引入了**智能结构化 (Smart Structuring)**，由 Agent 负责将碎片重写为标准的 TypeScript Interface 规则。

## 触发机制 (Trigger)
当用户输入以下意图时触发：
- "整理 inbox" / "整理经验" / "归档笔记"
- "把海马体里的东西存一下"
- "执行归档"

## ⚠️ 核心禁令 (Strict Prohibitions)
- **禁止使用 `DeleteFile` 工具操作 Inbox 文件**: 任何时候都不得直接删除 Inbox 中的 `.md` 文件。所有清理工作必须由脚本静默完成（软删除）。

## 标准作业程序 (SOP)

### 1. 扫描与决策 (Scan & Critic)
- **扫描**: 查看 `.trae/rules/inbox/` 下的待处理文件。
- **决策**: 必须在对话中输出以下评估块：
  ```text
  <critic>
  1. 拟归档碎片: [文件名]
  2. 风险评估: Level 0 (Pass) / Level 1 (Check) / Level 2 (Verify)
  3. 模板选择: [new|guide|concept|reference]
  4. 结构化策略: [简述如何提取 Interface]
  </critic>
  ```

### 2. 结构化重写 (Structuring) - **核心步骤**
Agent 必须根据选择的模板（在 `.trae/skills/knowledge-librarian/templates/`），将 Inbox 碎片重写为标准的 "TS Interface + Markdown" 格式。

- **动作**:
  1. 读取 Inbox 笔记原文。
  2. 读取目标模板（如 `new_module.md`）。
  3. **Rewrite**: 
     - 提取配置项、API、约束 -> 填充到 TS Interface。
     - 整合详细说明 -> 填充到下方 Markdown。
     - 确保 Frontmatter (`---`) 完整。
  4. **Save**: 将重写后的完整内容保存到 `.trae/temp/structured_[filename].md`。

### 3. 生成计划 (Plan)
生成 JSON 执行计划，指向重写后的临时文件。

**Plan JSON 示例**:
```json
[
  {
    "source": "inbox/note1.md",
    "target": "modules/ui/button.ts.md",
    "action": "create",
    "content_file": ".trae/temp/structured_note1.md"
  }
]
```

### 4. 执行与验证 (Execute & Verify)
- **执行**: `python .trae/skills/knowledge-librarian/scripts/batch_processor.py --plan .trae/temp/archive_plan.json`
- **验证**: 确认脚本执行成功，Inbox 文件已移入回收站。

## 辅助指引 (Cheat Sheet)

### 领域分类 (Domains)
- **Graphics**: 2D/3D 图形 (Canvas, Konva, WebGL)
- **Media**: 多媒体 (FFmpeg, YYEVA, Audio, Video)
- **UI**: 界面与交互 (Vue, 组件库)
- **Engineering**: 工程化 (Vite, CI/CD, WebWorker)
- **Core**: 核心架构
- **Data**: 数据与协议
- **Business**: 业务规则

### 归档策略 (Strategies)
- **Create**: 目标不存在，或内容独立。
- **Merge**: 目标已存在，内容为补充。
- **Batch Merge**: 多个同类碎片归档到同一目标。
