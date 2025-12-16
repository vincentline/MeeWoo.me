# Git修复脚本
$ErrorActionPreference = 'Stop'
Set-Location "f:\百度云同步盘\BaiduSyncdisk\04生活\小工具\svga.preview.git\svga.preview"

Write-Host "1. 检查状态..." -ForegroundColor Yellow
git status

Write-Host "`n2. 拉取远程更改（merge策略）..." -ForegroundColor Yellow
git pull --no-rebase origin main

Write-Host "`n3. 推送到远程..." -ForegroundColor Yellow
git push origin main

Write-Host "`n完成！" -ForegroundColor Green
