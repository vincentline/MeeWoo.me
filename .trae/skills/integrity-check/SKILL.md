---
name: integrity-check
description: 在提交代码前，主动检查代码变更是否已在 Inbox（海马体）中生成了经验记录。
version: 2.0.0
---

# Integrity Check Skill (质检员)

此技能模仿人脑的“免疫系统”，用于在 `git commit` 前作为一道主动防线，确保“重要代码变更”都已产生“经验碎片”。

## 核心指令 (Core Instructions)

当用户请求“提交代码”或“检查一致性”时，必须按以下步骤执行：

### 1. 变更扫描与核查 (Scan & Verify)
- **运行脚本**: 执行 `python .trae/skills/integrity-check/scripts/scan_changes.py`。
- **解析输出**:
    - `✅ No staged files found`: 暂存区为空，提醒用户先 `git add`。
    - `✅ No core module changes detected`: 安全，直接通过。
    - `✅ Inbox has been updated today`: 虽有变更但已记笔记，直接通过。
    - `❌ WARNING`: 核心模块变更且无今日笔记，**必须触发警告**。

### 2. 强制补录 (Self-Healing)
如果脚本返回 WARNING：
- **警告**: 向用户报告“检测到核心模块变更，但未发现 Inbox 记录”。
- **补救**: 自动调用 `knowledge-gardener` Skill。
    - **输入**: 将 `git diff --cached` 的关键内容作为输入。
    - **执行**: 生成一个新的经验碎片文件，并写入 Inbox。
- **反馈**: 报告“已自动补录经验碎片：[文件名]”。

### 3. 最终提交 (Commit)
- 执行 `git add .`（将补录的碎片文件加入暂存区）。
- 执行 `git commit -m "..."`。
