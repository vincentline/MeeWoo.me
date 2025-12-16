# Git 安全推送脚本 - 自动避免分叉
# 使用方法：右键选择"使用PowerShell运行"或在终端运行：PowerShell.exe -ExecutionPolicy Bypass -File git-push.ps1

$ErrorActionPreference = 'Stop'
# 自动定位到脚本所在目录
Set-Location $PSScriptRoot

Write-Host "==== Git 安全推送 ====" -ForegroundColor Cyan

# 1. 检查是否有修改
Write-Host "`n1. 检查本地修改..." -ForegroundColor Yellow
$status = git status --short
if ([string]::IsNullOrWhiteSpace($status)) {
    Write-Host "没有需要提交的修改" -ForegroundColor Green
    exit 0
}

Write-Host "发现以下修改：" -ForegroundColor Green
git status --short

# 2. 添加所有修改
Write-Host "`n2. 添加所有修改..." -ForegroundColor Yellow
git add -A

# 3. 提交（如果需要）
$commitMsg = Read-Host "`n请输入提交信息（直接回车使用默认信息）"
if ([string]::IsNullOrWhiteSpace($commitMsg)) {
    $commitMsg = "更新: $(Get-Date -Format 'yyyy-MM-dd HH:mm')"
}

Write-Host "提交信息: $commitMsg" -ForegroundColor Green
git commit -m $commitMsg

# 4. 先拉取远程更改（关键步骤！避免分叉）
Write-Host "`n3. 拉取远程更改（避免分叉）..." -ForegroundColor Yellow
git pull --no-rebase origin main

# 5. 推送
Write-Host "`n4. 推送到远程..." -ForegroundColor Yellow
git push origin main

Write-Host "`n==== 完成！ ====" -ForegroundColor Green
Write-Host "代码已安全推送到GitHub" -ForegroundColor Green
