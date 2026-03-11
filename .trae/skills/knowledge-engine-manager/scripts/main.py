# -*- coding: utf-8 -*-
"""知识引擎管理主脚本

该脚本是知识引擎管理器的入口点，支持以下操作：
1. install: 安装知识引擎
2. update: 更新知识引擎
3. reinstall: 重新安装知识引擎

使用方法：
    python main.py install [--root <project_root>]
    python main.py update [--root <project_root>]
    python main.py reinstall [--root <project_root>]

功能流程：
1. 检查并创建目录结构
2. 部署模板文件
3. 检查技术栈文件
4. 管理 Git 子模块
5. 安装项目依赖
"""

import os
import sys
import argparse
from error_handler import handle_exception, log_message
import directory_checker
import git_manager
import dependency_manager

# Knowledge Engine 目录
KNOWLEDGE_ENGINE_DIR = "knowledge-engine"

@handle_exception
def check_index_files(root_dir):
    """检查并生成 index.md 文件内容
    
    Args:
        root_dir (str): 项目根目录路径
    
    Returns:
        bool: 需要生成内容返回 True，否则返回 False
    """
    # 检查 rules/index.md
    rules_index_path = os.path.join(root_dir, ".trae", "rules", "index.md")
    if os.path.exists(rules_index_path):
        with open(rules_index_path, 'r', encoding='utf-8') as f:
            content = f.read().strip()
            # 检查内容是否只是模板，没有实际内容
            if content == "---\nalwaysApply: true\n---\n# 规则索引 (Rules Index)\n\n> 自动生成的索引文件。":
                return True
    return False

