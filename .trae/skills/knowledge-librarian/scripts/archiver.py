#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Knowledge Librarian - 知识档案员
================================

功能说明:
    负责将 Inbox (海马体) 中的经验碎片整理、归档到长期规则库 (皮层) 中。
    支持创建新模块、合并到现有模块、批量合并等操作。

使用方式:
    # 创建新规则模块
    python archiver.py create --source .trae/rules/inbox/note.md --target .trae/rules/modules/media/konva.ts.md

    # 合并到现有模块
    python archiver.py merge --source .trae/rules/inbox/note.md --target .trae/rules/modules/media/index.ts.md

    # 批量合并
    python archiver.py batch-merge --source "note1.md,note2.md" --target .trae/rules/modules/media/index.ts.md

    # 预览批量合并 (不执行)
    python archiver.py batch-merge --source "note1.md,note2.md" --target .trae/rules/modules/media/index.ts.md --dry-run

命令说明:
    create      从 Inbox 笔记创建新的规则模块
    merge       将 Inbox 笔记合并到现有规则模块
    batch-merge 批量合并多个 Inbox 笔记



"""

import argparse
import os
import re
import datetime
import sys
import subprocess
import signal

# ============================================================================
# 配置常量
# ============================================================================

# Inbox 目录路径 (海马体 - 临时经验存储)
INBOX_DIR = r".trae/rules/inbox"

# 模板目录路径
TEMPLATES_DIR = r".trae/skills/knowledge-librarian/templates"

# 规则模块目录路径 (皮层 - 长期规则库)
MODULES_DIR = r".trae/rules/modules"

# 确保目录存在
os.makedirs(INBOX_DIR, exist_ok=True)
os.makedirs(TEMPLATES_DIR, exist_ok=True)
os.makedirs(MODULES_DIR, exist_ok=True)


class TimeoutError(Exception):
    """命令执行超时异常。"""
    pass


def handler(signum, frame):
    """信号处理器 - 用于超时控制。"""
    raise TimeoutError("命令执行超时")


def run_with_timeout(cmd, timeout=30):
    """
    带超时限制的命令执行。

    Windows 系统不支持 signal.alarm，因此使用 subprocess 的 timeout 参数。

    Args:
        cmd (str): 要执行的命令
        timeout (int): 超时时间 (秒)，默认 30 秒

    Returns:
        tuple[bool, str]:
            - bool: 是否成功
            - str: 输出内容或错误信息
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


def to_pascal_case(s):
    """
    将字符串转换为 PascalCase 格式。

    用于生成 TypeScript Interface 名称。

    Args:
        s (str): 原始字符串 (通常为 kebab-case)

    Returns:
        str: PascalCase 格式的字符串

    Example:
        >>> to_pascal_case("konva-rules")
        'KonvaRules'
    """
    # 移除非字母数字字符 (保留空格)
    s = re.sub(r'[^\w\s]', '', s)
    return "".join(word.title() for word in s.split())


def get_template_content(template_name):
    """
    根据模板名称读取模板内容。

    Args:
        template_name (str): 模板名称 (new/guide/concept/reference)

    Returns:
        str: 模板内容字符串，如果文件不存在则返回默认模板

    Template Files:
        - new: new_module.md
        - guide: guide_module.md
        - concept: concept_module.md
        - reference: reference_module.md
    """
    filename = f"{template_name}_module.md"
    # 模板别名映射
    if template_name == "new":
        filename = "new_module.md"

    path = os.path.join(TEMPLATES_DIR, filename)
    try:
        with open(path, 'r', encoding='utf-8') as f:
            return f.read()
    except FileNotFoundError:
        print(f"⚠️ 模板 {filename} 未找到，使用默认模板。")
        return "# [ModuleName]\n\n## Overview\n\n[Description]\n"


def parse_markdown_source(source_path):
    """
    解析 Markdown 源文件，提取标题和内容。

    Args:
        source_path (str): 源文件路径

    Returns:
        tuple[str, str]:
            - str: 标题 (从 H1 提取，未找到则为 "Untitled")
            - str: 完整内容

    Raises:
        SystemExit: 文件读取失败时退出
    """
    try:
        with open(source_path, 'r', encoding='utf-8') as f:
            content = f.read()

        lines = content.splitlines()
        title = "Untitled"
        body = content

        # 尝试提取 H1 标题
        for line in lines:
            if line.startswith("# "):
                title = line[2:].strip()
                break

        return title, body
    except Exception as e:
        print(f"❌ 读取源文件失败: {e}")
        sys.exit(1)


def generate_ts_interface(name, description):
    """
    生成 TypeScript Interface 代码块。

    Args:
        name (str): Interface 名称 (将转换为 PascalCase)
        description (str): 描述文本

    Returns:
        str: TypeScript Interface 代码字符串

    Example:
        >>> generate_ts_interface("konva", "Konva 规则")
        '\\n/**\\n * KonvaRules\\n * @description Konva 规则\\n */\\nexport interface KonvaRules {...}'
    """
    return f"""
/**
 * {to_pascal_case(name)}Rules
 * @description {description}
 */
export interface {to_pascal_case(name)}Rules {{
  /** 
   * 规则描述 
   */
  description: string;
}}
"""


