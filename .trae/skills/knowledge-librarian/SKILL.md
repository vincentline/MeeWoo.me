---
name: knowledge-librarian
description: 负责将 Inbox（海马体）中的经验碎片整理、归档到长期规则库（皮层）中。
version: 1.0.0
---

# Knowledge Librarian Skill (图书管理员)

此技能模仿人脑的“睡眠整理”功能，负责将短期记忆转化为长期记忆。

## 核心指令 (Core Instructions)

此技能采用 **Agent (大脑) + Script (手臂)** 协同工作模式。Agent 负责思考和决策，Script 负责执行和落地。

### 1. 扫描与决策 (Scan & Decision)
- **全量扫描**: 读取 Inbox 索引 (`.trae/rules/inbox/index.md`)，默认对所有条目进行归档，遵循 **全量归档 (Archive All)** 原则。
- **优先级**: Bug Fixes > Core Config > General Guide。
- **分类标准**: 根据 **3.2 领域分类标准**，判断每个碎片属于哪个领域 (Graphics, Media, UI, Engineering, Core, Data, Business)。

### 2. 执行归档 (Execute Archiving)
调用核心脚本 `archiver.py` 进行结构化转换与文件写入。

- **脚本位置**: `.trae/skills/knowledge-librarian/scripts/archiver.py`
- **新建模块 (Create)**:
  - `python .trae/skills/knowledge-librarian/scripts/archiver.py create --source [SourcePath] --target [TargetPath] --template [TemplateType] --verify-cmd "[VerifyCmd]"`
- **合并规则 (Merge)**:
  - `python .trae/skills/knowledge-librarian/scripts/archiver.py merge --source [SourcePath] --target [TargetPath]`
- **双重验证机制**:
  - **Level 1 (纯文档)**: 直接归档。
  - **Level 2 (代码相关)**: Agent **必须**先阅读相关代码，并在调用脚本时传入 `--verify-cmd` (e.g., `grep "xxx" file.js`) 进行自动化验证。

### 3. 清理收尾 (Cleanup)
归档完成后，调用脚本清理源文件。

- **脚本位置**: `.trae/skills/knowledge-librarian/scripts/clean_inbox.py`
- **指令**: `python .trae/skills/knowledge-librarian/scripts/clean_inbox.py [File1] [File2] ...`
- **健康检查**: 归档结束后，建议运行 `check_health.py` 确保规则库健康。

### 3.2 领域分类标准 (Classification Standard)
- **Graphics**: 2D/3D 图形处理 (e.g., Canvas, Konva, WebGL, Shader, 坐标系统)。
- **Media**: 多媒体处理 (e.g., 音视频编解码, FFmpeg, WASM, 图片压缩)。
- **UI**: 界面与交互 (e.g., Vue 组件, 布局, CSS, 状态管理, 用户交互)。
- **Engineering**: 工程化与构建 (e.g., Vite, Webpack, CI/CD, 脚本工具, 依赖管理)。
- **Core**: 核心架构 (e.g., 系统设计, 核心接口, 插件机制, 错误处理)。
- **Data**: 数据与协议 (e.g., JSON Schema, Protobuf, IndexedDB, Pinia/Vuex 数据模型)。
- **Business**: 业务规则 (e.g., 计费逻辑, 权限控制, 埋点策略, 导出限制)。

### 4. 批评家模式 (Critic Mode) - 风险评估
在归档前，必须进行**分级质量审查**：

```text
<critic>
1. 拟归档碎片：[文件名]
2. 风险评估 (Risk Assessment):
    - Level 0 (Pass): 纯文档、概念、架构图 -> 无需代码验证。
    - Level 1 (Check): 业务逻辑、Bug 修复 -> Script 辅助 grep 验证。
    - Level 2 (Verify): 核心接口、配置项 -> Agent 阅读 + Script 验证。
3. 冲突处理 (Conflict Resolution):
    - 一致 -> 归档。
    - 冲突 -> 以代码现状为准，修正后归档。
    - 未找到 -> 标记为 "待确认 (Pending)"。
</critic>
```

### 5. 归档写入 (Archive)
- **动作**: 严格调用 `archiver.py` 执行，禁止手动 Write。
- **日志**: 重大决策 (ADR) 追加到 `logs/decision-log.md`。

### 6. 健康度检查与裂变 (Health Check & Division)
- **检测**: 运行 `.trae/skills/knowledge-librarian/scripts/check_health.py`。
- **拆分**: 超过 300 行的文件，提示 Agent 拆分为子目录。

### 7. 清理 (Cleanup)
- **执行清理**: 调用 `clean_inbox.py`。
- **验证**: 确认文件删除且索引更新。
