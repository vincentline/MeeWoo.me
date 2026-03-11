# -*- coding: utf-8 -*-
"""目录检查器模块

该模块负责：
1. 检查并创建知识引擎所需的基础目录结构
2. 部署模板文件到指定位置

使用方法：
    from directory_checker import check_and_create_dirs, deploy_templates
    check_and_create_dirs(root_dir)
    deploy_templates(root_dir, skill_root)
"""

import os
import shutil
from error_handler import handle_exception, log_message

# 基础目录结构 
BASE_DIRS = [
    ".trae/logs",      # 日志目录
    ".trae/temp",      # 临时文件目录
    ".trae/trash",     # 回收站目录
    ".trae/rules/core",    # 核心规则目录
    ".trae/rules/inbox",   # 未归档经验目录
    ".trae/rules/logs",    # 规则日志目录
    ".trae/rules/modules"   # 领域规则模块目录
]

# 特别需要检查的目录（可能被.gitignore排除）
SPECIAL_DIRS = [
    ".trae/temp",      # 临时文件目录
    ".trae/trash"      # 回收站目录
]

# 模板映射: (模板路径, 目标路径)
# 模板路径相对于 knowledge-engine-manager/templates
# 目标路径相对于项目根目录
TEMPLATE_MAPPING = {
    "UPDATE_LOG.md": ".trae/logs/UPDATE_LOG.md",                    # 更新日志模板
    "coding-style.ts.md": ".trae/rules/core/coding-style.ts.md",    # 代码风格规范
    "workflows.ts.md": ".trae/rules/core/workflows.ts.md",          # 工作流规范
    "core-rules.md": ".trae/rules/core-rules.md",                  # 核心规则文件
    "index.md": [
        ".trae/rules/index.md",           # 规则索引
        ".trae/rules/inbox/index.md"      # 经验索引
    ],
    "decision-log.md": ".trae/rules/logs/decision-log.md",          # 决策日志
    "error-log.md": ".trae/rules/logs/error-log.md"                # 错误日志
}

@handle_exception
def check_and_create_dirs(root_dir):
    """检查并创建基础目录结构
    
    Args:
        root_dir (str): 项目根目录路径
    
    Returns:
        bool: 操作成功返回 True
    """
    log_message(f"Checking directory structure in {root_dir}...")
    
    # 检查并创建基础目录
    for rel_path in BASE_DIRS:
        full_path = os.path.join(root_dir, rel_path)
        if not os.path.exists(full_path):
            os.makedirs(full_path, exist_ok=True)
            log_message(f"Created directory: {rel_path}", "SUCCESS")
    
    # 特别检查可能被.gitignore排除的目录
    log_message("Checking special directories (may be ignored by .gitignore)...")
    for rel_path in SPECIAL_DIRS:
        full_path = os.path.join(root_dir, rel_path)
        if not os.path.exists(full_path):
            os.makedirs(full_path, exist_ok=True)
            log_message(f"Created special directory: {rel_path}", "SUCCESS")
        else:
            log_message(f"Special directory exists: {rel_path}", "INFO")
    
    return True

@handle_exception
def deploy_templates(root_dir, skill_root):
    """部署模板文件到指定位置
    
    策略：仅当目标文件不存在时创建，避免覆盖用户数据
    
    Args:
        root_dir (str): 项目根目录路径
        skill_root (str): knowledge-engine-manager 的根目录路径
    
    Returns:
        bool: 操作成功返回 True
    """
    templates_dir = os.path.join(skill_root, "templates")
    
    for template_name, target_rel_paths in TEMPLATE_MAPPING.items():
        # 处理单个目标路径或多个目标路径的情况
        if isinstance(target_rel_paths, str):
            target_rel_paths = [target_rel_paths]
            
        src_path = os.path.join(templates_dir, template_name)
        if not os.path.exists(src_path):
            log_message(f"Template not found: {src_path}", "WARNING")
            continue
            
        for rel_path in target_rel_paths:
            target_path = os.path.join(root_dir, rel_path)
            
            # 策略：仅当不存在时创建。避免覆盖用户数据。
            if not os.path.exists(target_path):
                # 确保父目录存在
                os.makedirs(os.path.dirname(target_path), exist_ok=True)
                shutil.copy2(src_path, target_path)
                log_message(f"Deployed template: {rel_path}", "SUCCESS")
                
    return True
