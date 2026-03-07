# Coder 技能优化方案评估与建议

> **Context**: 基于 AI Agent 在批量代码注释任务中的实际体验反馈 (`coder_skill_optimization_feedback.md`)。

## 1. 核心问题提炼 (Key Issues)

根据反馈，当前 `coder` 技能在处理非标准化、批量化任务时存在明显短板：

1. **缺乏任务分级 (No Triage)**: 无论是改一行代码还是重构 12 个文件，都走同一套流程，导致简单任务太繁琐，复杂任务没规划。
2. **批量能力缺失 (No Batch Workflow)**: 面对多文件操作，Agent 只能“自行摸索”，效率低下且容易迷失进度。
3. **规则查阅僵化 (Rigid Rules)**: 找不到精确匹配的规则文件（如 Python 规范）时，没有兜底策略（如参考现有代码）。
4. **自检指令模糊 (Vague Self-Check)**: 只有“自检”两个字，没有具体的 Checklist，导致自检流于形式。

## 2. 解决方案评估与筛选 (Evaluation)

结合 MeeWoo 知识引擎 **"类脑记忆"** (Rules + Inbox) 和 **"角色分工"** (Coder/Librarian) 的设计理念，对体验报告中的建议进行筛选：

| 建议项            | 评估结论          | 理由与改进                                                          |
| :------------- | :------------ | :------------------------------------------------------------- |
| **0. 任务评估机制**  | **✅ 采纳**      | 必须引入。Coder 应具备“前额叶”的决策能力，区分任务轻重缓急。                             |
| **1. 规则查阅兜底**  | **✅ 采纳 (优化)** | **SearchCodebase** 是最好的兜底。如果 Rules 没写，就看 Codebase 怎么写的（实证主义）。  |
| **2. 风格一致性检查** | **✅ 采纳**      | 强调“模仿”。Agent 应优先模仿项目中的现有风格，而不是照搬通用的 Google/Airbnb 规范。          |
| **3. 批量任务模式**  | **✅ 采纳 (核心)** | 这是本次优化的重点。引入 `TodoWrite` 作为批量任务的“进度条”。                         |
| **4. 自检清单**    | **✅ 采纳**      | 将抽象的“自检”具象化为 Checklist (Lint, Type, Test)。                     |
| **5. 技能协作树**   | **⚠️ 部分采纳**   | 流程图太复杂，Agent 可能记不住。简化为 **"Trigger-Action"** 列表（如：改了逻辑 -> 跑测试）。 |
| **6. 快速参考卡片**  | **❌ 不采纳**     | 冗余。Skill Prompt 本身就应该是快速参考。保持 Prompt 精简比增加卡片更重要。               |

## 3. 最终优化方案 (Final Proposal)

### 3.1 架构调整：引入“思考阶段”

将 Coder 的执行流程从 **Linear (线性)** 改为 **Adaptive (自适应)**。

* **Phase 0: 评估 (Triage)**

  * 任务是 Simple (直接干) 还是 Complex (批量/跨模块)？

  * 是否需要 `TodoWrite`？

* **Phase 1: 获取上下文 (Context)**

  * 查 Rules (规范) -> 查 Inbox (经验) -> **查 Codebase (现状)**。

  * **新增兜底**: 若无明确 Rule，必须 `Read` 相似文件模仿风格。

* **Phase 2: 执行 (Execute)**

  * **批量模式**: 循环 `Read` -> `Edit` -> `Mark Done`。

* **Phase 3: 验证 (Verify)**

  * **Checklist**: 静态检查 (Lint) + 逻辑检查 (Test) + 风格检查 (Consistency)。

### 3.2 Prompt 关键更新点

#### A. 任务分级指令

```markdown
### 0. 任务评估 (Triage)
在开始前，判断任务类型：
- **Simple**: 单文件修改 -> 直接执行。
- **Complex**: 多文件/跨模块 -> **必须**使用 `TodoWrite` 规划步骤。
```

#### B. 规则查阅兜底 (Fallback)

```markdown
### 1. 查阅规则
...
- **兜底策略**: 若找不到对应 Rule，**必须**使用 `SearchCodebase` 或 `Read` 查找项目中的相似代码，并**模仿**其风格（命名、注释、结构）。
```

#### C. 批量处理工作流 (Batch Workflow)

```markdown
### 2. 执行 (批量模式)
若处理多个文件：
1. **Plan**: 使用 `TodoWrite` 列出所有目标文件。
2. **Loop**: 
   - 批量 `Read` 上下文。
   - 逐个 `Edit`。
   - 更新 `TodoWrite` 状态。
3. **Report**: 每完成 3-5 个文件，向用户汇报一次进度。
```

#### D. 具象化自检 (Concrete Checklist)

```markdown
### 3. 自检 (Self-Check)
提交前必须完成：
- [ ] **Lint**: 运行 `npm run lint` 或 `ruff check` (如有)。
- [ ] **Test**: 运行相关测试用例 (如有)。
- [ ] **Style**: 新代码与旧代码风格一致 (缩进、命名)。
```

## 4. 后续行动

1. 更新 `.trae/skills/coder/SKILL.md`。
2. 作为一个新的 Best Practice 写入 Inbox，供 Gardener 归档。

