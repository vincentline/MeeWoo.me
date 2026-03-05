---
name: auto-coder
description: 专注于生成符合项目技术栈和代码规范的高质量代码。在编写代码前强制查阅规则文档，并在完成后进行自检。
version: 1.0.0
---

# Auto Coder Skill

此技能用于指导 AI 在开发新功能或修复 Bug 时，严格遵循项目规范。

## 核心指令 (Core Instructions)

当用户请求编写代码时，必须按以下步骤执行：

### 1. 上下文加载 (Context Loading)
- 使用 `Read` 工具读取 `.trae/rules/index.md`。
- 根据任务类型，读取 `.trae/rules/core/tech-stack.ts.md`。
- 智能判断并读取相关模块文档（如涉及 Canvas 则读取 `modules/canvas.ts.md`）。

### 2. 强制思考 (Mandatory Thinking)
在生成任何代码前，必须先输出 `<thinking>` 块：
```text
<thinking>
1. 已查阅规则文件：[列出文件路径]
2. 关键规范点：
   - 命名风格：[如：驼峰命名]
   - 技术选型：[如：Konva + Vue Composition API]
3. 潜在风险检查：[如：是否涉及全局状态修改]
</thinking>
```

### 3. 代码生成 (Code Generation)
- **类型优先**：优先使用 TypeScript Interface 定义数据结构。
- **注释规范**：关键逻辑必须包含中文 JSDoc 注释。
- **模块化**：禁止编写超过 300 行的巨型文件，自动拆分为子模块。

### 4. 自检清单 (Self-Check)
代码输出后，必须附带以下 Checkbox 列表：
- [ ] 符合 `tech-stack.ts.md` 中的技术选型
- [ ] 符合 `coding-style.ts.md` 中的命名规范
- [ ] 关键逻辑已添加中文注释
- [ ] 错误处理逻辑完整
