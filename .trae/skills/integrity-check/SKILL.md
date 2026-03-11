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
- **自动暂存**: 脚本会自动检测暂存区，若为空则执行 `git add -A`。
- **解析输出**:
    - `✅ No changes to commit`: 没有任何变更，流程结束。
    - `✅ No core module changes detected`: 安全，直接通过。
    - `✅ Changes covered by Inbox notes`: 安全，直接通过。同时**提取** `__REF_NOTES__` 中的文件名。
    - `❌ WARNING`: 核心模块变更且无匹配笔记，**触发交互式修复**。

### 2. 交互式修复流 (Interactive Fix Flow)
如果脚本返回 WARNING，使用 `AskUserQuestion` 工具与用户交互，提供以下三个选项：

| 选项 | 标签 | 行为描述 |
| :--- | :--- | :--- |
| **A** | 自动补录 (推荐) | 自动调用 `knowledge-gardener` Skill，将 `git diff --cached` 作为输入，生成经验记录后继续流程。 |
| **B** | 终止处理 | 终止当前流程，要求用户手动处理 Inbox 记录后再重新提交。 |
| **C** | 忽略继续 | 跳过 Inbox 检查，直接进入下一步流程（不推荐，可能导致经验丢失）。 |

> **Prompt 示例**: "检测到核心模块变更，但未发现 Inbox 记录。请选择处理方式："

### 3. 自动提交与推送 (Auto-Commit & Push)

当检查通过（或补录完成）后，按以下步骤执行：

| 步骤 | 操作 | 命令 | 说明 |
|:---|:---|:---|:---|
| 1 | **同步远程** | `git pull origin main` | **必须**执行，确保本地代码与远程同步，避免冲突 |
| 2 | **暂存所有变更** | `git add -A` | **必须**执行，确保所有变更（包括暂存区和非暂存区）都被暂存 |
| 3 | **读取模板** | - | 读取 `.trae/skills/integrity-check/templates/commit_message.md` |
| 4 | **生成消息** | - | 根据 `git diff` 摘要和 Inbox 笔记内容填充模板，严格遵循 Conventional Commits 规范 |
| 5 | **写入临时文件** | - | 将生成的消息写入 `.git/COMMIT_EDITMSG_TEMP` |
| 6 | **静默提交** | `git commit -F .git/COMMIT_EDITMSG_TEMP` | 使用临时文件中的消息进行提交 |
| 7 | **推送到远程** | `git push origin main` | 将本地提交推送到远程仓库 |

**提交消息生成规范：**

1. **[type]**: 选择变更类型 (feat, fix, docs, style, refactor, perf, test, build, ci, chore, revert)
   - **Breaking Change**: 若包含破坏性变更，在 type 后加 `!` (e.g., `feat!: ...`)
2. **[scope]**: 影响的模块名 (如 canvas, media, core)
3. **[subject]**: 简短的中文描述 (不超过 60 字)
4. **[body]**:
   - **只写功能/业务更新，不写具体文件列表**（Git 历史已有）
   - 将复杂的变更归纳为几点核心功能点
   - 使用无序列表
5. **[footer]**:
   - `Ref: [inbox_file]` (必填，关联的 Inbox 文件名，逗号分隔)
   - `BREAKING CHANGE: ...` (如有)
   - `Closes #IssueID` (如有)

### 4. 自动发版 (Auto Release)
当用户请求“发布新版”、“合并版本号”或“发版”时：
- **运行脚本**: 执行 `python .trae/skills/integrity-check/scripts/release.py`。
- **行为**:
    - 脚本会自动查找由 `release-please` 创建的 Release PR。
    - 如果找到，通过 GitHub CLI 自动合并，触发 GitHub Actions 发布流程。
    - 如果未找到，提示用户当前无可发布内容。


