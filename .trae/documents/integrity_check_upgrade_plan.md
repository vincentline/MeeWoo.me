# Integrity Check & GitHub Release Automation Plan

> **目标**: 改造 `integrity-check` 技能，集成 GitHub Actions 自动化版本管理 (release-please)，并提供“一键发版”脚本，实现从提交规范到版本发布的闭环自动化。

## 1. 基础设施配置 (Infrastructure)

### 1.1 GitHub Actions Workflow

创建 `.github/workflows/release.yml`，配置 `release-please` 机器人。

* **功能**: 自动监控 `main` 分支，基于 Conventional Commits 生成 Release PR。

* **配置**: 使用 `google-github-actions/release-please-action@v4`。

### 1.2 Release Please Config

创建 `release-please-config.json`。

* **功能**: 映射 `commit_message.md` 中的 type 到 Changelog 章节。

* **映射规则**:

  * `feat` -> Features

  * `fix` -> Bug Fixes

  * `perf` -> Performance

  * `refactor` -> Refactor

  * `docs` -> Documentation

### 1.3 Manifest Config

创建 `.release-please-manifest.json`。

* **功能**: 声明发布的包名和初始版本。

## 2. 技能改造 (Skill Upgrade)

### 2.1 新增脚本 `release.py`

在 `.trae/skills/integrity-check/scripts/` 下创建一键发布脚本。

* **依赖**: `gh` (GitHub CLI)。

* **逻辑**:

  1. `gh pr list --search "label:autorelease: pending"` 查找待合并的 Release PR。
  2. 如果找到，输出 PR 信息。
  3. 执行 `gh pr merge <id> --merge --delete-branch`。
  4. 输出成功/失败信息。

### 2.2 更新 `SKILL.md`

* **新增指令**: 支持用户输入“发布新版”、“合并版本号”时，调用 `release.py`。

* **更新描述**: 明确 `integrity-check` 不仅负责提交前的检查，还负责发布阶段的执行。

## 3. 实施步骤 (Execution Steps)

1. **创建 GitHub 配置文件**:

   * `.github/workflows/release.yml`

   * `release-please-config.json`

   * `.release-please-manifest.json`
2. **开发发布脚本**:

   * `.trae/skills/integrity-check/scripts/release.py`
3. **更新技能定义**:

   * 修改 `.trae/skills/integrity-check/SKILL.md`
4. **验证**:

   * 模拟一次调用（Dry Run 脚本）。

## 4. 用户操作指南 (User Guide)

* **日常开发**: 继续使用 `integrity-check` 生成规范的 commit message。

* **发版时刻**: 对 AI 说 "帮我发版" 或 "合并版本号"。

* **手动干预**: 如需强制指定版本，在 GitHub PR 页面手动修改 PR 标题或打 Tag。

