# Knowledge Doctor Skill 实施计划 (Implementation Plan)

本计划旨在落地 **Knowledge Doctor (知识医生)** 技能，建立知识引擎的健康维护机制。

## Phase 1: 技能基础建设 (Foundation)

* [ ] **创建技能目录**

  * 路径: `.trae/skills/knowledge-doctor/`

  * 子目录: `scripts/`, `templates/`

* [ ] **编写** **`SKILL.md`**

  * 目标: 定义技能元数据、核心禁令、详细 SOP。

  * 内容要求:

    * 包含“分级诊疗”策略（急诊 vs 专家会诊）。

    * 详细描述诊断（Format, Fact, Dedup, Split）与治疗流程。

    * **详细 Prompt**: 为 Agent 提供具体的 Prompt 模板（如“如何进行事实查证”、“如何拆分大文件”）。

## Phase 2: 工具链开发 (Toolchain)

* [ ] **开发** **`scanner.py`** **(CT扫描仪)**

  * 目标文件: `.trae/skills/knowledge-doctor/scripts/scanner.py`

  * 核心功能:

    * **增量扫描**: 基于 `git diff` 识别最近变更的 `.ts.md` 文件。

    * **全量扫描**: 递归遍历指定目录。

    * **健康检查**:

      * 格式检查 (Format Check): 验证 Frontmatter 和 TS Interface。

      * 规模检查 (Size Check): 统计行数 (>300行警告)。

      * 标记检查 (Tag Check): 扫描 `TODO`, `FIXME`, `?` 等标记。

  * 输出: JSON 格式的诊断报告。

## Phase 3: 验证与实战 (Verification)

* [ ] **自测扫描**

  * 运行 `scanner.py` 扫描现有的 `modules` 目录。

  * 验证增量模式和全量模式是否正常工作。

* [ ] **模拟治疗**

  * 创建一个“患病”文件（格式错误、包含 TODO、行数过多）。

  * 模拟 Agent 调用 Skill 进行全流程治理。

* [ ] **注册技能**

  * 确认 Skill 可被系统识别并调用。

