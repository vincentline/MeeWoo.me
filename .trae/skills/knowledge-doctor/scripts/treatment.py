#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Knowledge Doctor - Treatment Execution Script (v1.0)
====================================================

功能说明:
    负责执行知识医生的治疗计划，支持文件的创建、更新和静默删除（软删除）。
    所有删除操作都会将文件移动到 .trae/trash/，确保安全。

使用方式:
    python treatment.py --plan plan.json

Plan JSON 结构示例:
    [
        {
            "action": "update",
            "target": ".trae/rules/modules/ui/button.ts.md",
            "content_file": ".trae/temp/fixed_button.md"
        },
        {
            "action": "delete",
            "target": ".trae/rules/modules/ui/old_button.md"
        }
    ]
"""

import os
import json
import argparse
import shutil
import datetime
import sys

# 配置常量
TRASH_DIR = r".trae/trash"

def get_trash_path(filename):
    """生成回收站中的目标路径"""
    basename = os.path.basename(filename)
    timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
    name, ext = os.path.splitext(basename)
    new_name = f"{name}_{timestamp}{ext}"
    return os.path.join(TRASH_DIR, new_name)

def soft_delete(file_path):
    """软删除：移动文件到回收站"""
    if not os.path.exists(file_path):
        print(f"⚠️ File not found, skipping delete: {file_path}")
        return False
    
    try:
        os.makedirs(TRASH_DIR, exist_ok=True)
        trash_path = get_trash_path(file_path)
        shutil.move(file_path, trash_path)
        print(f"🗑️ Soft deleted: {file_path} -> {trash_path}")
        return True
    except Exception as e:
        print(f"❌ Failed to soft delete {file_path}: {e}")
        return False

def write_file(target_path, content):
    """写入文件（如果已存在则先备份）"""
    if os.path.exists(target_path):
        print(f"📦 Backing up existing file before overwrite...")
        soft_delete(target_path)
    
    try:
        os.makedirs(os.path.dirname(target_path), exist_ok=True)
        with open(target_path, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"✅ Wrote to: {target_path}")
        return True
    except Exception as e:
        print(f"❌ Failed to write {target_path}: {e}")
        return False

def process_plan(plan_path, dry_run=False):
    if not os.path.exists(plan_path):
        print(f"❌ Plan file not found: {plan_path}")
        sys.exit(1)

    try:
        with open(plan_path, 'r', encoding='utf-8') as f:
            plan = json.load(f)
    except Exception as e:
        print(f"❌ Failed to load plan JSON: {e}")
        sys.exit(1)

    print(f"📋 Loaded treatment plan with {len(plan)} items.")
    
    success_count = 0
    
    for idx, item in enumerate(plan):
        action = item.get("action")
        target = item.get("target")
        
        print(f"\n[{idx + 1}/{len(plan)}] Action: {action} -> {target}")
        
        if not target:
            print("❌ Missing target path.")
            continue

        if dry_run:
            print("[Dry Run] Would execute action.")
            continue

        # 处理内容来源 (Handle Content Source)
        content = item.get("content")
        content_file = item.get("content_file")
        
        if content_file and os.path.exists(content_file):
            try:
                with open(content_file, 'r', encoding='utf-8') as f:
                    content = f.read()
            except Exception as e:
                print(f"❌ Failed to read content file {content_file}: {e}")
                continue

        # 执行动作 (Execute Actions)
        if action == "delete":
            if soft_delete(target):
                success_count += 1
        
        elif action in ["create", "update", "rewrite"]:
            if content is None:
                print("❌ Missing content or content_file for write operation.")
                continue
            if write_file(target, content):
                success_count += 1
                
        else:
            print(f"❌ Unknown action: {action}")

    print(f"\n✨ Treatment completed. {success_count}/{len(plan)} successful.")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Knowledge Doctor Treatment Executor")
    parser.add_argument("--plan", required=True, help="Path to JSON plan")
    parser.add_argument("--dry-run", action="store_true", help="Simulate execution")
    args = parser.parse_args()
    
    process_plan(args.plan, args.dry_run)
