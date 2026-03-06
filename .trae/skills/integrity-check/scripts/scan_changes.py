import os
import subprocess
import re
from datetime import datetime

# 配置
INBOX_DIR = r".trae/rules/inbox/"
INBOX_INDEX_PATH = os.path.join(INBOX_DIR, "index.md")

# 核心模块识别规则 (路径关键词 -> 模块名)
CORE_MODULES_MAP = {
    "src/assets/js/core/": "core",
    "src/assets/js/service/": "service",
    "src/assets/js/components/": "components",
    "src/gadgets/": "gadgets",
    "package.json": "config",
    "vite.config.js": "config",
    ".env": "config"
}

# 忽略规则 (黑名单)
IGNORE_PATTERNS = [
    "package-lock.json",
    "dist/",
    ".log",
    ".DS_Store",
    ".idea/",
    ".vscode/",
    "node_modules/"
]

def get_staged_files():
    """获取 Git 暂存区的文件列表"""
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
        # 过滤掉被忽略的文件
        return [f for f in files if not any(p in f for p in IGNORE_PATTERNS)]
    except subprocess.CalledProcessError:
        return []

def identify_changed_modules(files):
    """识别变更涉及的模块"""
    modules = set()
    for f in files:
        f = f.replace("\\", "/")
        for pattern, module_name in CORE_MODULES_MAP.items():
            if pattern in f or f.endswith(pattern):
                modules.add(module_name)
                break
    return list(modules)

def get_unarchived_notes():
    """获取所有未归档的 Inbox 笔记 (文件名 + 关键词)"""
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
    """检查变更模块是否被笔记覆盖"""
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
    print("Running Integrity Check Scan...")
    
    staged_files = get_staged_files()
    if not staged_files:
        print("✅ No staged files found.")
        return

    changed_modules = identify_changed_modules(staged_files)
    
    if not changed_modules:
        print("✅ No core module changes detected. (Safe to commit)")
        return

    print(f"ℹ️  Detected changes in modules: {', '.join(changed_modules)}")
    
    notes = get_unarchived_notes()
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
