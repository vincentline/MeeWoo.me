# MeeWoo 知识引擎架构设计文档 (MeeWoo Knowledge Engine Architecture)

## 1. 设计目标

解决非技术背景用户在使用 AI 辅助开发过程中面临的 **"AI 健忘"**、**"经验无法复用"** 以及 **"上下文 Token 爆炸"** 三大痛点。
本方案采用 **"规则系统 (Rule-Based) + 技能系统 (Skill-Based)"** 的双引擎架构，实现技术积累的自动化闭环。

***

## 2. 核心架构：双引擎驱动

### 2.0 系统指令 (System Prompts)

*定位：AI 的“宪法”，定义高遵循度的行为模式。*

在所有 Skill 的 System Prompt 中，我们将植入以下**伪代码契约**：

```python
# System Contract: Workflow Enforcement
def execute_task(task):
    """
    你是一个严格遵循流程的 AI 工程师。
    你的每一次行动都必须经过【思考】->【验证】->【执行】的步骤。
    """
    
    # 1. 强制思考 (Forced Chain of Thought)
    print("<thinking>")
    print(f"正在分析任务: {task.description}")
    
    # 2. 规则检索 (Rule Retrieval)
    rules = read_file(".trae/rules/index.md")
    required_docs = analyze_dependencies(task, rules)
    print(f"需查阅的文档: {required_docs}")
    
    # 3. 约束检查 (Constraint Check)
    if not verify_compliance(task, required_docs):
        raise ComplianceError("违反项目规范，拒绝执行")
    
    print("规则检查通过，开始执行...")
    print("</thinking>")
    
    # 4. 执行与输出 (Execution)
    result = perform_task(task)
    return format_output(result, format="json_or_markdown")
```

### 2.1 引擎一：规则系统 (The Library)

*定位：静态知识库，AI 的“长期记忆”与“行为准则”。*
*原则：按需加载，避免一次性占用过多上下文。*

#### 2.1.1 目录结构设计 (`.trae/rules/`)

```text
.trae/rules/
├── index.md                # [入口] 知识库总索引 (AI 必读)
├── active_context.md       # [动态] 当前任务上下文 (由 Skill 自动维护)
├── core/                   # [核心] 项目基础规范
│   ├── tech-stack.ts.md    # 技术选型 (Vue3, TS, Konva, Pinia)
│   ├── coding-style.ts.md  # 代码风格 (命名, 目录结构, 注释规范)
│   └── workflows.ts.md     # 工作流 (Git 提交, 版本发布)
├── modules/                # [模块] 垂直领域知识 (按需读取)
│   ├── canvas.ts.md        # Konva 画布交互与性能优化
│   ├── media.ts.md         # FFmpeg/SVGA/Lottie 处理经验
│   └── ui.ts.md            # Naive UI 组件使用规范
└── logs/                   # [记录] 踩坑与经验库
    ├── error-log.md        # 常见报错与解决方案
    └── decision-log.md     # 架构决策记录 (为什么选 A 不选 B)
```

#### 2.1.2 文档格式规范 (Structured Documentation)
推荐使用 **TS Interface + 注释** 的伪代码格式，以提升 AI 阅读效率并减少歧义。

*示例：`modules/canvas.ts.md`*
```typescript
// @module: CanvasInteraction
// @description: Konva 画布交互逻辑规范
// @last_updated: 2026-03-05

interface CanvasRules {
  // 【强制】拖拽实现规范
  // 必须使用 draggable 属性，禁止监听 mousemove
  dragImplementation: "native-draggable";

  // 【性能】渲染优化
  // 拖拽过程中必须停止重绘，mouseup 后再重绘
  performance: {
    throttle: "requestAnimationFrame";
    layerManagement: "use-separate-layer-for-drag";
  };

  // 【踩坑记录】
  troubleshooting: [
    {
      issue: "拖拽时画布闪烁",
      cause: "Vue 响应式更新频率过高",
      solution: "使用非响应式变量存储临时坐标"
    }
  ];
}
```

### 2.2 引擎二：技能系统 (The Worker)

*定位：动态执行器，AI 的“自动化脚本”。*
*原则：标准化流程，确保每次操作都符合规范。*

我们定义两个核心 Skill，分别负责 **"写代码"** 和 **"记笔记"**。

#### Skill A: `auto-coder` (开发模式)

*触发场景*：准备开发新功能或修复 Bug 时。
*System Prompt 增强*：

> "你必须先在 `<thinking>` 块中列出你即将查阅的规则文件路径。如果未查阅 `.trae/rules/core/tech-stack.md`，视为任务失败。"

*执行流程*：

1. **加载上下文**：自动读取 `.trae/rules/index.md` 和 `core/tech-stack.md`。
2. **任务分析**：判断涉及哪个模块（如 Canvas），自动读取对应的 `modules/canvas.md`。
3. **代码生成**：基于读取到的规范和经验生成代码。
4. **自检清单 (Self-Check)**：输出代码后，附带一个 Checkbox 列表，确认代码风格、类型定义、错误处理均已达标。

#### Skill B: `knowledge-gardener` (知识园丁)

*触发场景*：对话结束、Bug 解决后、或用户觉得“这条经验很重要”时。
*System Prompt 增强*：

