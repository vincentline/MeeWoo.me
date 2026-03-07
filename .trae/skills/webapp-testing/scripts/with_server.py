#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
WebApp Testing - 服务器启动器
=============================

功能说明:
    启动一个或多个服务器，等待就绪后运行命令，最后清理进程。
    用于自动化测试场景，确保服务器在测试前已准备就绪。

使用方式:
    # 单服务器
    python with_server.py --server "npm run dev" --port 5173 -- python automation.py
    python with_server.py --server "npm start" --port 3000 -- python test.py

    # 多服务器
    python with_server.py \
      --server "cd backend && python server.py" --port 3000 \
      --server "cd frontend && npm run dev" --port 5173 \
      -- python test.py

参数说明:
    --server    服务器启动命令 (可重复指定多个)
    --port      服务器端口 (必须与 --server 数量匹配)
    --timeout   等待服务器就绪的超时时间 (秒)，默认 30
    command     服务器就绪后要执行的命令 (以 -- 分隔)

工作流程:
    1. 解析命令行参数
    2. 验证服务器配置
    3. 启动所有服务器
    4. 等待服务器就绪
    5. 执行指定命令
    6. 清理服务器进程



"""

import subprocess
import socket
import time
import sys
import argparse


def is_server_ready(port, timeout=30):
    """
    通过轮询端口检查服务器是否就绪。

    尝试建立 TCP 连接到指定端口，成功则表示服务器已就绪。

    Args:
        port (int): 要检查的端口号
        timeout (int): 总超时时间 (秒)，默认 30

    Returns:
        bool: 服务器是否在超时时间内就绪

    Example:
        >>> if is_server_ready(5173):
        ...     print("服务器已就绪")
    """
    start_time = time.time()
    while time.time() - start_time < timeout:
        try:
            with socket.create_connection(('localhost', port), timeout=1):
                return True
        except (socket.error, ConnectionRefusedError):
            time.sleep(0.5)
    return False


def main():
    """
    主函数入口 - 服务器管理和命令执行。

    工作流程:
        1. 解析命令行参数
        2. 验证服务器配置
        3. 启动所有服务器
        4. 等待服务器就绪
        5. 执行指定命令
        6. 清理服务器进程
    """
    parser = argparse.ArgumentParser(
        description='启动一个或多个服务器，等待就绪后运行命令'
    )
    parser.add_argument(
        '--server',
        action='append',
        dest='servers',
        required=True,
        help='服务器启动命令 (可重复)'
    )
    parser.add_argument(
        '--port',
        action='append',
        dest='ports',
        type=int,
        required=True,
        help='每个服务器的端口 (必须与 --server 数量匹配)'
    )
    parser.add_argument(
        '--timeout',
        type=int,
        default=30,
        help='每个服务器的超时时间 (秒)，默认 30'
    )
    parser.add_argument(
        'command',
        nargs=argparse.REMAINDER,
        help='服务器就绪后要执行的命令'
    )

    args = parser.parse_args()

    # 移除 '--' 分隔符 (如果存在)
    if args.command and args.command[0] == '--':
        args.command = args.command[1:]

    if not args.command:
        print("错误: 未指定要执行的命令")
        sys.exit(1)

    # 验证服务器配置
    if len(args.servers) != len(args.ports):
        print("错误: --server 和 --port 参数数量必须匹配")
        sys.exit(1)

    # 构建服务器配置列表
    servers = []
    for cmd, port in zip(args.servers, args.ports):
        servers.append({'cmd': cmd, 'port': port})

    server_processes = []

    try:
        # ========================================
        # 启动所有服务器
        # ========================================
        for i, server in enumerate(servers):
            print(f"启动服务器 {i+1}/{len(servers)}: {server['cmd']}")

            # 使用 shell=True 支持 cd 和 && 等命令
            process = subprocess.Popen(
                server['cmd'],
                shell=True,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE
            )
            server_processes.append(process)

            # 等待此服务器就绪
            print(f"等待端口 {server['port']} 就绪...")
            if not is_server_ready(server['port'], timeout=args.timeout):
                raise RuntimeError(
                    f"服务器在 {args.timeout} 秒内未能启动于端口 {server['port']}"
                )

            print(f"端口 {server['port']} 已就绪")

        print(f"\n所有 {len(servers)} 个服务器已就绪")

        # ========================================
        # 执行命令
        # ========================================
        print(f"执行: {' '.join(args.command)}\n")
        result = subprocess.run(args.command)
        sys.exit(result.returncode)

    finally:
        # ========================================
        # 清理所有服务器进程
        # ========================================
        print(f"\n正在停止 {len(server_processes)} 个服务器...")
        for i, process in enumerate(server_processes):
            try:
                process.terminate()
                process.wait(timeout=5)
            except subprocess.TimeoutExpired:
                process.kill()
                process.wait()
            print(f"服务器 {i+1} 已停止")
        print("所有服务器已停止")


if __name__ == '__main__':
    main()
