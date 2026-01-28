# 发布脚本编写计划

## 脚本功能
1. **Node进程检查与关闭**：检查并关闭所有运行中的Node.js进程
2. **Git状态检查与提交**：如有未提交变更，调用现有的`git-push.ps1`脚本提交
3. **发布到gh-pages分支**：使用`git subtree split`命令将docs目录内容发布到gh-pages分支

## 技术实现
1. **编码处理**：
   - 设置PowerShell输出/输入编码为UTF-8
   - 设置Git编码为UTF-8，确保中文环境下无乱码

2. **Node进程管理**：
   - 使用`Get-Process`检查node进程
   - 使用`Stop-Process`关闭进程，添加错误处理

3. **Git操作**：
   - 检查未提交变更：`git status --short`
   - 调用现有提交脚本：`& "git-push.ps1"`
   - 发布到gh-pages：使用`git subtree split`和`git push`命令

4. **错误处理与日志**：
   - 添加彩色日志输出（成功/警告/错误）
   - 对关键命令添加错误捕获
   - 执行完成后输出总结报告

## 文件结构
- 新建脚本文件：`publish-gh-pages.ps1`
- 位置：项目根目录（与`git-push.ps1`同级）

## 执行流程
1. 初始化编码设置
2. 关闭Node进程
3. 检查并提交Git变更
4. 发布docs目录到gh-pages分支
5. 输出执行结果总结