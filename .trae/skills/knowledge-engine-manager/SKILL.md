---
name: knowledge-engine-manager
description: 当用户请求安装、更新或重新安装知识引擎时，必须立即调用此技能。此技能管理“类脑知识引擎”的安装、更新和维护，自动构建标准目录结构、部署规则文件、生成技术栈文档，并处理 Knowledge-Skills 子模块的双向同步。
---

# Knowledge Engine Manager

## ⚡ 触发条件 (Trigger Conditions)

**必须立即调用此技能的场景：**

| 触发关键词 | 示例请求 |
|:---|:---|
| **安装知识库** | "安装知识库"、"初始化知识引擎"、"设置知识引擎" |
| **更新知识库** | "更新知识库"、"同步知识引擎"、"拉取最新规则" |
| **重新安装知识库** | "重新安装知识库"、"覆盖知识引擎"、"重置知识引擎" |

**判断原则：** 凡是涉及知识引擎的安装、更新、重新安装等管理操作的场景，都必须触发此技能。

## 功能 (Features)
- **目录构建**: 自动创建 `.trae/rules`, `.trae/logs`, `.trae/temp`, `.trae/trash` 等标准结构。
- **规则部署**: 部署标准代码规范 (`coding-style`) 和工作流 (`workflows`)。
- **技术栈生成**: 自动分析项目依赖，生成 `tech-stack.ts.md`。
- **双向同步**: 管理 `Knowledge-Skills` 子模块的安装、拉取 (Pull) 和推送 (Push)。
- **依赖管理**: 检查并安装项目依赖 (`requirements.txt`, `package.json`)。

## 使用方法 (Usage)

### 安装 (Install)
> 在新项目中初始化知识引擎。

`/skill knowledge-engine-manager install` 或 `/skill knowledge-engine-manager 安装知识库`

### 更新 (Update)
> 同步知识引擎的最新规则和技能。

`/skill knowledge-engine-manager update` 或 `/skill knowledge-engine-manager 更新知识库`

### 重新安装 (Reinstall)
> 重新安装知识引擎，覆盖现有目录。

`/skill knowledge-engine-manager reinstall` 或 `/skill knowledge-engine-manager 重新安装知识库`

## Agent 指南 (Agent Guide)

### 1. 执行流程
当用户请求安装或更新时，请按照以下步骤操作：

1.  **调用主脚本**: 
    - 优先尝试运行: `python .trae/skills/knowledge-engine-manager/scripts/main.py [install|update|reinstall]`
    - 如果是在开发调试模式下，运行: `python knowledge-engine-manager/scripts/main.py [install|update|reinstall]`
2.  **检查输出**:
    - 若输出 `NEED_TECH_STACK_ANALYSIS`:
        - 调用 `LS` 列出项目根目录文件。
        - 查找 `package.json`, `requirements.txt`, `pom.xml`, `go.mod` 等。
        - 读取这些文件内容。
        - 分析主要技术栈（语言、框架、核心库）。
        - 按照 `tech-stack.ts.md` 格式生成内容。
        - 写入 `.trae/rules/core/tech-stack.ts.md`。
    - 若输出 `DIRTY_STATE_DETECTED`:
        - 询问用户：“检测到 `knowledge-engine` 有未提交的修改，您希望提交 (Commit) 还是丢弃 (Discard)？”
        - 若用户选择提交：引导用户输入 Commit Message，然后调用 `git add .` 和 `git commit` (在 `knowledge-engine` 目录下)。
        - 若用户选择丢弃：调用 `git reset --hard` (在 `knowledge-engine` 目录下)。
        - 完成后，再次运行 `update` 命令。
    - 若输出 `KE_EXISTS`:
        - 询问用户：“检测到 `knowledge-engine` 目录已存在，您希望：
          1. 重新安装（会覆盖现有目录）
          2. 更新仓库（与远程仓库双向同步）
          3. 取消安装流程”
        - 若用户选择重新安装：运行 `python .trae/skills/knowledge-engine-manager/scripts/main.py reinstall`
        - 若用户选择更新仓库：运行 `python .trae/skills/knowledge-engine-manager/scripts/main.py update`
        - 若用户选择取消：终止操作。
3.  **结果反馈**: 向用户汇报操作结果。

### 2. 技术栈生成提示 (Tech Stack Generation)
生成 `tech-stack.ts.md` 时，请遵循以下模板：

```typescript
# 技术栈规范 (Tech Stack)

/**
 * 项目技术栈定义
 * Tech Stack Definitions
 */
export interface TechStack {
  /**
   * 编程语言
   */
  languages: {
    // 示例: "Python": "3.9+"
    [key: string]: string;
  };

  /**
   * 核心框架
   */
  frameworks: {
    // 示例: "FastAPI": "0.68+"
    [key: string]: string;
  };

  /**
   * 关键依赖库
   */
  libraries: {
    // 示例: "Pydantic": "1.8+"
    [key: string]: string;
  };

  /**
   * 构建与工具
   */
  tools: {
    // 示例: "Poetry": "1.1+"
    [key: string]: string;
  };
}
```

## 3. 状态码列表 (Status Codes)

| 状态码 | 含义 | Agent 动作 |
|:---|:---|:---|
| `SUCCESS` | 完全成功 | 无需额外操作 |
| `NEED_TECH_STACK_ANALYSIS` | 需要生成技术栈 | 分析依赖文件，创建 tech-stack.ts.md |
| `NEED_INDEX_GENERATION` | 需要生成索引内容 | 根据当前规则结构生成 .trae/rules/index.md 内容 |
| `KE_EXISTS` | knowledge-engine 已存在且有效 | 询问用户：更新 or 重装 or 取消 |
| `KE_EXISTS_INVALID` | 目录存在但无效 | 询问用户：删除重建 or 取消 |
| `DIRTY_STATE_DETECTED` | 有未提交修改 | 询问用户：提交 or 丢弃 |

## 4. 错误恢复指南 (Error Recovery Guide)

### 4.1 常见错误状态处理

| 错误状态 | 可能原因 | 处理方法 |
|:---|:---|:---|
| `KE_EXISTS` | knowledge-engine 目录已存在 | 询问用户选择：更新、重新安装或取消 |
| `KE_EXISTS_INVALID` | 目录存在但不是有效 Git 仓库 | 询问用户选择：删除重建或取消 |
| `DIRTY_STATE_DETECTED` | 有未提交的修改 | 询问用户选择：提交或丢弃更改 |
| `NEED_TECH_STACK_ANALYSIS` | 技术栈文件缺失或为空 | 分析项目依赖，创建 tech-stack.ts.md |
| `NEED_INDEX_GENERATION` | index.md 文件内容为空 | 根据当前规则结构生成索引内容 |

### 4.2 故障排除

| 问题 | 可能原因 | 解决方案 |
|:---|:---|:---|
| Git 命令执行失败 | 网络问题或权限问题 | 检查网络连接和 VPN 状态，确保有足够的权限 |
| 依赖安装失败 | 包管理器不存在或网络问题 | 安装相应的包管理器，检查网络连接 |
| 目录创建失败 | 权限问题 | 以管理员身份运行命令 |
| 子模块同步失败 | 本地更改未提交 | 提交或丢弃本地更改后重试 |
