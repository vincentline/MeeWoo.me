#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Knowledge Librarian - 规则健康检查工具
======================================

功能说明:
    检查规则模块目录的健康状态，发现潜在问题并提供修复建议。
    支持自动拆分过大的文件。

使用方式:
    # 执行健康检查
    python check_health.py

    # 拆分过大的文件 (自动创建目录结构)
    python check_health.py --fix-split .trae/rules/modules/media/large-file.ts.md

检查项目:
    1. 文件大小: 超过 300 行的文件会被标记为"过重"
    2. 目录结构: 文件是否放置在正确的领域目录下
    3. 格式规范: 文件是否包含 TypeScript Interface

允许的领域目录:
    - graphics   (图形相关)
    - media      (媒体处理)
    - ui         (界面组件)
    - engineering (工程化)
    - core       (核心架构)
    - data       (数据协议)
    - business   (业务规则)



"""

import os
import re
import argparse
import shutil

# ============================================================================
# 配置常量
# ============================================================================

# 规则模块目录路径
RULES_DIR = r".trae/rules/modules"

# 文件行数阈值 (超过此值视为"过重")
THRESHOLD = 300

# 允许的领域目录列表
ALLOWED_DOMAINS = ["graphics", "media", "ui", "engineering", "core", "data", "business"]


def fix_split(file_path):
    """
    自动拆分过大的文件。

    工作流程:
        1. 创建与文件同名的子目录
        2. 将原文件移动到子目录中，重命名为 '_draft_to_split.md'
        3. 在子目录中创建 'index.ts.md' 骨架文件

    Args:
        file_path (str): 要拆分的文件路径

    Example:
        >>> fix_split(".trae/rules/modules/media/konva.ts.md")
        # 创建: .trae/rules/modules/media/konva/
        # 移动: .trae/rules/modules/media/konva/_draft_to_split.md
        # 创建: .trae/rules/modules/media/konva/index.ts.md
    """
    if not os.path.exists(file_path):
        print(f"❌ 文件不存在: {file_path}")
        return

    file_dir = os.path.dirname(file_path)
    file_name = os.path.basename(file_path)

    # 检查文件扩展名
    if not file_name.endswith(".ts.md"):
        print(f"❌ 文件必须以 .ts.md 结尾: {file_name}")
        return

    # 提取基础名称 (去除 .ts.md 后缀)
    base_name = file_name[:-6]
    target_dir = os.path.join(file_dir, base_name)

    # 创建目标目录
    if os.path.exists(target_dir):
        print(f"⚠️ 目标目录已存在: {target_dir}")
        # 继续执行，但发出警告
    else:
        os.makedirs(target_dir)
        print(f"✅ 已创建目录: {target_dir}")

    # 移动原文件
    draft_path = os.path.join(target_dir, "_draft_to_split.md")
    try:
        shutil.move(file_path, draft_path)
        print(f"✅ 已移动原文件到: {draft_path}")
    except Exception as e:
        print(f"❌ 移动文件失败: {e}")
        return

    # 创建 index.ts.md 骨架
    index_path = os.path.join(target_dir, "index.ts.md")
    interface_name = "".join(word.title() for word in base_name.split("-")) + "Rules"

    index_content = f"""
/**
 * {interface_name} Index
 * @description {base_name} 规则索引。
 * TODO: 在此导入拆分后的子模块。
 */
export interface {interface_name} {{
  // 示例:
  // core: import("./core").{interface_name}Core;
}}
"""
    with open(index_path, 'w', encoding='utf-8') as f:
        f.write(index_content)
    print(f"✅ 已创建索引骨架: {index_path}")
    print(f"\n🚀 准备拆分! 请手动从 '{draft_path}' 提取内容到 '{target_dir}' 中的新 .ts.md 文件。")


def check_health(fix_target=None):
    """
    执行规则模块健康检查。

    检查内容:
        1. 目录结构: 文件是否在允许的领域目录下
        2. 文件大小: 是否超过行数阈值
        3. 格式规范: 是否包含 TypeScript Interface

    Args:
        fix_target (str | None): 要拆分的文件路径，None 则仅检查不修复

    Output:
        打印健康检查报告，列出所有发现的问题
    """
    print("健康检查报告:")
    print("-" * 30)

    # 问题收集
    overweight_files = []      # 过重文件 (行数超标)
    misplaced_files = []       # 位置错误文件
    invalid_format_files = []  # 格式错误文件

    if not os.path.exists(RULES_DIR):
        print(f"目录不存在: {RULES_DIR}")
        return

    # 遍历规则目录
    for root, dirs, files in os.walk(RULES_DIR):
        rel_path = os.path.relpath(root, RULES_DIR)

        # 跳过拆分目录的领域检查 (拆分目录是领域目录的子目录)
        # 只检查顶层目录是否在允许列表中
        top_level_domain = rel_path.split(os.sep)[0] if rel_path != "." else "."

        for file in files:
            if file.endswith(".ts.md"):
                file_path = os.path.join(root, file)

                # ========================================
                # 检查 1: 目录结构
                # ========================================
                if top_level_domain == ".":
                    # 文件直接放在 modules/ 下
                    misplaced_files.append(file_path)
                elif top_level_domain not in ALLOWED_DOMAINS:
                    # 文件放在未授权的目录下
                    misplaced_files.append(file_path)

                try:
                    with open(file_path, 'r', encoding='utf-8') as f:
                        content = f.read()
                        lines = content.splitlines()
                        count = len(lines)

                        # ========================================
                        # 检查 2: 文件大小
                        # ========================================
                        if count > THRESHOLD:
                            overweight_files.append((file_path, count))

                        # ========================================
                        # 检查 3: 格式规范 (TS Interface)
                        # ========================================
                        if "export interface" not in content:
                            invalid_format_files.append(file_path)

                except Exception as e:
                    print(f"读取文件失败 {file}: {e}")

    # ========================================
    # 输出问题报告
    # ========================================
    if misplaced_files:
        print(f"⚠️  发现 {len(misplaced_files)} 个位置错误的文件:")
        for path in misplaced_files:
            print(f"  - {path}")

    if invalid_format_files:
        print(f"⚠️  发现 {len(invalid_format_files)} 个缺少 'export interface' 的文件:")
        for path in invalid_format_files:
            print(f"  - {path}")

    if overweight_files:
        print(f"⚠️  发现 {len(overweight_files)} 个超过 {THRESHOLD} 行的文件:")
        for path, count in overweight_files:
            print(f"  - {path}: {count} 行")

    if not (overweight_files or misplaced_files or invalid_format_files):
        print("✅  所有规则文件状态良好。")

    # ========================================
    # 执行修复 (如果指定)
    # ========================================
    if fix_target:
        print("\n🔧 执行拆分修复...")
        if os.path.isfile(fix_target):
            fix_split(fix_target)
        else:
            print(f"❌ 无效的文件路径: {fix_target}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Knowledge Librarian 健康检查工具")
    parser.add_argument(
        "--fix-split",
        help="指定要拆分的过大文件路径"
    )
    args = parser.parse_args()

    check_health(fix_target=args.fix_split)
