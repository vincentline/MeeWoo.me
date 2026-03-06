# 知识引擎索引优化方案 (Index Optimization Plan)

> **背景**: 随着项目规模扩大，`.trae/rules/index.md` 面临膨胀风险。为了保证 LLM 的检索效率和 Context Window 的利用率，决定采用**混合模式 (Hybrid Indexing)**。

## 1. 核心策略：混合索引 (Hybrid Indexing)

* **Layer 1 (静态索引)**: 仅保留 `Core` (核心规范) 和 `Domain` (领域入口)。保持极简，不超过 30 行。

* **Layer 2 (动态检索)**: 利用文件系统结构 (`LS` 命令) 作为天然索引。Coder 根据 Layer 1 的指引，进入特定目录执行 `LS` 查找具体规则。

## 2. 目录重构方案 (Directory Refactoring)

将 `.trae/rules/modules/` 下的扁平文件重组为领域子目录：

```text
.trae/rules/modules/
├── graphics/           # 图形与交互
│   ├── canvas.ts.md
│   └── webgl.ts.md (未来)
├── media/              # 多媒体处理
│   ├── media.ts.md
│   └── image-compression.ts.md
├── ui/                 # UI 与组件
│   └── ui.ts.md
└── engineering/        # 工程化 (未来)
```

## 3. Skill 适配计划 (Skill Adaptation)

### 3.1 Coder (老工匠)

* **现状**: 直接读取 `index.md` 并在其中查找具体文件。

* **变更**:

  1. 读取 `index.md` 获取领域入口 (如 `modules/media/`)。
  2. **执行** **`LS`** 列出该目录下的文件。
  3. 根据文件名语义选择读取目标。

* **影响**: 需要更新 `coder/SKILL.md` 的指令。

### 3.2 Librarian (图书管理员)

* **现状**: 归档时需要更新 `index.md`。

* **变更**:

  1. 归档时，将文件写入对应的领域子目录。
  2. **不再需要**频繁更新 `index.md` (因为 Layer 2 是动态的)。
  3. 仅当**新建领域目录**时，才需要更新 `index.md`。
  4. **拆分逻辑**：如果文件过大，拆分为 `modules/graphics/canvas/` 文件夹。

* **影响**: 需要更新 `knowledge-librarian/SKILL.md` 和 `check_health.py`。

### 3.3 Gardener (速记员)

* **现状**: 写入 Inbox，更新 Inbox 索引。

* **变更**: 无影响。Gardener 只负责 Inbox，不触碰 Rules 目录结构。

### 3.4 Integrity-Check (质检员)

* **现状**: 扫描 Inbox 覆盖率。

* **变更**: 无影响。

## 4. 实施步骤 (Execution Steps)

1. [ ] **目录重构**: 创建子目录并移动现有 `.ts.md` 文件。
2. [ ] **索引瘦身**: 重写 `.trae/rules/index.md`，仅保留领域入口。
3. [ ] **更新 Coder**: 修改 `SKILL.md`，增加 `LS` 动态检索指令。
4. [ ] **更新 Librarian**: 修改 `SKILL.md`，适配新的归档路径逻辑。
5. [ ] **验证**: 使用 Coder 尝试查找一个深层规则，验证检索链路。

<br />

