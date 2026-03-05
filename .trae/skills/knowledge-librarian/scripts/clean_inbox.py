import os

INBOX_DIR = r".trae/rules/inbox"
INDEX_FILE = r".trae/rules/inbox/index.md"

def clean_inbox(files_to_remove):
    if not files_to_remove:
        print("No files to remove.")
        return

    # 1. Remove files
    removed_count = 0
    for file_name in files_to_remove:
        file_path = os.path.join(INBOX_DIR, file_name)
        if os.path.exists(file_path):
            try:
                os.remove(file_path)
                print(f"Deleted: {file_name}")
                removed_count += 1
            except Exception as e:
                print(f"Error deleting {file_name}: {e}")
        else:
            print(f"File not found: {file_name}")

    # 2. Update Index
    if os.path.exists(INDEX_FILE):
        try:
            with open(INDEX_FILE, 'r', encoding='utf-8') as f:
                lines = f.readlines()
            
            new_lines = []
            for line in lines:
                # Simple check: if any removed file name is in the line, skip it
                should_keep = True
                for file_name in files_to_remove:
                    if file_name in line:
                        should_keep = False
                        break
                
                if should_keep:
                    new_lines.append(line)
            
            with open(INDEX_FILE, 'w', encoding='utf-8') as f:
                f.writelines(new_lines)
            
            print(f"Updated index.md (Removed {len(lines) - len(new_lines)} lines)")
            
        except Exception as e:
            print(f"Error updating index: {e}")
    
    print(f"Cleanup complete. Removed {removed_count} files.")

if __name__ == "__main__":
    import sys
    # Accept file names as arguments
    files = sys.argv[1:]
    clean_inbox(files)
