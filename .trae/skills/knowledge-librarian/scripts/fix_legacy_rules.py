#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Knowledge Librarian - 遗留规则修复工具
======================================

功能说明:
    为遗留的规则文件自动添加 TypeScript Interface 定义。
    用于统一规则文件的格式规范。

使用方式:
    python fix_legacy_rules.py

工作流程:
    1. 遍历规则模块目录
    2. 检查每个 .ts.md 文件是否包含 'export interface'
    3. 如果缺失，根据文件名生成 Interface 并插入

生成规则:
    - 文件名: konva.ts.md → Interface: KonvaRules
    - 文件名: media-ffmpeg.ts.md → Interface: MediaFfmpegRules



"""

import os
import re

# ============================================================================
# 配置常量
# ============================================================================

# 规则模块目录路径
RULES_DIR = r".trae/rules/modules"

# 允许的领域目录列表
ALLOWED_DOMAINS = ["graphics", "media", "ui", "engineering", "core", "data", "business"]


def to_pascal_case(kebab_str):
    """
    将 kebab-case 字符串转换为 PascalCase。

    Args:
        kebab_str (str): kebab-case 格式的字符串

    Returns:
        str: PascalCase 格式的字符串

    Example:
        >>> to_pascal_case("konva")
        'Konva'
        >>> to_pascal_case("media-ffmpeg")
        'MediaFfmpeg'
    """
    return "".join(word.title() for word in kebab_str.split("-"))


def fix_legacy_rules():
    """
    修复遗留规则文件。

    为缺少 TypeScript Interface 的文件自动添加定义。
    Interface 会被插入到 H1 标题之后。
    """
    print("正在修复遗留规则...")
    print("-" * 30)

    fixed_count = 0

    if not os.path.exists(RULES_DIR):
        print(f"目录不存在: {RULES_DIR}")
        return

    # 遍历规则目录
    for root, dirs, files in os.walk(RULES_DIR):
        for file in files:
            if file.endswith(".ts.md"):
                file_path = os.path.join(root, file)
                try:
                    with open(file_path, 'r', encoding='utf-8') as f:
                        content = f.read()

                    # 跳过已包含 interface 的文件
                    if "export interface" in content:
                        continue

                    # 生成 Interface 名称
                    filename_no_ext = file.replace(".ts.md", "")
                    interface_name = to_pascal_case(filename_no_ext) + "Rules"

                    # 创建 Interface 定义
                    interface_block = f"""
/**
 * {interface_name}
 * 为遗留规则文件自动生成的 Interface。
 */
export interface {interface_name} {{
  /** 
   * 规则描述 
   * @description 请将下方的 Markdown 内容逐步迁移到此结构化字段中
   */
  description: string;
}}

"""

                    # 插入到 H1 标题之后
                    lines = content.splitlines()
                    new_lines = []
                    inserted = False

                    for i, line in enumerate(lines):
                        new_lines.append(line)
                        # 在第一个 H1 标题后插入
                        if not inserted and line.strip().startswith("# "):
                            new_lines.append(interface_block)
                            inserted = True

                    # 如果没有 H1 标题，插入到文件开头
                    if not inserted:
                        new_lines.insert(0, interface_block)

                    # 写回文件
                    with open(file_path, 'w', encoding='utf-8') as f:
                        f.write("\n".join(new_lines))

                    print(f"✅ 已修复: {file} → 添加 {interface_name}")
                    fixed_count += 1

                except Exception as e:
                    print(f"处理文件失败 {file}: {e}")

    # 输出统计
    if fixed_count > 0:
        print(f"\n🎉 成功修复 {fixed_count} 个文件。")
    else:
        print("\n✨ 未发现需要修复的遗留文件。")


if __name__ == "__main__":
    fix_legacy_rules()
