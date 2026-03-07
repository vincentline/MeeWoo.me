#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Skill Creator - 技能快速验证工具
================================

功能说明:
    对技能目录执行基本验证检查。
    验证 SKILL.md 的结构和 frontmatter 格式。

使用方式:
    python quick_validate.py <skill_directory>

验证项目:
    1. SKILL.md 文件存在
    2. YAML frontmatter 格式正确
    3. 必需字段 (name, description) 存在
    4. name 符合命名规范 (kebab-case)
    5. description 不包含尖括号
    6. name 长度不超过 64 字符
    7. description 长度不超过 1024 字符

允许的 frontmatter 属性:
    - name: 技能名称
    - description: 技能描述
    - license: 许可证
    - allowed-tools: 允许的工具列表
    - metadata: 元数据字典

返回值:
    0: 验证通过
    1: 验证失败



"""

import sys
import os
import re
import yaml
from pathlib import Path


def validate_skill(skill_path):
    """
    执行技能的基本验证。

    验证步骤:
        1. 检查 SKILL.md 存在
        2. 检查 YAML frontmatter 格式
        3. 检查必需字段
        4. 检查命名规范
        5. 检查字段长度限制

    Args:
        skill_path (str | Path): 技能目录路径

    Returns:
        tuple[bool, str]:
            - bool: 验证是否通过
            - str: 验证结果消息
    """
    skill_path = Path(skill_path)

    # ========================================
    # 检查 1: SKILL.md 存在
    # ========================================
    skill_md = skill_path / 'SKILL.md'
    if not skill_md.exists():
        return False, "SKILL.md 未找到"

    # ========================================
    # 检查 2: 读取并验证 frontmatter
    # ========================================
    content = skill_md.read_text(encoding='utf-8')
    if not content.startswith('---'):
        return False, "未找到 YAML frontmatter"

    # 提取 frontmatter
    match = re.match(r'^---\n(.*?)\n---', content, re.DOTALL)
    if not match:
        return False, "frontmatter 格式无效"

    frontmatter_text = match.group(1)

    # 解析 YAML frontmatter
    try:
        frontmatter = yaml.safe_load(frontmatter_text)
        if not isinstance(frontmatter, dict):
            return False, "frontmatter 必须是 YAML 字典"
    except yaml.YAMLError as e:
        return False, f"frontmatter 中的 YAML 无效: {e}"

    # ========================================
    # 检查 3: 验证允许的属性
    # ========================================
    ALLOWED_PROPERTIES = {'name', 'description', 'license', 'allowed-tools', 'metadata'}

    # 检查意外属性 (排除 metadata 下的嵌套键)
    unexpected_keys = set(frontmatter.keys()) - ALLOWED_PROPERTIES
    if unexpected_keys:
        return False, (
            f"SKILL.md frontmatter 中有意外的键: {', '.join(sorted(unexpected_keys))}。"
            f"允许的属性: {', '.join(sorted(ALLOWED_PROPERTIES))}"
        )

    # ========================================
    # 检查 4: 必需字段
    # ========================================
    if 'name' not in frontmatter:
        return False, "frontmatter 中缺少 'name'"

    if 'description' not in frontmatter:
        return False, "frontmatter 中缺少 'description'"

    # ========================================
    # 检查 5: name 验证
    # ========================================
    name = frontmatter.get('name', '')
    if not isinstance(name, str):
        return False, f"name 必须是字符串，得到 {type(name).__name__}"

    name = name.strip()
    if name:
        # 检查命名规范 (kebab-case: 小写字母、数字和连字符)
        if not re.match(r'^[a-z0-9-]+$', name):
            return False, f"name '{name}' 应为 kebab-case (仅限小写字母、数字和连字符)"

        # 检查连字符位置
        if name.startswith('-') or name.endswith('-') or '--' in name:
            return False, f"name '{name}' 不能以连字符开头/结尾或包含连续连字符"

        # 检查长度 (规范要求最大 64 字符)
        if len(name) > 64:
            return False, f"name 过长 ({len(name)} 字符)。最大 64 字符。"

    # ========================================
    # 检查 6: description 验证
    # ========================================
    description = frontmatter.get('description', '')
    if not isinstance(description, str):
        return False, f"description 必须是字符串，得到 {type(description).__name__}"

    description = description.strip()
    if description:
        # 检查尖括号 (可能包含敏感信息)
        if '<' in description or '>' in description:
            return False, "description 不能包含尖括号 (< 或 >)"

        # 检查长度 (规范要求最大 1024 字符)
        if len(description) > 1024:
            return False, f"description 过长 ({len(description)} 字符)。最大 1024 字符。"

    return True, "技能验证通过！"


if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("用法: python quick_validate.py <skill_directory>")
        sys.exit(1)

    valid, message = validate_skill(sys.argv[1])
    print(message)
    sys.exit(0 if valid else 1)
