# -*- coding: utf-8 -*-
"""依赖管理器模块

该模块负责检查和安装项目的依赖项，支持：
1. Python 依赖 (requirements.txt)
2. Node.js 依赖 (package.json)

使用方法：
    from dependency_manager import install_dependencies
    success = install_dependencies(root_dir)
"""

import os
import subprocess
from error_handler import handle_exception, log_message

@handle_exception
def run_command(command, cwd=None):
    """执行系统命令
    
    Args:
        command (str): 要执行的命令字符串
        cwd (str, optional): 命令执行的工作目录. Defaults to None.
    
    Returns:
        bool: 命令执行成功返回 True，失败返回 False
    """
    log_message(f"Executing: {command}", "INFO")
    result = subprocess.run(
        command,
        cwd=cwd,
        shell=True,
        capture_output=True,
        text=True,
        encoding='utf-8',
        errors='replace'
    )
    if result.returncode != 0:
        log_message(f"Command failed: {result.stderr}", "ERROR")
        return False
    return True

@handle_exception
def check_requirements(root_dir):
    """检查并安装 Python 依赖
    
    Args:
        root_dir (str): 项目根目录路径
    
    Returns:
        bool: 依赖安装成功返回 True，失败返回 False
    """
    req_file = os.path.join(root_dir, "requirements.txt")
    if os.path.exists(req_file):
        log_message("Found requirements.txt, installing Python dependencies...", "INFO")
        return run_command(f"pip install -r {req_file}", cwd=root_dir)
    return True

@handle_exception
def check_package_json(root_dir):
    """检查并安装 Node.js 依赖
    
    Args:
        root_dir (str): 项目根目录路径
    
    Returns:
        bool: 依赖安装成功返回 True，失败返回 False
    """
    pkg_file = os.path.join(root_dir, "package.json")
    if os.path.exists(pkg_file):
        log_message("Found package.json, installing Node.js dependencies...", "INFO")
        return run_command("npm install", cwd=root_dir)
    return True

@handle_exception
def install_dependencies(root_dir):
    """安装所有项目依赖
    
    按顺序检查并安装：
    1. Python 依赖 (requirements.txt)
    2. Node.js 依赖 (package.json)
    
    Args:
        root_dir (str): 项目根目录路径
    
    Returns:
        bool: 所有依赖安装成功返回 True，否则返回 False
    """
    success = True
    if not check_requirements(root_dir):
        success = False
    if not check_package_json(root_dir):
        success = False
    
    # 还可以解析 ENVIRONMENT.md，但目前先只支持标准文件
    
    return success
