# GET_TIME.ps1 - 获取准确北京时间的PowerShell脚本
# 功能：获取北京标准时间，输出格式为 [YYYY-MM-DD HH:MM:SS]
# 作者：AI-HLP
# 日期：2026-01-26

# 方法1：使用WorldTimeAPI获取北京时间（优先方法）
try {
    Write-Host "正在从WorldTimeAPI获取北京时间..."
    $response = Invoke-RestMethod -Uri "https://worldtimeapi.org/api/timezone/Asia/Shanghai" -TimeoutSec 10
    $datetime = $response.datetime
    
    # 格式化时间字符串为 [YYYY-MM-DD HH:MM:SS]
    $formattedTime = [datetime]::Parse($datetime).ToString("[yyyy-MM-dd HH:mm:ss]")
    
    Write-Host "成功获取北京时间：$formattedTime"
    Write-Output $formattedTime
    exit 0
} catch {
    Write-Host "警告：WorldTimeAPI获取失败，使用本地时间作为备选..."
    Write-Host "错误信息：$($_.Exception.Message)"
}

# 方法2：使用本地时间（备选方法）
try {
    # 获取本地时间并转换为北京时间（UTC+8）
    $localTime = Get-Date
    $beijingTime = $localTime.ToUniversalTime().AddHours(8)
    $formattedTime = $beijingTime.ToString("[yyyy-MM-dd HH:mm:ss]")
    
    Write-Host "使用本地时间转换：$formattedTime"
    Write-Output $formattedTime
    exit 0
} catch {
    Write-Host "错误：无法获取时间"
    Write-Host "错误信息：$($_.Exception.Message)"
    exit 1
}
