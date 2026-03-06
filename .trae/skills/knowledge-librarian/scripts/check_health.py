import os
import re
import argparse
import shutil

RULES_DIR = r".trae/rules/modules"
THRESHOLD = 300
ALLOWED_DOMAINS = ["graphics", "media", "ui", "engineering", "core", "data", "business"]

def fix_split(file_path):
    """
    Automates the scaffolding for splitting a large file.
    1. Creates a subdirectory with the same name as the file (minus extension).
    2. Moves the original file to the subdirectory as '_draft_to_split.md'.
    3. Creates an 'index.ts.md' in the subdirectory with a skeleton interface.
    """
    if not os.path.exists(file_path):
        print(f"❌ File not found: {file_path}")
        return

    file_dir = os.path.dirname(file_path)
    file_name = os.path.basename(file_path)
    
    # Check extension
    if not file_name.endswith(".ts.md"):
        print(f"❌ File must end with .ts.md: {file_name}")
        return

    base_name = file_name[:-6] # Remove .ts.md
    target_dir = os.path.join(file_dir, base_name)
    
    # Create directory
    if os.path.exists(target_dir):
        print(f"⚠️ Target directory already exists: {target_dir}")
        # Proceed with caution or abort? Let's proceed but warn.
    else:
        os.makedirs(target_dir)
        print(f"✅ Created directory: {target_dir}")

    # Move original file
    draft_path = os.path.join(target_dir, "_draft_to_split.md")
    try:
        shutil.move(file_path, draft_path)
        print(f"✅ Moved original file to: {draft_path}")
    except Exception as e:
        print(f"❌ Error moving file: {e}")
        return

    # Create index.ts.md
    index_path = os.path.join(target_dir, "index.ts.md")
    interface_name = "".join(word.title() for word in base_name.split("-")) + "Rules"
    
    index_content = f"""
/**
 * {interface_name} Index
 * @description Index for {base_name} rules.
 * TODO: Import split modules here.
 */
export interface {interface_name} {{
  // Example:
  // core: import("./core").{interface_name}Core;
}}
"""
    with open(index_path, 'w', encoding='utf-8') as f:
        f.write(index_content)
    print(f"✅ Created index skeleton: {index_path}")
    print(f"\n🚀 Ready to split! Please manually extract content from '{draft_path}' into new .ts.md files in '{target_dir}'.")

def check_health(fix_target=None):
    print("Health Check Report:")
    print("-" * 30)
    
    overweight_files = []
    misplaced_files = []
    invalid_format_files = []
    
    if not os.path.exists(RULES_DIR):
        print(f"Directory not found: {RULES_DIR}")
        return

    for root, dirs, files in os.walk(RULES_DIR):
        rel_path = os.path.relpath(root, RULES_DIR)
        
        # Skip checking domain for files inside split directories (which are subdirs of domains)
        # We only check if the top-level folder in modules/ is allowed.
        top_level_domain = rel_path.split(os.sep)[0] if rel_path != "." else "."
        
        for file in files:
            if file.endswith(".ts.md"):
                file_path = os.path.join(root, file)
                
                # Check 1: Directory Structure
                if top_level_domain == ".":
                     misplaced_files.append(file_path)
                elif top_level_domain not in ALLOWED_DOMAINS:
                     misplaced_files.append(file_path)

                try:
                    with open(file_path, 'r', encoding='utf-8') as f:
                        content = f.read()
                        lines = content.splitlines()
                        count = len(lines)
                        
                        # Check 2: File Size
                        if count > THRESHOLD:
                            overweight_files.append((file_path, count))
                            
                        # Check 3: Content Format (TS Interface)
                        if "export interface" not in content:
                            invalid_format_files.append(file_path)
                            
                except Exception as e:
                    print(f"Error reading {file}: {e}")

    # Report Issues
    if misplaced_files:
        print(f"⚠️  Found {len(misplaced_files)} misplaced files:")
        for path in misplaced_files:
            print(f"  - {path}")
            
    if invalid_format_files:
        print(f"⚠️  Found {len(invalid_format_files)} files missing 'export interface':")
        for path in invalid_format_files:
            print(f"  - {path}")

    if overweight_files:
        print(f"⚠️  Found {len(overweight_files)} files exceeding {THRESHOLD} lines:")
        for path, count in overweight_files:
            print(f"  - {path}: {count} lines")
            
    if not (overweight_files or misplaced_files or invalid_format_files):
        print("✅  All rule files are healthy.")

    # Fix Split Logic
    if fix_target:
        print("\n🔧 Executing Fix Split...")
        # Check if fix_target is a file path or "all" (not implemented for safety, prefer explicit path)
        if os.path.isfile(fix_target):
            fix_split(fix_target)
        else:
            print(f"❌ Invalid file path for fix: {fix_target}")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Knowledge Librarian Health Check")
    parser.add_argument("--fix-split", help="Path to the large file to split (scaffolding)")
    args = parser.parse_args()
    
    check_health(fix_target=args.fix_split)
