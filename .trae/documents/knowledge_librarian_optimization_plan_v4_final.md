# Knowledge Librarian 体验优化方案 v4.0 (Final)

> **核心目标**: 解决 v3.0 在高频使用中的体验痛点，重点提升 **批量处理效率**、**决策明确性** 及 **大文件治理能力**。

## 1. 效率增强：定向批量处理 (Targeted Batch Processing)

**痛点**: `archiver.py` 单文件操作效率低，Context 消耗大。
**方案**: 升级脚本支持 **"定向收割"** 模式。

### 1.1 新增 `batch-merge` 命令

允许 Agent 将多个同类 Inbox 笔记一次性归档到同一个目标规则文件中。

* **调用方式**:

  ```bash
  python archiver.py batch-merge --target modules/graphics/canvas.ts.md --source "inbox/file1.md,inbox/file2.md" --dry-run
  ```

* **执行逻辑**:

  1. **预演 (Dry Run)**: 检查源文件存在性，验证目标路径，输出合并计划 (Plan)。
  2. **合并 (Execute)**:

     * 自动去重（Hash/标题匹配）。

     * 生成统一 Interface（若新建）。

     * 追加内容章节。
  3. **反馈**: 实时进度条 `[Batch] Merging 3 files... 100% ✅`。

***

## 2. 认知增强：决策指引速查 (Decision Cheat Sheet)

**痛点**: 模板选择模糊，归档策略摇摆不定。
**方案**: 在 `SKILL.md` 中集成决策表。

### 2.1 模板选择指南

| 模板类型        | 适用场景                          | 示例                      |
| :---------- | :---------------------------- | :---------------------- |
| `new`       | **默认/通用**。无法归类时用此模板。          | 任何模块                    |
| `guide`     | **操作教程**。包含步骤 (Step 1, 2, 3)。 | "如何配置 Vite", "环境搭建"     |
| `concept`   | **原理/概念**。解释 "是什么/为什么"。       | "双缓冲机制", "Vue 响应式原理"    |
| `reference` | **API/速查**。包含参数表、接口定义。        | "Konva API 列表", "错误码字典" |

### 2.2 归档策略指南

* **Create (新建)**: 目标模块不存在，或内容自成一体（独立知识点）。

* **Merge (合并)**: 目标模块已存在，内容是补充/修正。

* **Split (拆分)**: 目标模块 >300 行，触发裂变流程。

***

## 3. 结构治理：大文件裂变 (Fission Mechanism)

**痛点**: 规则文件臃肿 (>300行)，导致检索低效。
**方案**: 采用 **Index Pattern (索引模式)** 进行物理拆分。

### 3.1 拆分标准

* **触发**: `check_health.py` 报告文件行数 > 300。

* **原则**: 按 **知识簇 (Knowledge Cluster)** 拆分为原子文件。

### 3.2 自动化辅助 (`check_health.py --fix-split`)

脚本负责“搭架子”，Agent 负责“填肉”。

* **脚本动作**:

  1. 创建子目录 `modules/graphics/canvas/`。
  2. 生成入口索引 `index.ts.md` (预填 Interface 骨架)。
  3. 移动原文件 -> `_draft_to_split.md`。

### 3.3 Agent 操作流程 (SOP)

1. **检测**: 运行 `check_health.py` 发现大文件。
2. **准备**: 调用 `--fix-split` 生成目录结构。
3. **拆解**:

   * 读取 `_draft_to_split.md`。

   * 提取知识簇，调用 `archiver.py create` 生成原子文件 (`core.ts.md`, `events.ts.md`)。

   * 在 `index.ts.md` 中添加引用。
4. **清理**: 删除 `_draft_to_split.md`。

***

## 4. 闭环修复：脚本健壮性

### 4.1 `clean_inbox.py`

* **强制同步**: 删除文件后立即重写 `index.md`，杜绝索引残留。

* **容错**: 遇到非标准索引格式尝试自动修复。

### 4.2 `archiver.py`

* **验证命令**: 强制 Level 2 归档传入 `--verify-cmd`。

* **超时保护**: 所有操作默认 30s 超时。

***

## 5. 实施路线图

1. **Script 升级**:

   * 实现 `archiver.py` 的 `batch-merge`。

   * 实现 `check_health.py` 的 `--fix-split`。

   * 修复 `clean_inbox.py`。
2. **Prompt 更新**: 集成决策表与拆分 SOP 到 `SKILL.md`。
3. **验证**: 构造测试场景（批量合并 + 大文件拆分），验证流程闭环。