def command_create(args):
    """
    处理 'create' 命令 - 从 Inbox 笔记创建新的规则模块。

    工作流程:
        1. 读取源文件
        2. 应用模板生成内容
        3. (可选) 执行验证命令
        4. 写入目标文件

    Args:
        args: argparse 解析的命令行参数，包含:
            - source: 源文件路径
            - target: 目标文件路径
            - template: 模板类型
            - verify_cmd: 验证命令
            - timeout: 验证超时时间
    """
    source_path = args.source
    target_path = args.target
    template_type = args.template
    verify_cmd = args.verify_cmd
    timeout = args.timeout

    # ========================================
    # 步骤 1: 读取源文件
    # ========================================
    print(f"[1/4] 读取源文件: {source_path}...")
    title, body = parse_markdown_source(source_path)

    # 自清理逻辑: 读取完源文件后立即尝试删除 (如果源文件在 .trae/temp 目录下)
    try:
        abs_src = os.path.abspath(source_path)
        # 简单判断是否为临时文件 (包含 .trae/temp)
        if ".trae" in abs_src and "temp" in abs_src and os.path.exists(abs_src):
             os.remove(abs_src)
             # print(f"Deleted temp source file: {abs_src}") # Debug
    except OSError as e:
        print(f"⚠️ Failed to delete temp source file: {e}")

    # ========================================
    # 步骤 2: 应用模板生成内容
    # ========================================
    print(f"[2/4] 使用模板 '{template_type}' 生成内容...")
    template_content = get_template_content(template_type)

    # 简单模板填充
    # 1. 替换 [ModuleName] 为标题
    content = template_content.replace("[ModuleName]", title)
    content = content.replace("[Short Description]", f"Rules for {title}")

    # 生成 TS Interface 并组装最终内容
    interface_block = generate_ts_interface(title, f"Generated from {os.path.basename(source_path)}")
    final_content = f"# {title}\n\n{interface_block}\n\n{body}"

    # ========================================
    # 步骤 3: 验证 (可选)
    # ========================================
    if verify_cmd:
        print(f"[3/4] 执行验证命令: {verify_cmd}...")
        success, output = run_with_timeout(verify_cmd, timeout)
        if not success:
            print(f"⚠️ 验证失败: {output}")
            # 不中断流程，仅警告
        else:
            print("✅ 验证通过。")
    else:
        print("[3/4] 跳过验证 (未提供验证命令)。")

    # ========================================
    # 步骤 4: 写入目标文件
    # ========================================
    print(f"[4/4] 写入目标文件: {target_path}...")
    os.makedirs(os.path.dirname(target_path), exist_ok=True)
    with open(target_path, 'w', encoding='utf-8') as f:
        f.write(final_content)

    print(f"✅ 成功创建模块: {target_path}")


def command_merge(args):
    """
    处理 'merge' 命令 - 将 Inbox 笔记合并到现有规则模块。

    工作流程:
        1. 读取源文件
        2. 追加到目标文件 (作为新章节)

    Args:
        args: argparse 解析的命令行参数，包含:
            - source: 源文件路径
            - target: 目标文件路径
    """
    source_path = args.source
    target_path = args.target

    # ========================================
    # 步骤 1: 读取源文件
    # ========================================
    print(f"[1/2] 读取源文件: {source_path}...")
    title, body = parse_markdown_source(source_path)

    # 自清理逻辑: 读取完源文件后立即尝试删除 (如果源文件在 .trae/temp 目录下)
    try:
        abs_src = os.path.abspath(source_path)
        if ".trae" in abs_src and "temp" in abs_src and os.path.exists(abs_src):
             os.remove(abs_src)
    except OSError:
        pass

    if not os.path.exists(target_path):
        print(f"❌ 目标文件不存在: {target_path}")
        sys.exit(1)

    # ========================================
    # 步骤 2: 追加到目标文件
    # ========================================
    print(f"[2/2] 追加到目标文件: {target_path}...")

    # 准备追加内容
    append_content = f"\n\n## {title} (Merged)\n\n{body}\n"

    with open(target_path, 'a', encoding='utf-8') as f:
        f.write(append_content)

    # 检查行数，超过 300 行时发出警告
    with open(target_path, 'r', encoding='utf-8') as f:
        line_count = len(f.readlines())
        if line_count > 300:
            print(f"⚠️ 警告: 目标文件已达 {line_count} 行，建议拆分。")

    print(f"✅ 成功合并到: {target_path}")


