---
name: coder
display_name: 老工匠 (Auto Coder)
description: 专注于生成符合项目技术栈和代码规范的高质量代码。在编写代码前强制查阅规则文档，并在完成后进行自检。
version: 2.0.0
---

# Coder Skill （老工匠）

此技能用于指导 AI 在编写代码时遵循项目的“类脑知识引擎”规范，确保代码质量和一致性。

## 核心指令 (Core Instructions)

当用户请求编写代码、修改功能或修复 Bug 时，按以下步骤执行：

### 1. 查阅规则 (Consult Rules)
- **读取索引**: 读取 `.trae/rules/index.md`。
- **定位领域**: 根据用户需求，确定所属的领域目录 (如 `modules/media/`)。
- **动态检索**: 
    - 使用 `LS` 列出该领域目录下的所有文件。
    - 根据文件名语义，选择最相关的规则文件。
- **读取规则**: 读取选定的 `.ts.md` 文件。
- **查阅经验**: 快速浏览 `.trae/rules/inbox/` 下是否有相关的最新经验。

### 2. 编写代码 (Coding)
- **严格遵循**: 必须遵循 Rules 中定义的 Interface、命名规范和最佳实践。
- **禁止猜测**: 对于不确定的 API 或逻辑，必须先使用 `SearchCodebase` 确认，或询问用户。

### 3. 自检 (Self-Check)
- **静态检查**: 检查代码是否符合 TypeScript 类型定义。
- **逻辑检查**: 确认是否遗漏了边界情况。

### 4. 提交建议 (Commit Advice)
- 代码完成后，提醒用户运行 `/skill integrity-check` 进行提交前检查。