> "你是一个苛刻的技术审查员。在记录经验前，必须反思：这条经验是否具备通用性？是否已经存在？请按 JSON 格式输出更新计划。"

*执行流程*：

1. **经验提取**：分析当前对话历史，提取 **"问题-原因-解决方案"** 三元组。
2. **查重与定位**：读取 `index.md`，判断该经验属于哪个模块。
3. **批评家模式 (Critic Mode)**：

   * 自我反思：这条经验是否准确？是否冗余？

   * 结构化输出：生成待更新内容的 JSON 预览。
4. **文档更新**：

   * **修正**：如果发现文档里的旧经验是错的，执行修正。

   * **追加**：如果是新知识，追加到对应文档（如 `logs/error-log.md`）。
5. **健康度检查 (Health Check)**：

   * **检测**：如果目标文档行数 > 300 行（或字符数 > 2000）。

   * **拆分**：按语义聚类（如“交互”、“性能”、“数据结构”），将大文件拆解为多个子文件存放在同名目录下。

   * **重构**：原文件转变为“子索引”，仅保留指向新文件的导航链接。
6. **索引同步**：如果新建了文件，自动更新 `index.md`。

***

## 3. 工作流演示 (Workflow Demo)

### 场景：开发“无限画布”拖拽功能

#### 阶段一：开发 (调用 `auto-coder`)

1. **用户**：`/skill auto-coder 我要开发画布拖拽功能`
2. **AI**：

   * 读取 `index.md` -> 发现涉及 Canvas 模块。

   * 读取 `modules/canvas.md` -> 获取“Konva 拖拽最佳实践”（例如：使用 `draggable: true` 而不是手动监听 mousemove）。

   * **生成代码**：直接产出符合项目规范的 Vue 3 + Konva 代码。

#### 阶段二：踩坑与修复

1. **用户**：*“报错了，拖拽时画布闪烁。”*
2. **AI**：*“排查发现是 Vue 响应式更新频率过高，应该用* *`requestAnimationFrame`* *节流。”* -> **修复代码**。

#### 阶段三：归档 (调用 `knowledge-gardener`)

1. **用户**：`/skill knowledge-gardener 记录这次闪烁问题的解决办法`
2. **AI**：

   * 提取经验：*“Konva 拖拽事件中避免直接修改 Vue 响应式数据，应使用非响应式变量或节流。”*

   * 定位目标：`modules/canvas.md` 的“性能优化”章节。

   * **写入文档**：将该条目追加到文件中。

   * **反馈**：*“已更新 Canvas 开发文档，记录了防抖优化的经验。”*

***

#### Skill B+: `integrity-check` (自动闭环版)
*定位：主动式一致性检查与自动修复*

*触发场景*：用户输入“提交代码”时。

*执行流程*：
1.  **变更扫描**：AI 扫描 `git diff --cached`，判断是否涉及核心模块（如 Canvas, FFmpeg）。
2.  **文档比对**：
    *   检查对应的 `.trae/rules/modules/xxx.ts.md` 修改时间。
    *   如果文档已更新 -> 执行 `git commit`。
3.  **自修复 (Self-Healing)**：
    *   如果文档未更新，自动调用 `knowledge-gardener`。
    *   **提取变更意图**：分析代码 Diff，总结修改点。
    *   **自动写入**：将变更追加到对应文档的 `changeLog` 或 `troubleshooting` 字段中。
    *   **反馈**：*“检测到 Canvas 逻辑变更，已自动更新技术文档。”*
4.  **最终提交**：将文档变更加入暂存区，一并提交。

---

## 4. 实施计划 (Implementation Plan)

### 第一步：基建搭建 (Infrastructure via Agent)
*执行方式：由 Agent 手动执行以下操作，无需编写额外 Python 脚本。*

1.  **全量扫描**：Agent 读取项目现有文档 (`README.md`, `UPDATE_LOG.md`) 及重构建议书。
2.  **结构化迁移**：
    *   创建 `.trae/rules/` 及其子目录。
    *   提取核心规范，写入 `core/tech-stack.ts.md` 等文件。
    *   生成 `index.md` 总索引。
3.  **验证**：尝试读取 `index.md` 并根据指引找到 `tech-stack.ts.md`。

### 第二步：技能配置 (Skill Configuration)

* [ ] 编写 `auto-coder` 的 Prompt 模板（包含自动读取指令）。

* [ ] 编写 `knowledge-gardener` 的 Prompt 模板（包含文档分析与写入指令）。

* [ ] 在 Trae 中注册这两个 Skill。

### 第三步：试运行 (Pilot Run)

* [ ] 使用新架构处理“MeeWoo 重构建议书”，将其拆解并归档到知识库中。

* [ ] 验证 AI 是否能通过 `/skill auto-coder` 正确读取到重构建议书中的技术选型。

***

## 5. 给用户的建议

1. **习惯使用 Skill**：把 `/skill` 当作一个“模式切换开关”。写代码前开 `auto-coder`，做完后开 `knowledge-gardener`。
2. **定期“除草”**：虽然 AI 会自动维护，但建议每隔一两个月手动浏览一遍 `index.md`，把过时的模块删掉。
3. **多用自然语言**：在调用 Skill 时，多用自然语言描述背景（如“这个 Bug 是因为 FFmpeg 版本不兼容导致的”），能帮助 AI 更准确地记录经验。

