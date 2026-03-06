# 质检员 (Integrity-Check) 体验优化方案

> **背景**: 现有的 `scan_changes.py` 虽然能跑，但在实际使用中表现得像个“只会看日期的打卡机”，存在误报多、检查弱、交互硬等问题。本文档旨在将其升级为真正的“智能安检仪”。

## 1. 痛点吐槽 (Pain Points)

### 1.1 “今日限定”的死板

* **槽点**: “昨天修了 Bug 记了笔记，今天提交代码被骂没记笔记。”

* **本质**: 检查逻辑只看 `datetime.now()`，忽略了“未归档”的有效性。

* **后果**: 逼迫开发者重复记笔记，或者被迫忽略警告，导致“狼来了”效应。

### 1.2 “只看有没有，不看对不对”

* **槽点**: “改了 Canvas 代码，记了一条 FFmpeg 笔记，居然通过了。”

* **本质**: 缺乏**相关性检查 (Relevance Check)**。脚本只查 `inbox/index.md` 有没有新行，不查内容是否匹配。

* **后果**: 核心模块变更可能漏检，Inbox 里堆满无关紧要的“凑数”笔记。

### 1.3 “只管杀不管埋”

* **槽点**: “报了 Warning 之后就没下文了，还得我自己去调 Gardener。”

* **本质**: Skill 指令链断裂。发现问题后没有自动提供修复路径。

* **后果**: 开发者体验割裂，修复成本高。

### 1.4 “核心文件漏网”

* **槽点**: “改了 `package.json` 加了新依赖，居然没反应。”

* **本质**: 忽略列表 (`IGNORE_PATTERNS`) 过于粗暴，把 `.json` 全忽略了。

* **后果**: 项目配置、依赖变更等重大事件缺乏记录。

### 1.5 “提交信息太随意”

* **槽点**: “每次都写 `update` 或者 `fix bug`，回头看 Git Log 根本不知道改了啥。”

* **本质**: 缺乏自动化的 Commit Message 生成机制。

* **后果**: 代码历史难以追溯，Release Note 没法写。

## 2. 优化方案 (Solutions)

### 2.1 引入“未归档”检查机制

* **方案**:

  * 不再只检查“今天”的日期。

  * 而是检查 `inbox/index.md` 中**所有未被 Librarian 处理**的条目。

  * 只要 Inbox 里有存货（且相关），就视为“已记笔记”。

* **实现**: 修改 `scan_changes.py`，解析索引表，提取所有文件名。

### 2.2 关键词相关性匹配 (Keyword Matching)

* **方案**:

  * 提取 Git 变更文件的**路径关键词**（如 `src/core/canvas/Stage.js` -> `canvas`）。

  * 提取 Inbox 条目的**文件名/摘要关键词**（如 `canvas-drag-fix.md` -> `canvas`）。

  * **判定**: 只有当两者有交集时，才算 Pass。

* **实现**: 在 Python 脚本中增加简单的字符串匹配逻辑。

### 2.3 交互式修复流 (Interactive Fix Flow)

* **方案**:

  * 当脚本返回 Warning 时，Integrity-Check Skill **自动**接管后续流程。

  * **Prompt**: “检测到核心变更未记录。是否立即调用 Gardener 补录？(推荐)”

  * **Action**: 用户确认后，直接把 `git diff` 喂给 Gardener。

### 2.4 智能忽略规则 (Smart Ignore)

* **方案**:

  * 把 `package.json`, `vite.config.js`, `.env` 等关键配置文件加入**白名单**。

  * 仅忽略 `package-lock.json`, `dist/`, `*.log` 等真正的无关文件。

### 2.5 自动生成 Commit Message (Auto-Commit)
- **方案**:
    - 利用 `git diff` 和 Inbox 内容，自动生成**符合 Angular 规范**的提交信息。
    - **格式**:
        ```text
        feat(canvas): optimize drag performance
        
        - Refactor Stage.js to use requestAnimationFrame
        - Add inertia scrolling support
        - Related: .trae/rules/inbox/canvas-drag-perf.md
        ```
    - **交互**: 
        - **静默提交 (Silent Commit)**: 用户无需确认，Skill 直接执行 `git commit -m "..."`。
        - **强制关联**: 提交信息末尾自动追加 `Ref: [Inbox File]`，确保溯源链完整。

## 3. 待定方案 (?Open Questions)

### ? 3.1 是否需要“强制关联”？ (已确定)
- **结论**: **需要**。作为 Auto-Commit 的一部分，强制关联不仅能提供上下文，还能作为“质检通过”的凭证。

### ? 3.2 是否允许“免检通道”？

<br />

## 4. 行动计划 (Action Items)

1. [ ] 优化 `scan_changes.py`：实现“未归档”检查 + “关键词匹配”。
2. [ ] 调整忽略规则：把配置文件纳入监控。
3. [ ] 更新 SKILL.md：增加“自动补录”的交互指令。

