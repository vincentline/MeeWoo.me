# 项目工作流协议 (Workflows Protocols)

> **定位**: 本文档是项目的**元规则**，定义了核心协议标准（Protocols）和工作流路由（Router）。具体的操作指南请查阅对应 Skill 的文档。

## 1. 协议标准 (Core Protocols)

### 1.1 版本控制协议 (Versioning)
*   **标准**: [Semantic Versioning 2.0.0](https://semver.org/)
*   **格式**: `Major.Minor.Patch` (e.g., `1.2.3`)
*   **自动化**: 由 `release-please` 基于 Git 提交信息自动计算。
    *   `fix` -> Patch
    *   `feat` -> Minor
    *   `BREAKING CHANGE` -> Major

### 1.2 提交信息协议 (Commit Message)
*   **标准**: [Conventional Commits 1.0.0](https://www.conventionalcommits.org/)
*   **格式**: `type(scope)!: subject`
*   **类型 (Types)**:
    *   `feat`: 新功能
    *   `fix`: 修复 Bug
    *   `docs`: 文档变更
    *   `style`: 代码格式 (不影响逻辑)
    *   `refactor`: 代码重构
    *   `perf`: 性能优化
    *   `test`: 测试相关
    *   `build`: 构建系统/依赖
    *   `ci`: CI 配置
    *   `chore`: 杂项
    *   `revert`: 回退
*   **执行**: 必须使用 `/skill integrity-check` 生成规范消息。

### 1.3 变更日志协议 (Change Log)
*   **文件**: `.trae/logs/UPDATE_LOG.md`
*   **定位**: 项目的“行车记录仪”，记录每一次文件变更。
*   **格式**: `[YYYY-MM-DD HH:MM:SS] 【<ActionType>】 : <RelativePath> - <Description>`
*   **时区**: Asia/Shanghai (UTC+8)
*   **执行**: 代码修改时由 Coder 技能自动调用 `log_change.py` 记录，**禁止人工手写**。

## 2. 工作流路由 (Workflow Router)

### 2.1 开发流 (Development)
> 我要写代码、修 Bug、加功能。

*   **Action**: 调用 `/skill coder`
*   **流程**: 
    1.  **Triage**: 评估任务复杂度。
    2.  **Context**: 查阅 Rules 和 Inbox。
    3.  **Execute**: 编写代码并实时更新 `UPDATE_LOG.md`。
    4.  **Verify**: 自检与测试。

### 2.2 提交流 (Commit)
> 代码写完了，我要提交到 Git。

*   **Action**: 调用 `/skill integrity-check`
*   **流程**:
    1.  **Scan**: 检查变更是否已在 Inbox 备案。
    2.  **Fix**: 若无备案，交互式补录经验。
    3.  **Commit**: 生成规范消息并提交。

### 2.3 知识流 (Knowledge)
> 我学到了新知识，或者要整理旧经验。

*   **记录 (Input)**: 调用 `/skill knowledge-gardener`
    *   用于快速捕捉碎片化经验。
*   **整理 (Organize)**: 调用 `/skill knowledge-librarian`
    *   用于批量归档 Inbox，拆分大文件，维护 Rules 结构。

### 2.4 发布流 (Release)
> 功能攒够了，我要发新版本。

*   **Action**: 对 AI 说 "帮我发版" 或 "合并版本号"
*   **流程**:
    1.  **Release Script**: AI 运行 `release.py`。
    2.  **Auto Merge**: 脚本自动合并 GitHub 上的 Release PR。
    3.  **CI/CD**: GitHub Actions 自动打 Tag、生成 Changelog 并发布 Release。

### 2.5 自动化发布原理 (Automated Release Mechanics)
> 基于 `release-please` 和 `integrity-check` 的协同工作机制。

*   **前置条件 (Prerequisite)**:
    *   **Git Tag**: 必须存在初始 Tag (e.g. `v1.0.0`) 作为基准。
    *   **Commit**: 只有 Tag **之后** 的新 Commit 才会触发新版本。
*   **触发机制 (Trigger)**:
    *   **Patch**: `fix:` 提交 -> `1.0.1`
    *   **Minor**: `feat:` 提交 -> `1.1.0`
    *   **Force Release**: 若需强制发版（如无代码变更），需提交 Empty Commit: `git commit --allow-empty -m "fix: force release"`
*   **执行流**:
    1.  Push 代码到 `main`。
    2.  GitHub Actions 运行，检测到变更。
    3.  创建/更新 `chore: release x.x.x` 的 PR。
    4.  用户调用 `integrity-check` 脚本合并该 PR。
    5.  合并触发新 Action -> 打 Tag -> 发布 Release。

## 3. 存储架构 (Storage Architecture)

*   **Inbox (海马体)**: `.trae/rules/inbox/`
    *   短期记忆，碎片化，读写快。
*   **Rules (皮层)**: `.trae/rules/modules/`
    *   长期记忆，结构化。
    *   **Index Pattern**: 采用 `dir/index.ts.md` 索引大文件。


## git-commit-F-file-method (Merged)

# git-commit-F-file-method
> Tags: git,trae-sandbox,commit
> Created: 2026-03-07

## 问题
trae-sandbox 终端环境对多行/中文命令行参数解析有限制，使用 `git commit -m` 会导致参数被错误拆分。

## 解决方案
使用 `-F` 文件方式传递 commit message：
```bash
# 1. 写入临时文件
echo "commit message" > .git/COMMIT_EDITMSG_TEMP

# 2. 使用文件提交
git commit -F .git/COMMIT_EDITMSG_TEMP

# 3. 清理临时文件
rm .git/COMMIT_EDITMSG_TEMP
```

## 适用场景
- 多行 commit message
- 包含中文的 commit message
- 任何被 trae-sandbox 错误解析的参数

