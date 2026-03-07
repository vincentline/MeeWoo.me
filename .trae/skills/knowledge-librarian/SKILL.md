---
name: knowledge-librarian
description: 负责将 Inbox（海马体）中的经验碎片整理、归档到长期规则库（皮层）中。
version: 4.0.0
---

# Knowledge Librarian Skill (图书管理员)

此技能模仿人脑的“睡眠整理”功能，负责将短期记忆转化为长期记忆。

## 核心指令 (Core Instructions)

此技能采用 **Agent (大脑) + Script (手臂)** 协同工作模式。

### 1. 扫描与决策 (Scan & Decision)
- **全量扫描**: 读取 Inbox 索引 (`.trae/rules/inbox/index.md`)，默认对所有条目进行归档。
- **分类与决策速查 (Decision Cheat Sheet)**:
  - **领域分类**:
    - **Graphics**: 2D/3D 图形 (Canvas, Konva, WebGL)
    - **Media**: 多媒体 (FFmpeg, Audio, Video)
    - **UI**: 界面与交互 (Vue, CSS)
    - **Engineering**: 工程化 (Vite, CI/CD)
    - **Core**: 核心架构
    - **Data**: 数据与协议
    - **Business**: 业务规则
  - **模板选择**:
    - `new`: 通用/默认
    - `guide`: 操作教程 (Steps)
    - `concept`: 原理/概念 (Why/What)
    - `reference`: API/速查表
  - **归档策略**:
    - **Create**: 目标不存在，或内容独立。
    - **Merge**: 目标已存在，内容为补充。
    - **Batch Merge**: 多个同类碎片归档到同一目标。

### 2. 执行归档 (Execute Archiving)
调用核心脚本 `archiver.py`。

- **新建模块 (Create)**:
  `python .trae/skills/knowledge-librarian/scripts/archiver.py create --source [Src] --target [Dst] --template [Type] --verify-cmd "[Cmd]"`
- **合并规则 (Merge)**:
  `python .trae/skills/knowledge-librarian/scripts/archiver.py merge --source [Src] --target [Dst]`
- **批量合并 (Batch Merge)**:
  `python .trae/skills/knowledge-librarian/scripts/archiver.py batch-merge --target [Dst] --source "file1,file2"`
  *(建议先加 `--dry-run` 预演)*

### 3. 批评家模式 (Critic Mode) - 风险评估
在归档前，必须进行**分级质量审查**：

```text
<critic>
1. 拟归档碎片：[文件名]
2. 风险评估 (Risk Assessment):
    - Level 0 (Pass): 纯文档、概念 -> 无需验证。
    - Level 1 (Check): 业务逻辑 -> Script 辅助 grep 验证。
    - Level 2 (Verify): 核心接口 -> Agent 阅读 + Script 验证 (--verify-cmd)。
3. 冲突处理 (Conflict Resolution):
    - 一致 -> 归档。
    - 冲突 -> 以代码现状为准，修正后归档。
</critic>
```

### 4. 结构治理：大文件裂变 (Fission)
- **检测**: 运行 `check_health.py` 发现文件 > 300 行。
- **SOP**:
  1. Agent 调用 `check_health.py --fix-split [File]` 搭建目录架子。
  2. Agent 读取生成的 `_draft_to_split.md`。
  3. Agent 识别知识簇，调用 `archiver.py create` 拆分为原子文件 (Index Pattern)。
  4. Agent 更新 `index.ts.md` 引用并删除 Draft。

### 5. 清理收尾 (Cleanup)
- **指令**: `python .trae/skills/knowledge-librarian/scripts/clean_inbox.py [Files...]`
- **验证**: 确认文件删除且索引更新。
