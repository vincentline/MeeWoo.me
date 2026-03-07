# MeeWoo 项目最高指引 (Prime Directive)

> 本文档是项目的**核心原则**与**知识引擎入口**。所有开发行为必须遵循以下规则，并优先查阅知识引擎中的具体规范。

## 1. 知识引擎指引 (Knowledge Engine Router)
项目已全面启用“类脑知识引擎”，所有技术决策必须基于 `.trae/rules/` 下的最新规范。

- **查阅代码规范**: 请移步 [.trae/rules/core/coding-style.ts.md](.trae/rules/core/coding-style.ts.md)
- **查阅技术栈**: 请移步 [.trae/rules/core/tech-stack.ts.md](.trae/rules/core/tech-stack.ts.md)
- **查阅工作流**: 请移步 [.trae/rules/core/workflows.ts.md](.trae/rules/core/workflows.ts.md)
- **查阅功能模块**: 请使用 `LS .trae/rules/modules/` 查看领域索引，支持扁平文件 (`*.ts.md`) 和聚合目录 (`dir/index.ts.md`) 两种形式。

## 2. 行为准则 (Behavioral Guidelines)

### 2.1 不猜测，重实证
- **遇到问题时**: 严禁基于假设进行猜测。必须通过 `RunCommand` (grep/ls) 或 `SearchCodebase` 确认现状。
- **遇到未知 API 时**: 严禁编造代码。必须查阅官方文档或使用 `WebSearch` 获取最新用法。
- **信息来源优先级**: 官方文档 > 权威技术博客 > 开源项目 Issues > Stack Overflow 高票回答。

### 2.2 遵守知识引擎工作流
- **写代码前**: 必须调用 `/skill coder` 或手动查阅 Rules 与 Inbox。
- **有新经验时**: 必须调用 `/skill knowledge-gardener` 将经验记入 Inbox。
- **提交代码前**: 必须调用 `/skill integrity-check` 确保 Inbox 覆盖率。

### 2.3 变更管理
- **测试验证**: 任何代码变更必须经过测试验证（使用 `webapp-testing` 技能或手动测试）。