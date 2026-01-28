# 发布脚本：将docs目录发布到gh-pages分支
# 功能：关闭Node进程、检查并提交Git变更、发布docs到gh-pages

# 设置编码
$OutputEncoding = [System.Text.Encoding]::UTF8

Write-Host "=== 发布到 gh-pages 分支脚本 ==="

# 1. 检查并关闭Node进程
Write-Host "\n1. 检查Node进程..."
try {
    $nodeProcesses = Get-Process -Name "node" -ErrorAction SilentlyContinue
    if ($nodeProcesses) {
        $processCount = $nodeProcesses.Count
        Write-Host "发现 $processCount 个Node进程，正在关闭..."
        foreach ($process in $nodeProcesses) {
            $process | Stop-Process -Force -ErrorAction SilentlyContinue
        }
        Write-Host "成功关闭所有Node进程"
    } else {
        Write-Host "未发现Node进程"
    }
} catch {
    Write-Host "关闭Node进程时出错: $($_.Exception.Message)"
}

# 2. 检查Git状态并提交变更
Write-Host "\n2. 检查Git状态..."
try {
    # 检查是否在Git仓库中
    $gitStatus = git status --short 2>$null
    if (-not $gitStatus) {
        Write-Host "没有需要提交的变更"
    } else {
        Write-Host "发现未提交的变更，正在调用提交脚本..."
        # 调用现有的git-push.ps1脚本
        $gitPushScriptPath = Join-Path -Path $PSScriptRoot -ChildPath "git-push.ps1"
        if (Test-Path $gitPushScriptPath) {
            & $gitPushScriptPath
            if ($LASTEXITCODE -eq 0) {
                Write-Host "成功提交变更"
            } else {
                Write-Host "提交变更失败，脚本将继续执行发布操作"
            }
        } else {
            Write-Host "未找到git-push.ps1脚本，跳过提交步骤"
        }
    }
} catch {
    Write-Host "检查Git状态时出错: $($_.Exception.Message)"
    Write-Host "脚本将继续执行发布操作"
}

# 3. 发布docs目录到gh-pages分支
Write-Host "\n3. 发布docs目录到gh-pages分支..."
try {
    # 检查docs目录是否存在
    $docsPath = Join-Path -Path $PSScriptRoot -ChildPath "docs"
    if (-not (Test-Path $docsPath)) {
        Write-Host "错误: docs目录不存在"
        exit 1
    }
    
    # 使用git subtree split将docs目录分离为独立提交
    Write-Host "正在分离docs目录..."
    $splitHash = git subtree split --prefix docs main 2>&1
    if ($LASTEXITCODE -ne 0) {
        Write-Host "分离docs目录失败: $splitHash"
        exit 1
    }
    
    # 去除可能的错误信息，只保留哈希值
    $splitHash = $splitHash | Where-Object { $_ -match '^[0-9a-f]{40}$' }
    if (-not $splitHash) {
        Write-Host "无法获取分离后的提交哈希值"
        exit 1
    }
    
    Write-Host "成功分离docs目录，提交哈希: $splitHash"
    
    # 推送分离后的提交到gh-pages分支
    Write-Host "正在推送到gh-pages分支..."
    $pushResult = git push origin ${splitHash}:refs/heads/gh-pages --force 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "成功: docs目录已发布到gh-pages分支"
    } else {
        Write-Host "推送失败: $pushResult"
        exit 1
    }
} catch {
    Write-Host "发布到gh-pages分支时出错: $($_.Exception.Message)"
    exit 1
}

Write-Host "\n=== 发布完成 ==="
Write-Host "docs目录已成功发布到gh-pages分支"