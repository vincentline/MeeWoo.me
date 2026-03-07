#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
WebApp Testing - 增强版错误捕获启动器
=====================================

功能说明:
    启动增强版错误捕获脚本，用于实时捕获浏览器控制台错误和警告。
    自动启动开发服务器并运行错误捕获脚本。

使用方式:
    python capture_errors.py [--help]

选项:
    --help, -h    显示帮助信息

工作流程:
    1. 检查增强版错误捕获脚本是否存在
    2. 启动开发服务器 (npm run dev, 端口 5173)
    3. 运行错误捕获脚本
    4. 实时显示错误和警告
    5. 按 Ctrl+C 停止并查看统计信息

前置条件:
    - 已安装 Python 依赖 (Playwright)
    - 已安装 npm 依赖
    - 增强版错误捕获脚本存在

输出:
    - 实时错误/警告日志
    - 带时间戳的详细日志文件
    - 统计信息汇总



"""

import sys
import os
import subprocess


def main():
    """
    主函数入口 - 启动增强版错误捕获。

    工作流程:
        1. 解析命令行参数
        2. 定位增强版错误捕获脚本
        3. 构建并执行命令
    """
    # 显示帮助信息
    if '--help' in sys.argv or '-h' in sys.argv:
        print(__doc__)
        return

    # 获取脚本目录和项目根目录
    script_dir = os.path.dirname(os.path.abspath(__file__))
    project_root = os.path.abspath(os.path.join(script_dir, '../../..'))

    # 增强版错误捕获脚本路径
    error_capture_script = os.path.join(script_dir, '../examples/enhanced_error_capture.py')

    # 检查脚本是否存在
    if not os.path.exists(error_capture_script):
        print(f"错误：增强版错误捕获脚本不存在: {error_capture_script}")
        return

    # 构建命令
    # 使用 with_server.py 启动开发服务器，然后运行错误捕获脚本
    command = [
        'python', 'scripts/with_server.py',
        '--server', 'npm run dev',
        '--port', '5173',
        '--',
        'python', error_capture_script
    ]

    print("启动增强版错误捕获...")
    print(f"执行命令: {' '.join(command)}")
    print("\n提示:")
    print("1. 浏览器会自动打开，您可以进行各种操作测试")
    print("2. 错误和警告会实时显示在终端中")
    print("3. 按 Ctrl+C 停止捕获并查看统计信息")
    print("4. 详细日志会保存到带时间戳的文件中\n")

    # 执行命令
    try:
        subprocess.run(command, cwd=project_root, check=True)
    except subprocess.CalledProcessError as e:
        print(f"命令执行失败: {e}")
    except KeyboardInterrupt:
        print("\n操作被用户中断")


if __name__ == "__main__":
    main()
