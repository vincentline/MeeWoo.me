# 知识引擎输入端优化执行计划

根据 `knowledge_engine_input_optimization.md` 的规划，本计划旨在解决 Gardener 颗粒度不匹配、上下文缺失及模板僵化问题。

## 1. 创建通用知识模板

* **目标**: 为“纯知识/通识”类信息提供载体，不再强制套用问题修复格式。

* **文件**: `.trae/skills/knowledge-gardener/templates/inbox_knowledge.md`

* **内容**:

  ````markdown
  # [Topic] 知识摘要
  > 摘要: [一句话总结]
  > 类型: [Concept | Guide | Reference | Snippet]

  ## 1. 核心要点 (Key Points)
  [知识的核心内容、原理或定义]

  ## 2. 适用场景 (Use Cases)
  - [场景 1]
  - [场景 2]

  ## 3. 代码/配置示例 (Examples)
  ```javascript
  // 代码片段
  ````

  ## 4. 关联信息 (Meta)

  * 来源: \[URL / Chat]

  * 建议归档位置: `modules/...`

  ```
  ```

## 2. 升级 Gardener (速记员) 能力

* **目标**: 赋予 Gardener 预切分和智能选模版的能力。

* **文件**: `.trae/skills/knowledge-gardener/SKILL.md`

* **变更点**:

  1. **增加“预切分 (Pre-slicing)”指令**:

     * 分析输入文档结构，若包含多个独立主题（如同时包含“规范”和“部署”），主动拆分为多个 Inbox 文件。
  2. **增加“智能选模版”指令**:

     * 针对 Bug/问题修复 -> 使用 `inbox_note.md`。

     * 针对 纯知识/通识 -> 使用 `inbox_knowledge.md`。

## 3. 升级 Librarian (图书管理员) 能力

* **目标**: 在归档前增加“项目相关性”检查，防止引入无关知识。

* **文件**: `.trae/skills/knowledge-librarian/SKILL.md`

* **变更点**:

  1. **增强 Critic Mode**:

     * 在实证环节增加 **“项目相关性检查 (Relevance Check)”**。

     * 对于通用建议（如框架选型、库推荐），必须查阅 `package.json` 或 `core/tech-stack.ts.md`。

     * 若不匹配（如在 Vue 项目中推荐 React 库），标记为“仅参考”或不予归档。

## 执行顺序

1. 创建模板文件。
2. 更新 Gardener Skill。
3. 更新 Librarian Skill。

