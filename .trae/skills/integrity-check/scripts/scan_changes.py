import os
import subprocess
from datetime import datetime

# 配置
INBOX_INDEX_PATH = r".trae/rules/inbox/index.md"
CORE_MODULES_PATTERNS = [
    "src/assets/js/core/",
    "src/assets/js/service/",
    "src/assets/js/components/"
]
IGNORE_PATTERNS = [
    ".md", ".json", ".css", ".html", "package.json", ".gitignore"
]

def get_staged_files():
    """获取 Git 暂存区的文件列表"""
    try:
        result = subprocess.run(
            ["git", "diff", "--cached", "--name-only"],
            capture_output=True,
            text=True,
            check=True
        )
        return result.stdout.strip().splitlines()
    except subprocess.CalledProcessError:
        return []

def is_core_change(file_path):
    """判断是否为核心模块变更"""
    # 1. 排除非代码文件
    for ext in IGNORE_PATTERNS:
        if file_path.endswith(ext):
            return False
    
    # 2. 检查是否在核心目录
    for pattern in CORE_MODULES_PATTERNS:
        if pattern in file_path.replace("\\", "/"):
            return True
            
    return False

def check_inbox_update():
    """检查 Inbox 索引今日是否有更新"""
    if not os.path.exists(INBOX_INDEX_PATH):
        return False
        
    today = datetime.now().strftime("%Y-%m-%d")
    try:
        with open(INBOX_INDEX_PATH, 'r', encoding='utf-8') as f:
            content = f.read()
            # 简单检查文件中是否包含今天的日期
            return today in content
    except Exception:
        return False

def main():
    print("Running Integrity Check Scan...")
    
    staged_files = get_staged_files()
    if not staged_files:
        print("✅ No staged files found.")
        return

    core_changes = [f for f in staged_files if is_core_change(f)]
    
    if not core_changes:
        print("✅ No core module changes detected. (Safe to commit)")
        return

    print(f"⚠️  Detected {len(core_changes)} core module changes:")
    for f in core_changes[:3]:
        print(f"  - {f}")
    if len(core_changes) > 3:
        print(f"  - ... and {len(core_changes)-3} more")

    has_inbox_update = check_inbox_update()
    
    if has_inbox_update:
        print("✅ Inbox has been updated today. (Pass)")
    else:
        print("\n❌ WARNING: Core changes detected but NO Inbox entry found for today!")
        print("   Please run /skill knowledge-gardener to record your changes.")
        # 返回非零状态码，便于后续流程判断（可选）
        # sys.exit(1) 

if __name__ == "__main__":
    main()
