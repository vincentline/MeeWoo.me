import os
import re

RULES_DIR = r".trae/rules/modules"
THRESHOLD = 300
ALLOWED_DOMAINS = ["graphics", "media", "ui", "engineering", "core", "data", "business"] # Add core if needed, though usually separate

def check_health():
    print("Health Check Report:")
    print("-" * 30)
    
    overweight_files = []
    misplaced_files = []
    invalid_format_files = []
    
    if not os.path.exists(RULES_DIR):
        print(f"Directory not found: {RULES_DIR}")
        return

    for root, dirs, files in os.walk(RULES_DIR):
        # Check if current directory is a valid domain
        rel_path = os.path.relpath(root, RULES_DIR)
        if rel_path != "." and rel_path.split(os.sep)[0] not in ALLOWED_DOMAINS:
             # This check is a bit loose, allows subdirectories of allowed domains
             pass

        for file in files:
            if file.endswith(".ts.md"):
                file_path = os.path.join(root, file)
                
                # Check 1: Directory Structure
                if rel_path == ".":
                     misplaced_files.append(file_path)
                elif rel_path.split(os.sep)[0] not in ALLOWED_DOMAINS:
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
        print(f"⚠️  Found {len(misplaced_files)} misplaced files (should be in {ALLOWED_DOMAINS}):")
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

if __name__ == "__main__":
    check_health()
