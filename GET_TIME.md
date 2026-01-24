# GET_TIME.md

## 1. 概述
本文档描述了获取准确北京时间的方法，生成格式 `[YYYY-MM-DD HH:MM:SS]` 的时间戳。

## 2. 推荐命令
### 2.1 核心命令
```powershell
Write-Output "[$(((Invoke-RestMethod -Uri 'https://worldtimeapi.org/api/timezone/Asia/Shanghai').datetime -replace 'T', ' ' -replace '\.\d+.*', ''))]"
```

### 2.2 命令说明
- 调用WorldTimeAPI获取北京时间
- 自动格式化为 `[YYYY-MM-DD HH:MM:SS]`
- 输出示例：`[2026-01-25 12:30:45]`

## 3. 备选方案
### 3.1 本地时间（网络不可用时）
```powershell
Write-Output "[$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')]"
```

## 4. 格式要求
- 格式：`[YYYY-MM-DD HH:MM:SS]`
- 时区：北京时间（UTC+8）
- 禁止手动输入时间戳
