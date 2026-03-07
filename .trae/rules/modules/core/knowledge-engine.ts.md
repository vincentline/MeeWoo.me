---
module_name: KnowledgeEngine
type: core
description: 知识引擎配置与索引机制 (v6.0 + Doctor v1)
version: 1.1.0
---

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
    layer1: "Static Index (rules/index.md)";
    /** Layer 2: 动态索引 (文件系统目录结构) */
    layer2: "Dynamic Index (LS rules/modules/)";
  };

  /**
   * 目录结构 (v2.0)
   * @description 按领域分层的目录结构
   */
  directoryStructure: {
    core: "modules/core/ (系统设计, 知识引擎)";
    engineering: "modules/engineering/ (构建, CI/CD, WebWorker)";
    graphics: "modules/graphics/ (Konva, Canvas)";
    media: "modules/media/ (FFmpeg, YYEVA, 压缩)";
    ui: "modules/ui/ (Vue, 组件库)";
    business: "modules/business/ (业务规则)";
  };

  /**
   * 技能体系
   * @description 知识引擎的两大护法
   */
  skills: {
    /** 
     * 图书管理员 (Knowledge Librarian v6.0)
     * 负责将 Inbox 碎片结构化归档
     */
    librarian: {
      strategy: "Smart Structuring (Agent writes content)";
      operation: "Silent Delete (Move to Trash)";
    };
    /**
     * 知识医生 (Knowledge Doctor v1.0)
     * 负责维护知识库健康 (格式, 查证, 去重, 拆分)
     */
    doctor: {
      diagnosis: "Scanner (Format/Size/Tag)";
      treatment: "Treatment Script (Silent Delete/Update)";
    };
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

## 2. 技能协作 (Skill Collaboration)

### 2.1 图书管理员 (Librarian v6.0)
- **输入**: Inbox 中的经验碎片。
- **动作**: 智能结构化 (Smart Structuring) -> 生成 TS Interface + Markdown -> 归档。
- **输出**: 标准化的模块文档。
- **机制**: 归档成功后，脚本静默删除 Inbox 源文件。

### 2.2 知识医生 (Doctor v1.0)
- **输入**: 现有模块文档 (Modules) 和 技能定义 (Skills)。
- **动作**: 
  - **诊断 (Diagnosis)**: 扫描格式错误、大文件、TODO 标记。
  - **治疗 (Treatment)**: 执行格式修复、去重、拆分 (Fission)、事实查证。
- **输出**: 健康的知识库。
- **机制**: 所有删除操作均为静默软删除 (Move to Trash)。

## 3. 关联规则
- 核心规范: [工作流规范](../../core/workflows.ts.md)
- 技术栈: [技术栈规范](../../core/tech-stack.ts.md)
