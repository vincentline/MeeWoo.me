# JSON Schema 定义

本文档定义了 skill-creator 使用的 JSON 结构。

---

## evals.json

定义技能的评估用例。位于技能目录下的 `evals/evals.json`。

```json
{
  "skill_name": "example-skill",
  "evals": [
    {
      "id": 1,
      "prompt": "用户的示例提示词",
      "expected_output": "期望结果的描述",
      "files": ["evals/files/sample1.pdf"],
      "expectations": [
        "输出包含 X",
        "技能使用了脚本 Y"
      ]
    }
  ]
}
```

**字段说明：**
- `skill_name`：与技能 frontmatter 中的 name 匹配
- `evals[].id`：唯一整数标识
- `evals[].prompt`：要执行的任务
- `evals[].expected_output`：人类可读的成功描述
- `evals[].files`：可选的输入文件路径列表（相对于技能根目录）
- `evals[].expectations`：可验证的断言列表

---

## history.json

追踪改进模式下的版本演进。位于工作区根目录。

```json
{
  "started_at": "2026-01-15T10:30:00Z",
  "skill_name": "pdf",
  "current_best": "v2",
  "iterations": [
    {
      "version": "v0",
      "parent": null,
      "expectation_pass_rate": 0.65,
      "grading_result": "baseline",
      "is_current_best": false
    },
    {
      "version": "v1",
      "parent": "v0",
      "expectation_pass_rate": 0.75,
      "grading_result": "won",
      "is_current_best": false
    },
    {
      "version": "v2",
      "parent": "v1",
      "expectation_pass_rate": 0.85,
      "grading_result": "won",
      "is_current_best": true
    }
  ]
}
```

**字段说明：**
- `started_at`：改进开始的 ISO 时间戳
- `skill_name`：被改进的技能名称
- `current_best`：当前最佳版本的标识符
- `iterations[].version`：版本标识符（v0, v1, ...）
- `iterations[].parent`：此版本派生自的父版本
- `iterations[].expectation_pass_rate`：评分通过率
- `iterations[].grading_result`：`"baseline"`、`"won"`、`"lost"` 或 `"tie"`
- `iterations[].is_current_best`：是否为当前最佳版本

---

## grading.json

评分子代理的输出。位于 `<run-dir>/grading.json`。

```json
{
  "expectations": [
    {
      "text": "输出包含名称 'John Smith'",
      "passed": true,
      "evidence": "在记录 Step 3 中发现: 'Extracted names: John Smith, Sarah Johnson'"
    },
    {
      "text": "电子表格在 B10 单元格有 SUM 公式",
      "passed": false,
      "evidence": "未创建电子表格。输出是文本文件。"
    }
  ],
  "summary": {
    "passed": 2,
    "failed": 1,
    "total": 3,
    "pass_rate": 0.67
  },
  "execution_metrics": {
    "tool_calls": {
      "Read": 5,
      "Write": 2,
      "Bash": 8
    },
    "total_tool_calls": 15,
    "total_steps": 6,
    "errors_encountered": 0,
    "output_chars": 12450,
    "transcript_chars": 3200
  },
  "timing": {
    "executor_duration_seconds": 165.0,
    "grader_duration_seconds": 26.0,
    "total_duration_seconds": 191.0
  },
  "claims": [
    {
      "claim": "表单有 12 个可填充字段",
      "type": "factual",
      "verified": true,
      "evidence": "在 field_info.json 中计数到 12 个字段"
    }
  ],
  "user_notes_summary": {
    "uncertainties": ["使用了 2023 年数据，可能已过时"],
    "needs_review": [],
    "workarounds": ["对不可填充字段回退到文本覆盖"]
  },
  "eval_feedback": {
    "suggestions": [
      {
        "assertion": "输出包含名称 'John Smith'",
        "reason": "一个提到该名称的虚构文档也会通过"
      }
    ],
    "overall": "断言检查了存在性但未检查正确性。"
  }
}
```

**字段说明：**
- `expectations[]`：带证据的已评分断言
- `summary`：汇总的通过/失败计数
- `execution_metrics`：工具使用和输出大小（来自执行器的 metrics.json）
- `timing`：实际耗时（来自 timing.json）
- `claims`：从输出中提取并验证的声明
- `user_notes_summary`：执行器标记的问题
- `eval_feedback`：（可选）对评估的改进建议，仅当评分者发现值得关注的问题时存在

---

## metrics.json

执行器子代理的输出。位于 `<run-dir>/outputs/metrics.json`。

```json
{
  "tool_calls": {
    "Read": 5,
    "Write": 2,
    "Bash": 8,
    "Edit": 1,
    "Glob": 2,
    "Grep": 0
  },
  "total_tool_calls": 18,
  "total_steps": 6,
  "files_created": ["filled_form.pdf", "field_values.json"],
  "errors_encountered": 0,
  "output_chars": 12450,
  "transcript_chars": 3200
}
```

**字段说明：**
- `tool_calls`：每种工具的调用次数
- `total_tool_calls`：所有工具调用的总和
- `total_steps`：主要执行步骤数
- `files_created`：创建的输出文件列表
- `errors_encountered`：执行期间遇到的错误数
- `output_chars`：输出文件的总字符数
- `transcript_chars`：执行记录字符数

---

## timing.json

运行的实际耗时。位于 `<run-dir>/timing.json`。

**如何捕获：** 当子代理任务完成时，任务通知中包含 `total_tokens` 和 `duration_ms`。立即保存这些数据——它们不会持久化到其他地方，事后无法恢复。

