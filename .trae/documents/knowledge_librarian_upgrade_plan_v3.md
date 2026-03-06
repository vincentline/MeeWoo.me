# Knowledge Librarian 自动化升级方案 v3.0

> **核心目标**: 构建 **Agent (认知) + Script (执行)** 的自动化协同工作流，实现从 Inbox (经验碎片) 到 Rules (长期规则) 的标准化归档，确保持续集成的高质量知识库。

## 1. 核心架构：归档流水线 (The Archiving Pipeline)

我们将 Knowledge Librarian 的工作流标准化为四个阶段，明确分工：

| 阶段         | 角色                            | 职责          | 关键动作                                                                                                                    |
| :--------- | :---------------------------- | :---------- | :---------------------------------------------------------------------------------------------------------------------- |
| **P1: 决策** | **Agent**                     | **分类与策略制定** | 1. **全量扫描**: 读取 Inbox 索引。2. **分类**: 根据五大领域标准 (Graphics/Media/UI/Eng/Core) 定位。3. **优先级**: Bug Fix > Core Config > Guide。 |
| **P2: 转换** | **Script** (`archiver.py`)    | **结构化转换**   | 1. **读取 Markdown**。2. **生成 TS Interface**。3. **填充内容**。4. **进度反馈** (e.g., `[1/5] Processing...`)。                        |
| **P3: 验证** | **Agent** + **Script**        | **双重验证机制**  | 1. **存在性验证 (Script)**: 执行 `grep` 确保代码片段真实存在。2. **逻辑性验证 (Agent)**: 阅读代码上下文，判断经验是否过时或冲突。                                  |
| **P4: 清理** | **Script** (`clean_inbox.py`) | **闭环收尾**    | 1. **删除源文件** (严格校验)。2. **更新索引** (精准移除)。                                                                                 |

***

## 2. 执行层设计：Librarian CLI 工具链

所有脚本必须支持 **超时保护 (Timeout)**，防止无人值守时挂死。

### 2.1 核心归档脚本：`archiver.py`

* **位置**: `.trae/skills/knowledge-librarian/scripts/archiver.py`

* **功能**:

  * `create`: 将 Inbox 笔记转换为新的规则模块。

  * `merge`: 将 Inbox 笔记追加到现有规则模块。

* **参数**:

  * `--source`: Inbox 源文件路径。

  * `--target`: 目标规则文件路径。

  * `--template`: 模板类型 (`guide`, `concept`, `reference`)。

  * `--verify-cmd`: (可选) 自动化验证命令 (e.g., `grep "outDir" vite.config.js`)。

  * `--timeout`: (默认 30s) 超时强制退出。

### 2.2 辅助脚本修复

* **`clean_inbox.py`**:

  * **修复**: 增加文件存在性校验，输出 Warning 而非报错。

  * **优化**: 精准匹配索引行，防止误删。

* **`check_health.py`**:

  * **定位**: 作为 Agent 的手动检查工具，在归档结束后调用。

***

## 3. 认知层设计：Skill Prompt 升级

更新 `SKILL.md`，明确 Agent 的操作规范。

### 3.1 归档策略 (Strategy)

* **范围**: **全量归档 (Archive All)**。除非 Agent 明确判定内容无效，否则不得遗漏。

* **领域分类标准**:

  * **Graphics**: Canvas, Konva, WebGL, 坐标系。

  * **Media**: 音视频, FFmpeg, 编解码, 格式转换。

  * **UI**: Vue 组件, 样式, 交互, 状态管理。

  * **Engineering**: 构建 (Vite), 部署, 脚本, CI/CD。

  * **Core**: 架构设计, 核心接口, 插件机制。

### 3.2 验证规范 (Verification)

* **Level 1 (纯文档)**: 直接归档。

* **Level 2 (代码相关)**:

  * **Agent 动作**: 必须先阅读相关代码文件 (`Read`).

  * **Script 动作**: 调用 `archiver.py` 时必须传入 `--verify-cmd`。

***

## 4. 实施路线图 (Roadmap)

1. **Script 开发**: 编写 `archiver.py`，实现 Markdown -> TS Interface 转换逻辑及超时机制。
2. **Script 修复**: 优化 `clean_inbox.py` 的鲁棒性。
3. **Prompt 更新**: 修改 `SKILL.md`，集成新工具链与归档策略。
4. **全流程测试**: 选取 3 个不同类型的 Inbox 笔记进行归档，验证流水线闭环。

