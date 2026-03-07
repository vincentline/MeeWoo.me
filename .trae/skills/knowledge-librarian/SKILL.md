---
name: knowledge-librarian
description: 负责将 Inbox（海马体）中的经验碎片整理、归档到长期规则库（皮层）中。
version: 5.0.0
---

# Knowledge Librarian Skill (图书管理员 v5.0)

此技能模仿人脑的“睡眠整理”功能，负责将短期记忆转化为长期记忆。
v5.0 引入了**静默批处理**和**指挥官模式**，大幅提升整理效率与安全性。

## ⚠️ 核心禁令 (Strict Prohibitions)
- **禁止使用 `DeleteFile` 工具操作 Inbox 文件**: 任何时候都不得直接删除 Inbox 中的 `.md` 文件。所有清理工作必须由脚本静默完成（软删除）。

## 标准作业程序 (SOP)

### 1. 扫描与规划 (Scan & Plan)
- **扫描**: 查看 `.trae/rules/inbox/` 下的待处理文件。
- **决策 (Critic Mode)**: 在生成计划前，必须按以下格式对每个文件进行**分级质量审查**：

  ```text
  <critic>
  1. 拟归档碎片：[文件名]
  2. 风险评估 (Risk Assessment):
      - Level 0 (Pass): 纯文档、概念 -> 无需验证。
      - Level 1 (Check): 业务逻辑 -> 必须通过 `grep` 验证代码是否存在。
      - Level 2 (Verify): 核心接口 -> 必须阅读上下文，并通过 Plan JSON 中的 `verify_cmd` 参数添加验证命令。
  3. 冲突处理 (Conflict Resolution):
      - 一致 -> 归档。
      - 冲突 -> 以代码现状为准，修正知识内容后归档。
  </critic>
  ```

- **规划**: 基于审查结果生成 JSON 执行计划，保存至 `.trae/temp/archive_plan.json`。

**Plan JSON 示例**:
```json
[
  {
    "source": "note1.md",
    "target": ".trae/rules/modules/media/index.ts.md",
    "action": "merge"
  },
  {
    "source": "note2.md",
    "target": ".trae/rules/modules/graphics/konva.ts.md",
    "action": "create",
    "template": "new",
    "verify_cmd": "grep -r 'Konva' src/"
  }
]
```

### 2. 执行归档 (Execute)
调用指挥官脚本 `batch_processor.py` 执行计划。

- **Dry Run (预演 - 可选)**:
  `python .trae/skills/knowledge-librarian/scripts/batch_processor.py --plan .trae/temp/archive_plan.json --dry-run`
- **Execute (执行)**:
  `python .trae/skills/knowledge-librarian/scripts/batch_processor.py --plan .trae/temp/archive_plan.json`

### 3. 验证 (Verify)
- 检查脚本输出统计 (Success/Failed)。
- 确认 Inbox 文件已消失（移至 `.trae/trash/`）。
- 确认目标规则文件已更新。

### 4. 结构治理：大文件裂变 (Fission)
当发现规则文件 > 300 行时，需启动裂变程序。

- **检测**: 运行 `check_health.py` 发现大文件。
- **SOP**:
  1. Agent 调用 `check_health.py --fix-split [File]` 搭建目录架子（生成 `_draft_to_split.md`）。
  2. Agent 读取 Draft，识别知识簇。
  3. Agent 生成 **Plan JSON**，使用 `create` 动作将 Draft 拆分为多个原子文件。
  4. Agent 更新 `index.ts.md` 引用。
  5. 手动删除 Draft 文件（此特殊文件不在 Inbox 流程中，需手动清理）。

## 辅助指引 (Cheat Sheet)

### 领域分类
- **Graphics**: 2D/3D 图形 (Canvas, Konva, WebGL)
- **Media**: 多媒体 (FFmpeg, Audio, Video)
- **UI**: 界面与交互 (Vue, CSS)
- **Engineering**: 工程化 (Vite, CI/CD)
- **Core**: 核心架构
- **Data**: 数据与协议
- **Business**: 业务规则

### 归档策略
- **Create**: 目标不存在，或内容独立。
- **Merge**: 目标已存在，内容为补充。
- **Batch Merge**: 多个同类碎片归档到同一目标。
