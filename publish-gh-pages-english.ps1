#!/usr/bin/env powershell
# Publish script: Deploy docs directory to gh-pages branch
# Features: Close Node processes, check and commit Git changes, publish docs to gh-pages
# Note: This script must be saved in UTF-8 with BOM encoding

# Set encoding to UTF-8
$OutputEncoding = [System.Text.Encoding]::UTF8
[Console]::OutputEncoding = [System.Text.UTF8Encoding]::new()
[System.Console]::InputEncoding = [System.Text.UTF8Encoding]::new()

Write-Host "=== Publish to gh-pages Branch Script ==="

# 1. Check and close Node processes
Write-Host "\n1. Checking Node processes..."
try {
    $nodeProcesses = Get-Process -Name "node" -ErrorAction SilentlyContinue
    if ($nodeProcesses) {
        $processCount = $nodeProcesses.Count
        Write-Host "Found $processCount Node processes, closing..."
        foreach ($process in $nodeProcesses) {
            $process | Stop-Process -Force -ErrorAction SilentlyContinue
        }
        Write-Host "Successfully closed all Node processes"
    } else {
        Write-Host "No Node processes found"
    }
} catch {
    Write-Host "Error: Failed to close Node processes: $($_.Exception.Message)"
    exit 1
}

# 2. Check Git status and commit changes
Write-Host "\n2. Checking Git status..."
try {
    # Check if in Git repository
    $gitStatus = git status --short 2>$null
    if (-not $gitStatus) {
        Write-Host "No changes to commit"
    } else {
        Write-Host "Found uncommitted changes, calling commit script..."
        # Call existing git-push.ps1 script
        $gitPushScriptPath = Join-Path -Path $PSScriptRoot -ChildPath "git-push.ps1"
        if (Test-Path $gitPushScriptPath) {
            & $gitPushScriptPath
            if ($LASTEXITCODE -ne 0) {
                Write-Host "Error: Failed to commit changes"
                exit 1
            }
            Write-Host "Successfully committed changes"
        } else {
            Write-Host "Error: git-push.ps1 script not found"
            exit 1
        }
    }
} catch {
    Write-Host "Error: Failed to check Git status: $($_.Exception.Message)"
    exit 1
}

# 3. Publish docs directory to gh-pages branch (using regular commit sync method)
Write-Host "\n3. Publishing docs directory to gh-pages branch..."
try {
    # Check if docs directory exists
    $docsPath = Join-Path -Path $PSScriptRoot -ChildPath "docs"
    if (-not (Test-Path $docsPath)) {
        Write-Host "Error: docs directory does not exist"
        exit 1
    }
    
    # Save current branch
    $currentBranch = git rev-parse --abbrev-ref HEAD
    Write-Host "[Progress] Current branch: $currentBranch"
    
    # Create temporary directory
    $tempDir = Join-Path -Path $env:TEMP -ChildPath "gh-pages-deploy-$(Get-Random)"
    New-Item -ItemType Directory -Path $tempDir -Force | Out-Null
    Write-Host "[Progress] Created temporary directory: $tempDir"
    
    # Clone repository to temporary directory
    Write-Host "[Progress] Cloning repository to temporary directory..."
    git clone "file://