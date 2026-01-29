#!/usr/bin/env powershell
# 发布脚本：将 docs 目录部署到 gh-pages 分支
# 功能：关闭 Node 进程，检查并提交 Git 更改，将 docs 发布到 gh-pages 分支
# 注意：此脚本必须使用 UTF-8 with BOM 编码保存，否则中文会显示为乱码

# 设置编码为 UTF-8
$OutputEncoding = [System.Text.Encoding]::UTF8
[Console]::OutputEncoding = [System.Text.UTF8Encoding]::new()
[System.Console]::InputEncoding = [System.Text.UTF8Encoding]::new()

Write-Host "=== 发布到 gh-pages 分支脚本 ==="

# 1. 检查并关闭 Node 进程
Write-Host "\n1. 检查 Node 进程..."
try {
    $nodeProcesses = Get-Process -Name "node" -ErrorAction SilentlyContinue
    if ($nodeProcesses) {
        $processCount = $nodeProcesses.Count
        Write-Host "发现 $processCount 个 Node 进程，正在关闭..."
        foreach ($process in $nodeProcesses) {
            $process | Stop-Process -Force -ErrorAction SilentlyContinue
        }
        Write-Host "成功关闭所有 Node 进程"
    } else {
        Write-Host "未发现 Node 进程"
    }
} catch {
    Write-Host "错误：关闭 Node 进程失败：$($_.Exception.Message)"
    exit 1
}

# 2. 检查 Git 状态并提交更改
Write-Host "\n2. 检查 Git 状态..."
try {
    # 检查是否在 Git 仓库中
    $gitStatus = git status --short 2>$null
    if (-not $gitStatus) {
        Write-Host "没有需要提交的更改"
    } else {
        Write-Host "发现未提交的更改，正在调用提交脚本..."
        # 调用现有的 git-push.ps1 脚本
        $gitPushScriptPath = Join-Path -Path $PSScriptRoot -ChildPath "git-push.ps1"
        if (Test-Path $gitPushScriptPath) {
            & $gitPushScriptPath
            if ($LASTEXITCODE -ne 0) {
                Write-Host "错误：提交更改失败"
                exit 1
            }
            Write-Host "成功提交更改"
        } else {
            Write-Host "错误：未找到 git-push.ps1 脚本"
            exit 1
        }
    }
} catch {
    Write-Host "错误：检查 Git 状态失败：$($_.Exception.Message)"
    exit 1
}

# 3. 将 docs 目录发布到 gh-pages 分支
Write-Host "\n3. 正在将 docs 目录发布到 gh-pages 分支..."
try {
    # 检查 docs 目录是否存在
    $docsPath = Join-Path -Path $PSScriptRoot -ChildPath "docs"
    if (-not (Test-Path $docsPath)) {
        Write-Host "错误：docs 目录不存在"
        exit 1
    }
    
    # 保存当前分支
    $currentBranch = git rev-parse --abbrev-ref HEAD
    Write-Host "[进度] 当前分支: $currentBranch"
    
    # 创建临时目录
    $tempDir = Join-Path -Path $env:TEMP -ChildPath "gh-pages-deploy-$(Get-Random)"
    New-Item -ItemType Directory -Path $tempDir -Force | Out-Null
    Write-Host "[进度] 创建临时目录: $tempDir"
    
    # 克隆仓库到临时目录
    Write-Host "[进度] 克隆仓库到临时目录..."
    git clone "file://$PSScriptRoot" "$tempDir"
    if ($LASTEXITCODE -ne 0) {
        Write-Host "错误：克隆仓库失败"
        Remove-Item $tempDir -Recurse -Force
        exit 1
    }
    
    # 切换到临时目录
    cd $tempDir
    
    # 切换到 gh-pages 分支
    Write-Host "[进度] 切换到 gh-pages 分支..."
    $ghPagesExists = git show-ref --verify --quiet refs/heads/gh-pages
    if ($LASTEXITCODE -ne 0) {
        # 如果 gh-pages 分支不存在，创建一个新的
        Write-Host "[进度] gh-pages 分支不存在，创建新分支..."
        git checkout --orphan gh-pages
        git reset --hard
        git commit --allow-empty -m "Initial commit for gh-pages"
    } else {
        # 如果 gh-pages 分支存在，切换到该分支
        git checkout gh-pages
    }
    
    # 清空 gh-pages 分支的内容
    Write-Host "[进度] 清空 gh-pages 分支的内容..."
    $filesToKeep = @(".git", ".gitignore", "CNAME", "_headers", "vercel.json")
    $allFiles = Get-ChildItem -Force | Where-Object { $_.Name -notin $filesToKeep }
    $totalFiles = $allFiles.Count
    $currentFile = 0
    foreach ($file in $allFiles) {
        $currentFile++
        Write-Host "[进度] 删除文件 " $currentFile "/" $totalFiles ": " $file.Name
        Remove-Item $file.FullName -Recurse -Force
    }
    
    # 复制 main 分支的 docs 目录内容到 gh-pages 分支
    Write-Host "[进度] 复制 docs 目录内容到 gh-pages 分支..."
    $mainDocsPath = Join-Path -Path $PSScriptRoot -ChildPath "docs"
    $docsFiles = Get-ChildItem -Path $mainDocsPath -Recurse
    $totalDocsFiles = $docsFiles.Count
    $currentDocsFile = 0
    foreach ($file in $docsFiles) {
        $currentDocsFile++
        $relativePath = $file.FullName.Substring($mainDocsPath.Length + 1)
        $targetPath = Join-Path -Path $tempDir -ChildPath $relativePath
        $targetDir = Split-Path -Path $targetPath -Parent
        if (-not (Test-Path $targetDir)) {
            New-Item -ItemType Directory -Path $targetDir -Force | Out-Null
        }
        Copy-Item -Path $file.FullName -Destination $targetPath -Force
        Write-Host "[进度] 复制文件 " $currentDocsFile "/" $totalDocsFiles ": " $relativePath
    }
    
    # 添加所有文件并提交
    Write-Host "[进度] 添加所有文件并提交..."
    git add .
    $commitMsg = "Deploy docs to gh-pages: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
    git commit -m $commitMsg
    if ($LASTEXITCODE -ne 0) {
        Write-Host "警告：没有需要提交的更改"
    }
    
    # 推送到 gh-pages 分支
    Write-Host "[进度] 推送到 gh-pages 分支..."
    git push origin gh-pages
    if ($LASTEXITCODE -ne 0) {
        Write-Host "错误：推送失败"
        Remove-Item $tempDir -Recurse -Force
        exit 1
    }
    
    # 清理临时目录
    cd $PSScriptRoot
    Remove-Item $tempDir -Recurse -Force
    Write-Host "[进度] 清理临时目录"
    
    # 切换回原分支
    git checkout $currentBranch
    
    Write-Host "成功：docs 目录已发布到 gh-pages 分支"
} catch {
    Write-Host "错误：发布到 gh-pages 分支失败：$($_.Exception.Message)"
    exit 1
}

Write-Host "\n=== 发布完成 ==="
Write-Host "docs 目录已成功发布到 gh-pages 分支"
