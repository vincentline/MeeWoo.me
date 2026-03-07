# Knowledge Librarian 技能升级方案 (v5.0) - 静默自动化版

## 1. 背景与痛点 (Background & Pain Points)

当前的 v4.0 版本在实际运行中暴露了以下核心痛点，阻碍了“知识整理”的自动化闭环：

1. **非静默操作 (Non-Silent)**: Agent 错误使用 IDE 的 `DeleteFile` 工具删除 Inbox 源文件，导致 IDE 频繁弹出确认卡片，严重打断用户心流。
2. **单点处理瓶颈 (Single-Point Bottleneck)**: Agent 缺乏批处理逻辑，整理完一个文件后即停止，无法响应“整理所有 Inbox”的指令，效率极低。
3. **脚本割裂 (Script Fragmentation)**: 归档脚本 (`archiver.py`) 和清理脚本 (`clean_inbox.py`) 相互独立，缺乏事务一致性保障（可能出现“归档失败但文件被删”或“归档成功但文件未删”的情况）。

## 2. 升级目标 (Upgrade Objectives)

打造一个**完全静默、具备批处理能力、高度安全**的图书管理员。

* **Silent (静默)**: 彻底摒弃 GUI 交互，所有文件操作在脚本层静默完成。

* **Batch (批量)**: 引入“指挥官”脚本，一次指令，全量处理。

* **Safe (安全)**: 引入回收站机制和原子性事务检查，杜绝数据丢失。

## 3. 详细技术方案 (Implementation Details)

### 3.1 基础设施：引入“回收站”机制 (The Trash Can)

为了防止静默删除导致的数据不可逆丢失，我们将从“物理删除”转向“软删除”。

* **机制**: 所有“删除”操作实际上是将文件移动到 `.trae/trash/` 目录，并附加时间戳后缀。

* **配置**: 更新 `.gitignore`，确保回收站内容不会被提交到版本控制系统。

* **管理**: Agent 不负责清空回收站，由用户根据需要手动清理或另行配置定期清理任务。

### 3.2 核心架构：指挥官模式 (The Commander Pattern)

为了解决 Agent “整理一个就停”的问题，我们将引入一个新的调度脚本 `batch_processor.py`。

* **角色**: 它是流水线的指挥官，负责串联 `archiver.py` (归档) 和 `clean_inbox.py` (软删除)。

* **工作流 (Workflow)**:

  1. **扫描 (Scan)**: 自动识别 `.trae/rules/inbox/` 下所有待处理的 `.md` 文件。
  2. **规划 (Plan)**: Agent 只需生成简单的 JSON 计划（指定哪些文件归档到哪里）。
  3. **循环执行 (Execution Loop)**:

     * **Step 1 - 归档**: 调用 `archiver.py`。

     * **Step 2 - 验证**: 检查 `archiver.py` 的退出代码 (Exit Code)。

       * ✅ **成功 (Code 0)** -> 进入 Step 3。

       * ❌ **失败 (Code != 0)** -> 记录错误，**跳过** Step 3，保留源文件，继续处理下一个。

     * **Step 3 - 软删除**: 调用 `clean_inbox.py` 将源文件移入回收站。
  4. **报告 (Report)**: 输出最终统计（成功 N 个，失败 M 个）。

### 3.3 脚本改造计划 (Script Refactoring)

#### A. `clean_inbox.py` (改造)

* **变更**: 将 `os.remove(file)` 替换为 `shutil.move(file, trash_dir)`。

* **索引更新**: 保持现有的索引 (`index.md`) 清理逻辑不变。

#### B. `batch_processor.py` (新增)

* **功能**: 实现上述“指挥官模式”的调度逻辑。

* **特性**:

  * 支持 `--dry-run`: 仅打印计划，不执行操作。

  * 支持 `--max-count`: 限制单次处理数量（防止死循环）。

  * **原子性保障**: 严格依赖 `archiver.py` 的返回状态，确保“先归档，后删除”。

### 3.4 技能规则更新 (`SKILL.md`)

* **Strict Ban**: 明确禁止 Agent 使用 `DeleteFile` 工具操作任何 Inbox 文件。

* **SOP (标准作业程序)**:

  * **场景**: 用户指令“整理 Inbox”。

  * **动作**:

    1. 调用 `LS` 查看 Inbox。
    2. 调用 `batch_processor.py --scan` (或生成 JSON 计划传给它)。
    3. 根据脚本输出反馈结果。

## 4. 执行计划 (Execution Roadmap)

### Phase 1: 基础设施准备

1. [ ] **配置 Git**: 修改 `.gitignore`，添加 `.trae/trash/`。
2. [ ] **创建目录**: 建立 `.trae/trash/` 目录。

### Phase 2: 脚本开发与改造

1. [ ] **改造** **`clean_inbox.py`**: 实现软删除逻辑。
2. [ ] **开发** **`batch_processor.py`**: 实现指挥官调度逻辑。

### Phase 3: 规则更新与验证

1. [ ] **更新** **`SKILL.md`**: 写入新的 SOP 和禁令。
2. [ ] **验收测试**:

   * 创建 3 个测试文件 (`test1.md`, `test2.md`, `test3.md`)。

   * 运行 `batch_processor.py`。

   * 验证：文件是否归档？Inbox 是否清空？回收站是否有文件？索引是否更新？

## 5. 风险控制 (Risk Management)

| 风险点        | 应对措施                                                    |
| :--------- | :------------------------------------------------------ |
| **数据丢失**   | 依靠“回收站”机制，所有删除均为移动操作，随时可恢复。                             |
| **脚本死循环**  | `batch_processor.py` 设置默认最大处理上限（如 50 个文件）。              |
| **索引并发冲突** | `batch_processor.py` 采用串行处理（Serial Processing），避免并发写索引。 |

