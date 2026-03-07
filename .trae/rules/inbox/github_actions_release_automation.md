# GitHub_Actions_Release_Automation
> Tags: github,actions,release-please,versioning
> Created: 2026-03-07

# GitHub Actions 自动化版本管理最佳实践 (GitHub Release Automation)

> **Context**: 项目引入了 `release-please` 实现半自动化的 Semantic Versioning 管理。

## 1. 核心架构
采用 **Release Please (Google)** + **Conventional Commits** + **Manual Merge** 的组合方案。

- **机器人 (Robot)**: 监控 `main` 分支，基于提交信息 (`feat`, `fix`) 自动计算版本号，并维护一个 `chore: release` 的 Pull Request。
- **开发者 (Human)**: 
  - 日常提交严格遵守 Conventional Commits。
  - **发版时刻**: 手动合并 Release PR，触发 GitHub Release 和 Tag。

## 2. 版本号控制策略
- **Patch (1.0.1)**: 提交 `fix(...)`。
- **Minor (1.1.0)**: 提交 `feat(...)`。
- **Major (2.0.0)**: 提交包含 `BREAKING CHANGE` 的信息。
  ```text
  feat(core)!: 重构核心架构
  BREAKING CHANGE: API 已变更。
  ```
- **强制指定版本**: 手动修改 Release PR 分支中的 `.release-please-manifest.json`。

## 3. 一键发布脚本
为了简化操作，开发了 `release.py` 脚本：
- **原理**: 调用 `gh` CLI 查找并合并 Release PR。
- **命令**: `python .trae/skills/integrity-check/scripts/release.py`
- **优势**: 无需打开浏览器，终端一键发版。

## 4. 关键配置文件
- `.github/workflows/release.yml`: Action 定义。
- `release-please-config.json`: Changelog 章节映射。
- `.release-please-manifest.json`: 版本号数据源。
