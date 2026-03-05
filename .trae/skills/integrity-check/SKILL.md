---
name: integrity-check
description: 在提交代码前，主动检查代码与文档的一致性，并具备自动修复能力。
version: 1.0.0
---

# Integrity Check Skill

此技能用于在 `git commit` 前作为一道主动防线，确保“代码变更”与“文档更新”同步。

## 核心指令 (Core Instructions)

当用户请求“提交代码”或“检查一致性”时，必须按以下步骤执行：

### 1. 变更扫描 (Scan)
- 执行 `git diff --cached --name-only`。
- 识别受影响的核心模块（如 `src/core/canvas` -> `modules/canvas.ts.md`）。

### 2. 文档比对 (Verify)
- 检查对应文档的最后修改时间或内容。
- 判断：文档是否包含了代码变更中的新逻辑？

### 3. 自修复 (Self-Healing)
如果发现文档未更新：
- **触发**：自动调用 `knowledge-gardener` Skill。
- **输入**：将 `git diff` 的内容作为输入，要求提取变更点。
- **执行**：将变更点追加到文档中。
- **反馈**：向用户报告“已自动修复文档一致性问题”。

### 4. 最终提交 (Commit)
- 执行 `git add .`（将文档变更加入暂存区）。
- 执行 `git commit -m "..."`。
