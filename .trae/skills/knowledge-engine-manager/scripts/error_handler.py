# -*- coding: utf-8 -*-
"""错误处理模块

该模块提供：
1. 日志记录功能
2. 异常捕获装饰器
3. 控制台彩色输出

使用方法：
    from error_handler import handle_exception, log_message
    
    @handle_exception
    def my_function():
        # 函数代码
        pass
    
    log_message("Information message")
    log_message("Warning message", "WARNING")
    log_message("Error message", "ERROR")
"""

import os
import sys
import traceback
import datetime
from functools import wraps

# 定义颜色
class Colors:
    """控制台颜色定义"""
    HEADER = '\033[95m'      # 紫色
    OKBLUE = '\033[94m'      # 蓝色
    OKCYAN = '\033[96m'      # 青色
    OKGREEN = '\033[92m'     # 绿色
    WARNING = '\033[93m'     # 黄色
    FAIL = '\033[91m'        # 红色
    ENDC = '\033[0m'         # 结束颜色
    BOLD = '\033[1m'         # 粗体
    UNDERLINE = '\033[4m'     # 下划线

# 日志路径 (相对于项目根目录)
LOG_FILE = os.path.join(".trae", "logs", "error-log.md")

def log_message(message, level="INFO"):
    """打印日志并记录到文件（如果是错误）
    
    Args:
        message (str): 日志消息
        level (str, optional): 日志级别，可选值：INFO, WARNING, ERROR, SUCCESS. Defaults to "INFO".
    """
    timestamp = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    
    # 控制台输出
    color = Colors.OKBLUE
    if level == "WARNING":
        color = Colors.WARNING
    elif level == "ERROR":
        color = Colors.FAIL
    elif level == "SUCCESS":
        color = Colors.OKGREEN
        
    print(f"{color}[{timestamp}] [{level}] {message}{Colors.ENDC}")
    
    # 写入文件 (仅错误)
    if level == "ERROR":
        try:
            # 确保父目录存在
            log_dir = os.path.dirname(LOG_FILE)
            if os.path.exists(log_dir) and os.path.exists(LOG_FILE):
                with open(LOG_FILE, "a", encoding="utf-8") as f:
                    f.write(f"\n## [{timestamp}] Error\n")
                    f.write(f"- Message: {message}\n")
                    # 只有在有 traceback 的时候才记录
                    if sys.exc_info()[0] is not None:
                        f.write(f"```\n{traceback.format_exc()}\n```\n")
        except Exception:
            pass # 避免递归错误

def handle_exception(func):
    """装饰器：捕获异常并记录
    
    装饰后的函数在执行过程中发生异常时会：
    1. 捕获异常并记录到日志
    2. 返回 False 表示失败（如果函数预期返回布尔值）
    
    Args:
        func (callable): 要装饰的函数
    
    Returns:
        callable: 装饰后的函数
    """
    @wraps(func)
    def wrapper(*args, **kwargs):
        try:
            return func(*args, **kwargs)
        except Exception as e:
            log_message(f"Execution failed in {func.__name__}: {str(e)}", "ERROR")
            # 返回 False 表示失败 (如果函数预期返回布尔值)
            return False
    return wrapper
