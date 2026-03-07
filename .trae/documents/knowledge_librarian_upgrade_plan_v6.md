# Knowledge Librarian 技能升级方案 (v6.0) - 智能结构化

## 1. 背景与痛点 (Background & Pain Points)

在 v5.0 版本中，我们成功实现了“静默批处理”和“安全软删除”，解决了操作效率和数据安全问题。然而，在实际运行中，我们发现了新的核心矛盾：

* **结构化能力缺失**: 现有的 `archiver.py` 脚本采用死板的字符串替换逻辑 (`.replace("[ModuleName]", title)`)，无法理解 Inbox 笔记的语义。

* **规则质量低下**: 生成的 TypeScript Interface 往往是空的或仅包含默认字段，大量有价值的知识依然以非结构化的 Markdown 文本堆积在文件底部，违背了“Code as Documentation”的设计初衷。

* **模板形同虚设**: 精心设计的 TS Interface 模板（如 `new_module.md`）因为脚本无法填充而被浪费。

## 2. 升级目标 (Upgrade Objectives)

将 **Knowledge Librarian** 从“搬运工”升级为“翻译官”。

* **Smart Structuring (智能结构化)**: 将知识提取与结构化的工作从脚本层上移至 Agent 层（利用 LLM 的理解能力）。

* **Template Driven (模板驱动)**: 确保生成的规则文档严格遵循 `templates/` 下定义的 TypeScript Interface 规范。

* **Simplified IO (IO 简化)**: 脚本退化为纯粹的执行器，只负责文件写入和流程控制，不再负责内容生成。

## 3. 详细技术方案 (Implementation Details)

### 3.1 架构调整 (Architecture Shift)

| 职责                  | v5.0 (旧)                 | v6.0 (新)                                                              |
| :------------------ | :----------------------- | :-------------------------------------------------------------------- |
| **Agent**           | 生成简单的 `source/target` 计划 | **阅读笔记 -> 选择模板 -> 重写为完整 TS+MD 内容 -> 生成包含** **`content_file`** **的计划** |
| **Archiver Script** | 读取源文件 -> 尝试正则替换模板 -> 写入  | **直接读取 Agent 提供的** **`content_file`** **-> 写入目标路径**                   |
| **Templates**       | 仅作为脚本的字符串替换底板            | **作为 Agent 的“写作大纲”和“类型约束”**                                           |

### 3.2 技能规则更新 (`SKILL.md`)

#### 新增 SOP 步骤：结构化重写 (Structuring)

在生成计划前，Agent 必须执行以下动作：

1. **Select Template**: 根据笔记类型选择合适的模板（`new`, `guide`, `concept`, `reference`）。
2. **Read & Rewrite**: 读取 Inbox 笔记，将其内容重组为模板要求的 `export interface` + Markdown 格式。

   * *提取配置项* -> 填充到 TS Interface。

   * *提取 API* -> 填充到 TS Interface。

   * *保留详情* -> 整合到下方 Markdown。
3. **Save Temp**: 将重写后的完整内容保存到 `.trae/temp/structured_[timestamp].md`。

#### 更新 Plan JSON 结构

```json
{
  "source": "inbox/note.md",
  "target": "modules/ui/button.ts.md",
  "action": "create",
  "content_file": ".trae/temp/structured_123456.md" // [新增] 指向重写后的文件
}
```

### 3.3 脚本改造计划 (Script Refactoring)

#### A. `archiver.py` (大幅简化)

* **删除**: `get_template_content`, `generate_ts_interface` 等模板处理函数。

* **修改**: `command_create` 和 `command_merge`。

  * 逻辑变更为：优先读取 `--content-file` 参数指定的文件内容。

  * 如果未提供 content file，才回退到旧逻辑（兼容性）。

* **新增参数**: `--content-file`。

#### B. `batch_processor.py` (适配)

* **修改**: 在构造 `archiver.py` 调用命令时，透传 Plan JSON 中的 `content_file` 字段到 `--content-file` 参数。

### 3.4 模板优化 (Template Optimization)

* 保持现有的 TS Interface 模板不变，它们将作为 Agent 的“Prompt”参考，而不是脚本的“String Template”。

## 4. 执行计划 (Execution Roadmap)

### Phase 1: 规则升级 (Brain Upgrade)

1. [ ] **更新** **`SKILL.md`**:

   * 重写 SOP，加入“结构化重写”步骤。

   * 提供 Prompt 示例，教 Agent 如何将笔记映射到 TS Interface。

### Phase 2: 脚本改造 (Hand Refactoring)

1. [ ] **修改** **`archiver.py`**: 支持 `--content-file` 参数，实现直接写入模式。
2. [ ] **修改** **`batch_processor.py`**: 适配 Plan JSON 的新字段。

### Phase 3: 验证 (Verification)

1. [ ] **创建测试笔记**: 一个包含非结构化知识的 Inbox 笔记。
2. [ ] **人工模拟 Agent**:

   * 手动重写笔记为 TS 格式 -> 存入 temp。

   * 构造 Plan JSON。

   * 运行 `batch_processor.py`。
3. [ ] **验收**: 检查生成的文件是否完美保留了 TS Interface 结构。

## 5. 风险控制 (Risk Management)

| 风险点          | 应对措施                                                  |
| :----------- | :---------------------------------------------------- |
| **Agent 幻觉** | 在 SOP 中强调“保留所有原始信息”，禁止 Agent 随意丢弃 Markdown 详情。        |
| **临时文件堆积**   | `archiver.py` 在读取完 `content_file` 后必须立即执行自清理（删除临时文件）。 |

