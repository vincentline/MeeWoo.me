# Auto-Commit Template
# 用于 Integrity-Check 自动生成提交信息

<template>
[type]([scope]): [subject]

[body]

---
Ref: [inbox_file]
Type: [update_type]
</template>

<instructions>
1. **[type]**: 选择变更类型 (feat, fix, docs, style, refactor, perf, test, chore)。
2. **[scope]**: 影响的模块名 (如 canvas, media, core)。
3. **[subject]**: 简短的中文描述 (不超过 50 字)。
4. **[body]**: 
    - **只写功能/业务更新，不写具体文件列表**（Git 历史已有）。
    - 将复杂的变更归纳为几点核心功能点。
    - 使用无序列表。
5. **[inbox_file]**: 关联的 Inbox 文件名。若有多个，用逗号分隔 (如 `fix-a.md, feat-b.md`)。
6. **[update_type]**: AI 可读的简写标记：
    - `NEW`: 新功能/新文件
    - `MOD`: 修改逻辑/优化
    - `FIX`: 修复 Bug
    - `DOC`: 仅文档变更
    - `CFG`: 配置变更
</instructions>

<example>
docs(integrity-check): 更新帮助文档以反映新工作流

- 更新 Skill 角色图鉴，明确“自动提交”职责
- 补充自动提交 (Auto-Commit) 的操作步骤说明
- 修正流程图中的 Mermaid 语法错误

---
Ref: integrity-check-docs-update.md
Type: DOC
</example>

<example>
perf(canvas): 优化拖拽性能并修复边界抖动

- 核心逻辑重构：使用 requestAnimationFrame 替代 setTimeout
- 交互优化：增加惯性滚动支持
- Bug修复：解决拖拽至画布边缘时的坐标抖动

---
Ref: canvas-drag-perf.md
Type: MOD
</example>

<example>
refactor(media): 重构媒体处理核心架构

- 统一 FFmpeg 和 WebAssembly 的加载逻辑，移除冗余代码
- 优化 GIF/MP4 导出流程，支持多线程并发处理
- 升级相关测试用例适配新接口
- 更新媒体处理相关的类型定义 (Type Definitions)

---
Ref: media-module-refactor.md, ffmpeg-wasm-fix.md
Type: MOD
</example>
