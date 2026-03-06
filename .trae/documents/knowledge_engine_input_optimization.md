# 知识引擎输入端优化方案 (Knowledge Input Optimization)

> **背景**: 在处理《Python 编程技能》等综合性大文档时，发现现有 Gardener 机制存在颗粒度不匹配、上下文缺失和模板僵化等问题。

## 1. 核心问题分析 (Problem Analysis)

### 1.1 颗粒度不匹配 (Granularity Mismatch)
- **现象**: 源文档包含 5+ 个不同维度的知识（规范、测试、部署），Gardener 试图将其塞入单个 `.md` 碎片。
- **后果**: 碎片内容杂乱，Librarian 难以分类和归档，导致“消化不良”。

### 1.2 上下文缺失 (Context Gap)
- **现象**: 源文档包含通用建议（如 Flask/Django），但 Gardener 无法判断其是否适用于当前项目（MeeWoo 是 Vue + Node.js 项目）。
- **后果**: 可能引入与项目现状冲突的“垃圾知识”或误导性规范。

### 1.3 模板僵化 (Template Rigidity)
- **现象**: `inbox_note.md` 强制要求“问题-原因-方案”三段式。
- **后果**: 对于“通识性文档”（如编码规范），很难套用此结构，导致记录内容生硬。

## 2. 优化方案 (Proposed Solutions)

### 2.1 Gardener 能力升级：预切分 (Pre-slicing)
- **机制**: 在提取知识前，Gardener 应先分析源文档结构。
- **动作**: 如果文档包含多个独立主题，Gardener 应主动将其拆分为多个 Inbox 碎片。
- **示例**: `SKILL.md` -> `python-structure.md` (Guide) + `python-testing.md` (Guide) + `python-perf.md` (Concept)。

### 2.2 Inbox 模板多元化 (Template Diversification)
- **新增模板**: 
    - `inbox_knowledge.md`: 适用于纯知识记录（无问题背景）。
        ```markdown
        # [Topic] 知识摘要
        ## 核心要点
        ## 适用场景
        ## 代码示例
        ```
- **智能选择**: Gardener 根据输入内容（是修 Bug 还是学知识）选择 `inbox_note.md` 或 `inbox_knowledge.md`。

### 2.3 Librarian 实证增强 (Contextual Verification)
- **机制**: 在 Critic Mode 中增加“项目相关性检查”。
- **动作**: 
    - 对于通用建议（如“使用 Flask”），Librarian 必须检查 `package.json` 或 `tech-stack.ts.md`。
    - **决策**: 
        - 匹配 -> 归档。
        - 不匹配 -> 标记为“仅参考”或直接丢弃（避免污染）。

## 3. 待定方案 (?Open Questions)（已经确定）

###  3.1 是否需要“交互式提取”
- **设想**: 当 Gardener 发现文档太长时，反问用户：“这文档太长了，您想先提取哪部分？1. 规范 2. 测试 3. 部署”。
- **疑虑**: 会打断用户的心流，不够“无感”。

## 4. 行动计划 (Action Items)
1. [ ] 创建 `inbox_knowledge.md` 模板。
2. [ ] 更新 Gardener SKILL，增加“预切分”逻辑说明。
3. [ ] 更新 Librarian SKILL，强化“项目相关性检查”指令。
