import os
import argparse
import sys

# Constants
INBOX_DIR = r".trae/rules/inbox"
INDEX_FILE = os.path.join(INBOX_DIR, "index.md")

def clean_inbox(files_to_remove):
    if not files_to_remove:
        print("No files to remove.")
        return

    # Normalize file names (strip path if provided)
    normalized_files = []
    for f in files_to_remove:
        basename = os.path.basename(f)
        normalized_files.append(basename)

    print(f"Starting cleanup for {len(normalized_files)} files...")

    # 1. Remove files
    removed_count = 0
    failed_files = []
    
    for file_name in normalized_files:
        file_path = os.path.join(INBOX_DIR, file_name)
        
        # Try to remove file
        if os.path.exists(file_path):
            try:
                os.remove(file_path)
                print(f"✅ Deleted file: {file_name}")
                removed_count += 1
            except Exception as e:
                print(f"❌ Error deleting {file_name}: {e}")
                failed_files.append(file_name)
        else:
            print(f"⚠️ Warning: File not found on disk: {file_name} (will still attempt index cleanup)")

    # 2. Update Index
    if os.path.exists(INDEX_FILE):
        try:
            with open(INDEX_FILE, 'r', encoding='utf-8') as f:
                lines = f.readlines()
            
            new_lines = []
            removed_index_lines = 0
            
            # Use a set for faster lookup
            files_set = set(normalized_files)
            
            for line in lines:
                should_keep = True
                
                # Check if this line is an entry for any of the removed files
                # Format: | [filename](filename) | ...
                for file_name in files_set:
                    # Robust check: look for the markdown link pattern
                    # Also check simple filename presence to be safe? 
                    # No, strict link pattern is better to avoid false positives.
                    link_pattern = f"[{file_name}]({file_name})"
                    if link_pattern in line:
                        should_keep = False
                        removed_index_lines += 1
                        print(f"✅ Removed from index: {file_name}")
                        break
                
                if should_keep:
                    new_lines.append(line)
            
            # Write back only if changes were made
            if removed_index_lines > 0:
                with open(INDEX_FILE, 'w', encoding='utf-8') as f:
                    f.writelines(new_lines)
                print(f"Index updated. Removed {removed_index_lines} entries.")
            else:
                print("ℹ️ Index unchanged (no matching entries found).")
            
        except Exception as e:
            print(f"❌ Error updating index: {e}")
    else:
        print(f"⚠️ Warning: Index file not found at {INDEX_FILE}")
    
    print("-" * 30)
    print(f"Cleanup Summary: {removed_count}/{len(normalized_files)} files deleted.")
    if failed_files:
        print(f"Failed to delete: {', '.join(failed_files)}")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(
        description="Clean up archived files from Inbox",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  python clean_inbox.py file1.md file2.md
  python clean_inbox.py .trae/rules/inbox/file1.md
  
Note: Both full paths and filenames are accepted.
        """
    )
    parser.add_argument("files", nargs="+", help="List of files to remove (full path or filename)")
    args = parser.parse_args()
    
    clean_inbox(args.files)
