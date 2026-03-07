# Knowledge Doctor Skill 建设方案

## 1. 核心定位 (Mission)

**Knowledge Doctor (知识医生)** 是知识引擎的**健康守护者**。
它负责对 `.trae/rules/modules` 中的存量知识进行**诊断 (Diagnose)** 和 **治疗 (Treat)**，确保知识库始终保持**正确、健康、高效**的状态。

与 Librarian 的区别：

* **Librarian (图书管理员)**: 负责 **Ingestion (入库)**。将 Inbox 碎片搬运到 Modules 中。

* **Doctor (医生)**: 负责 **Governance (治理)**。对已入库的知识进行体检、手术和康复。

## 2. 核心能力 (Capabilities)

### 2.1 格式标准化 (Format Standardization)

* **诊断**: 扫描文件是否符合 v6.0 `TypeScript Interface + Markdown` 标准。

* **治疗**: 自动将旧版 Markdown 或格式错误的文档重写为标准格式。

### 2.2 真相查证 (Fact Checking)

* **诊断**: 识别文档中的存疑点（`TODO`, `FIXME`, `?`）或互相矛盾的描述。

* **治疗**: 调用 `WebSearch` 验证官方文档，修正错误内容，并签署“健康证明”（添加 `Verified: [Date]`）。

### 2.3 去重与冲突解决 (Deduplication)

* **诊断**: 发现重复内容（冗余）或冲突内容（病灶）。

* **治疗**: 执行“切除手术”——保留正确的一处权威源 (SSOT)，删除冗余，并建立引用链接。

### 2.4 结构裂变 (Fission)

* **诊断**: 识别“肥胖”文件（行数 > 300行）。

* **治疗**: 执行“分身手术”——将大文件按逻辑拆分为多个原子文件，并更新索引。

## 3. 扫描策略 (Scanning Strategy)

为了平衡性能与覆盖率，采用**分级诊疗**策略：

### 3.1 急诊模式 (Emergency Mode) - *默认*

* **触发**: 日常维护，或用户未指定范围时。

* **范围**: **增量扫描**。

  * 基于 Git 状态：检查未提交 (`git diff`) 和最近 N 次提交 (`git diff HEAD~N`) 涉及的规则文件。

  * 聚焦于“最近活动”的知识，确保新知识的健康度。

### 3.2 专家会诊 (Full Checkup) - *按需*

* **触发**: 用户明确指令（“给 graphics 模块做个体检”）或定期任务。

* **范围**: **全量扫描**。

  * 扫描指定目录（如 `modules/graphics`）或全部 `modules`。

  * 适用于系统性的重构或定期大扫除。

## 4. 标准作业程序 (SOP)

### Step 1: 预检 (Triage)

Agent 调用扫描脚本，生成**诊断报告 (Diagnosis Report)**。

```bash
# 默认急诊模式 (增量)
python .trae/skills/knowledge-doctor/scripts/scanner.py

# 专家会诊 (指定目标)
python .trae/skills/knowledge-doctor/scripts/scanner.py --target modules/graphics --full
```

**报告示例**:

```json
{
  "critical": [
    { "file": "modules/core/legacy.md", "issue": "format_error", "msg": "Missing Interface" }
  ],
  "warning": [
    { "file": "modules/graphics/konva.ts.md", "issue": "oversized", "msg": "450 lines" },
    { "file": "modules/ui/button.ts.md", "issue": "conflict", "msg": "Potential duplicate with modules/ui/common.ts.md" }
  ]
}
```

### Step 2: 治疗 (Treatment)

Agent 根据报告优先级执行治疗方案：

1. **急救 (Critical Fix)**: 优先修复格式错误，确保文件可被机器理解。
2. **手术 (Surgery)**:

   * **去重**: 阅读冲突文件 -> 联网验证 -> 合并/删除。

   * **拆分**: 读取大文件 -> 制定拆分计划 -> 创建新文件 -> 更新引用。
3. **康复 (Verify)**: 再次运行扫描，确认问题已解决。

## 5. 工具链设计 (Toolchain)

### 5.1 `scanner.py` (CT扫描仪)

* **功能**: 执行增量/全量扫描，生成 JSON 格式的诊断报告。

* **参数**:

  * `--target [path]`: 指定扫描目录。

  * `--full`: 强制全量扫描（忽略 Git 状态）。

  * `--since [commit]`: 扫描自某次提交以来的变更。

## 6. 目录结构

```text
.trae/skills/knowledge-doctor/
├── SKILL.md              # 技能定义 (SOP)
├── scripts/
│   └── scanner.py        # 核心扫描脚本
└── templates/            # 诊断报告模板 (可选)
```

## 7. 实施计划

1. **创建技能**: 建立 `knowledge-doctor` 目录。
2. **开发工具**: 实现 `scanner.py`，重点实现基于 Git 的增量检测逻辑。
3. **制定 SOP**: 编写 `SKILL.md`，定义从“预检”到“治疗”的完整流程。

