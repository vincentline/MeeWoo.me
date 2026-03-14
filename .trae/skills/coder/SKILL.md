---
name: coder
display_name: 老工匠 (Auto Coder)
description: 当用户请求编写代码、修改功能、修复 Bug、重构代码、添加新特性、或涉及任何代码变更时，必须立即调用此技能。此技能确保代码符合项目规范，强制查阅知识库规则。
version: 3.5.0
---

# Coder Skill （老工匠） v3.5

此技能用于指导 AI 在编写代码时遵循项目的"类脑知识引擎"规范，确保代码质量和一致性。

## ⚡ 触发条件 (Trigger Conditions)

**必须立即调用此技能的场景：**

| 触发关键词 | 示例请求 |
|:---|:---|
| **编写/创建代码** | "帮我写一个..."、"创建一个组件..." |
| **修改功能** | "修改这个功能..."、"更新..." |
| **修复 Bug** | "修复这个 bug"、"报错了..." |
| **重构代码** | "重构这个模块"、"优化这段代码" |
| **添加特性** | "添加一个新功能"、"实现..." |
| **代码相关问答** | "这段代码什么意思"、"为什么这样写" |

**判断原则：** 凡是涉及 `.ts`, `.vue`, `.js`, `.py` 等代码文件的新增、修改、删除操作，都必须触发此技能。

## 核心指令 (Core Instructions)

按以下 **Plan - Act - Log - Experience Check - Verify** 闭环流程执行：

### 0. 任务评估 (Triage)
在开始前，先评估任务规模：
- **Simple**: 单文件修改 -> 直接进入执行阶段。
- **Complex**: 涉及 3+ 文件或跨模块修改 -> **必须**先使用 `TodoWrite` 规划详细步骤，然后按步骤执行。

### 0.5 需求沟通 (Requirement Communication)
**触发条件**：当任务描述模糊、信息不足或存在多种实现方案时。

**沟通流程**：
1. **理解说明**：Agent 用自己的话复述任务理解，确保与用户意图一致
2. **信息收集**：询问用户补充必要信息
3. **确认反馈**：用户提供反馈（正确、有误、其他）
4. **决策判断**：
   - 若用户确认正确且信息充足 → 进入获取上下文阶段
   - 若用户反馈有误 → 重新分析任务并再次沟通
   - 若用户选择其他并补充信息 → 评估补充信息是否足够
   - 若信息仍不足 → 继续追问

**实现方式**：使用 `AskUserQuestion` 工具与用户交互，提供清晰的选项和补充信息输入。

### 1. 获取上下文 (Context)

- **查阅知识库**: 读取 `.trae/rules/index.md`，用 Grep 搜索 `.trae/rules/modules/` 定位领域知识。
- **查阅经验碎片**: 读取 `.trae/rules/inbox/`（可能为空）。
- **查阅代码**: 知识库不足时，用 SearchCodebase 查找相似代码模仿风格。
- **用户确认**: 若需要用户确认或补充信息，**必须**使用 `AskUserQuestion` 工具交互。

### 2. 执行与记录 (Execute & Log)
- **执行**: 编写或修改代码。
- **注释规范 (MANDATORY)**:
    - **文件头**: 每个文件必须有功能说明注释。
    - **公共 API**: 所有对外暴露的函数、类、接口必须有注释。
    - **注释语言**: 使用中文。
    - **格式要求**: 根据语言/技术选择合适的注释格式。
    - **通用原则**:
        - 说明"做什么"（功能）
        - 说明"输入什么"（参数）
        - 说明"输出什么"（返回值）
        - 说明"注意什么"（边界条件、副作用）
    - **常见格式示例**:
        ```typescript
        // TypeScript/JavaScript (JSDoc)
        /**
         * 功能描述
         * @param paramName - 参数说明
         * @returns 返回值说明
         */
        ```
        ```python
        # Python (Docstring)
        def function_name(param_name: type) -> return_type:
            """功能描述
            
            Args:
                param_name: 参数说明
                
            Returns:
                返回值说明
            """
        ```
        ```vue
        <!-- Vue 组件 -->
        <!--
        组件名称
        功能描述
        Props:
          - propName: 说明
        Emits:
          - eventName: 说明
        -->
        ```
- **用户确认**: 在执行过程中，若遇到需要用户确认的设计决策、技术选型或其他信息需求，**必须**使用 `AskUserQuestion` 工具与用户交互。
- **记录日志 (MANDATORY)**: 
    - 每完成一个文件的修改，**必须**立即调用日志脚本记录变更。
    - **禁止**手动编辑 `UPDATE_LOG.md`。
    - **推荐方式 (Template Mode)**: 
        1. 使用 `Write` 工具生成日志JSON文件：`.trae/logs/temp_log.json` (参考 `.trae/skills/coder/templates/log_entry.json`)
        2. 执行脚本读取：`python .trae/skills/coder/scripts/log_change.py --from-file .trae/logs/temp_log.json`
        3. 脚本会自动删除临时文件。
    - **备用方式 (CLI Mode)**: 仅适用于短描述。
        - `python .trae/skills/coder/scripts/log_change.py --action [修改文件/新增文件] --file [相对路径] --desc [简短中文描述]`

### 3. 经验检查 (Experience Check)

任务完成后，**必须**检查是否有值得总结的经验：

**判断维度**：
- **稀缺性**：Agent 首次遇到的问题、项目独创的技术方案
- **决策价值**：技术选型、架构决策、关键配置
- **问题解决价值**：Bug 修复、性能优化、坑点规避

**执行流程**：
1. 回顾整个任务过程
2. 根据判断维度检查是否有值得总结的经验
3. 如有，调用 `AskUserQuestion` 询问用户是否记录
   - 问题格式："发现以下经验值得记录，是否保存到 Inbox？\n- [经验摘要]"
   - 选项："是，记录下来" / "否，不需要"
4. 用户确认后，调用 `/skill knowledge-gardener` 记录

### 4. 自检 (Verify)
提交前必须完成以下检查：
- [ ] **Lint**: 运行 `npm run lint` 或 `ruff check` (如有配置)。
- [ ] **JSDoc**: 检查所有公共 API 是否有 JSDoc 注释，缺失则补充。
- [ ] **Test**: 运行相关测试用例 (如有配置)。
- [ ] **Style**: 确认新代码与现有代码风格一致。
- [ ] **Log**: 确认所有文件变更都已通过脚本记录到 `UPDATE_LOG.md`。

### 5. 提交建议 (Commit Advice)
- 代码完成后，提醒用户运行 `/skill integrity-check` 进行提交前检查。
