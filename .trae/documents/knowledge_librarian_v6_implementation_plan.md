# Knowledge Librarian v6.0 Implementation Plan

本计划旨在落地 Knowledge Librarian v6.0 升级方案，核心目标是实现“智能结构化”的知识归档。

## Phase 1: 规则升级 (Brain Upgrade)

* [ ] **更新** **`SKILL.md`**

  * 目标文件: `.trae/skills/knowledge-librarian/SKILL.md`

  * 变更内容:

    * **SOP 更新**: 新增“结构化重写 (Structuring)”步骤，要求 Agent 在生成 Plan 前，先根据模板将 Inbox 笔记重写为标准的 `TS Interface + Markdown` 格式。

    * **Prompt 示例**: 提供具体的 Prompt 示例，教 Agent 如何将笔记映射到 TS Interface。

    * **Plan JSON 更新**: 增加 `content_file` 字段说明。

## Phase 2: 脚本改造 (Hand Refactoring)

* [ ] **修改** **`archiver.py`**

  * 目标文件: `.trae/skills/knowledge-librarian/scripts/archiver.py`

  * 变更内容:

    * **参数解析**: 新增 `--content-file` 参数。

    * **核心逻辑**: `command_create` 和 `command_merge` 优先读取 `--content-file` 指定的文件内容，直接写入目标路径。

    * **清理逻辑**: 读取完 `content_file` 后立即删除临时文件。

    * **兼容性**: 保留旧逻辑作为 fallback。

* [ ] **修改** **`batch_processor.py`**

  * 目标文件: `.trae/skills/knowledge-librarian/scripts/batch_processor.py`

  * 变更内容:

    * **Plan 解析**: 读取 Plan JSON 中的 `content_file` 字段。

    * **命令构造**: 将 `content_file` 传递给 `archiver.py` 的 `--content-file` 参数。

## Phase 3: 验证与验收 (Verification)

* [ ] **创建测试笔记**

  * 文件: `.trae/rules/inbox/test_v6_note.md`

  * 内容: 包含非结构化知识的 Markdown 文本。

* [ ] **人工模拟 Agent**

  * 手动重写笔记为 TS 格式 -> 存入 `.trae/temp/test_v6_structured.md`。

  * 构造 Plan JSON -> `.trae/temp/test_v6_plan.json`。

  * 运行 `batch_processor.py`。

* [ ] **验收**

  * 检查生成的文件是否完美保留了 TS Interface 结构。

  * 检查临时文件是否被清理。

  * 检查 Inbox 源文件是否被移入回收站。