def command_batch_merge(args):
    """
    处理 'batch-merge' 命令 - 批量合并多个 Inbox 笔记。

    工作流程:
        1. 验证所有源文件
        2. (dry-run 模式) 仅显示计划
        3. 创建/追加内容到目标文件
        4. 执行去重检查

    Args:
        args: argparse 解析的命令行参数，包含:
            - source: 源文件列表 (逗号分隔)
            - target: 目标文件路径
            - dry_run: 是否仅预览
    """
    sources = [s.strip() for s in args.source.split(",")]
    target_path = args.target
    dry_run = args.dry_run

    print(f"🔄 开始批量合并 {len(sources)} 个文件到 {target_path}")

    # ========================================
    # 步骤 1: 验证源文件
    # ========================================
    valid_sources = []
    for src in sources:
        if os.path.exists(src):
            valid_sources.append(src)
        else:
            print(f"⚠️ 警告: 源文件不存在: {src}")

    if not valid_sources:
        print("❌ 未找到有效的源文件。操作终止。")
        sys.exit(1)

    # ========================================
    # 步骤 2: Dry Run 模式
    # ========================================
    if dry_run:
        print("\n[Dry Run 计划]")
        print(f"目标: {target_path}")
        print("待合并源文件:")
        for src in valid_sources:
            title, _ = parse_markdown_source(src)
            print(f"  - {src} (标题: {title})")
        return

    # ========================================
    # 步骤 3: 执行合并
    # ========================================
    # 如果目标文件不存在，创建新文件
    if not os.path.exists(target_path):
        print(f"📄 创建新目标文件: {target_path}")
        # 使用第一个文件的标题作为模块标题
        first_title, _ = parse_markdown_source(valid_sources[0])
        interface_block = generate_ts_interface(first_title, "批量合并模块")
        with open(target_path, 'w', encoding='utf-8') as f:
            f.write(f"# {first_title}\n\n{interface_block}\n")

    # 读取现有内容用于去重
    with open(target_path, 'r', encoding='utf-8') as f:
        existing_content = f.read()

    merged_count = 0
    for i, src in enumerate(valid_sources):
        print(f"[{i+1}/{len(valid_sources)}] 处理 {src}...")
        title, body = parse_markdown_source(src)

        # 自清理逻辑 (临时文件)
        try:
            abs_src = os.path.abspath(src)
            if ".trae" in abs_src and "temp" in abs_src and os.path.exists(abs_src):
                 os.remove(abs_src)
        except OSError:
            pass

        # 简单去重检查 (按标题)
        if f"## {title}" in existing_content:
            print(f"  ℹ️ 跳过重复章节: {title}")
            continue

        # 追加内容
        with open(target_path, 'a', encoding='utf-8') as f:
            f.write(f"\n\n## {title}\n\n{body}\n")
        merged_count += 1

    print(f"\n✅ 批量合并完成。已合并 {merged_count}/{len(valid_sources)} 个文件。")


def main():
    """
    主函数入口 - CLI 命令路由。

    支持的子命令:
        create      创建新规则模块
        merge       合并到现有模块
        batch-merge 批量合并
    """
    parser = argparse.ArgumentParser(description="Knowledge Librarian Archiver CLI - 知识档案员命令行工具")
    subparsers = parser.add_subparsers(dest="command", required=True)

    # ========================================
    # create 命令配置
    # ========================================
    parser_create = subparsers.add_parser("create", help="从 Inbox 笔记创建新的规则模块")
    parser_create.add_argument(
        "--source",
        required=True,
        help="源文件路径 (Inbox 笔记)"
    )
    parser_create.add_argument(
        "--target",
        required=True,
        help="目标文件路径 (规则模块)"
    )
    parser_create.add_argument(
        "--template",
        choices=["new", "guide", "concept", "reference"],
        default="new",
        help="模板类型: new (新模块) / guide (指南) / concept (概念) / reference (参考)"
    )
    parser_create.add_argument(
        "--verify-cmd",
        help="验证命令 (如 grep 命令验证代码存在)"
    )
    parser_create.add_argument(
        "--timeout",
        type=int,
        default=30,
        help="验证超时时间 (秒)，默认 30 秒"
    )

    # ========================================
    # merge 命令配置
    # ========================================
    parser_merge = subparsers.add_parser("merge", help="将 Inbox 笔记合并到现有规则模块")
    parser_merge.add_argument(
        "--source",
        required=True,
        help="源文件路径 (Inbox 笔记)"
    )
    parser_merge.add_argument(
        "--target",
        required=True,
        help="目标文件路径 (规则模块)"
    )

    # ========================================
    # batch-merge 命令配置
    # ========================================
    parser_batch = subparsers.add_parser("batch-merge", help="批量合并多个 Inbox 笔记")
    parser_batch.add_argument(
        "--source",
        required=True,
        help="源文件列表 (逗号分隔)"
    )
    parser_batch.add_argument(
        "--target",
        required=True,
        help="目标文件路径"
    )
    parser_batch.add_argument(
        "--dry-run",
        action="store_true",
        help="仅预览计划，不执行"
    )

    # 解析参数并路由到对应命令
    args = parser.parse_args()

    if args.command == "create":
        command_create(args)
    elif args.command == "merge":
        command_merge(args)
    elif args.command == "batch-merge":
        command_batch_merge(args)


if __name__ == "__main__":
    main()
