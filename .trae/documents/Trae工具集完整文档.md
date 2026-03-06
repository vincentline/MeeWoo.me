# Trae 工具集完整文档

> 本文档列出了 Trae IDE 提供给 Agent 的所有工具及其功能说明。

---

## 一、代码搜索与探索工具

### 1. SearchCodebase
**功能**: 代码库语义搜索引擎
- 使用自然语言描述搜索代码
- 基于专有检索/嵌入模型，提供高质量代码片段召回
- 实时索引，结果始终反映代码库当前状态
- 支持跨编程语言检索

### 2. Glob
**功能**: 文件模式匹配搜索
- 快速文件名模式匹配（如 `*.js`、`src/**/*.ts`）
- 按修改时间排序返回结果
- 适用于已知文件名模式的场景

### 3. Grep
**功能**: 正则表达式内容搜索
- 基于 ripgrep 的强大搜索能力
- 支持完整正则语法
- 支持按文件类型过滤（js、py、rust 等）
- 支持上下文行显示（-A、-B、-C 参数）
- 支持多行匹配模式

### 4. LS
**功能**: 目录内容列表
- 列出指定路径下的文件和目录
- 支持忽略特定 glob 模式
- 必须使用绝对路径

---

## 二、文件操作工具

### 5. Read
**功能**: 读取文件内容
- 直接访问本地文件系统任意文件
- 单次最多读取 250 行（默认 2000 行）
- 支持指定偏移量和限制行数
- 超过 2000 字符的行会被截断

### 6. Write
**功能**: 写入文件
- 覆盖现有文件（需先 Read）
- 创建新文件
- 必须使用绝对路径

### 7. SearchReplace
**功能**: 搜索替换编辑文件
- 在现有文件中搜索并替换内容
- 只替换第一个匹配项
- SEARCH 和 REPLACE 部分必须不同
- 适用于精确的代码修改

### 8. DeleteFile
**功能**: 删除文件
- 支持批量删除多个文件
- 删除前必须确认文件存在
- 必须使用绝对路径

---

## 三、命令执行工具

### 9. RunCommand
**功能**: 执行终端命令
- 以用户身份执行命令
- 支持 PowerShell 环境
- 支持指定工作目录
- 支持阻塞/非阻塞模式
- 非阻塞模式适用于启动服务器等长时间运行进程

### 10. CheckCommandStatus
**功能**: 检查命令执行状态
- 获取非阻塞命令的当前状态
- 查看运行中命令的输出
- 支持输出过滤和分页

### 11. StopCommand
**功能**: 终止运行中的命令
- 停止正在执行的命令
- 用于重启服务或清理进程

---

## 四、任务管理工具

### 12. TodoWrite
**功能**: 任务列表管理
- 创建和管理结构化任务列表
- 跟踪任务进度（pending、in_progress、completed）
- 支持任务优先级（high、medium、low）
- 自动记录任务完成摘要

### 13. Task
**功能**: 启动子代理
- 分配任务给专门的子代理
- 支持的代理类型：
  - **search**: 代码库探索
  - **ui-designer**: UI 设计与组件开发
  - **backend-architect**: 后端架构设计
  - **lifestyle-butler**: 生活事务管理
  - **frontend-architect**: 前端架构设计
  - **qa-testing-engineer**: 测试与代码审查
  - **product-strategist**: 产品策略规划

### 14. Skill
**功能**: 执行技能
- 调用预定义的技能模块
- 当前可用技能：
  - **skill-creator**: 创建新技能
  - **knowledge-gardener**: 开发经验提取
  - **integrity-check**: 代码变更检查
  - **coder**: 代码生成
  - **webapp-testing**: Web 应用测试
  - **python_programming**: Python 编程
  - **knowledge-librarian**: 知识归档

---

## 五、交互与诊断工具

### 15. AskUserQuestion
**功能**: 向用户提问
- 在任务执行中收集用户偏好
- 澄清模糊指令
- 提供选项让用户决策
- 支持多选模式
- 自动提供 "Other" 自定义输入选项

