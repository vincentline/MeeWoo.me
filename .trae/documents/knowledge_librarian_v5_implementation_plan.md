# Knowledge Librarian v5.0 Implementation Plan

本计划旨在落地 Knowledge Librarian v5.0 升级方案，核心目标是实现“静默、批量、安全”的知识归档。

## Phase 1: 基础设施准备 (Infrastructure)

* [ ] **创建回收站目录**

  * 目标路径: `.trae/trash/`

  * 操作: 使用 `os.makedirs` 确保目录存在。

* [ ] **配置 Git 忽略规则**

  * 目标文件: `.gitignore`

  * 操作: 追加 `.trae/trash/`，防止回收站内容被提交。

## Phase 2: 脚本改造与开发 (Scripting)

* [ ] **改造** **`clean_inbox.py`** **(实现软删除)**

  * 目标文件: `.trae/skills/knowledge-librarian/scripts/clean_inbox.py`

  * 变更内容:

    * 引入 `shutil` 和 `datetime` 模块。

    * 将 `os.remove(file_path)` 替换为 `shutil.move(file_path, trash_path)`。

    * 在移动时为文件名附加 `_YYYYMMDD_HHMMSS` 时间戳，防止重名覆盖。

    * 保持原有的 `index.md` 清理逻辑。

* [ ] **开发** **`batch_processor.py`** **(指挥官脚本)**

  * 目标文件: `.trae/skills/knowledge-librarian/scripts/batch_processor.py`

  * 功能规格:

    * **输入**: 接收 `--plan` 参数，指向一个 JSON 格式的执行计划文件。

    * **JSON 结构**: `[{"source": "...", "target": "...", "action": "create|merge", "template": "..."}]`

    * **执行循环**:

      1. 读取 Plan JSON。
      2. 遍历每个条目:

         * 调用 `archiver.py` 执行归档 (通过 `subprocess`)。

         * **关键检查**: 检查 `archiver.py` 的 Exit Code。

         * 若成功 (0): 调用 `clean_inbox.py` 执行软删除。

         * 若失败 (!=0): 记录错误日志，**跳过**删除操作。

    * **输出**: 打印简明的统计报告 (Total, Success, Failed, Skipped)。

    * **选项**: 支持 `--dry-run` 仅校验不执行。

## Phase 3: 技能规则更新 (Skill Configuration)

* [ ] **更新** **`SKILL.md`**

  * 目标文件: `.trae/skills/knowledge-librarian/SKILL.md`

  * 变更内容:

    * **Core Instructions**: 更新 SOP (标准作业程序)。

    * **新流程**:

      1. **Analyze**: Agent 扫描 Inbox，决定归档策略。
      2. **Plan**: Agent 生成 JSON 计划文件 (存至 `.trae/temp/`)。
      3. **Execute**: Agent 调用 `batch_processor.py --plan ...`。

    * **Constraints**: 明确禁止使用 `DeleteFile` 操作 Inbox 文件。

## Phase 4: 验证与验收 (Verification)

* [ ] **单元功能验证**

  * 创建测试文件 `.trae/rules/inbox/test_v5_note.md`。

  * 手动运行 `clean_inbox.py` 验证是否移动到 `.trae/trash/`。

* [ ] **集成流程验证**

  * 创建多个测试文件。

  * 生成测试 Plan JSON。

  * 运行 `batch_processor.py`。

  * 检查:

    * 目标归档文件是否生成/更新。

    * Inbox 源文件是否消失。

    * `.trae/trash/` 是否有备份。

    * `.trae/rules/inbox/index.md` 是否更新。

