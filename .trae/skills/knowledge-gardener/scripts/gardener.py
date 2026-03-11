#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Knowledge Gardener - 知识园丁
=============================

功能说明:
    负责将开发经验快速提取并暂存到 Inbox (海马体) 中。
    不直接修改长期规则库，仅负责经验碎片的收集和索引。

使用方式:
    # 创建新笔记
    python gardener.py new --type bug --title "修复画布拖拽Bug" --tags "canvas,drag" --content "问题描述..."

    # 从文件读取内容
    python gardener.py new --type knowledge --title "Konva性能优化" --content-file ./notes.md

    # 检查重复笔记
    python gardener.py check --keywords "canvas,drag"

命令说明:
    new     创建新的经验笔记
    check   检查是否存在重复笔记

笔记类型:
    bug         Bug 修复经验
    knowledge   通用知识/最佳实践



"""

import argparse
import os
import re
import datetime
import sys

# ============================================================================
# 工具函数
# ============================================================================

def find_project_root():
    """
    查找项目根目录（包含 .trae 目录的目录）
    
    Returns:
        str: 项目根目录的绝对路径，如果未找到则返回 None
    """
    current_dir = os.path.dirname(os.path.abspath(__file__))
    while current_dir != os.path.dirname(current_dir):  # 到达文件系统根目录时停止
        if os.path.exists(os.path.join(current_dir, '.trae')):
            return current_dir
        current_dir = os.path.dirname(current_dir)
    return None

# ============================================================================
# 配置常量
# ============================================================================

# 项目根目录
PROJECT_ROOT = find_project_root()
if not PROJECT_ROOT:
    print("❌ 错误：未找到项目根目录（.trae 目录）")
    exit(1)

# Inbox 目录路径 (海马体 - 临时经验存储)
INBOX_DIR = os.path.join(PROJECT_ROOT, ".trae", "rules", "inbox")

# 模板目录路径
TEMPLATES_DIR = os.path.join(PROJECT_ROOT, ".trae", "skills", "knowledge-gardener", "templates")

# Inbox 索引文件路径
INDEX_FILE = os.path.join(INBOX_DIR, "index.md")

# 确保目录存在
os.makedirs(INBOX_DIR, exist_ok=True)
os.makedirs(TEMPLATES_DIR, exist_ok=True)


def to_kebab_case(s):
    """
    将字符串转换为 kebab-case 格式。

    用于生成 URL 友好的文件名。

    Args:
        s (str): 原始字符串

    Returns:
        str: kebab-case 格式的字符串

    Example:
        >>> to_kebab_case("修复画布拖拽Bug")
        '修复画布拖拽bug'
        >>> to_kebab_case("Konva Performance Tips")
        'konva-performance-tips'
    """
    # 移除非字母数字字符 (保留空格和连字符)
    s = re.sub(r'[^\w\s-]', '', s).strip().lower()
    # 将空格替换为连字符
    s = re.sub(r'[-\s]+', '-', s)
    return s


def get_template_content(type_name):
    """
    根据笔记类型读取模板内容。

    Args:
        type_name (str): 笔记类型 ('bug' 或 'knowledge')

    Returns:
        str: 模板内容字符串，如果文件不存在则返回默认模板

    Template Files:
        - bug: inbox_note.md
        - knowledge: inbox_knowledge.md
    """
    filename = "inbox_note.md" if type_name == "bug" else "inbox_knowledge.md"
    path = os.path.join(TEMPLATES_DIR, filename)
    try:
        with open(path, 'r', encoding='utf-8') as f:
            return f.read()
    except FileNotFoundError:
        # 模板文件缺失时的后备模板
        return f"# {{title}}\n\n{{content}}\n"


def update_index(filename, title, tags, summary):
    """
    原子性地向索引表追加新行。

    索引文件格式为 Markdown 表格:
    | 文件名 | 关键词 | 摘要 | 创建日期 |

    Args:
        filename (str): 笔记文件名
        title (str): 笔记标题
        tags (str): 关键词标签 (逗号分隔)
        summary (str): 内容摘要

    Side Effects:
        - 如果索引文件不存在，创建新文件
        - 向索引文件追加新行
    """
    today = datetime.datetime.now().strftime("%Y-%m-%d")

    # 清理输入中的 Markdown 表格特殊字符
    title = title.replace("|", "\\|")
    tags = tags.replace("|", "\\|")
    summary = summary.replace("|", "\\|").replace("\n", " ")

    # 构建新行
    new_row = f"| [{filename}]({filename}) | {tags} | {summary} | {today} |"

    if not os.path.exists(INDEX_FILE):
        # 创建新的索引文件
        with open(INDEX_FILE, 'w', encoding='utf-8') as f:
            f.write("# Inbox Index (海马体索引)\n\n> 存放尚未归档的临时经验碎片。\n\n| 文件名 | 关键词 | 摘要 | 创建日期 |\n| :--- | :--- | :--- | :--- |\n")

    with open(INDEX_FILE, 'r+', encoding='utf-8') as f:
        content = f.read()
        if new_row not in content:
            # 追加到文件末尾，确保有换行符
            if not content.endswith("\n"):
                f.write("\n")
            f.write(new_row + "\n")
            print(f"✅ 已更新索引: {INDEX_FILE}")
        else:
            print("ℹ️ 索引中已存在此条目。")


def command_new(args):
    """
    处理 'new' 命令 - 创建新的经验笔记。

    工作流程:
        1. 获取笔记内容 (从参数或文件)
        2. 准备模板和内容
        3. 生成文件名 (kebab-case)
        4. 写入文件
        5. 更新索引

    Args:
        args: argparse 解析的命令行参数，包含:
            - title: 笔记标题
            - type: 笔记类型 (bug/knowledge)
            - tags: 关键词标签
            - content: 内容字符串
            - content_file: 内容文件路径
            - raw: 是否使用原始内容 (不添加头部)
    """
    title = args.title
    type_name = args.type
    tags = args.tags or ""

    # ========================================
    # 步骤 1: 获取内容
    # ========================================
    content = ""
    if args.content_file:
        # 从文件读取内容
        try:
            with open(args.content_file, 'r', encoding='utf-8') as f:
                content = f.read()

            # 自清理逻辑: 读取完文件后立即尝试删除
            try:
                # 确保文件路径是绝对路径或正确的相对路径
                abs_path = os.path.abspath(args.content_file)
                if os.path.exists(abs_path):
                    os.remove(abs_path)
                    # print(f"Deleted temp file: {abs_path}") # Debug
            except OSError as e:
                # 打印错误以便调试 (后续稳定后可移除)
                print(f"⚠️ Failed to delete temp file: {e}")

        except Exception as e:
            print(f"❌ 读取内容文件失败: {e}")
            sys.exit(1)
    elif args.content:
        # 使用命令行参数中的内容
        content = args.content
    else:
        # 无内容时使用占位符
        content = "(内容待补充...)"

    # ========================================
    # 步骤 2: 准备模板和内容
    # ========================================
    final_file_content = ""

    if args.raw:
        # RAW 模式: 直接使用内容，不添加任何格式
        final_file_content = content
    else:
        # 模板模式: 添加标准头部
        # 格式: 标题 + 标签 + 创建日期 + 正文
        final_file_content = f"# {title}\n> Tags: {tags}\n> Created: {datetime.datetime.now().strftime('%Y-%m-%d')}\n\n{content}"

    # ========================================
    # 步骤 3: 生成文件名
    # ========================================
    filename = f"{to_kebab_case(title)}.md"
    filepath = os.path.join(INBOX_DIR, filename)

    # ========================================
    # 步骤 4: 写入文件
    # ========================================
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(final_file_content)
    print(f"✅ 已创建笔记: {filepath}")

    # ========================================
    # 步骤 5: 更新索引
    # ========================================
    # 从内容生成摘要 (取前 50 字符)
    summary = content.split('\n')[0][:50] + "..." if len(content) > 50 else content
    update_index(filename, title, tags, summary)


def command_check(args):
    """
    处理 'check' 命令 - 检查重复笔记。

    在索引文件中搜索包含指定关键词的笔记，
    帮助避免创建重复的经验记录。

    Args:
        args: argparse 解析的命令行参数，包含:
            - keywords: 要检查的关键词 (逗号分隔)

    Output:
        - 找到重复: 列出所有匹配的笔记文件名
        - 未找到: 输出 "PASS: No duplicates found."
    """
    keywords = [k.strip().lower() for k in args.keywords.split(',')]
    found = []

    if os.path.exists(INDEX_FILE):
        with open(INDEX_FILE, 'r', encoding='utf-8') as f:
            for line in f:
                if line.startswith("| ["):
                    lower_line = line.lower()
                    if any(k in lower_line for k in keywords):
                        # 从 Markdown 链接中提取文件名
                        match = re.search(r'\[(.*?)\]', line)
                        if match:
                            found.append(match.group(1))

    if found:
        print("WARN: 发现潜在的重复笔记:")
        for item in found:
            print(f"  - {item}")
    else:
        print("PASS: 未发现重复笔记。")


def main():
    """
    主函数入口 - CLI 命令路由。

    支持的子命令:
        new     创建新笔记
        check   检查重复
    """
    parser = argparse.ArgumentParser(description="Knowledge Gardener CLI - 知识园丁命令行工具")
    subparsers = parser.add_subparsers(dest="command", required=True)

    # ========================================
    # new 命令配置
    # ========================================
    parser_new = subparsers.add_parser("new", help="创建新的经验笔记")
    parser_new.add_argument(
        "--type",
        choices=["bug", "knowledge"],
        required=True,
        help="笔记类型: bug (Bug修复) 或 knowledge (通用知识)"
    )
    parser_new.add_argument(
        "--title",
        required=True,
        help="笔记标题"
    )
    parser_new.add_argument(
        "--tags",
        help="关键词标签 (逗号分隔)"
    )
    parser_new.add_argument(
        "--content",
        help="笔记内容字符串"
    )
    parser_new.add_argument(
        "--content-file",
        help="笔记内容文件路径"
    )
    parser_new.add_argument(
        "--raw",
        action="store_true",
        help="使用原始内容，不添加标准头部"
    )

    # ========================================
    # check 命令配置
    # ========================================
    parser_check = subparsers.add_parser("check", help="检查是否存在重复笔记")
    parser_check.add_argument(
        "--keywords",
        required=True,
        help="要检查的关键词 (逗号分隔)"
    )

    # 解析参数并路由到对应命令
    args = parser.parse_args()

    if args.command == "new":
        command_new(args)
    elif args.command == "check":
        command_check(args)


if __name__ == "__main__":
    main()
