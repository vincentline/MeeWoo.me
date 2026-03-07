#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Knowledge Librarian - 知识档案员 (v6.0 精简版)
==============================================

功能说明:
    负责将 Inbox (海马体) 中的经验碎片整理、归档到长期规则库 (皮层) 中。
    v6.0 仅支持写入 Agent 预先生成的结构化内容 (--content-file)，移除了旧版模板填充逻辑。

使用方式:
    # 创建新规则模块
    python archiver.py create --source .trae/rules/inbox/note.md --target .trae/rules/modules/media/konva.ts.md --content-file .trae/temp/structured_note.md

    # 合并到现有模块
    python archiver.py merge --source .trae/rules/inbox/note.md --target .trae/rules/modules/media/index.ts.md --content-file .trae/temp/structured_note.md

命令说明:
    create      创建新的规则模块
    merge       合并到现有规则模块
"""

import argparse
import os
import sys
import subprocess

# ============================================================================
# 配置常量
# ============================================================================

# Inbox 目录路径 (海马体 - 临时经验存储)
INBOX_DIR = r".trae/rules/inbox"

# 规则模块目录路径 (皮层 - 长期规则库)
MODULES_DIR = r".trae/rules/modules"

# 确保目录存在
os.makedirs(INBOX_DIR, exist_ok=True)
os.makedirs(MODULES_DIR, exist_ok=True)


class TimeoutError(Exception):
    """命令执行超时异常。"""
    pass


def run_with_timeout(cmd, timeout=30):
    """
    带超时限制的命令执行。
    """
    try:
        result = subprocess.run(
            cmd,
            shell=True,
            check=True,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            timeout=timeout
        )
        return True, result.stdout.decode('utf-8')
    except subprocess.TimeoutExpired:
        return False, "执行超时"
    except subprocess.CalledProcessError as e:
        return False, e.stderr.decode('utf-8')


def read_and_clean_content_file(content_file):
    """
    读取并清理 Agent 生成的结构化内容文件。
    """
    if not content_file:
        return None
        
    try:
        with open(content_file, 'r', encoding='utf-8') as f:
            content = f.read()
            
        # 自清理: 读取后立即删除临时文件
        try:
            abs_path = os.path.abspath(content_file)
            if ".trae" in abs_path and "temp" in abs_path and os.path.exists(abs_path):
                os.remove(abs_path)
        except OSError as e:
            print(f"⚠️ Failed to delete temp content file: {e}")
            
        return content
    except Exception as e:
        print(f"❌ 读取 Content File 失败: {e}")
        return None


def command_create(args):
    """
    处理 'create' 命令。
    """
    source_path = args.source
    target_path = args.target
    verify_cmd = args.verify_cmd
    timeout = args.timeout
    content_file = args.content_file

    print(f"[1/4] 读取源文件信息: {source_path}...")
    
    # 强制要求提供 content_file
    final_content = read_and_clean_content_file(content_file)
    if not final_content:
        print("❌ Error: v6.0 requires --content-file argument with structured content.")
        sys.exit(1)
        
    print("✅ 使用 Agent 提供的结构化内容。")

    # ========================================
    # 验证 (可选)
    # ========================================
    if verify_cmd:
        print(f"[3/4] 执行验证命令: {verify_cmd}...")
        success, output = run_with_timeout(verify_cmd, timeout)
        if not success:
            print(f"⚠️ 验证失败: {output}")
        else:
            print("✅ 验证通过。")
    else:
        print("[3/4] 跳过验证 (未提供验证命令)。")

    # ========================================
    # 写入目标文件
    # ========================================
    print(f"[4/4] 写入目标文件: {target_path}...")
    os.makedirs(os.path.dirname(target_path), exist_ok=True)
    with open(target_path, 'w', encoding='utf-8') as f:
        f.write(final_content)

    print(f"✅ 成功创建模块: {target_path}")


def command_merge(args):
    """
    处理 'merge' 命令。
    """
    source_path = args.source
    target_path = args.target
    content_file = args.content_file

    print(f"[1/2] 读取源文件信息: {source_path}...")
    
    final_content = read_and_clean_content_file(content_file)
    if not final_content:
        print("❌ Error: v6.0 requires --content-file argument with structured content.")
        sys.exit(1)

    # 确保追加时有足够的换行
    if not final_content.startswith("\n"):
        final_content = "\n\n" + final_content

    if not os.path.exists(target_path):
        print(f"❌ 目标文件不存在: {target_path}")
        sys.exit(1)

    # ========================================
    # 追加到目标文件
    # ========================================
    print(f"[2/2] 追加到目标文件: {target_path}...")

    with open(target_path, 'a', encoding='utf-8') as f:
        f.write(final_content)

    # 检查行数
    with open(target_path, 'r', encoding='utf-8') as f:
        line_count = len(f.readlines())
        if line_count > 300:
            print(f"⚠️ 警告: 目标文件已达 {line_count} 行，建议拆分。")

    print(f"✅ 成功合并到: {target_path}")


def main():
    parser = argparse.ArgumentParser(description="Knowledge Librarian Archiver CLI (v6.0 Lite)")
    subparsers = parser.add_subparsers(dest="command", required=True)

    # create
    parser_create = subparsers.add_parser("create", help="创建新规则模块")
    parser_create.add_argument("--source", required=True, help="源文件路径 (仅用于记录)")
    parser_create.add_argument("--target", required=True, help="目标文件路径")
    parser_create.add_argument("--content-file", required=True, help="Agent 生成的结构化内容文件路径")
    parser_create.add_argument("--verify-cmd", help="验证命令")
    parser_create.add_argument("--timeout", type=int, default=30, help="超时时间")
    # 兼容旧参数 (虽然不再使用，但避免 batch_processor 报错)
    parser_create.add_argument("--template", help="[Deprecated] 模板类型", default="new")

    # merge
    parser_merge = subparsers.add_parser("merge", help="合并到现有规则模块")
    parser_merge.add_argument("--source", required=True, help="源文件路径 (仅用于记录)")
    parser_merge.add_argument("--target", required=True, help="目标文件路径")
    parser_merge.add_argument("--content-file", required=True, help="Agent 生成的结构化内容文件路径")

    # batch-merge (暂不支持 v6.0 特性，建议移除或重构，此处仅保留占位以防调用崩溃)
    parser_batch = subparsers.add_parser("batch-merge", help="[Deprecated] 批量合并")
    parser_batch.add_argument("--source", help="源文件列表")
    parser_batch.add_argument("--target", help="目标文件路径")
    parser_batch.add_argument("--dry-run", action="store_true")

    args = parser.parse_args()

    if args.command == "create":
        command_create(args)
    elif args.command == "merge":
        command_merge(args)
    elif args.command == "batch-merge":
        print("⚠️ batch-merge command is deprecated in v6.0. Please use create/merge with smart structuring.")

if __name__ == "__main__":
    main()
