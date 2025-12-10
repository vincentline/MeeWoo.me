# One-click deploy static docs from main to gh-pages (no auto build / preview)

$ErrorActionPreference = 'Stop'

function Pause-And-Exit($msg) {
  Write-Host ""
  Write-Host $msg -ForegroundColor Yellow
  Read-Host "Press Enter to exit..."
  exit 1
}

# 0. 提示构建 & 预览命令（仅提示，不自动执行）
Write-Host "== Build & Preview (manual) =="
Write-Host "在 main 分支上构建静态文件："
Write-Host "  npm run build"
Write-Host ""
Write-Host "开发预览（可选，用于调试）："
Write-Host "  powershell -ExecutionPolicy Bypass -File .\run-dev.ps1"
Write-Host "  或：npm run dev"
Write-Host ""
Write-Host "本脚本只负责：把当前 main 分支工作区中的 .\docs 内容发布到 gh-pages。"
Write-Host ""

# 1. 确认当前在 main 分支
Write-Host "== Step 1: Check current git branch =="

$branch = (git rev-parse --abbrev-ref HEAD 2>$null).Trim()
if (-not $branch) {
  Pause-And-Exit "[ERROR] Not a git repository or git not available."
}

Write-Host "Current branch: $branch"
if ($branch -ne "main") {
  Pause-And-Exit "[ERROR] Please switch to 'main' branch in Qoder and run this script again."
}

# 2. 检查 docs/ 是否存在（要求你已经在 main 上执行过 npm run build）
Write-Host "`n== Step 2: Check docs/ exists on main (after manual build) =="
if (-not (Test-Path ".\docs")) {
  Pause-And-Exit "[ERROR] 'docs' directory not found. Please run 'npm run build' on main first."
}

# 3. 检查 main 上是否有非 docs/ 的未提交改动（避免奇怪冲突）
Write-Host "`n== Step 3: Check working tree on 'main' (only docs/ changes allowed) =="
$statusLines = git status --porcelain

if ($statusLines) {
  # 允许的行：路径在 docs/ 下
  $nonDocs = $statusLines | Where-Object { $_ -notmatch '^[MADRCU\?\!]{1,2}\s+docs/' }
  if ($nonDocs) {
    Write-Host "git status --porcelain 输出如下：" -ForegroundColor Yellow
    $statusLines | ForEach-Object { Write-Host "  $_" }
    Pause-And-Exit "[ERROR] 'main' branch has uncommitted changes outside 'docs/'. Please commit or discard them first, then rerun this script."
  }
}

Write-Host "[OK] Only docs/ changes (or clean). Continue."

# 4. 将当前 main 工作区的 docs/ 拷贝到临时目录
Write-Host "`n== Step 4: Copy docs/ from main working tree to temp folder =="

$tempDir  = Join-Path $env:TEMP "vuepress_deploy_docs"
$tempDocs = Join-Path $tempDir "docs"

if (Test-Path $tempDir) {
  Remove-Item $tempDir -Recurse -Force
}
New-Item -ItemType Directory -Path $tempDocs | Out-Null

Write-Host "Copying .\docs\* -> $tempDocs"
Copy-Item ".\docs\*" $tempDocs -Recurse -Force

# 5. 切到 gh-pages 分支
Write-Host "`n== Step 5: Switch to gh-pages branch =="

$currentBranch = $branch

try {
  git checkout gh-pages
} catch {
  if (Test-Path $tempDir) {
    Remove-Item $tempDir -Recurse -Force
  }
  Pause-And-Exit "[ERROR] Failed to switch to 'gh-pages' branch. Make sure it exists locally."
}

# 6. 清空当前目录（保留 .git、CNAME、LICENSE、README.md）
Write-Host "`n== Step 6: Clean gh-pages working tree (keep .git / CNAME / LICENSE / README.md) =="

Get-ChildItem -Path . -Force |
  Where-Object { $_.Name -notin @(".git", "CNAME", "LICENSE", "README.md") } |
  ForEach-Object {
    if ($_.PSIsContainer) {
      Remove-Item $_.FullName -Recurse -Force
    } else {
      Remove-Item $_.FullName -Force
    }
  }

# 7. 将临时目录中的 docs/* 拷贝到 gh-pages 根目录
Write-Host "`n== Step 7: Copy docs/* into gh-pages root =="

if (-not (Test-Path $tempDocs)) {
  if (Test-Path $tempDir) {
    Remove-Item $tempDir -Recurse -Force
  }
  Pause-And-Exit "[ERROR] Temp docs directory not found. Please rerun build and then this script."
}

Copy-Item (Join-Path $tempDocs "*") . -Recurse -Force

# 8. 提交并推送 gh-pages
Write-Host "`n== Step 8: Commit and push on gh-pages =="

git add .

try {
  git commit -m "chore: update site from main docs"
} catch {
  Write-Host "[INFO] No changes to commit on gh-pages."
}

try {
  git push origin gh-pages
} catch {
  Write-Host ""
  Write-Host "[ERROR] git push origin gh-pages failed. Please check your network or credentials." -ForegroundColor Yellow
  Write-Host "你可以稍后手动在 gh-pages 分支运行：git push origin gh-pages" -ForegroundColor Yellow
}

# 9. 切回 main 分支 & 清理临时目录
Write-Host "`n== Step 9: Switch back to '$currentBranch' branch =="

git checkout $currentBranch | Out-Null

if (Test-Path $tempDir) {
  Remove-Item $tempDir -Recurse -Force
}

Write-Host "`n== Done =="
Write-Host "Deployed current main working-tree docs/ to 'gh-pages' and switched back to '$currentBranch'."
Read-Host "Press Enter to exit..."