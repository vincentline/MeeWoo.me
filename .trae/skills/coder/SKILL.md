---
name: coder
display_name: 老工匠 (Auto Coder)
description: 当用户请求编写代码、修改功能、修复 Bug、重构代码、添加新特性、或涉及任何代码变更时，必须立即调用此技能。此技能确保代码符合项目规范，强制查阅知识库规则。
version: 3.6.0
---

# Coder Skill （老工匠） v3.6

此技能用于指导 AI 在编写代码时遵循项目规范（`.trae/rules/`），确保代码质量和一致性。

> **与 complex-dev-task-lite 的关系**：本技能覆盖所有代码开发任务的基础流程。Triage 判定为 Complex（3+ 文件 / 跨模块 / 需求边界不清 / 影响 API 契约）时，升级到 `complex-dev-task-lite` 走完整方案治理流程。判定为 Simple/Medium 时在本技能内闭环。

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

按以下 7 步闭环流程执行：

### 1. 任务评估 (Triage)

在开始前，先评估任务规模与影响面，决定执行路径：

| 级别 | 判定条件 | 执行路径 |
|:---|:---|:---|
| **Simple** | 单文件局部改动，不涉及核心逻辑/状态/API 契约变更 | 直接进入步骤 3（获取上下文） |
| **Medium** | 单文件核心逻辑 / 2-3 文件改动 / 存在 2+ 种实现路径 | 使用 `TodoWrite` 规划后进入步骤 3 |
| **Complex** | 3+ 文件或跨模块 / 需求边界不清 / 影响 API 契约 | **升级到 `complex-dev-task-lite`** |

### 2. 需求沟通 (Requirement Communication)

**唯一的用户交互入口**。能推理判断的，不问用户。仅在以下场景使用 `AskUserQuestion`：
- 任务描述模糊、信息不足，无法自行推断
- 存在多种实现方案且各有真实取舍，无法自行判断
- 执行途中出现步骤 1 未覆盖的新不确定项 → 回到本步骤处理

**信息充足 → 直接进入步骤 3；信息不足 → 继续追问，直到充足或用户表示"先用现有信息开始"。**

### 3. 获取上下文 (Context)

- **查阅知识库**: 读取 `.trae/rules/index.md`，用 Grep 搜索 `.trae/rules/modules/` 定位领域知识。
- **查阅经验碎片**: 读取 `.trae/rules/inbox/`（可能为空）。
- **查阅代码**: 知识库不足时，用 SearchCodebase 查找相似代码模仿风格。

### 4. 执行与记录 (Execute & Log)
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
- **记录日志 (MANDATORY)**: 
    - 每完成一个文件的修改，**必须**立即调用日志脚本记录变更。
    - **禁止**手动编辑 `UPDATE_LOG.md`。
    - **推荐方式 (Template Mode)**: 
        1. 使用 `Write` 工具生成日志JSON文件：`.trae/logs/temp_log.json` (参考 `.trae/skills/coder/templates/log_entry.json`)
        2. 执行脚本读取：`python .trae/skills/coder/scripts/log_change.py --from-file .trae/logs/temp_log.json`
        3. 脚本会自动删除临时文件。
    - **备用方式 (CLI Mode)**: 仅适用于短描述。
        - `python .trae/skills/coder/scripts/log_change.py --action [修改文件/新增文件] --file [相对路径] --desc [简短中文描述]`

### 5. 经验检查 (Experience Check)

任务完成后，对照用户规则中的 **记忆检索与活动规则** 写入触发场景表逐项自查：
- **命中** → 直接调用 `/skill knowledge-gardener` 或 MCP `memory_write` 写入，**无需询问用户**。
- **边界模糊**（疑似命中但不确定）→ 才使用 `AskUserQuestion` 确认后再写入。
- **未命中** → 跳过。

### 6. 自检 (Verify)

提交前按文件类型执行对应检查：

- [ ] **JS/TS**: 若 `package.json` 存在 `lint` 脚本 → 执行；否则跳过（输出"跳过 lint：未配置"）
- [ ] **Python**: 先 `python -c "import ruff"` 检测可用性 → 可用则 `ruff check`；不可用则跳过
- [ ] **CSS/HTML**: 目视检查代码风格一致性
- [ ] **Style**: 确认新代码与现有代码风格一致（新旧代码相邻对比）
- [ ] **Log**: 确认所有文件变更都已通过脚本记录到 `UPDATE_LOG.md`

### 7. 提交 (Commit)

**与用户规则"原则五：编辑后提交"对齐**——发生任何文件编辑后，在本轮交付前完成 git commit。

1. 执行 `git status` + `git diff` + `git log --oneline -5` 了解变更和提交风格
2. 将相关文件 `git add`（禁止 `git add -A`）
3. 使用 `-F` 文件方式提交（避免中文/多行参数被终端错误解析）：
   ```bash
   echo "commit message" > .git/COMMIT_EDITMSG_TEMP
   git commit -F .git/COMMIT_EDITMSG_TEMP
   rm .git/COMMIT_EDITMSG_TEMP
   ```
4. 无需 push（除非用户明确要求）
5. 改动较大时拆分为多次原子提交
