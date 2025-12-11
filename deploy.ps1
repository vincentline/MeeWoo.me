# One-click deploy static docs from main to gh-pages (no auto build / preview)

$ErrorActionPreference = 'Stop'

function Pause-And-Exit($msg) {
  Write-Host ""
  Write-Host $msg -ForegroundColor Yellow
  Read-Host "Press Enter to exit..."
  exit 1
}

# 0. Build & Preview hints (manual only)
Write-Host "== Build & Preview (manual) =="
Write-Host "Build on main branch:"
Write-Host "  npm run build"
Write-Host ""
Write-Host "Dev preview (optional):"
Write-Host "  powershell -ExecutionPolicy Bypass -File .\run-dev.ps1"
Write-Host "  or: npm run dev"
Write-Host ""
Write-Host "This script deploys docs/ from main to gh-pages."
Write-Host ""

# 1. Check current branch
Write-Host "== Step 1: Check current git branch =="

$branch = (git rev-parse --abbrev-ref HEAD 2>$null).Trim()
if (-not $branch) {
  Pause-And-Exit "[ERROR] Not a git repository or git not available."
}

Write-Host "Current branch: $branch"
if ($branch -ne "main") {
  Pause-And-Exit "[ERROR] Please switch to 'main' branch and run this script again."
}

# 2. Check docs/ exists
Write-Host "`n== Step 2: Check docs/ exists on main =="
if (-not (Test-Path ".\docs")) {
  Pause-And-Exit "[ERROR] 'docs' directory not found. Please run 'npm run build' on main first."
}

# 3. Check working tree
Write-Host "`n== Step 3: Check working tree on 'main' =="
$statusLines = git status --porcelain

if ($statusLines) {
  $nonDocs = @()
  foreach ($line in $statusLines) {
    if ($line -notmatch 'docs/') {
      $nonDocs += $line
    }
  }
  if ($nonDocs.Count -gt 0) {
    Write-Host "git status --porcelain output:" -ForegroundColor Yellow
    $statusLines | ForEach-Object { Write-Host "  $_" }
    Pause-And-Exit "[ERROR] 'main' branch has uncommitted changes outside 'docs/'. Please commit or discard them first."
  }
}

Write-Host "[OK] Only docs/ changes (or clean). Continue."

# 4. Copy docs/ to temp folder
Write-Host "`n== Step 4: Copy docs/ from main to temp folder =="

$tempDir  = Join-Path $env:TEMP "vuepress_deploy_docs"
$tempDocs = Join-Path $tempDir "docs"

if (Test-Path $tempDir) {
  Remove-Item $tempDir -Recurse -Force
}
New-Item -ItemType Directory -Path $tempDocs | Out-Null

Write-Host "Copying .\docs\* -> $tempDocs"
Copy-Item ".\docs\*" $tempDocs -Recurse -Force

# 5. Switch to gh-pages
Write-Host "`n== Step 5: Switch to gh-pages branch =="

$currentBranch = $branch

try {
  git checkout gh-pages
} catch {
  if (Test-Path $tempDir) {
    Remove-Item $tempDir -Recurse -Force
  }
  Pause-And-Exit "[ERROR] Failed to switch to 'gh-pages' branch."
}

# 6. Clean gh-pages working tree
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

# 7. Copy docs/* to gh-pages root
Write-Host "`n== Step 7: Copy docs/* into gh-pages root =="

if (-not (Test-Path $tempDocs)) {
  if (Test-Path $tempDir) {
    Remove-Item $tempDir -Recurse -Force
  }
  Pause-And-Exit "[ERROR] Temp docs directory not found."
}

Copy-Item (Join-Path $tempDocs "*") . -Recurse -Force

# 8. Commit and push gh-pages
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
  Write-Host "[ERROR] git push origin gh-pages failed. Please check your network." -ForegroundColor Yellow
  Write-Host "You can manually run: git push origin gh-pages" -ForegroundColor Yellow
}

# 9. Switch back to main
Write-Host "`n== Step 9: Switch back to '$currentBranch' branch =="

git checkout $currentBranch | Out-Null

if (Test-Path $tempDir) {
  Remove-Item $tempDir -Recurse -Force
}

Write-Host "`n== Done =="
Write-Host "Deployed docs/ to 'gh-pages' and switched back to '$currentBranch'."
Read-Host "Press Enter to exit..."
