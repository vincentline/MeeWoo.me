import os
import re

RULES_DIR = r".trae/rules/modules"
THRESHOLD = 300

def check_health():
    print("Health Check Report:")
    print("-" * 30)
    
    overweight_files = []
    
    if not os.path.exists(RULES_DIR):
        print(f"Directory not found: {RULES_DIR}")
        return

    for root, dirs, files in os.walk(RULES_DIR):
        for file in files:
            if file.endswith(".ts.md"):
                file_path = os.path.join(root, file)
                try:
                    with open(file_path, 'r', encoding='utf-8') as f:
                        lines = f.readlines()
                        count = len(lines)
                        if count > THRESHOLD:
                            overweight_files.append((file_path, count))
                except Exception as e:
                    print(f"Error reading {file}: {e}")

    if overweight_files:
        print(f"⚠️  Found {len(overweight_files)} files exceeding {THRESHOLD} lines:")
        for path, count in overweight_files:
            print(f"  - {path}: {count} lines")
    else:
        print("✅  All rule files are healthy.")

if __name__ == "__main__":
    check_health()
