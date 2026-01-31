#!/usr/bin/env python3
"""
更新日志脚本 - Python 版本
扫描项目变更并更新UPDATE_LOG.md文件
"""

import subprocess
import sys
import os
import re
from datetime import datetime

# 获取北京时间
def get_beijing_time():
  """
  获取当前北京时间
  :return: 格式化的北京时间字符串 [YYYY-MM-DD HH:MM:SS]
  """
  try:
    # 尝试使用GET_TIME.py脚本获取北京时间
    get_time_path = os.path.join(os.path.dirname(__file__), "GET_TIME.py")
    if os.path.exists(get_time_path):
      result = subprocess.run(
        [sys.executable, get_time_path],
        capture_output=True,
        text=True,
        encoding='utf-8',
        errors='ignore'  # 添加错误处理，忽略无法解码的字符
      )
      if result.returncode == 0 and result.stdout:
        # 只取最后一行输出，因为GET_TIME.py会输出多行信息
        lines = result.stdout.strip().split('\n')
        for line in reversed(lines):
          if line.startswith('[') and ']' in line:
            return line.strip()
  except Exception as e:
    print(f"获取北京时间失败: {str(e)}")
  
  # 使用本地时间备选
  try:
    now = datetime.now()
    return f"[{now.strftime('%Y-%m-%d %H:%M:%S')}]"
  except Exception as e:
    print(f"使用本地时间备选失败: {str(e)}")
    # 终极兜底：返回当前时间戳的字符串表示
    import time
    return f"[{time.strftime('%Y-%m-%d %H:%M:%S')}]"

def run_cmd(cmd, cwd=None):
  """
  运行命令并返回结果
  :param cmd: 命令
  :param cwd: 工作目录
  :return: (returncode, stdout, stderr)
  """
  try:
    result = subprocess.run(
      cmd, 
      shell=True, 
      capture_output=True, 
      text=True, 
      encoding='utf-8',
      cwd=cwd
    )
    return result.returncode, result.stdout.strip(), result.stderr.strip()
  except Exception as e:
    return 1, "", str(e)

def get_git_changes():
  """
  获取Git变更记录
  :return: 变更文件列表
  """
  changes = []
  
  # 获取修改的文件
  code, stdout, stderr = run_cmd("git diff --name-status")
  if code == 0:
    for line in stdout.split('\n'):
      if line:
        parts = line.split('\t', 1)
        if len(parts) == 2:
          status = parts[0]
          file_path = parts[1]
          # 对于重命名的文件，只保留新文件名
          if '->' in file_path:
            file_path = file_path.split(' -> ')[1]
          changes.append((status, file_path))
  
  # 获取未跟踪的文件
  code, stdout, stderr = run_cmd("git ls-files --others --exclude-standard")
  if code == 0:
    for file_path in stdout.split('\n'):
      if file_path:
        changes.append(('A', file_path))
  
  return changes

def get_operation_type(status):
  """
  根据Git状态获取操作类型
  :param status: Git状态
  :return: 操作类型字符串
  """
  status_map = {
    'A': '新增文件',
    'D': '删除文件',
    'M': '修改文件',
    'R': '重命名文件',
    'C': '复制文件'
  }
  return status_map.get(status, '修改文件')

def is_ignored(file_path):
  """
  检查文件是否应该被忽略
  :param file_path: 文件路径
  :return: 是否忽略
  """
  # 忽略.gitignore过滤的文件
  code, stdout, stderr = run_cmd(f"git check-ignore {file_path}")
  if code == 0:
    return True
  
  # 忽略UPDATE_LOG.md自身
  if os.path.basename(file_path) == "UPDATE_LOG.md":
    return True
  
  return False

def update_log():
  """
  更新UPDATE_LOG.md文件
  :return: 是否有更新
  """
  update_log_path = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "UPDATE_LOG.md")
  
  if not os.path.exists(update_log_path):
    print("UPDATE_LOG.md文件不存在")
    return False
  
  # 获取Git变更
  changes = get_git_changes()
  if not changes:
    print("没有发现变更")
    return False
  
  # 读取现有日志
  with open(update_log_path, 'r', encoding='utf-8') as f:
    content = f.read()
  
  # 提取更新记录部分
  log_section_match = re.search(r'## 更新记录\n(.*)', content, re.DOTALL)
  if not log_section_match:
    print("UPDATE_LOG.md格式不正确")
    return False
  
  existing_logs = log_section_match.group(1)
  
  # 检查变更是否已经在日志中
  new_entries = []
  for status, file_path in changes:
    if is_ignored(file_path):
      continue
    
    # 检查文件是否已经在最近的日志中
    operation_type = get_operation_type(status)
    # 简化文件路径，使用相对路径
    relative_path = os.path.relpath(file_path, os.path.dirname(update_log_path))
    
    # 生成更新简述
    summary = "修改文件"
    if status == 'A':
      summary = "新增文件"
    elif status == 'D':
      summary = "删除文件"
    elif status == 'R':
      summary = "重命名文件"
    
    # 生成日志条目
    beijing_time = get_beijing_time()
    entry = f"{beijing_time} 【{operation_type}】 : {relative_path} - {summary}"
    
    # 检查条目是否已存在
    if entry not in existing_logs:
      new_entries.append(entry)
  
  if not new_entries:
    print("没有新的变更需要更新到日志")
    return False
  
  # 更新日志文件
  new_logs = '\n'.join(new_entries) + '\n' + existing_logs
  new_content = content.replace(existing_logs, new_logs)
  
  with open(update_log_path, 'w', encoding='utf-8') as f:
    f.write(new_content)
  
  print(f"成功更新UPDATE_LOG.md，添加了{len(new_entries)}条记录")
  return True

def main():
  print("==== 更新日志 ====\n")
  
  # 更新日志
  updated = update_log()
  
  return 0

if __name__ == "__main__":
  sys.exit(main())