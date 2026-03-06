# 知识引擎规范 (Knowledge Engine)

```typescript
/**
 * 知识引擎配置与索引机制
 * Knowledge Engine Configuration and Indexing Mechanism
 */
export interface KnowledgeEngine {
  /**
   * 索引模式
   * @description 混合索引模式 (Hybrid Indexing)
   */
  indexing: {
    /** Layer 1: 静态索引 (Core 规范和 Domain 入口) */
    layer1: "Static Index";
    /** Layer 2: 动态索引 (文件系统目录结构) */
    layer2: "Dynamic Index";
  };

  /**
   * 目录结构
   * @description 按领域分层的目录结构
   */
  directoryStructure: {
    /** 核心规范目录 */
    core: string;
    /** 领域模块目录 */
    modules: string;
    /** 日志目录 */
    logs: string;
  };

  /**
   * 归档流程
   * @description 经验碎片的处理流程
   */
  archivingProcess: {
    /** 扫描 Inbox */
    scan: boolean;
    /** 知识加工 */
    process: boolean;
    /** 质量审查 */
    criticMode: boolean;
    /** 写入归档 */
    archive: boolean;
    /** 健康度检查 */
    healthCheck: boolean;
    /** 清理 Inbox */
    cleanup: boolean;
  };
}
```

## 1. 混合索引机制 (Hybrid Indexing)

### 1.1 核心原理
- **Layer 1 (静态)**: `rules/index.md` 仅保留 Core 规范和 Domain 入口，保持极简。
- **Layer 2 (动态)**: 利用文件系统目录结构 (`LS`) 作为天然索引，Coder 可动态检索。

### 1.2 适用场景
- 当项目规则文件数量剧增，单一 `index.md` 超出 Context Window 时。
- 需要提高 Coder 检索准确率，减少无关干扰时。

## 2. 目录重构策略

### 2.1 领域分层
- `rules/modules/` 下不再扁平存放，而是按领域分层：
  - `graphics/` (图形与交互)
  - `media/` (多媒体处理)
  - `ui/` (UI 与组件)
  - `engineering/` (工程化)

### 2.2 目录结构示例
```markdown
## 2. 领域索引 (Domain Index)
| 领域 (Domain) | 目录入口 | 包含内容 |
| :--- | :--- | :--- |
| **图形与交互** | [modules/graphics/](../graphics/) | Canvas, Konva, WebGL |
```

## 3. 技能适配
- **Coder**: 学会使用 `LS` 进行动态检索。
- **Librarian**: 学会按领域归档经验碎片。

## 4. 健康度检查
- 运行脚本 `.trae/skills/knowledge-librarian/scripts/check_health.py` 扫描所有规则文件。
- 对于超过 300 行的文件，自动按语义拆分为子目录。

## 5. 关联规则
- 核心规范: [工作流规范](../../core/workflows.ts.md)
- 技术栈: [技术栈规范](../../core/tech-stack.ts.md)"}}}