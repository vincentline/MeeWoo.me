#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Integrity Check - 变更扫描工具
==============================

功能说明:
    扫描 Git 暂存区的文件变更，检查是否被 Inbox 笔记覆盖。
    用于提交前的完整性检查，确保代码变更有对应的经验记录。

使用方式:
    python scan_changes.py

工作流程:
    1. 获取 Git 暂存区文件列表
    2. 识别变更涉及的模块
    3. 读取 Inbox 索引中的未归档笔记
    4. 检查变更模块是否被笔记覆盖
    5. 输出检查结果

输出格式:
    - 成功: "✅ Changes covered by Inbox notes: xxx.md"
    - 警告: "❌ WARNING: Core changes in xxx are NOT covered!"



"""

import os
import subprocess
import re
from datetime import datetime

# ============================================================================
# 配置常量
# ============================================================================

# Inbox 目录路径 (存放未归档的经验笔记)
INBOX_DIR = r".trae/rules/inbox/"

# Inbox 索引文件路径 (记录所有笔记的元数据)
INBOX_INDEX_PATH = os.path.join(INBOX_DIR, "index.md")

# 核心模块识别规则
# 格式: {路径关键词: 模块名}
# 用于根据文件路径判断所属模块
CORE_MODULES_MAP = {
    "src/assets/js/core/": "core",           # 核心模块
    "src/assets/js/service/": "service",     # 服务层
    "src/assets/js/components/": "components",  # 组件
    "src/gadgets/": "gadgets",               # 小工具
    "package.json": "config",                # 配置文件
    "vite.config.js": "config",              # Vite 配置
    ".env": "config"                         # 环境变量
}

# 忽略规则 (黑名单)
# 这些文件/目录的变更不会触发检查
IGNORE_PATTERNS = [
    "package-lock.json",    # 依赖锁定文件
    "dist/",                # 构建产物
    ".log",                 # 日志文件
    ".DS_Store",            # macOS 系统文件
    ".idea/",               # IDE 配置
    ".vscode/",             # VS Code 配置
    "node_modules/"         # 依赖目录
]


def get_staged_files():
    """
    获取 Git 暂存区的文件列表。

    使用 `git diff --cached --name-only` 命令获取已暂存的文件。
    如果暂存区为空，自动执行 `git add -A` 将所有变更加入暂存区。
    自动过滤掉忽略规则中的文件。

    Returns:
        list[str]: 暂存文件路径列表 (已过滤)

    Example:
        >>> files = get_staged_files()
        >>> print(files)
        ['src/assets/js/core/main.js', 'package.json']
    """
    try:
        result = subprocess.run(
            ["git", "diff", "--cached", "--name-only"],
            capture_output=True,
            text=True,
            encoding='utf-8',
            errors='replace',
            check=True
        )
        files = result.stdout.strip().splitlines() if result.stdout else []
        
        if not files:
            print("ℹ️  Staging area is empty. Running git add -A...")
            subprocess.run(
                ["git", "add", "-A"],
                capture_output=True,
                text=True,
                encoding='utf-8',
                check=True
            )
            result = subprocess.run(
                ["git", "diff", "--cached", "--name-only"],
                capture_output=True,
                text=True,
                encoding='utf-8',
                errors='replace',
                check=True
            )
            files = result.stdout.strip().splitlines() if result.stdout else []
        
        return [f for f in files if not any(p in f for p in IGNORE_PATTERNS)]
    except subprocess.CalledProcessError:
        return []


def identify_changed_modules(files):
    """
    识别变更涉及的模块。

    根据文件路径匹配 CORE_MODULES_MAP 中的规则，
    判断文件属于哪个模块。

    Args:
        files (list[str]): 文件路径列表

    Returns:
        list[str]: 涉及的模块名列表 (去重)

    Example:
        >>> modules = identify_changed_modules(['src/assets/js/core/main.js'])
        >>> print(modules)
        ['core']
    """
    modules = set()
    for f in files:
        f = f.replace("\\", "/")  # 统一使用正斜杠
        for pattern, module_name in CORE_MODULES_MAP.items():
            if pattern in f or f.endswith(pattern):
                modules.add(module_name)
                break
    return list(modules)


def get_unarchived_notes():
    """
    获取所有未归档的 Inbox 笔记。

    解析 Inbox 索引文件，提取所有笔记的文件名和关键词。
    通过检查文件是否存在来判断是否已归档。

    Returns:
        list[dict]: 笔记信息列表，每项包含:
            - file: 文件名
            - keys: 关键词 (小写)

    Example:
        >>> notes = get_unarchived_notes()
        >>> print(notes)
        [{'file': 'fix-canvas-bug.md', 'keys': 'canvas, bug'}]
    """
    notes = []
    if not os.path.exists(INBOX_INDEX_PATH):
        return notes

    try:
        with open(INBOX_INDEX_PATH, 'r', encoding='utf-8') as f:
            for line in f:
                # 解析表格行: | [filename](...) | keywords | ...
                match = re.search(r'\|\s*\[(.*?)\]\(.*?\)\s*\|\s*(.*?)\s*\|', line)
                if match:
                    filename = match.group(1).strip()
                    keywords = match.group(2).strip().lower()
                    # 检查文件是否存在于 inbox 目录 (存在即未归档)
                    if os.path.exists(os.path.join(INBOX_DIR, filename)):
                        notes.append({"file": filename, "keys": keywords})
    except Exception:
        pass
    return notes


def check_coverage(changed_modules, notes):
    """
    检查变更模块是否被笔记覆盖。

    通过关键词匹配判断笔记是否覆盖了变更模块。
    匹配规则: 笔记关键词或文件名包含模块名。

    Args:
        changed_modules (list[str]): 变更模块列表
        notes (list[dict]): Inbox 笔记列表

    Returns:
        tuple[bool, list]:
            - bool: 是否完全覆盖
            - list: 覆盖时返回相关笔记文件名，未覆盖时返回缺失模块名

    Example:
        >>> is_covered, result = check_coverage(['core'], notes)
        >>> if is_covered:
        ...     print(f"覆盖笔记: {result}")
        ... else:
        ...     print(f"缺失模块: {result}")
    """
    if not changed_modules:
        return True, "No core changes"

    # 简单关键词匹配: 只要笔记的关键词里包含模块名，或者文件名包含模块名
    covered_modules = set()
    relevant_notes = []

    for module in changed_modules:
        for note in notes:
            if module in note['keys'] or module in note['file']:
                covered_modules.add(module)
                relevant_notes.append(note['file'])

    missing = set(changed_modules) - covered_modules

    if not missing:
        return True, list(set(relevant_notes))
    else:
        return False, list(missing)


def main():
    """
    主函数入口。

    执行完整的变更扫描流程:
        1. 获取暂存文件 (自动 git add -A 如果暂存区为空)
        2. 识别变更模块
        3. 检查笔记覆盖情况
        4. 输出结果
    """
    print("Running Integrity Check Scan...")

    # 步骤 1: 获取暂存文件 (自动 add 如果为空)
    staged_files = get_staged_files()
    if not staged_files:
        print("✅ No changes to commit.")
        return

    # 步骤 2: 识别变更模块
    changed_modules = identify_changed_modules(staged_files)

    if not changed_modules:
        print("✅ No core module changes detected. (Safe to commit)")
        return

    print(f"ℹ️  Detected changes in modules: {', '.join(changed_modules)}")

    # 步骤 3: 获取未归档笔记
    notes = get_unarchived_notes()

    # 步骤 4: 检查覆盖情况
    is_covered, result = check_coverage(changed_modules, notes)

    if is_covered:
        print(f"✅ Changes covered by Inbox notes: {', '.join(result)}")
        # 输出给 Skill 解析用的特殊标记
        print(f"__REF_NOTES__:{','.join(result)}")
    else:
        print(f"\n❌ WARNING: Core changes in {', '.join(result)} are NOT covered by any active Inbox note!")
        print("   Please run /skill knowledge-gardener to record your changes.")
        # 抛出异常状态码，供 Skill 捕获
        # exit(1)


if __name__ == "__main__":
    main()
