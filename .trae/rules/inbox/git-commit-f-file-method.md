# git-commit-F-file-method
> Tags: git,trae-sandbox,commit
> Created: 2026-03-07

## 问题
trae-sandbox 终端环境对多行/中文命令行参数解析有限制，使用 `git commit -m` 会导致参数被错误拆分。

## 解决方案
使用 `-F` 文件方式传递 commit message：
```bash
# 1. 写入临时文件
echo "commit message" > .git/COMMIT_EDITMSG_TEMP

# 2. 使用文件提交
git commit -F .git/COMMIT_EDITMSG_TEMP

# 3. 清理临时文件
rm .git/COMMIT_EDITMSG_TEMP
```

## 适用场景
- 多行 commit message
- 包含中文的 commit message
- 任何被 trae-sandbox 错误解析的参数
