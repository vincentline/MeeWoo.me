# Coder Skill 升级方案 v3.0 (集成日志自动化)

> **核心目标**: 打造“全自动、强执行”的 Coder 技能。不仅提升代码质量，更将 `UPDATE_LOG` 的维护责任从 Agent 的“自觉”转变为 Skill 的“本能”。

## 1. 核心架构调整

### 1.1 `UPDATE_LOG` 重构 (Log Refactoring)

* **存储位置**: 使用 `git mv` 将根目录 `UPDATE_LOG.md` 迁移至 `.trae/logs/UPDATE_LOG.md`，保留 Git 历史。

* **? 归档旧日志**: 是否将旧内容移动到 `ARCHIVE_2025.md`，让主日志轻装上阵？(待定)

* **管理模式**: **禁止 Agent 手写**。所有日志更新必须通过 Coder 技能内置的脚本 `log_change.py` 完成。

* **规则清理**: 删除 `workflows.ts.md` 及其他规则中关于“手动更新日志”的条款，避免指令冲突。

### 1.2 Coder 技能流程重塑 (Workflow Redesign)

将流程从线性执行改为 **"Plan - Act - Log - Verify"** 闭环：

1. **Triage (分诊)**: 评估任务规模，决定是否启用批量模式。
2. **Context (上下文)**: 查阅 Rules/Inbox，无文档时**必须**模仿现有代码。
3. **Execute (执行)**: 编写代码。
4. **Log (记录)**: 调用 `log_change.py` 自动追加变更记录。

   * **改进**: 支持 `--batch` 模式，允许一次性记录多个文件的变更。
5. **Verify (验证)**: 运行 Lint/Test 进行自检。

***

## 2. 详细实施方案

### 2.1 脚本开发: `log_change.py`

在 `.trae/skills/coder/scripts/` 下开发此脚本。

* **功能**:

  * 接收参数：`--action` (新增/修改/删除), `--file` (文件路径), `--desc` (简述)。

  * **智能模式**: 如果只传 `--file`，脚本尝试通过 `git status` 自动推断 action。

  * **? 锁机制**: 是否需要文件锁防止并发写入？(暂不实现，依赖 Agent 串行操作)

  * 自动获取当前北京时间。

  * 格式化追加到 `.trae/logs/UPDATE_LOG.md`。

### 2.2 Prompt 更新 (`SKILL.md`)

#### A. 任务评估 (Phase 0)

```markdown
### 0. 任务评估 (Triage)
在开始前，判断任务类型：
- **Simple**: 单文件修改 -> 直接执行。
- **Complex**: 多文件/跨模块 -> **必须**使用 `TodoWrite` 规划步骤。
```

#### B. 规则查阅兜底 (Phase 1)

```markdown
### 1. 查阅规则
...
- **兜底策略**: 若找不到对应 Rule，**必须**使用 `SearchCodebase` 或 `Read` 查找项目中的相似代码，并**模仿**其风格。
```

#### C. 强制日志记录 (Phase 2 - Post Action)

```markdown
### 2. 执行与记录 (Execute & Log)
每完成一个文件的修改，**必须**立即调用日志脚本：
`python .trae/skills/coder/scripts/log_change.py --action [修改/新增] --file [路径] --desc [简述]`

> **Warning**: 禁止手动编辑 UPDATE_LOG.md，必须使用脚本。
```

#### D. 具象化自检 (Phase 3)

```markdown
### 3. 自检 (Self-Check)
提交前必须完成：
- [ ] **Lint**: 运行 `npm run lint` 或 `ruff check`。
- [ ] **Test**: 运行相关测试用例。
- [ ] **Log**: 确认所有变更都已通过脚本记录日志。
- **? Double Check**: 是否需要 Integrity Check 再次验证日志完整性？(作为最后防线)
```

### 2.3 旧规则清理计划

1. **`workflows.ts.md`**: 删除 `changeLog` 部分的具体操作指南，改为指向 Coder 技能。
2. **`HELP.md`**: 更新日志文件路径说明。
3. **其他脚本**: 检查是否有脚本（如 `integrity-check`）在操作旧日志文件，如有则移除。

***

## 3. 实施路线图

1. **基础设施准备**:

   * 创建 `.trae/logs/` 目录。

   * 迁移旧日志内容（可选，或直接归档）。

   * 开发 `log_change.py`。
2. **规则清洗**:

   * 修改 `workflows.ts.md`。

   * 全局搜索 `UPDATE_LOG`，清理过时引用。
3. **技能升级**:

   * 更新 `coder/SKILL.md`，植入新流程。
4. **验证**:

   * 模拟一次代码修改，验证日志是否自动生成且格式正确。

