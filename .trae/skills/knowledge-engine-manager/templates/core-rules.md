---
alwaysApply: true
---
> 本文档是项目的**核心原则**与**知识引擎入口**。所有开发行为必须遵循以下规则，并优先查阅知识引擎中的具体规范。

## 1. 知识引擎指引 (Knowledge Engine Router)
项目已全面启用“类脑知识引擎”，所有技术决策必须基于 `.trae/rules/` 下的最新规范。

- **查阅代码规范**: 请移步 [.trae/rules/core/coding-style.ts.md](.trae/rules/core/coding-style.ts.md)
- **查阅技术栈**: 请移步 [.trae/rules/core/tech-stack.ts.md](.trae/rules/core/tech-stack.ts.md)
- **查阅工作流**: 请移步 [.trae/rules/core/workflows.ts.md](.trae/rules/core/workflows.ts.md)
- **查阅功能模块**: 请使用 `LS .trae/rules/modules/` 查看领域索引，支持扁平文件 (`*.ts.md`) 和聚合目录 (`dir/index.ts.md`) 两种形式。

## 2. 行为准则 (Behavioral Guidelines)

### 2.1 开发生命周期 (Development Lifecycle)

#### 📋 开发前 (Before Coding)
触发 `/skill coder` 的关键词：编写、修改、修复、重构、优化、实现、Bug、报错

| 步骤 | 动作 |
|:---|:---|
| **1. 识别领域** | 判断属于 `graphics` / `media` / `ui` / `engineering` / `core` |
| **2. 查规则** | 读 `rules/index.md` 定位规则文件 |
| **3. 读领域规则** | 读 `modules/<domain>/` 获取开发规范 |
| **4. 查经验** | 读 `inbox/index.md` 查看未归档经验 |

#### ⚠️ 开发中 (During Coding)
- **禁止猜测 API**：未知 API 必须查阅官方文档或 `WebSearch`
- **禁止未查规则直接写**：必须先完成开发前检查
- **模仿代码风格**：`SearchCodebase` 找相似文件 + 参考 `coding-style.ts.md`

#### ✅ 开发后 (After Coding)
- **测试验证**：`webapp-testing` 或手动测试，确保功能正常、无报错
- **记录经验**：解决非显而易见 Bug / 发现技术坑点 / 完成复杂功能 / 性能优化 → 调用 `/skill knowledge-gardener`

#### 🔒 提交前 (Before Commit)
- **检查覆盖率**：调用 `/skill integrity-check` 确保 Inbox 覆盖率

#### 🔄 异常处理 (Exception Handling)
- **测试失败** → 修复 → 重测 → 记录经验
- **规则冲突**：优先级 `core/` > `modules/` > `inbox/`
- **多领域任务**：按主次顺序查阅规则

### 2.2 信息来源优先级
官方文档 > 权威技术博客 > 开源项目 Issues > Stack Overflow 高票回答