---
name: coder
display_name: 老工匠 (Auto Coder)
description: 专注于生成符合项目技术栈和代码规范的高质量代码。在编写代码前强制查阅规则文档，并在完成后进行自检。
version: 3.0.0
---

# Coder Skill （老工匠） v3.0

此技能用于指导 AI 在编写代码时遵循项目的“类脑知识引擎”规范，确保代码质量和一致性。

## 核心指令 (Core Instructions)

当用户请求编写代码、修改功能或修复 Bug 时，按以下 **Plan - Act - Log - Verify** 闭环流程执行：

### 0. 任务评估 (Triage)
在开始前，先评估任务规模：
- **Simple**: 单文件修改 -> 直接进入执行阶段。
- **Complex**: 涉及 3+ 文件或跨模块修改 -> **必须**先使用 `TodoWrite` 规划详细步骤，然后按步骤执行。

### 1. 获取上下文 (Context)
- **查阅规则 (Rules)**: 
    - 读取 `.trae/rules/index.md` 定位领域。
    - 读取相关领域的 `.ts.md` 规则文件。
- **查阅经验 (Inbox)**: 浏览 `.trae/rules/inbox/` 查找最新经验。
- **查阅代码 (Codebase)**: 
    - **兜底策略**: 若找不到明确的规则文档，**必须**使用 `SearchCodebase` 或 `Read` 查找项目中的相似代码，并**模仿**其风格（命名、注释、结构）。

### 2. 执行与记录 (Execute & Log)
- **执行**: 编写或修改代码。
- **记录日志 (MANDATORY)**: 
    - 每完成一个文件的修改，**必须**立即调用日志脚本记录变更。
    - **禁止**手动编辑 `UPDATE_LOG.md`。
    - **推荐方式 (Template Mode)**: 
        1. 使用 `Write` 工具生成日志JSON文件：`.trae/logs/temp_log.json` (参考 `.trae/skills/coder/templates/log_entry.json`)
        2. 执行脚本读取：`python .trae/skills/coder/scripts/log_change.py --from-file .trae/logs/temp_log.json`
        3. (可选) 删除临时文件。
    - **备用方式 (CLI Mode)**: 仅适用于短描述。
        - `python .trae/skills/coder/scripts/log_change.py --action [修改文件/新增文件] --file [相对路径] --desc [简短中文描述]`

### 3. 自检 (Verify)
提交前必须完成以下检查：
- [ ] **Lint**: 运行 `npm run lint` 或 `ruff check` (如有配置)。
- [ ] **Test**: 运行相关测试用例 (如有配置)。
- [ ] **Style**: 确认新代码与现有代码风格一致。
- [ ] **Log**: 确认所有文件变更都已通过脚本记录到 `UPDATE_LOG.md`。

### 4. 提交建议 (Commit Advice)
- 代码完成后，提醒用户运行 `/skill integrity-check` 进行提交前检查。