@handle_exception
def main():
    """主函数
    
    解析命令行参数并执行相应的操作
    """
    parser = argparse.ArgumentParser(description="Knowledge Engine Manager")
    parser.add_argument("action", choices=["install", "update", "reinstall"], help="Action to perform")
    parser.add_argument("--root", default=os.getcwd(), help="Project root directory")
    args = parser.parse_args()
    
    root_dir = os.path.abspath(args.root)
    # 获取脚本所在的目录 (scripts) 的父目录 (knowledge-engine-manager)
    skill_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    
    # 状态变量
    status = {
        "directories": "CREATED",
        "templates": "DEPLOYED",
        "tech_stack": "EXISTS",
        "submodule": "SUCCESS",
        "dependencies": "SKIPPED",
        "next_step": "None"
    }
    
    log_message(f"Starting Knowledge Engine Manager ({args.action})...", "HEADER")
    log_message(f"Project Root: {root_dir}")
    log_message(f"Skill Root: {skill_root}")
    
    # 1. 目录检查
    log_message("Step 1: Checking directories...", "HEADER")
    directory_checker.check_and_create_dirs(root_dir)
    directory_checker.deploy_templates(root_dir, skill_root)
    
    # 2. 检查 index.md 文件是否需要生成内容
    if check_index_files(root_dir):
        log_message("Index files need content generation.", "WARNING")
        # 输出特定标记供 Agent 识别
        print("[STATE] NEED_INDEX_GENERATION")
        print("[ACTION] Agent should generate content for .trae/rules/index.md based on current rules structure")
        status["next_step"] = "Agent should generate index.md content"
    
    # 3. 技术栈检查 (由 Agent 后续处理，这里只做标记)
    tech_stack_path = os.path.join(root_dir, ".trae", "rules", "core", "tech-stack.ts.md")
    # 检查文件是否存在且内容是否为空（或仅包含空白字符）
    need_analysis = False
    if not os.path.exists(tech_stack_path):
        need_analysis = True
    else:
        with open(tech_stack_path, 'r', encoding='utf-8') as f:
            content = f.read().strip()
            if not content:
                need_analysis = True
    
    if need_analysis:
        log_message("Tech Stack file is missing or empty.", "WARNING")
        # 输出特定标记供 Agent 识别
        print("[STATE] NEED_TECH_STACK_ANALYSIS")
        print("[ACTION] Agent should analyze package.json/requirements.txt and create .trae/rules/core/tech-stack.ts.md")
        status["tech_stack"] = "NEEDED"
        status["next_step"] = "Agent should create tech-stack.ts.md manually"
    else:
        status["tech_stack"] = "EXISTS"
    
    # 3. 检查 knowledge-engine 目录
    ke_path = os.path.join(root_dir, KNOWLEDGE_ENGINE_DIR)
    ke_exists = os.path.exists(ke_path) and os.listdir(ke_path)
    ke_valid = False
    if ke_exists:
        ke_valid = git_manager.is_valid_git_repo(ke_path)
    
    # 4. Git 管理
    log_message("Step 2: Managing Knowledge Engine...", "HEADER")
    if not git_manager.check_git_status(root_dir):
        log_message("Skipping Git operations (not a git repo).", "WARNING")
        status["submodule"] = "SKIPPED"
        status["next_step"] = "Initialize git repository first"
    else:
        # 检查是否存在现有子模块在其他位置
        has_existing, existing_path = git_manager.check_existing_submodule(root_dir)
        
        if has_existing and existing_path != KNOWLEDGE_ENGINE_DIR:
            # 子模块在其他目录，需要迁移
            log_message(f"Found existing submodule at {existing_path}, will migrate to {KNOWLEDGE_ENGINE_DIR}", "INFO")
            print("[STATE] KE_MIGRATION_NEEDED")
            print(f"[ACTION] Agent should migrate submodule from {existing_path} to {KNOWLEDGE_ENGINE_DIR}")
            status["submodule"] = "MIGRATION_NEEDED"
            status["next_step"] = "Agent should migrate submodule to knowledge-engine directory"
        else:
            # 根据操作类型执行相应的 Git 操作
            if args.action == "install":
                if ke_exists:
                    if ke_valid:
                        # 输出特定标记供 Agent 识别
                        print("[STATE] KE_EXISTS")
                        print("[ACTION] Agent should ask user: update or reinstall or cancel")
                        log_message(f"{KNOWLEDGE_ENGINE_DIR} directory already exists and is valid.", "INFO")
                        status["submodule"] = "EXISTS"
                        status["next_step"] = "Agent should ask user for action"
                        return
                    else:
                        # 输出特定标记供 Agent 识别
                        print("[STATE] KE_EXISTS_INVALID")
                        print("[ACTION] Agent should ask user: delete and recreate or cancel")
                        log_message(f"{KNOWLEDGE_ENGINE_DIR} directory exists but is not valid.", "ERROR")
                        status["submodule"] = "INVALID"
                        status["next_step"] = "Agent should ask user for action"
                        return
                else:
                    # 安装子模块
                    success = git_manager.install_submodule(root_dir, "install")
                    if success:
                        status["submodule"] = "SUCCESS"
                    else:
                        status["submodule"] = "FAILED"
                        status["next_step"] = "Check git status and try again"
            elif args.action == "update":
                if not ke_exists:
                    log_message(f"{KNOWLEDGE_ENGINE_DIR} directory not found. Cannot update.", "ERROR")
                    status["submodule"] = "NOT_FOUND"
                    status["next_step"] = "Install knowledge engine first"
                    return
                
                if not ke_valid:
                    print("[STATE] KE_EXISTS_INVALID")
                    print("[ACTION] Agent should ask user: delete and recreate or cancel")
                    log_message(f"{KNOWLEDGE_ENGINE_DIR} directory exists but is not valid.", "ERROR")
                    status["submodule"] = "INVALID"
                    status["next_step"] = "Agent should ask user for action"
                    return
                
                # 检查是否有未提交更改
                if git_manager.check_dirty(root_dir):
                    # 输出特定标记供 Agent 识别
                    print("[STATE] DIRTY_STATE_DETECTED")
                    print("[ACTION] Agent should ask user: commit or discard changes")
                    log_message(f"Local changes detected in {KNOWLEDGE_ENGINE_DIR}. Please commit or discard them.", "WARNING")
                    status["submodule"] = "DIRTY"
                    status["next_step"] = "Agent should ask user for action"
                    return
                
                # 同步子模块
                success = git_manager.install_submodule(root_dir, "update")
                if success:
                    status["submodule"] = "SUCCESS"
                else:
                    status["submodule"] = "FAILED"
                    status["next_step"] = "Check network connection and try again"
            elif args.action == "reinstall":
                # 重新安装子模块
                success = git_manager.install_submodule(root_dir, "reinstall")
                if success:
                    status["submodule"] = "SUCCESS"
                else:
                    status["submodule"] = "FAILED"
                    status["next_step"] = "Check git status and try again"
                
    # 5. 依赖管理
    log_message("Step 3: Checking dependencies...", "HEADER")
    # 检查 knowledge-engine 目录下的依赖
    ke_path = os.path.join(root_dir, KNOWLEDGE_ENGINE_DIR)
    if os.path.exists(ke_path):
        dependency_manager.install_dependencies(ke_path)
        status["dependencies"] = "INSTALLED"
    else:
        log_message(f"{KNOWLEDGE_ENGINE_DIR} directory not found. Skipping dependency installation.", "WARNING")
        status["dependencies"] = "SKIPPED"
    
    # 6. 输出状态总结
    log_message("\n[STATE] SUMMARY", "HEADER")
    print("[SUMMARY]")
    print(f"- Directories: {status['directories']}")
    print(f"- Templates: {status['templates']}")
    print(f"- TechStack: {status['tech_stack']}")
    print(f"- Submodule: {status['submodule']}")
    print(f"- Dependencies: {status['dependencies']}")
    print(f"- NextStep: {status['next_step']}")
    
    # 7. 最终状态
    if status["submodule"] == "SUCCESS" and status["tech_stack"] == "EXISTS":
        log_message("Operation completed successfully!", "SUCCESS")
        print("[STATE] SUCCESS")
    else:
        if status["submodule"] == "FAILED":
            log_message("Operation failed!", "ERROR")
        else:
            log_message("Operation completed with some issues.", "WARNING")

if __name__ == "__main__":
    main()
