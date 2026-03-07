#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Integrity Check - 自动发布工具
==============================

功能说明:
    自动查找并合并由 release-please 创建的发布 PR。
    用于 GitHub Actions 自动化发布流程。

使用方式:
    python release.py

前置条件:
    1. 已安装 GitHub CLI (gh)
    2. 已通过 `gh auth login` 完成认证

工作流程:
    1. 检查 GitHub CLI 是否安装
    2. 检查登录状态
    3. 搜索待处理的 Release PR (标题包含 "chore: release")
    4. 自动合并 PR 并删除分支
    5. 触发 GitHub Actions 进行发布



"""

import subprocess
import json
import sys
import shutil


def run_command(command, timeout=30):
    """
    执行 Shell 命令并返回输出结果。

    Args:
        command (str): 要执行的命令字符串

    Returns:
        str | None: 命令的标准输出内容，失败时返回 None

    Example:
        >>> output = run_command("gh repo list")
        >>> print(output)
    """
    try:
        result = subprocess.run(
            command,
            shell=True,
            check=True,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            encoding='utf-8',
            timeout=timeout
        )
        return result.stdout.strip()
    except subprocess.TimeoutExpired:
        print(f"❌ 命令执行超时 ({timeout}s): {command}")
        return None
    except subprocess.CalledProcessError as e:
        print(f"❌ 命令执行失败: {command}")
        print(f"错误输出: {e.stderr}")
        return None


def check_gh_installed():
    """
    检查 GitHub CLI (gh) 是否已安装。

    验证 gh 命令是否在系统 PATH 中可用。
    如果未安装，打印安装指引并退出程序。

    Raises:
        SystemExit: 当 gh 未安装时退出，状态码为 1
    """
    if not shutil.which("gh"):
        print("❌ GitHub CLI (gh) 未安装或不在 PATH 中。")
        print("请从 https://cli.github.com/ 安装，然后运行 'gh auth login'。")
        sys.exit(1)


def get_release_pr():
    """
    查找由 release-please 创建的待处理发布 PR。

    搜索条件:
        - 状态为 open
        - 标题包含 "chore: release"

    Returns:
        dict | None: PR 信息字典，包含以下字段:
            - number: PR 编号
            - title: PR 标题
            - url: PR 链接
            - headRefName: 分支名称
            如果未找到则返回 None

    Example:
        >>> pr = get_release_pr()
        >>> if pr:
        ...     print(f"找到 PR #{pr['number']}")
    """
    print("🔍 正在搜索待处理的 Release PR...")

    # 搜索标题包含 "chore: release" 的开放 PR
    # 限制返回 1 条结果
    cmd = 'gh pr list --search "chore: release state:open" --json number,title,url,headRefName --limit 1'
    output = run_command(cmd)

    if not output:
        return None

    prs = json.loads(output)
    if not prs:
        return None

    return prs[0]


def merge_pr(pr):
    """
    合并指定的 Pull Request。

    使用 Merge Commit 方式合并，保留完整提交历史。
    合并后自动删除源分支。

    Args:
        pr (dict): PR 信息字典，需包含 'number', 'title', 'url' 字段

    Side Effects:
        - 合并远程 PR
        - 删除 PR 源分支
        - 触发后续 GitHub Actions 工作流
    """
    pr_number = pr['number']
    pr_title = pr['title']
    pr_url = pr['url']

    print(f"🚀 发现 Release PR: #{pr_number} {pr_title}")
    print(f"🔗 链接: {pr_url}")

    # 使用 --merge (Merge Commit) 方式合并，保留历史结构
    # 使用 --delete-branch 清理分支
    print("⏳ 正在合并...")
    cmd = f'gh pr merge {pr_number} --merge --delete-branch'
    result = run_command(cmd)

    if result is not None:
        print(f"✅ 成功合并 PR #{pr_number}!")
        print("🎉 GitHub Actions 将在稍后发布新版本。")
    else:
        print("❌ 合并失败。")


def main():
    """
    主函数入口。

    执行完整的自动发布流程:
        1. 检查 GitHub CLI 安装状态
        2. 验证登录状态
        3. 查找并合并 Release PR
    """
    print("Integrity Check - 自动发布工具")
    print("-" * 30)

    # 步骤 1: 检查 gh 是否安装
    check_gh_installed()

    # 步骤 2: 检查登录状态
    auth_status = run_command("gh auth status")
    if auth_status is None:
        print("❌ 您尚未登录 GitHub CLI。请先运行 'gh auth login'。")
        sys.exit(1)

    # 步骤 3: 查找 Release PR
    pr = get_release_pr()

    if not pr:
        print("ℹ️  未找到待处理的 Release PR。")
        print("   (可能 release-please 尚未创建，或所有变更已发布)")
        return

    # 步骤 4: 合并 PR
    merge_pr(pr)


if __name__ == "__main__":
    main()
