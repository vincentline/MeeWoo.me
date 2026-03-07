---
module_name: KnowledgeDoctorDesign
type: concept
domain: core
tags: knowledge-doctor, diagnosis, treatment, fission, smart-structuring
version: 1.0.0
---

# 知识医生 (Knowledge Doctor) 设计与开发复盘

```typescript
/**
 * 知识医生 (Knowledge Doctor) 概念模型
 * @description 模仿医生的“诊断-治疗”流程，维护知识库健康的自动化机制
 */
export interface KnowledgeDoctorDesign {
  /**
   * 核心定义
   * @description 一套自动化的诊断与治疗机制，维护知识库的格式、内容和结构健康
   */
  definition: string;

  /**
   * 核心架构
   * @description 诊断 (Diagnosis) + 治疗 (Treatment) 双阶段设计
   */
  architecture: {
    diagnosis: "Scanner (Incremental/Full Scan)";
    treatment: "Plan-Driven Execution (Backup + Soft Delete)";
  };

  /**
   * 关键经验
   * @description 开发过程中的核心发现与解决方案
   */
  lessonsLearned: {
    smartStructuring: "Agent as Brain for complex rewriting";
    fission: "Split oversized files into atomic sub-modules";
    silentOperations: "Script-handled file deletion to avoid interruption";
  };

  /**
   * 扩展性
   * @description 未来发展方向
   */
  scalability: "Scope expansion (Skills) + Integration with Librarian";
}
```

## 1. 核心定义 (Definition)
知识医生 (Knowledge Doctor) 是 MeeWoo 知识引擎的核心组件之一，旨在解决规则库缺乏维护、格式混乱、内容冗余等问题。它模仿医生的“望闻问切”流程，通过自动化的诊断工具和智能化的治疗方案，持续维护知识库的健康状态。

## 2. 核心架构 (Architecture)
采用 **Diagnosis (诊断) + Treatment (治疗)** 双阶段设计。

### 2.1 诊断 (Diagnosis)
- **工具**: `scanner.py`
- **机制**:
  - **增量扫描**: 基于 Git Diff (`git status`, `git diff-tree`) 快速定位变更文件。
  - **全量扫描**: 遍历所有模块文件。
- **检查项**:
  - **Format**: 检查 Frontmatter (`---`) 和 TS Interface。
  - **Size**: 检查文件行数是否超过 300 行。
  - **Tags**: 检查 `TODO`, `FIXME`, `?` 等标记。

### 2.2 治疗 (Treatment)
- **工具**: `treatment.py`
- **机制**:
  - **Plan-Driven**: Agent 生成 JSON 治疗计划，脚本批量执行。
  - **Safe Operations**:
    - **Backup**: 覆盖写前自动备份。
    - **Soft Delete**: 删除操作仅移动到 `.trae/trash/`，不物理删除。

## 3. 关键经验 (Lessons Learned)

### 3.1 智能结构化 (Smart Structuring)
- **发现**: 传统的正则表达式替换无法处理复杂的 Markdown 结构。
- **方案**: 引入 Agent (Librarian/Doctor) 作为“大脑”，负责将非结构化文本重写为 `TypeScript Interface + Markdown` 的标准格式。
- **效果**: 实现了对 Konva, Figma, WebWorker 等复杂模块的完美结构化。

### 3.2 细胞分裂 (Fission)
- **发现**: 单个模块文件容易膨胀到上千行，导致 Context Window 压力大且检索困难。
- **方案**: 实施“裂变”手术，将大文件拆解为原子化的子模块目录（如 `graphics/konva/` 下分 `interaction`, `rendering`, `export`）。
- **效果**: 提高了检索精度和维护性。

### 3.3 静默操作 (Silent Operations)
- **发现**: 频繁调用 IDE 的 `DeleteFile` 会打断用户心流。
- **方案**: 开发专用脚本 (`clean_inbox.py`, `treatment.py`) 处理文件删除，Agent 仅负责生成计划。

## 4. 扩展性 (Scalability)
- **Scope**: 医生不仅能治愈 Rules 模块，还能检查 Skills 定义 (`SKILL.md`) 的规范性。
- **Integration**: 与 Librarian (图书管理员) 形成闭环：Librarian 负责“入库”，Doctor 负责“在库维护”。