### 16. GetDiagnostics
**功能**: 获取语言诊断
- 从 VS Code 获取语言服务器诊断
- 检查类型错误、语法错误等
- 支持指定文件或全局诊断

### 17. OpenPreview
**功能**: 打开预览
- 向用户展示本地服务器预览 URL
- 必须在成功启动服务器后使用

---

## 六、网络工具

### 18. WebSearch
**功能**: 网络搜索
- 搜索互联网信息
- 获取实时数据（天气、股价等）
- 查找官方文档和解决方案

### 19. WebFetch
**功能**: 获取网页内容
- 抓取 URL 内容并转换为 Markdown
- 只读操作，不修改文件
- 结果可能被截断

---

## 七、GitHub 集成工具

### 仓库操作
| 工具名称 | 功能 |
|---------|------|
| mcp_GitHub_create_repository | 创建新仓库 |
| mcp_GitHub_fork_repository | Fork 仓库 |
| mcp_GitHub_search_repositories | 搜索仓库 |

### 文件操作
| 工具名称 | 功能 |
|---------|------|
| mcp_GitHub_get_file_contents | 获取文件/目录内容 |
| mcp_GitHub_create_or_update_file | 创建或更新单个文件 |
| mcp_GitHub_push_files | 批量推送多个文件 |

### 分支操作
| 工具名称 | 功能 |
|---------|------|
| mcp_GitHub_create_branch | 创建新分支 |
| mcp_GitHub_list_commits | 列出提交历史 |

### Issue 操作
| 工具名称 | 功能 |
|---------|------|
| mcp_GitHub_create_issue | 创建 Issue |
| mcp_GitHub_get_issue | 获取 Issue 详情 |
| mcp_GitHub_list_issues | 列出 Issues |
| mcp_GitHub_update_issue | 更新 Issue |
| mcp_GitHub_add_issue_comment | 添加 Issue 评论 |

### Pull Request 操作
| 工具名称 | 功能 |
|---------|------|
| mcp_GitHub_create_pull_request | 创建 PR |
| mcp_GitHub_get_pull_request | 获取 PR 详情 |
| mcp_GitHub_list_pull_requests | 列出 PRs |
| mcp_GitHub_get_pull_request_files | 获取 PR 变更文件 |
| mcp_GitHub_get_pull_request_status | 获取 PR 状态检查 |
| mcp_GitHub_get_pull_request_comments | 获取 PR 评论 |
| mcp_GitHub_get_pull_request_reviews | 获取 PR 审查 |
| mcp_GitHub_create_pull_request_review | 创建 PR 审查 |
| mcp_GitHub_merge_pull_request | 合并 PR |
| mcp_GitHub_update_pull_request_branch | 更新 PR 分支 |

### 搜索操作
| 工具名称 | 功能 |
|---------|------|
| mcp_GitHub_search_code | 搜索代码 |
| mcp_GitHub_search_issues | 搜索 Issues/PRs |
| mcp_GitHub_search_users | 搜索用户 |

---

## 八、Figma 集成工具

### 20. mcp_Figma_get_figma_data
**功能**: 获取 Figma 设计数据
- 获取完整的 Figma 文件数据
- 包含布局、内容、视觉和组件信息
- 支持指定节点深度
- 支持按节点 ID 获取

### 21. mcp_Figma_download_figma_images
**功能**: 下载 Figma 图片
- 下载 SVG 和 PNG 图片
- 支持批量下载
- 支持图片裁剪
- 支持自定义 PNG 缩放比例

---

## 工具使用优先级建议

| 场景 | 推荐工具 |
|------|---------|
| 查找特定文件 | Glob |
| 搜索代码内容 | Grep |
| 语义化搜索代码 | SearchCodebase |
| 读取已知文件 | Read |
| 编辑现有文件 | SearchReplace |
| 创建新文件 | Write |
| 执行命令 | RunCommand |
| 向用户提问 | AskUserQuestion |
| 管理任务进度 | TodoWrite |
| 复杂搜索任务 | Task (search 代理) |

---

*文档生成时间: 2026-03-07*
