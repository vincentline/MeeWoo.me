#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Knowledge Librarian - 指挥官调度脚本 (v5.0)
===========================================

功能说明:
    负责批量执行知识归档任务，确保“先归档，后删除”的原子性操作。
    接收 Agent 生成的 JSON 计划，循环调用 archiver.py 和 clean_inbox.py。

使用方式:
    python batch_processor.py --plan plan.json
    python batch_processor.py --plan plan.json --dry-run

Plan JSON 结构示例:
    [
        {
            "source": "note1.md",
            "target": ".trae/rules/modules/media/index.ts.md",
            "action": "merge"
        },
        {
            "source": "note2.md",
            "target": ".trae/rules/modules/graphics/konva.ts.md",
            "action": "create",
            "template": "new"
        }
    ]
"""

import os
import json
import argparse
import subprocess
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

# 脚本路径配置
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
ARCHIVER_SCRIPT = os.path.join(CURRENT_DIR, "archiver.py")
CLEANER_SCRIPT = os.path.join(CURRENT_DIR, "clean_inbox.py")


def run_command(cmd, dry_run=False):
    """执行命令并返回退出码"""
    if dry_run:
        print(f"[Dry Run] Executing: {' '.join(cmd)}")
        return 0
    
    print(f"Executing: {' '.join(cmd)}")
    result = subprocess.run(cmd)
    return result.returncode


def process_plan(plan_path, dry_run=False):
    """
    处理执行计划
    """
    if not os.path.exists(plan_path):
        print(f"❌ Plan file not found: {plan_path}")
        sys.exit(1)

    try:
        with open(plan_path, 'r', encoding='utf-8') as f:
            plan = json.load(f)
    except Exception as e:
        print(f"❌ Failed to load plan JSON: {e}")
        sys.exit(1)

    if not isinstance(plan, list):
        print("❌ Invalid plan format: Root element must be a list.")
        sys.exit(1)

    print(f"📋 Loaded plan with {len(plan)} items.")
    if dry_run:
        print("⚠️ DRY RUN MODE: No changes will be made.")

    stats = {"success": 0, "failed": 0, "skipped": 0}

    for idx, item in enumerate(plan):
        print(f"\n[{idx + 1}/{len(plan)}] Processing {item.get('source', 'unknown')}...")
        
        source = item.get("source")
        target = item.get("target")
        action = item.get("action")
        
        # 基础校验
        if not source or not target or not action:
            print(f"❌ Invalid item structure: {item}")
            stats["failed"] += 1
            continue

        # 如果 source 是文件名，补全路径 (默认在 Inbox)
        if not os.path.dirname(source):
            source_path = os.path.join(".trae/rules/inbox", source)
        else:
            source_path = source

        # Step 1: 归档 (Archive)
        # Use sys.executable to ensure we use the correct python interpreter
        cmd_archive = [sys.executable, ARCHIVER_SCRIPT, action, "--source", source_path, "--target", target]
        
        # 处理 create 动作的额外参数
        if action == "create":
            if "template" in item:
                cmd_archive.extend(["--template", item["template"]])
            if "verify_cmd" in item:
                cmd_archive.extend(["--verify-cmd", item["verify_cmd"]])
        
        # [v6.0] 处理 content_file 参数 (智能结构化)
        if "content_file" in item:
            cmd_archive.extend(["--content-file", item["content_file"]])
        
        # [v6.0] merge 命令也支持 content_file
        if action == "merge" and "content_file" in item:
             # archiver.py 已经处理了，这里不需要额外做什么，extend 会自动追加
             pass
        
        # 处理 batch-merge (特殊情况，通常 Plan 中每个条目对应一个文件，但支持 batch-merge)
        if action == "batch-merge":
             # 此时 source 应该是逗号分隔的字符串
             pass
             
        # Execute Archiver
        if not dry_run:
            print(f"Executing: {' '.join(cmd_archive)}")
            result = subprocess.run(cmd_archive)
            exit_code = result.returncode
        else:
            print(f"[Dry Run] Executing: {' '.join(cmd_archive)}")
            exit_code = 0

        # Step 2: 验证结果
        if exit_code == 0:
            if not dry_run:
                print("✅ Archiving successful.")
            
            # Step 3: 软删除 (Soft Delete)
            if dry_run:
                print(f"[Dry Run] Would run clean_inbox.py for {source_path}")
                stats["success"] += 1
            else:
                cmd_clean = [sys.executable, CLEANER_SCRIPT, source_path]
                print(f"Executing: {' '.join(cmd_clean)}")
                clean_result = subprocess.run(cmd_clean)
                if clean_result.returncode == 0:
                    stats["success"] += 1
                else:
                    print(f"⚠️ Warning: Archiving succeeded but cleanup failed for {source}")
                    # 仍然算成功，因为知识已归档
                    stats["success"] += 1
        else:
            print(f"❌ Archiving failed (Exit Code: {exit_code}). Cleanup skipped.")
            stats["failed"] += 1

    # Final Report
    print("\n" + "="*30)
    print("Execution Report")
    print("="*30)
    print(f"Total Items: {len(plan)}")
    print(f"Success    : {stats['success']}")
    print(f"Failed     : {stats['failed']}")
    print(f"Skipped    : {stats['skipped']}")
    
    # Call Knowledge Doctor for diagnosis after archiving
    print("\n" + "="*30)
    print("Calling Knowledge Doctor for diagnosis...")
    print("="*30)
    
    # Path to Knowledge Doctor scanner script
    doctor_scanner = os.path.join(os.path.dirname(os.path.dirname(CURRENT_DIR)), "knowledge-doctor", "scripts", "scanner.py")
    
    if os.path.exists(doctor_scanner):
        print(f"Executing: {sys.executable} {doctor_scanner} --full")
        doctor_result = subprocess.run([sys.executable, doctor_scanner, "--full"])
        print(f"Knowledge Doctor completed with exit code: {doctor_result.returncode}")
    else:
        print("⚠️ Knowledge Doctor scanner script not found.")
    
    if stats["failed"] > 0:
        sys.exit(1)
    else:
        sys.exit(0)


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Knowledge Librarian Commander (Batch Processor)")
    parser.add_argument("--plan", required=True, help="Path to the JSON execution plan file")
    parser.add_argument("--dry-run", action="store_true", help="Verify plan without executing")
    
    args = parser.parse_args()
    
    process_plan(args.plan, args.dry_run)
