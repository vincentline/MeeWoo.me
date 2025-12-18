# 更新大R头像框SVGA列表
# 扫描 docs/assets/dar_svga 目录下的 .svga 文件，更新 file-list.json

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$svgaDir = Join-Path $scriptDir "docs\assets\dar_svga"
$jsonFile = Join-Path $svgaDir "file-list.json"

Write-Host "扫描目录: $svgaDir" -ForegroundColor Cyan

# 获取所有 .svga 文件
$svgaFiles = Get-ChildItem -Path $svgaDir -Filter "*.svga" | Select-Object -ExpandProperty Name | Sort-Object

if ($svgaFiles.Count -eq 0) {
    Write-Host "未找到任何 .svga 文件" -ForegroundColor Yellow
    $svgaFiles = @()
}

# 转换为JSON数组
$jsonContent = $svgaFiles | ConvertTo-Json

# 处理空数组或单个文件的情况
if ($svgaFiles.Count -eq 0) {
    $jsonContent = "[]"
} elseif ($svgaFiles.Count -eq 1) {
    $jsonContent = "[$jsonContent]"
}

# 写入文件
$jsonContent | Out-File -FilePath $jsonFile -Encoding UTF8

Write-Host "已更新 file-list.json，共 $($svgaFiles.Count) 个文件：" -ForegroundColor Green
$svgaFiles | ForEach-Object { Write-Host "  - $_" -ForegroundColor Gray }

Write-Host ""
Write-Host "提示：每个 .svga 文件需要对应一个同名的 .png 图标文件" -ForegroundColor Yellow
Write-Host "例如：D01.svga 需要 D01.png" -ForegroundColor Yellow
