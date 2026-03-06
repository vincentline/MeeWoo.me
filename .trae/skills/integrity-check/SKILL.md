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
    - `✅ Changes covered by Inbox notes`: 安全，直接通过。同时**提取** `__REF_NOTES__` 中的文件名。
    - `❌ WARNING`: 核心模块变更且无匹配笔记，**触发交互式修复**。

### 2. 交互式修复流 (Interactive Fix Flow)
如果脚本返回 WARNING：
- **Prompt**: “检测到核心模块变更，但未发现 Inbox 记录。是否立即调用 Gardener 补录？(Y/n)”
- **Action (Y)**: 自动调用 `knowledge-gardener` Skill，将 `git diff --cached` 作为输入。
- **Action (n)**: 终止流程，要求用户手动处理。

### 3. 自动提交与推送 (Auto-Commit & Push)
当检查通过（或补录完成）后：
- **读取模板**: 读取 `.trae/skills/integrity-check/templates/commit_message.md`。
- **生成消息**: 
    - 根据 `git diff` 摘要和 Inbox 笔记内容，填充模板。
    - 确保 `[body]` 使用清晰的中文描述。
    - 确保 `Ref` 和 `Type` 字段准确无误。
- **写入临时文件**: 将生成的消息写入 `.git/COMMIT_EDITMSG_TEMP`。
- **静默提交**: 执行 `git commit -F .git/COMMIT_EDITMSG_TEMP`，无需用户确认。
- **清理临时文件**: 提交成功后删除 `.git/COMMIT_EDITMSG_TEMP`。
- **推送到远程**: 执行 `git push`，将本地提交同步到远程仓库。

> **注意**: 由于终端环境 (trae-sandbox) 对多行/中文参数解析有限制，必须使用 `-F` 文件方式提交，避免参数解析错误。

