#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Knowledge Librarian - Inbox 清理工具 (v5.0 Soft Delete)
===================================================

功能说明:
    清理已归档的 Inbox 笔记文件，同时更新索引文件。
    v5.0 更新: 采用“软删除”机制，将文件移动到 .trae/trash/ 目录，而非物理删除。

使用方式:
    # 清理单个文件
    python clean_inbox.py note1.md

    # 清理多个文件
    python clean_inbox.py note1.md note2.md

    # 使用完整路径
    python clean_inbox.py .trae/rules/inbox/note1.md

特性:
    - 软删除: 移动到 .trae/trash/ 并附加时间戳
    - 索引更新: 自动移除 index.md 中的对应条目
    - 安全: 防止误删，随时可恢复

"""

import os
import argparse
import sys
import shutil
import datetime

# ============================================================================
# 配置常量
# ============================================================================

# Inbox 目录路径
INBOX_DIR = r".trae/rules/inbox"

# Inbox 索引文件路径
INDEX_FILE = os.path.join(INBOX_DIR, "index.md")

# 回收站目录路径
TRASH_DIR = r".trae/trash"


def get_trash_path(filename):
    """
    生成回收站中的目标路径（附加时间戳以防重名）。
    
    Args:
        filename (str): 原始文件名
        
    Returns:
        str: 回收站中的完整路径，例如 .trae/trash/note_20231027_100000.md
    """
    basename, ext = os.path.splitext(filename)
    timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
    new_name = f"{basename}_{timestamp}{ext}"
    return os.path.join(TRASH_DIR, new_name)


def clean_inbox(files_to_remove):
    """
    清理已归档的 Inbox 文件（软删除）。

    工作流程:
        1. 规范化文件名
        2. 移动文件到回收站
        3. 更新索引文件

    Args:
        files_to_remove (list[str]): 要删除的文件列表
    """
    if not files_to_remove:
        print("没有需要删除的文件。")
        return

    # 确保回收站存在
    os.makedirs(TRASH_DIR, exist_ok=True)

    # 规范化文件名 (提取 basename)
    normalized_files = []
    for f in files_to_remove:
        basename = os.path.basename(f)
        normalized_files.append(basename)

    print(f"开始清理 {len(normalized_files)} 个文件 (软删除 -> {TRASH_DIR})...")

    # ========================================
    # 步骤 1: 移动文件到回收站 (软删除)
    # ========================================
    removed_count = 0
    failed_files = []

    for file_name in normalized_files:
        src_path = os.path.join(INBOX_DIR, file_name)
        
        if os.path.exists(src_path):
            try:
                dst_path = get_trash_path(file_name)
                shutil.move(src_path, dst_path)
                print(f"✅ 已移至回收站: {file_name} -> {os.path.basename(dst_path)}")
                removed_count += 1
            except Exception as e:
                print(f"❌ 移动失败 {file_name}: {e}")
                failed_files.append(file_name)
        else:
            print(f"⚠️ 警告: 文件不存在: {file_name} (仍将尝试更新索引)")

    # ========================================
    # 步骤 2: 更新索引文件
    # ========================================
    if os.path.exists(INDEX_FILE):
        try:
            with open(INDEX_FILE, 'r', encoding='utf-8') as f:
                lines = f.readlines()

            new_lines = []
            removed_index_lines = 0

            # 使用集合加速查找
            files_set = set(normalized_files)

            for line in lines:
                should_keep = True

                # 检查此行是否为待删除文件的条目
                # 格式: | [filename](filename) | ...
                for file_name in files_set:
                    # 严格匹配 Markdown 链接模式
                    link_pattern = f"[{file_name}]({file_name})"
                    if link_pattern in line:
                        should_keep = False
                        removed_index_lines += 1
                        print(f"✅ 已从索引移除: {file_name}")
                        break

                if should_keep:
                    new_lines.append(line)

            # 仅在有变更时写入
            if removed_index_lines > 0:
                with open(INDEX_FILE, 'w', encoding='utf-8') as f:
                    f.writelines(new_lines)
                print(f"索引已更新。移除了 {removed_index_lines} 条记录。")
            else:
                print("ℹ️ 索引未变更 (未找到匹配条目)。")

        except Exception as e:
            print(f"❌ 更新索引失败: {e}")
    else:
        print(f"⚠️ 警告: 索引文件不存在: {INDEX_FILE}")

    # ========================================
    # 输出统计
    # ========================================
    print("-" * 30)
    print(f"清理完成: {removed_count}/{len(normalized_files)} 个文件已移至回收站。")
    if failed_files:
        print(f"失败列表: {', '.join(failed_files)}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(
        description="清理已归档的 Inbox 文件 (软删除)",
        formatter_class=argparse.RawDescriptionHelpFormatter
    )
    parser.add_argument(
        "files",
        nargs="+",
        help="要删除的文件列表 (完整路径或文件名)"
    )
    args = parser.parse_args()

    clean_inbox(args.files)
