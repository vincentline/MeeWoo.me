# Simple Git Push Script
# Usage: PowerShell.exe -ExecutionPolicy Bypass -File git-push.ps1

Write-Host "=== Git Push Script ===" -ForegroundColor Cyan

# Get current branch
$currentBranch = git rev-parse --abbrev-ref HEAD 2>$null
if (-not $currentBranch) {
    Write-Host "Error: Not in a git repository" -ForegroundColor Red
    exit 1
}
Write-Host "Current branch: $currentBranch" -ForegroundColor Green

# Check for changes
$status = git status --short 2>$null
if (-not $status) {
    Write-Host "No changes to commit" -ForegroundColor Green
    exit 0
}

Write-Host "Changes found:" -ForegroundColor Green
git status --short

# Add all changes
git add -A 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "Failed to add changes" -ForegroundColor Red
    exit 1
}

# Commit changes
$commitMsg = "Auto update: $(Get-Date -Format 'yyyy-MM-dd HH:mm')"
git commit -m $commitMsg 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "Failed to commit changes" -ForegroundColor Red
    exit 1
}

# Pull changes first
git pull --no-rebase origin main 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "Warning: Failed to pull, trying to push anyway..." -ForegroundColor Yellow
}

# Push changes
git push origin main 2>$null
if ($LASTEXITCODE -eq 0) {
    Write-Host "`nSuccess: Changes pushed to GitHub" -ForegroundColor Green
} else {
    Write-Host "`nFailed to push changes" -ForegroundColor Red
    exit 1
}

Write-Host "=== Done ===" -ForegroundColor Cyan