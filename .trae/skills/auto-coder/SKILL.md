---
name: auto-coder
description: 专注于生成符合项目技术栈和代码规范的高质量代码。在编写代码前强制查阅规则文档，并在完成后进行自检。
version: 1.0.0
---

# Auto Coder Skill （老工匠）

此技能用于指导 AI 在开发新功能或修复 Bug 时，严格遵循项目规范。

## 核心指令 (Core Instructions)

当用户请求编写代码时，必须按以下步骤执行：

### 1. 上下文加载与路由 (Context Loading & Routing)
- **读取路由表**: 使用 `Read` 工具读取 `.trae/rules/index.md`。
- **扫描海马体 (Inbox Scan)**: 使用 `Read` 工具读取 `.trae/rules/inbox/index.md`，查看是否有最新的相关经验碎片。
- **关键词匹配**: 根据用户需求中的关键词 (如 `Canvas`, `FFmpeg`)，在主路由表和 Inbox 索引中查找对应的文件路径。
- **加载规则**: 读取匹配到的长期规则文件 (如 `modules/canvas.ts.md`)、核心规范 (`core/tech-stack.ts.md`) 以及相关的 Inbox 碎片文件。

### 2. 内部思考 (Internal Thinking)
在生成代码前，请在内心进行演练 (Think silently)，无需向用户显性输出 `<thinking>` 块，除非用户明确要求展示思考过程。
思考重点：
1. 是否覆盖了所有相关规则？
2. 是否存在技术栈冲突？
3. 是否引入了已知风险？

### 3. 代码生成 (Code Generation)
- **类型优先**：优先使用 TypeScript Interface 定义数据结构。
- **注释规范**：关键逻辑必须包含中文 JSDoc 注释。
- **模块化**：禁止编写超过 300 行的巨型文件，自动拆分为子模块。
- **引用规则代码**: 如果规则文件中提供了 Code Snippet 或 Validator Script，请优先引用或复用。

### 4. 自检清单 (Self-Check)
代码输出后，必须附带以下 Checkbox 列表，并在括号中注明依据的规则文件：
- [ ] 符合技术栈规范 (`core/tech-stack.ts.md`)
- [ ] 符合代码风格 (`core/coding-style.ts.md`)
- [ ] 关键逻辑已添加中文注释
- [ ] 错误处理逻辑完整
- [ ] 已查阅并遵循相关模块规则 (如 `modules/canvas.ts.md`)
