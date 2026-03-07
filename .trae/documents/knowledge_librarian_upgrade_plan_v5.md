# Knowledge Librarian Skill Upgrade Plan (v5.0)

## 1. Background & Motivation
当前的 v4.0 版本在实际运行中暴露了以下痛点，阻碍了“睡眠整理”的自动化闭环：
1.  **非静默操作**: Agent 错误使用 `DeleteFile` 工具删除 Inbox 源文件，导致 IDE 频繁弹出确认卡片，打断用户心流。
2.  **单次处理局限**: Agent 缺乏批处理逻辑，每次仅能处理一个文件，无法响应“整理所有 Inbox”的指令。
3.  **脚本能力不足**: 核心脚本 `archiver.py` 和 `clean_inbox.py` 功能割裂，缺乏原子性的“归档即清理”选项。

## 2. Upgrade Objectives (v5.0)
打造一个**完全静默、具备批处理能力、高度自动化**的图书管理员。

### Core Pillars
1.  **Silent by Design (静默设计)**: 彻底摒弃 `DeleteFile` 工具，利用脚本内建的 `os.remove` 实现无感清理。
2.  **Batch First (批处理优先)**: 重构 Agent 指令，强制先扫描后执行，引入循环处理机制。
3.  **Atomic Operations (原子操作)**: 升级脚本，确保归档和清理的事务一致性。

## 3. Implementation Details

### 3.1 Skill Document Update (`SKILL.md`)
- **Strict Ban**: 明确禁止 Agent 使用 `DeleteFile` 操作任何 Inbox 或临时文件。
- **SOP Update**:
    - **Single File**: `archiver.py create/merge` -> `clean_inbox.py`
    - **Batch**: `LS` -> Loop `archiver.py` -> Batch `clean_inbox.py`
- **New Capability**: 引入 `auto-organize` 概念（未来脚本化，目前 Agent 模拟）。

### 3.2 Script Enhancements
#### `archiver.py`
- **Feature**: 增强自清理逻辑（已部分完成）。
- **Fix**: 确保 `batch-merge` 模式下的路径解析稳健性。

#### `clean_inbox.py`
- **Optimization**: 优化索引更新逻辑，确保并发删除时的索引一致性。

### 3.3 Workflow Optimization
- **Temp File Handling**: 所有中间产物强制重定向至 `.trae/temp/`，利用 `.gitignore` 和脚本自清理机制实现“来无影去无踪”。

## 4. Execution Plan
1.  **Draft**: 编写 v5.0 升级文档 (本文档)。
2.  **Apply**: 更新 `SKILL.md` 规则。
3.  **Verify**: 创建多个 Inbox 假数据，执行“整理所有”指令进行验收。