```json
{
  "total_tokens": 84852,
  "duration_ms": 23332,
  "total_duration_seconds": 23.3,
  "executor_start": "2026-01-15T10:30:00Z",
  "executor_end": "2026-01-15T10:32:45Z",
  "executor_duration_seconds": 165.0,
  "grader_start": "2026-01-15T10:32:46Z",
  "grader_end": "2026-01-15T10:33:12Z",
  "grader_duration_seconds": 26.0
}
```

---

## benchmark.json

基准测试输出。位于 `benchmarks/<timestamp>/benchmark.json`。

```json
{
  "metadata": {
    "skill_name": "pdf",
    "skill_path": "/path/to/pdf",
    "executor_model": "claude-sonnet-4-20250514",
    "analyzer_model": "most-capable-model",
    "timestamp": "2026-01-15T10:30:00Z",
    "evals_run": [1, 2, 3],
    "runs_per_configuration": 3
  },
  "runs": [
    {
      "eval_id": 1,
      "eval_name": "Ocean",
      "configuration": "with_skill",
      "run_number": 1,
      "result": {
        "pass_rate": 0.85,
        "passed": 6,
        "failed": 1,
        "total": 7,
        "time_seconds": 42.5,
        "tokens": 3800,
        "tool_calls": 18,
        "errors": 0
      },
      "expectations": [
        {"text": "...", "passed": true, "evidence": "..."}
      ],
      "notes": [
        "使用了 2023 年数据，可能已过时",
        "对不可填充字段回退到文本覆盖"
      ]
    }
  ],
  "run_summary": {
    "with_skill": {
      "pass_rate": {"mean": 0.85, "stddev": 0.05, "min": 0.80, "max": 0.90},
      "time_seconds": {"mean": 45.0, "stddev": 12.0, "min": 32.0, "max": 58.0},
      "tokens": {"mean": 3800, "stddev": 400, "min": 3200, "max": 4100}
    },
    "without_skill": {
      "pass_rate": {"mean": 0.35, "stddev": 0.08, "min": 0.28, "max": 0.45},
      "time_seconds": {"mean": 32.0, "stddev": 8.0, "min": 24.0, "max": 42.0},
      "tokens": {"mean": 2100, "stddev": 300, "min": 1800, "max": 2500}
    },
    "delta": {
      "pass_rate": "+0.50",
      "time_seconds": "+13.0",
      "tokens": "+1700"
    }
  },
  "notes": [
    "断言 '输出是 PDF 文件' 在两个配置中均 100% 通过——可能不区分技能价值",
    "Eval 3 显示高方差 (50% ± 40%)——可能不稳定或依赖模型",
    "无技能运行在表格提取断言上持续失败",
    "技能增加了 13 秒平均执行时间，但将通过率提高了 50%"
  ]
}
```

**字段说明：**
- `metadata`：基准测试运行信息
- `runs[]`：单次运行结果，`configuration` 必须为 `"with_skill"` 或 `"without_skill"`
- `run_summary`：每种配置的统计汇总（`mean`、`stddev`）
- `notes`：分析器的自由格式观察

---

## comparison.json

盲比输出。位于 `<grading-dir>/comparison-N.json`。

```json
{
  "winner": "A",
  "reasoning": "输出 A 提供了完整的解决方案，格式正确，包含所有必要字段。输出 B 缺少日期字段且格式不一致。",
  "rubric": {
    "A": {
      "content": {"correctness": 5, "completeness": 5, "accuracy": 4},
      "structure": {"organization": 4, "formatting": 5, "usability": 4},
      "content_score": 4.7, "structure_score": 4.3, "overall_score": 9.0
    },
    "B": {
      "content": {"correctness": 3, "completeness": 2, "accuracy": 3},
      "structure": {"organization": 3, "formatting": 2, "usability": 3},
      "content_score": 2.7, "structure_score": 2.7, "overall_score": 5.4
    }
  },
  "output_quality": {
    "A": {"score": 9, "strengths": ["完整解决方案", "格式良好", "所有字段齐全"], "weaknesses": ["标题样式有轻微不一致"]},
    "B": {"score": 5, "strengths": ["可读输出", "基本结构正确"], "weaknesses": ["缺少日期字段", "格式不一致", "部分数据提取"]}
  },
  "expectation_results": {
    "A": {"passed": 4, "total": 5, "pass_rate": 0.80},
    "B": {"passed": 3, "total": 5, "pass_rate": 0.60}
  }
}
```

---

## analysis.json

事后分析输出。位于 `<grading-dir>/analysis.json`。

```json
{
  "comparison_summary": {
    "winner": "A",
    "winner_skill": "path/to/winner/skill",
    "loser_skill": "path/to/loser/skill",
    "comparator_reasoning": "比较器选择赢家的原因摘要"
  },
  "winner_strengths": [
    "处理多页文档的清晰分步指令",
    "包含捕获格式错误的验证脚本"
  ],
  "loser_weaknesses": [
    "模糊的指令 '适当处理文档' 导致行为不一致",
    "没有验证脚本，执行者不得不临时应对"
  ],
  "instruction_following": {
    "winner": {"score": 9, "issues": ["次要：跳过了可选日志步骤"]},
    "loser": {"score": 6, "issues": ["未使用技能的格式模板", "自行发明了方法而非按步骤 3 执行"]}
  },
  "improvement_suggestions": [
    {
      "priority": "high",
      "category": "instructions",
      "suggestion": "将 '适当处理文档' 替换为明确的步骤",
      "expected_impact": "将消除导致行为不一致的歧义"
    }
  ],
  "transcript_insights": {
    "winner_execution_pattern": "读取技能 → 遵循 5 步流程 → 使用验证脚本",
    "loser_execution_pattern": "读取技能 → 不清楚方法 → 尝试了 3 种不同方法"
  }
}
```
