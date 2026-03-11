---
name: knowledge-doctor
description: 知识引擎的健康守护者。负责对 Rules 模块进行诊断（格式、正确性、去重、拆分）和治疗。
version: 1.0.0
---

# Knowledge Doctor Skill (知识医生)

此技能模仿医生的“诊断-治疗”流程，负责维护知识库的健康。
核心职责：**Format (格式化)**, **Fact (查证)**, **Dedup (去重)**, **Split (拆分)**。

## 触发机制 (Trigger)
当用户输入以下意图时触发：
- "整理知识库" / "检查知识库" / "知识体检"
- "修复文档格式" / "去重"
- "拆分大文件" / "验证知识准确性"

## ⚠️ 核心禁令 (Strict Prohibitions)
- **禁止使用 `DeleteFile` 工具操作规则文件**: 任何时候都不得直接删除 `.trae/rules/modules` 中的文件。所有删除工作必须由 `treatment.py` 脚本静默完成（软删除）。
- **禁止猜测**: 修正知识点时，必须有明确的证据（WebSearch 结果或代码库现状）。
- **禁止过度治疗**: 如果文件没有明显问题，不要为了“优化”而随意修改。
- **禁止越界治疗**: 严禁修改 `.trae/rules/modules` 以外的文件（如项目源码、配置文件、Skill定义文件等）。技能文件 (`SKILL.md`) 仅接受只读检查，不得进行格式化重写。
- **禁止手动重命名**: 所有文件重命名操作必须通过 `treatment.py` 脚本执行，确保操作可追溯。

## 标准作业程序 (SOP)

### 1. 预检分诊 (Triage)
Agent 调用 `scanner.py` 获取诊断报告。

- **默认模式 (增量)**: `python .trae/skills/knowledge-doctor/scripts/scanner.py`
- **专家模式 (全量)**: `python .trae/skills/knowledge-doctor/scripts/scanner.py --target modules --full`

**报告分析**:
- `critical`: 格式错误，必须立即修复。
- `warning`: 规模过大或潜在冲突，按需处理。

### 2. 制定治疗方案 (Treatment Planning)

根据报告类型，生成 JSON 格式的治疗计划（Treatment Plan）。

**Plan JSON 示例**:
```json
[
  {
    "action": "rewrite",
    "target": ".trae/rules/modules/ui/button.ts.md",
    "content_file": ".trae/temp/fixed_button.md"
  },
  {
    "action": "delete",
    "target": ".trae/rules/modules/ui/old_button_guide.md"
  }
]
```

**治疗类型**:

#### A. 格式修复 (Format Fix)
*症状*: 文件缺少 Frontmatter，或未使用 TypeScript Interface。
*动作*:
1. 读取文件。
2. 使用 `knowledge-librarian` 的 `new_module.md` 模板进行重写。
3. **Plan Action**: `"rewrite"` (target: 原文件, content_file: 重写后的临时文件)

#### B. 真相查证 (Fact Check)
*症状*: 包含 `TODO`, `FIXME`, `?` 标记，或内容存疑。
*动作*:
1. **Search**: 使用 `WebSearch` 搜索关键词。
2. **Verify**: 对比文档内容与搜索结果。
3. **Fix**: 修正错误，并在修改处添加 `<!-- Verified: YYYY-MM-DD -->` 注释。
4. **Plan Action**: `"rewrite"`

#### C. 去重手术 (Deduplication)
*症状*: 两个文件内容高度重叠。
*动作*:
1. **Analyze**: 确定保留哪个文件。
2. **Merge**: 将被废弃文件中的独特价值点合并到保留文件中。
3. **Plan Action**: 
   - 对保留文件执行 `"rewrite"` (合并后内容)
   - 对废弃文件执行 `"delete"`

#### D. 结构裂变 (Fission)
*症状*: 文件行数 > 300 行。
*动作*:
1. **Plan**: 提出拆分方案。
2. **Split**: 创建新的子文件。
3. **命名规则**: 拆分后的文件（除 index 外）必须包含原大文件的文件名作为前缀。
   - 原文件: `123.ts.md`
   - 拆分后:
     - `123-main-feature.ts.md`（核心功能）
     - `123-sub-feature-a.ts.md`（子功能A）
     - `123-sub-feature-b.ts.md`（子功能B）
     - `index.ts.md`（索引文件）
4. **Plan Action**: 
   - `"create"` (target: 新子文件)
   - `"rewrite"` (target: 原文件或 Index 文件)
   - `"delete"` (target: 原大文件，如果已完全拆分)

#### E. 命名规范修复 (Naming Convention Fix)
*症状*: 拆分文件不符合命名规则（缺少原文件名前缀）。
*动作*:
1. **Analyze**: 分析文件命名问题，确定原文件和正确的命名格式。
2. **Rename**: 按照命名规则重命名文件。
3. **Plan Action**: 
   - `"rename"` (old_path: 原文件路径, target: 新文件路径)

### 3. 执行治疗 (Execute Treatment)
执行生成的计划文件。

- **命令**: `python .trae/skills/knowledge-doctor/scripts/treatment.py --plan .trae/temp/treatment_plan.json`
- **机制**: 脚本会自动备份被修改的文件，并将被删除的文件移动到 `.trae/trash/`（静默删除）。

### 4. 康复复查 (Post-Check)
治疗完成后，再次运行 `scanner.py` 确认相关文件的警告已消除。
