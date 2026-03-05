---
name: integrity-check
description: 在提交代码前，主动检查代码变更是否已在 Inbox（海马体）中生成了经验记录。
version: 2.0.0
---

# Integrity Check Skill (质检员)

此技能模仿人脑的“免疫系统”，用于在 `git commit` 前作为一道主动防线，确保“重要代码变更”都已产生“经验碎片”。

## 核心指令 (Core Instructions)

当用户请求“提交代码”或“检查一致性”时，必须按以下步骤执行：

### 1. 变更扫描 (Scan)
- 执行 `git diff --cached --name-only`。
- 识别受影响的核心模块（如 `src/core/canvas` -> 关联 `Canvas` 模块）。
- 如果只有文档变更或无关紧要的配置文件（如 `.gitignore`），则直接通过。

### 2. 记忆核查 (Verify Inbox)
- 读取 `.trae/rules/inbox/index.md`。
- **判断**: 检查今日（或最近）的索引条目中，是否存在与变更模块相关的经验碎片？
    - *Case A*: 修改了 `Canvas` 拖拽逻辑 -> Inbox 中有 `canvas-drag-fix.md` -> **Pass**。
    - *Case B*: 修改了 `FFmpeg` 配置 -> Inbox 中无相关记录 -> **Warning**。

### 3. 强制补录 (Self-Healing)
如果发现代码变更未产生经验记录：
- **警告**: 向用户报告“检测到核心模块变更，但未发现 Inbox 记录”。
- **补救**: 自动调用 `knowledge-gardener` Skill。
    - **输入**: 将 `git diff` 的关键内容作为输入。
    - **执行**: 生成一个新的经验碎片文件，并写入 Inbox。
- **反馈**: 报告“已自动补录经验碎片：[文件名]”。

### 4. 最终提交 (Commit)
- 执行 `git add .`（将补录的碎片文件加入暂存区）。
- 执行 `git commit -m "..."`。
