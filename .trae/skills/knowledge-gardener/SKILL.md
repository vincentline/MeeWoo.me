---
name: knowledge-gardener
description: 负责项目知识库的维护、更新和索引同步。自动提取开发经验，并确保文档与代码的一致性。
version: 1.0.0
---

# Knowledge Gardener Skill

此技能用于在开发结束后，将隐性经验转化为显性的结构化文档，并维护知识库的健康度。

## 核心指令 (Core Instructions)

当用户请求总结经验或更新文档时，必须按以下步骤执行：

### 1. 经验提取 (Extraction)
分析当前对话历史，提取“问题-原因-解决方案”三元组。

### 2. 批评家模式 (Critic Mode)
在写入文档前，必须进行自我反思：
```text
<critic>
1. 拟更新内容：[简述]
2. 查重结果：[是否已存在于 logs/error-log.md]
3. 价值评估：[这条经验是否具备通用性？]
4. 格式检查：[是否符合 TS Interface 格式？]
</critic>
```

### 3. 文档更新 (Update)
- **定位**：通过 `index.md` 找到目标文档（如 `modules/canvas.ts.md`）。
- **写入**：将新经验追加到 `troubleshooting` 或相关字段中。
- **格式**：必须使用 TypeScript Interface + 注释的格式。

### 4. 健康度检查 (Health Check)
- **检测**：检查目标文档行数是否超过 300 行。
- **拆分**：如果超标，自动按语义拆分为子文件（如 `canvas/drag.ts.md`），并更新索引。

### 5. 索引同步 (Indexing)
如果创建了新文件，必须同步更新 `.trae/rules/index.md`。
