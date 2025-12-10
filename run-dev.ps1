NEW_FILE_CODE
# 一键安装依赖并启动本项目的 VuePress 开发服务器
# One-click install & run for this project (ASCII only)

$ErrorActionPreference = 'SilentlyContinue'

# 第 0 步：检查当前目录是否已经存在依赖（node_modules）和本地 vuepress 命令
Write-Output "== Step 0: Check existing environment =="

$nodeModulesExists = Test-Path .\node_modules
$vuepressLocal = ".\node_modules\.bin\vuepress.cmd"
$vuepressLocalExists = Test-Path $vuepressLocal

if ($nodeModulesExists -and $vuepressLocalExists) {
  # 已经安装过依赖，且存在本地 vuepress，可直接跳过安装
  Write-Output "[OK] node_modules and local vuepress found. Skip reinstall."
} else {
  # 依赖或本地 vuepress 不存在，需要重新安装依赖
  Write-Output "[INFO] node_modules or vuepress not found. Will reinstall dependencies."

  # 清理旧的锁文件和 node_modules，避免脏环境导致安装异常
  Write-Output "== Step 0: Clean old lock & node_modules =="
  if (Test-Path .\package-lock.json) {
    Remove-Item .\package-lock.json -Force
    Write-Output "Removed package-lock.json"
  }
  if (Test-Path .\node_modules) {
    Remove-Item .\node_modules -Recurse -Force
    Write-Output "Removed node_modules"
  }

  # 第 1 步：安装依赖，优先使用 npx npm@10，兼容不同 npm 版本
  Write-Output "`n== Step 1: Install dependencies (try npx npm@10) =="
  $hasNpx = (Get-Command npx -ErrorAction SilentlyContinue) -ne $null
  if ($hasNpx) {
    Write-Output "Running: npx --yes npm@10 install"
    & npx --yes npm@10 install
  } else {
    # 没有 npx 时退回到本机 npm.cmd
    Write-Output "Running: npm.cmd install"
    & npm.cmd install
  }

  # 如果安装结束后仍然没有 node_modules，尝试切换到国内镜像重新安装
  if (-not (Test-Path .\node_modules)) {
    Write-Output "`n[WARN] node_modules not found. Trying registry mirror and reinstall..."
    & npm.cmd config set registry https://registry.npmmirror.com
    if ($hasNpx) {
      & npx --yes npm@10 install
    } else {
      & npm.cmd install
    }
  }

  # 重新计算本地 vuepress 路径，确保后面启动时能找到
  $vuepressLocalExists = Test-Path $vuepressLocal
}

# 第 2 步：启动开发服务器（按优先级选择启动方式）
Write-Output "`n== Step 2: Start dev server =="

$hasNpx = (Get-Command npx -ErrorAction SilentlyContinue) -ne $null

if ($vuepressLocalExists) {
  # 优先使用本地安装的 vuepress.cmd
  Write-Output "Running: $vuepressLocal dev ."
  & $vuepressLocal dev .
} elseif ($hasNpx) {
  # 如果没有本地命令，但有 npx，则通过 npx 临时运行指定版本 vuepress
  Write-Output "Running: npx vuepress@1.8.2 dev ."
  & npx vuepress@1.8.2 dev .
} else {
  # 最后兜底：走 package.json 中的 dev 脚本（npm.cmd run dev）
  Write-Output "Running: npm.cmd run dev"
  & npm.cmd run dev
}

# 结束提示：如果过程中失败，让你把终端输出贴给我分析
Write-Output "`nDone. If it fails, copy the output and send it to me."
Read-Host "Press Enter to exit..."