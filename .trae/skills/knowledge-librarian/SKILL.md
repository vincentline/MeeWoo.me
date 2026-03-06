---
name: knowledge-librarian
description: 负责将 Inbox（海马体）中的经验碎片整理、归档到长期规则库（皮层）中。
version: 1.0.0
---

# Knowledge Librarian Skill (图书管理员)

此技能模仿人脑的“睡眠整理”功能，负责将短期记忆转化为长期记忆。

## 核心指令 (Core Instructions)

当用户请求“整理知识库”、“归档经验”或系统空闲时，按以下步骤执行：

### 1. 扫描 Inbox (Scan)
- **读取索引**: 读取 `.trae/rules/inbox/index.md`，获取所有待处理条目。
- **读取碎片**: 逐个读取 `.trae/rules/inbox/` 下的碎片文件内容。

### 2. 知识加工 (Process)
对于每个碎片文件：
- **分类**: 判断其属于哪个核心模块（如 `Canvas`, `Media`, `UI`）。
- **抽象**: 将具体的 Bug 或经验抽象为通用的规范或最佳实践。
- **定位**: 在 `.trae/rules/modules/` 中找到对应的规则文件。
    - 如果没有对应模块，则新建一个模块文件（如 `modules/3d-preview.ts.md`）并在主索引中注册。
    - **新建时必须根据内容类型选择合适的模板**:
        - **接口/规范型**: `.trae/skills/knowledge-librarian/templates/new_module.md`
        - **概念/原理型**: `.trae/skills/knowledge-librarian/templates/concept_module.md`
        - **指南/教程型**: `.trae/skills/knowledge-librarian/templates/guide_module.md`
        - **API/速查表**: `.trae/skills/knowledge-librarian/templates/reference_module.md`

### 3. 批评家模式 (Critic Mode) - 分级实证
在归档每个碎片前，必须进行**分级质量审查**，以确保知识与代码的一致性。

```text
<critic>
1. 拟归档碎片：[文件名]
2. 风险评估 (Risk Assessment):
    - Level 0 (Pass): 纯文档、概念、架构图 -> 无需代码验证。
    - Level 1 (Check): 业务逻辑、Bug 修复 -> 使用 Grep 确认相关组件存在。
    - Level 2 (Verify): 核心接口、配置项、公共方法 -> 必须使用 SearchCodebase/Read 验证代码实现是否一致。
3. 项目相关性检查 (Relevance Check):
    - 对于“通用技术建议”（如使用 Flask/Django），**必须**查阅 `package.json` 或 `core/tech-stack.ts.md`。
    - 若与项目技术栈不符（如在 Node.js 项目中推荐 Python 库），标记为 "仅参考" 或直接丢弃。
4. 实证执行 (Execution):
    - [针对 Level 1/2]: 执行验证命令 (e.g., `grep "interface Layer" src/`)
    - [结果]: 一致 / 冲突 / 未找到
5. 冲突处理 (Conflict Resolution):
    - 一致 -> 归档。
    - 冲突 -> 以**代码现状**为准，修正碎片内容后再归档。
    - 未找到 -> 标记为 "待确认 (Pending)"，暂不归档，并在 Inbox 中添加 `[PENDING]` 前缀。
</critic>
```

### 4. 归档写入 (Archive)
- **写入规则**: 将抽象后的内容写入目标规则文件（使用 TS Interface 格式）。
- **写入日志**: 如果是错误日志，追加到 `logs/error-log.md`。
    - **格式参考**: `.trae/skills/knowledge-librarian/templates/error_entry.md`。

### 5. 健康度检查与裂变 (Health Check & Division)
- **检测**: 运行脚本 `.trae/skills/knowledge-librarian/scripts/check_health.py` 扫描所有规则文件。
- **拆分**: 对于脚本报告中超过 300 行的文件，自动按语义将文件拆分为子目录（如 `modules/canvas/index.ts.md`）。
    - 拆分后，必须更新 `.trae/rules/index.md` 中的路由路径。
    - 确保新目录结构符合项目规范。

### 6. 清理 (Cleanup)
- **执行清理**: 运行脚本 `.trae/skills/knowledge-librarian/scripts/clean_inbox.py`，传入已处理的文件名列表。
    - 示例: `python .trae/skills/knowledge-librarian/scripts/clean_inbox.py file1.md file2.md`
- **验证**: 确认 Inbox 目录下的文件已被删除，且 `index.md` 已更新。
