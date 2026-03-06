# Knowledge Engine Optimization Plan

## 1. 更新知识引擎优化清单 (`knowledge-engine-backlog.md`)

将最新的“类脑记忆机制”讨论成果详细记录到 Backlog 中，作为核心架构升级的蓝图。

### 新增条目

* **\[P0] 架构升级：类脑记忆机制 (Brain-Inspired Memory)**

  * **核心理念**: 模仿人脑的工作记忆、海马体（短期）和皮层（长期）机制。

  * **组件分工**:

    * **Inbox (海马体)**: 存放碎片化、未整理的经验 (`.trae/rules/inbox/`)。

    * **Rules (皮层)**: 存放结构化、长期有效的规范 (`.trae/rules/modules/`)。

  * **角色调整**:

    * **Knowledge-Gardener (采集员)**: 只负责写入 Inbox，不直接修改 Rules。

    * **coder (执行者)**: 同时查阅 Rules (长期) 和 Inbox Index (短期)。

    * **Knowledge-Librarian (图书管理员)**: 新增角色，负责定期将 Inbox 内容归档进 Rules (睡眠整理)。

* **\[P1] Inbox 索引化 (Indexed Inbox)**

  * **文件结构**: 创建 `.trae/rules/inbox/index.md`。

  * **命名规范**: 碎片文件使用 kebab-case (如 `canvas-drag-fix.md`)。

  * **索引内容**: 包含文件名、关键词、摘要、创建日期。

* **\[P1] 知识裂变机制 (Cell Division)**

  * **单文件阈值**: 当 Rules 文件超过 300 行时，Librarian 需将其拆分为子目录。

  * **日志归档**: 当 `error-log.md` 过长时，按月归档。

## 2. 更新帮助文档 (`HELP.md`)

更新文档以反映新的架构理念，并使用生动的比喻介绍 Skill 角色。

### 新增章节：Skill 角色图鉴 (Skill Roles)

使用通俗易懂的比喻来介绍每个 Skill 的定位：

| Skill 名称                  | 中文代号      | 形象比喻          | 职责 (Job Description)                                   |
| :------------------------ | :-------- | :------------ | :----------------------------------------------------- |
| **`coder`**          | **老工匠**   | **前额叶 (执行)**  | **写代码的**。干活前先查规矩 (Rules)，也会瞟一眼备忘录 (Inbox)，确保活儿做得漂亮且合规。 |
| **`knowledge-gardener`**  | **速记员**   | **海马体 (感知)**  | **记笔记的**。你随口说的经验、踩过的坑，它立马记在便利贴 (Inbox) 上，不让灵感溜走。       |
| **`knowledge-librarian`** | **图书管理员** | **睡眠整理 (内化)** | **整理书架的**。趁你休息时，把便利贴分类、誊写进正式手册 (Rules)，把没用的扔掉。         |
| **`integrity-check`**     | **质检员**   | **免疫系统 (防御)** | **守大门的**。提交代码前拦住你，检查文档是不是漏更了，有问题当场修复。                  |

### 更新章节：知识引擎原理

* 补充“类脑记忆机制”的图解说明。

* 解释 Inbox (短期) -> Librarian (整理) -> Rules (长期) 的数据流向。

## 3. 执行步骤

1. **编辑** `.trae/documents/knowledge-engine-backlog.md`，追加上述 \[P0] 和 \[P1] 任务。
2. **编辑** `HELP.md`，更新原理部分并添加“Skill 角色图鉴”。

