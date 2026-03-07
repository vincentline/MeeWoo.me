#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Skill Creator - 技能打包工具
============================

功能说明:
    将技能目录打包为可分发的 .skill 文件。
    打包前会自动执行验证检查。

使用方式:
    # 打包技能到当前目录
    python package_skill.py <path/to/skill-folder>

    # 打包技能到指定目录
    python package_skill.py <path/to/skill-folder> [output-directory]

示例:
    # 打包到当前目录
    python package_skill.py skills/public/my-skill

    # 打包到 dist 目录
    python package_skill.py skills/public/my-skill ./dist

输出格式:
    .skill 文件实际上是 ZIP 格式，包含完整的技能目录结构。

工作流程:
    1. 验证技能目录存在
    2. 验证 SKILL.md 存在
    3. 执行快速验证
    4. 创建 .skill 文件 (ZIP 格式)



"""

import sys
import zipfile
from pathlib import Path
from quick_validate import validate_skill


def package_skill(skill_path, output_dir=None):
    """
    将技能目录打包为 .skill 文件。

    工作流程:
        1. 验证技能目录存在
        2. 验证 SKILL.md 存在
        3. 执行快速验证
        4. 创建 .skill 文件 (ZIP 格式)

    Args:
        skill_path (str): 技能目录路径
        output_dir (str | None): 输出目录，默认为当前目录

    Returns:
        Path | None: 创建的 .skill 文件路径，失败时返回 None
    """
    skill_path = Path(skill_path).resolve()

    # 验证技能目录存在
    if not skill_path.exists():
        print(f"❌ 错误: 技能目录不存在: {skill_path}")
        return None

    if not skill_path.is_dir():
        print(f"❌ 错误: 路径不是目录: {skill_path}")
        return None

    # 验证 SKILL.md 存在
    skill_md = skill_path / "SKILL.md"
    if not skill_md.exists():
        print(f"❌ 错误: SKILL.md 未在 {skill_path} 中找到")
        return None

    # 打包前执行验证
    print("🔍 验证技能...")
    valid, message = validate_skill(skill_path)
    if not valid:
        print(f"❌ 验证失败: {message}")
        print("   请在打包前修复验证错误。")
        return None
    print(f"✅ {message}\n")

    # 确定输出位置
    skill_name = skill_path.name
    if output_dir:
        output_path = Path(output_dir).resolve()
        output_path.mkdir(parents=True, exist_ok=True)
    else:
        output_path = Path.cwd()

    skill_filename = output_path / f"{skill_name}.skill"

    # 创建 .skill 文件 (ZIP 格式)
    try:
        with zipfile.ZipFile(skill_filename, 'w', zipfile.ZIP_DEFLATED) as zipf:
            # 遍历技能目录
            for file_path in skill_path.rglob('*'):
                if file_path.is_file():
                    # 计算 ZIP 内的相对路径
                    arcname = file_path.relative_to(skill_path.parent)
                    zipf.write(file_path, arcname)
                    print(f"  已添加: {arcname}")

        print(f"\n✅ 成功打包技能到: {skill_filename}")
        return skill_filename

    except Exception as e:
        print(f"❌ 创建 .skill 文件失败: {e}")
        return None


def main():
    """
    主函数入口 - CLI 命令解析和执行。
    """
    if len(sys.argv) < 2:
        print("用法: python package_skill.py <path/to/skill-folder> [output-directory]")
        print("\n示例:")
        print("  python package_skill.py skills/public/my-skill")
        print("  python package_skill.py skills/public/my-skill ./dist")
        sys.exit(1)

    skill_path = sys.argv[1]
    output_dir = sys.argv[2] if len(sys.argv) > 2 else None

    print(f"📦 打包技能: {skill_path}")
    if output_dir:
        print(f"   输出目录: {output_dir}")
    print()

    result = package_skill(skill_path, output_dir)

    if result:
        sys.exit(0)
    else:
        sys.exit(1)


if __name__ == "__main__":
    main()
