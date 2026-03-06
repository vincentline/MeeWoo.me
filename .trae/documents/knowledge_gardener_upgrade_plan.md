# Knowledge Gardener 自动化升级方案

> **当前状态**: SOP (标准作业程序) 驱动，依赖人工手动执行多步操作，效率低且易出错。
> **目标**: 构建 **Agent (大脑) + Script (手臂)** 的自动化工作流，实现经验总结的“一键落地”。

## 1. 核心架构：Agent-Script 协同模式

我们将 Knowledge Gardener 升级为双层架构，彻底分离“认知决策”与“执行落地”：

| 层级          | 角色                         | 职责                           | 输入                           | 输出            |
| :---------- | :------------------------- | :--------------------------- | :--------------------------- | :------------ |
| **L1: 认知层** | **Agent** (Skill Prompt)   | **思考与生成**分析对话、提炼知识、决定模板、处理交互 | 用户指令、上下文、代码变更                | 结构化的 CLI 命令参数 |
| **L2: 执行层** | **Script** (`gardener.py`) | **落地与执行**生成文件、填充模板、更新索引、查重校验 | CLI 参数 (`--title`, `--type`) | 物理文件操作结果      |

***

## 2. 执行层设计：Gardener CLI 工具链

开发 Python 脚本 `gardener.py`，作为底层的“无头执行器”。

* **位置**: `.trae/skills/knowledge-gardener/scripts/gardener.py`

* **调用**: `python gardener.py [COMMAND] [OPTIONS]`

### 2.1 核心命令：`new` (创建笔记)

负责将内容写入文件并自动更新索引。

#### 参数设计

| 参数               | 必选 | 说明                        | 示例                              |
| :--------------- | :- | :------------------------ | :------------------------------ |
| `--type`         | 是  | 模板类型                      | `bug` (问题修复), `knowledge` (知识点) |
| `--title`        | 是  | 笔记标题 (自动转 kebab-case 文件名) | `"Konva 拖拽卡顿"`                  |
| `--tags`         | 否  | 关键词 (用于查重和索引)             | `"konva,perf"`                  |
| `--content`      | \* | 笔记正文 (短文本)                | `"使用 cache() 解决..."`            |
| `--content-file` | \* | 笔记正文文件路径 (长文本/复杂格式)       | `temp_content.md`               |

> *注:* *`--content`* *和* *`--content-file`* *二选一。*

#### 关键特性

1. **自动化模板填充**: 根据 `--type` 读取对应模板，替换 `{title}`, `{content}`, `{date}` 等占位符。
2. **文件名标准化**: 自动将标题转换为 URL 友好的 kebab-case (e.g., `konva-drag-lag.md`)。
3. **原子化索引更新**: 解析 `index.md` 表格结构，安全追加新行，避免并发冲突。

### 2.2 辅助命令：`check` (查重校验)

负责在创建前检查是否已存在类似经验。

* **逻辑**: 扫描 `inbox/index.md` 和 `rules/modules/`，匹配 `--tags` 或 `--title` 中的关键词。

* **输出**:

  * `PASS`: 无重复。

  * `WARN`: 发现潜在重复 (列出相关文件名)。

***

## 3. 认知层设计：Skill Prompt 升级

更新 `SKILL.md`，教会 Agent 如何根据不同场景调用脚本。

### 3.1 场景一：指令明确 (Direct Mode)

用户指令清晰，包含了所有必要信息。

* **用户**: "帮我记个 Bug，Konva 拖拽卡顿，用 cache 解决。"

* **Agent**:

  1. 提炼信息: Title="Konva 拖拽卡顿", Type="bug", Content="使用 cache..."
  2. 直接调用: `python gardener.py new --type bug ...`

### 3.2 场景二：指令模糊 (Interactive Mode)

用户指令模糊，缺少关键信息。

* **用户**: "把刚才那个问题记下来。"

* **Agent**:

  1. 识别缺失: 缺少 Title 和 Type。
  2. **调用工具**: `AskUserQuestion` ("请确认标题和类型？")
  3. 获取回答后，再调用脚本。

### 3.3 场景三：长内容/复杂格式 (File Mode)

经验内容包含大量代码块或特殊字符。

* **用户**: "总结一下刚才的 5 个文件修改。"

* **Agent**:

  1. 生成内容: 将总结写到临时文件 `_temp_note.md`。
  2. 调用脚本: `python gardener.py new --content-file _temp_note.md ...`
  3. 清理: 删除临时文件。

***

## 4. 实施计划 (Roadmap)

1. **Script 开发**: 编写 `gardener.py`，实现 `new` 命令、模板填充和索引更新逻辑。
2. **Prompt 更新**: 修改 `SKILL.md`，定义上述三种调用模式。
3. **测试验证**: 模拟 Bug 记录、知识总结等场景，验证自动化流程。

