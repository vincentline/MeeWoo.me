#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Knowledge Librarian - Inbox 清理工具
====================================

功能说明:
    清理已归档的 Inbox 笔记文件，同时更新索引文件。
    用于在知识归档完成后清理临时文件。

使用方式:
    # 清理单个文件
    python clean_inbox.py note1.md

    # 清理多个文件
    python clean_inbox.py note1.md note2.md note3.md

    # 使用完整路径
    python clean_inbox.py .trae/rules/inbox/note1.md

特性:
    - 支持文件名或完整路径
    - 同时删除文件和更新索引
    - 提供详细的操作反馈



"""

import os
import argparse
import sys

# ============================================================================
# 配置常量
# ============================================================================

# Inbox 目录路径
INBOX_DIR = r".trae/rules/inbox"

# Inbox 索引文件路径
INDEX_FILE = os.path.join(INBOX_DIR, "index.md")


def clean_inbox(files_to_remove):
    """
    清理已归档的 Inbox 文件。

    工作流程:
        1. 规范化文件名 (提取 basename)
        2. 删除物理文件
        3. 更新索引文件 (移除对应条目)

    Args:
        files_to_remove (list[str]): 要删除的文件列表
            支持格式:
            - 文件名: "note.md"
            - 完整路径: ".trae/rules/inbox/note.md"

    Output:
        打印操作结果和统计信息
    """
    if not files_to_remove:
        print("没有需要删除的文件。")
        return

    # 规范化文件名 (提取 basename)
    normalized_files = []
    for f in files_to_remove:
        basename = os.path.basename(f)
        normalized_files.append(basename)

    print(f"开始清理 {len(normalized_files)} 个文件...")

    # ========================================
    # 步骤 1: 删除物理文件
    # ========================================
    removed_count = 0
    failed_files = []

    for file_name in normalized_files:
        file_path = os.path.join(INBOX_DIR, file_name)

        # 尝试删除文件
        if os.path.exists(file_path):
            try:
                os.remove(file_path)
                print(f"✅ 已删除文件: {file_name}")
                removed_count += 1
            except Exception as e:
                print(f"❌ 删除失败 {file_name}: {e}")
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
    print(f"清理完成: {removed_count}/{len(normalized_files)} 个文件已删除。")
    if failed_files:
        print(f"删除失败: {', '.join(failed_files)}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(
        description="清理已归档的 Inbox 文件",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
示例:
  python clean_inbox.py file1.md file2.md
  python clean_inbox.py .trae/rules/inbox/file1.md

注意: 支持完整路径和文件名两种格式。
        """
    )
    parser.add_argument(
        "files",
        nargs="+",
        help="要删除的文件列表 (完整路径或文件名)"
    )
    args = parser.parse_args()

    clean_inbox(args.files)
