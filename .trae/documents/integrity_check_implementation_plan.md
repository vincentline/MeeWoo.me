# 质检员 (Integrity-Check) 体验优化执行计划

根据 `integrity_check_optimization.md` 的规划，本计划旨在将 Integrity-Check 从“打卡机”升级为“智能安检仪 + 自动秘书”。

## 1. 升级核心扫描脚本

* **目标**: 解决“今日限定”和“只看有没有”的痛点，并细化忽略规则。

* **文件**: `.trae/skills/integrity-check/scripts/scan_changes.py`

* **变更点**:

  1. **引入“未归档”检查**: 解析 `inbox/index.md` 表格，提取所有未被删除的文件名（代表未归档）。
  2. **实现关键词匹配**:

     * 从 `git diff` 路径提取模块名（如 `src/core/canvas/` -> `canvas`）。

     * 从 Inbox 文件名/摘要提取关键词。

     * 只有当两者存在交集时，才视为“已覆盖”。
  3. **智能白名单**:

     * 移除 `.json` 的全量忽略。

     * 显式白名单: `package.json`, `.env`, `vite.config.js` 等。

     * 显式黑名单: `package-lock.json`, `dist/`, `*.log`。

## 2. 升级 Skill 指令与工作流

* **目标**: 实现自动补录和自动提交。

* **文件**: `.trae/skills/integrity-check/SKILL.md`

* **变更点**:

  1. **交互式修复流 (Interactive Fix Flow)**:

     * 若扫描失败，自动调用 Gardener 补录笔记。
  2. **自动生成提交信息 (Auto-Commit)**:

     * 扫描通过（或补录后），根据 `git diff` 摘要和 Inbox 笔记内容，生成 Angular 规范的 Commit Message。

     * 自动追加 `Ref: [Inbox File]`。
  3. **静默提交**:

     * 无需用户二次确认，直接执行提交。

## 执行步骤

1. 修改 `scan_changes.py` 脚本逻辑。
2. 更新 `SKILL.md` 指令，串联 Gardener 和 Auto-Commit 逻辑。
3. 验证新流程。

