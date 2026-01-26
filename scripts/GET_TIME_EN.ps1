# GET_TIME_EN.ps1 - Get accurate Beijing time
# Function: Get Beijing standard time, format: [YYYY-MM-DD HH:MM:SS]
# Author: AI-HLP
# Date: 2026-01-26

# Method 1: Get Beijing time from WorldTimeAPI (priority method)
try {
    Write-Host "Getting Beijing time from WorldTimeAPI..."
    $response = Invoke-RestMethod -Uri "https://worldtimeapi.org/api/timezone/Asia/Shanghai" -TimeoutSec 10
    $datetime = $response.datetime
    
    # Format time string to [YYYY-MM-DD HH:MM:SS]
    $formattedTime = [datetime]::Parse($datetime).ToString("[yyyy-MM-dd HH:mm:ss]")
    
    Write-Host "Successfully got Beijing time: $formattedTime"
    Write-Output $formattedTime
    exit 0
} catch {
    Write-Host "Warning: Failed to get from WorldTimeAPI, using local time as backup..."
    Write-Host "Error message: $($_.Exception.Message)"
}

# Method 2: Use local time (backup method)
try {
    # Get local time and convert to Beijing time (UTC+8)
    $localTime = Get-Date
    $beijingTime = $localTime.ToUniversalTime().AddHours(8)
    $formattedTime = $beijingTime.ToString("[yyyy-MM-dd HH:mm:ss]")
    
    Write-Host "Using local time conversion: $formattedTime"
    Write-Output $formattedTime
    exit 0
} catch {
    Write-Host "Error: Failed to get time"
    Write-Host "Error message: $($_.Exception.Message)"
    exit 1
}