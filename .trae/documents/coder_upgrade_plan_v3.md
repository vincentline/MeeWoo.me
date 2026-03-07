# Coder Skill Upgrade Plan v3.0

> **目标**: 升级 Coder 技能，集成日志自动化管理，并优化任务执行流程。

## 1. 基础设施与日志重构 (Infrastructure)

### 1.1 目录准备

* 创建 `.trae/logs/` 目录。

* 创建 `.trae/skills/coder/scripts/` 目录。

### 1.2 日志迁移

* 使用 `git mv` 将 `UPDATE_LOG.md` 移动到 `.trae/logs/UPDATE_LOG.md`。

* 更新 `HELP.md` 中的文件路径引用。

## 2. 脚本开发 (Scripting)

### 2.1 `log_change.py`

开发自动日志脚本，支持：

* 自动获取北京时间。

* 追加格式化日志条目。

* 支持 `--batch` 批量模式。

* 自动处理文件创建/表头初始化。

## 3. 技能定义更新 (Skill Definition)

### 3.1 更新 `coder/SKILL.md`

* **Phase 0 (Triage)**: 增加任务评估步骤。

* **Phase 1 (Context)**: 增加“模仿现有代码”的兜底策略。

* **Phase 2 (Execute)**:

  * 增加“批量处理工作流”。

  * **强制要求**每一步修改后调用 `log_change.py`。

* **Phase 3 (Verify)**: 具象化自检清单 (Lint, Test, Log)。

## 4. 规则清理 (Cleanup)

### 4.1 `workflows.ts.md`

* 移除关于手动更新日志的具体指令，改为指向 Coder 技能。

### 4.2 全局清理
- 搜索并移除其他文档中过时的日志更新指令。

### 4.3 索引更新
- 更新 `INDEX.md`，反映 `UPDATE_LOG.md` 的新位置。
- 更新 `.trae/rules/index.md` 中的日志路径引用。

## 5. 验证 (Verification)

* 运行 `log_change.py` 测试日志追加功能。

* 检查 `UPDATE_LOG.md` 格式是否正确。

