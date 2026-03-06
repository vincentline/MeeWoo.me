# Knowledge Engine Index Optimization 知识摘要
> 摘要: 知识引擎索引机制升级为“混合模式 (Hybrid Indexing)”，以应对规则膨胀问题。
> 类型: Concept

## 1. 核心要点 (Key Points)
- **混合索引 (Hybrid Indexing)**:
    - **Layer 1 (静态)**: `rules/index.md` 仅保留 Core 规范和 Domain 入口，极简。
    - **Layer 2 (动态)**: 利用文件系统目录结构 (`LS`) 作为天然索引，Coder 动态检索。
- **目录重构**: `rules/modules/` 下不再扁平存放，而是按领域分层 (`graphics/`, `media/`, `ui/`)。
- **Skill 适配**: Coder 学会了 `LS` 检索；Librarian 学会了按领域归档。

## 2. 适用场景 (Use Cases)
- 当项目规则文件数量剧增，单一 `index.md` 超出 Context Window 时。
- 需要提高 Coder 检索准确率，减少无关干扰时。

## 3. 代码/配置示例 (Examples)
```markdown
## 2. 领域索引 (Domain Index)
| 领域 (Domain) | 目录入口 | 包含内容 |
| :--- | :--- | :--- |
| **图形与交互** | [modules/graphics/](modules/graphics/) | Canvas, Konva, WebGL |
```

## 4. 关联信息 (Meta)
- 来源: Chat with User
- 建议归档位置: `modules/engineering/knowledge-engine.ts.md`
