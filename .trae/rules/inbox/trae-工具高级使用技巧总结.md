# Trae 工具高级使用技巧总结
> Tags: Trae,工具,技巧,效率,最佳实践
> Created: 2026-03-09

# Trae 工具高级使用技巧总结

## 核心要点

### 1. 代码搜索与探索
- **SearchCodebase**: 语义化搜索，使用具体功能描述而非简单关键词（如 "用户登录认证逻辑" 而非 "login"）
- **Grep**: 精确正则匹配，结合 `-A/-B/-C` 获取上下文，用 `glob` 搜索多文件类型
- **Glob**: 递归搜索用 `**`，多模式用 `{}`，如 `src/**/*.{ts,vue}`

### 2. 文件操作
- **Read**: 大文件用 `offset` + `limit` 分块读取
- **Write**: 模板化写入，先 Read 再 Write 确保基于最新版本
- **Edit**: 精确匹配上下文，避免误改；用 `replace_all` 进行全局替换

### 3. 命令执行
- **RunCommand**: 
  - 阻塞模式 (`blocking: true`) 用于短命令
  - 非阻塞模式 (`blocking: false`) 用于服务器启动
- **CheckCommandStatus**: 监控长时间运行命令，用 `filter` 过滤输出

### 4. 任务管理
- **TodoWrite**: 复杂任务分解为子任务，及时更新状态
- **Skill**: 技能组合使用，如 `coder` + `webapp-testing`

### 5. 工具组合策略
- **搜索 → 分析 → 执行**: SearchCodebase → Read → Edit
- **诊断 → 修复 → 验证**: GetDiagnostics → Edit → RunCommand
- **并行操作**: 同时执行不相关的工具调用

## 最佳实践流程

### 代码重构
1. SearchCodebase 了解结构
2. TodoWrite 规划步骤
3. Edit 修改代码
4. RunCommand 运行测试
5. GetDiagnostics 检查质量
6. knowledge-gardener 记录经验

### Bug 修复
1. Grep 定位代码
2. Read 分析逻辑
3. Edit 修复问题
4. RunCommand 验证
5. webapp-testing 测试
6. knowledge-gardener 记录

### 功能开发
1. TodoWrite 规划任务
2. Write 创建新文件
3. Edit 实现功能
4. RunCommand 构建项目
5. GetDiagnostics 检查代码
6. webapp-testing 测试功能

## 注意事项
- 并行执行不相关的工具调用提升效率
- 缓存搜索结果和常用命令
- 建立完善的错误处理机制
- Edit 前先 Read 确保基于最新版本

## 来源
- 文档: `.trae/documents/Trae工具高级使用技巧.md`
- 日期: 2026-03-09
