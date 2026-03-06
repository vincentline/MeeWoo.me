import argparse
import os
import re
import datetime
import sys

# Constants
INBOX_DIR = r".trae/rules/inbox"
TEMPLATES_DIR = r".trae/skills/knowledge-gardener/templates"
INDEX_FILE = os.path.join(INBOX_DIR, "index.md")

# Ensure directories exist
os.makedirs(INBOX_DIR, exist_ok=True)
os.makedirs(TEMPLATES_DIR, exist_ok=True)

def to_kebab_case(s):
    """Converts a string to kebab-case (URL friendly)."""
    # Remove non-alphanumeric characters (except spaces)
    s = re.sub(r'[^\w\s-]', '', s).strip().lower()
    # Replace spaces with hyphens
    s = re.sub(r'[-\s]+', '-', s)
    return s

def get_template_content(type_name):
    """Reads template content based on type."""
    filename = "inbox_note.md" if type_name == "bug" else "inbox_knowledge.md"
    path = os.path.join(TEMPLATES_DIR, filename)
    try:
        with open(path, 'r', encoding='utf-8') as f:
            return f.read()
    except FileNotFoundError:
        # Fallback template if file missing
        return f"# {{title}}\n\n{{content}}\n"

def update_index(filename, title, tags, summary):
    """Atomically appends a new row to the index table."""
    today = datetime.datetime.now().strftime("%Y-%m-%d")
    # Clean inputs for markdown table
    title = title.replace("|", "\\|")
    tags = tags.replace("|", "\\|")
    summary = summary.replace("|", "\\|").replace("\n", " ")
    
    new_row = f"| [{filename}]({filename}) | {tags} | {summary} | {today} |"
    
    if not os.path.exists(INDEX_FILE):
        # Create new index file if missing
        with open(INDEX_FILE, 'w', encoding='utf-8') as f:
            f.write("# Inbox Index (海马体索引)\n\n> 存放尚未归档的临时经验碎片。\n\n| 文件名 | 关键词 | 摘要 | 创建日期 |\n| :--- | :--- | :--- | :--- |\n")
    
    with open(INDEX_FILE, 'r+', encoding='utf-8') as f:
        content = f.read()
        if new_row not in content:
            # Append to end of file, ensuring newline
            if not content.endswith("\n"):
                f.write("\n")
            f.write(new_row + "\n")
            print(f"✅ Updated index: {INDEX_FILE}")
        else:
            print("ℹ️ Index already contains this entry.")

def command_new(args):
    """Handler for 'new' command."""
    title = args.title
    type_name = args.type
    tags = args.tags or ""
    
    # 1. Get Content
    content = ""
    if args.content_file:
        try:
            with open(args.content_file, 'r', encoding='utf-8') as f:
                content = f.read()
        except Exception as e:
            print(f"❌ Error reading content file: {e}")
            sys.exit(1)
    elif args.content:
        content = args.content
    else:
        # If no content provided, use placeholder
        content = "(Content pending...)"

    # 2. Prepare Template & Content
    final_file_content = ""
    
    if args.raw:
        # RAW Mode: Use content directly
        final_file_content = content
    else:
        # Template Mode
        template = get_template_content(type_name)
        # Simple replacement - in reality, Agent should format content to fit template structure.
        # Here we just append the content to the template or replace a generic placeholder if we had one.
        # Since our templates are structured (Section 1, 2, 3), simply replacing {content} isn't enough.
        # STRATEGY: 
        # The Agent is expected to provide the FULLY FORMATTED content if it wants to fit the template perfectly.
        # However, to support the "Simple Input" case, we can do a smart append.
        
        # Actually, the best way for the Agent is to generate the full markdown and pass it via --content-file or --content.
        # But if the Agent uses --type bug, it expects the script to help.
        # Let's assume for "simple" usage, we just replace {title} and append content.
        # For "advanced" usage (Agent), the Agent should likely use --raw or provide formatted content.
        
        # Let's stick to the plan: Script helps with file creation and indexing. 
        # We will put the title in the first line and the content below.
        
        # Re-reading plan: "Agent 提炼信息... 直接调用 python gardener.py".
        # If Agent provides specific sections (Context, Root Cause), it's hard to pass via single string.
        # DECISION: If --raw is NOT used, we try to inject title, but we rely on Agent to format the --content string 
        # to match the template sections OR we just treat --content as the body.
        
        # Let's try to be smart: If content looks like it has headers, use it. 
        # If not, wrap it in the template? No, that's too complex for script.
        # SIMPLEST APPROACH: 
        # 1. Read Template.
        # 2. Replace [Title] or [Topic] in first line with actual title.
        # 3. If --content is provided, we essentially want to fill the "body". 
        #    But the template has specific sections. 
        #    So, we will just Prepend Title and Append Content, unless --raw is used.
        
        # Improved Strategy for "Auto-Templating":
        # We will use a generic header with metadata, then the content.
        # The "Template" files in .trae are actually for the Human/Agent to READ to know WHAT to write.
        # The Script should probably just create a clean file.
        
        # Let's use the content passed by Agent as the SOURCE OF TRUTH.
        # If Agent passes "## 1. Context...", we write it.
        # If Agent passes "Just a simple note", we write it.
        # The script adds the YAML frontmatter or H1 header.
        
        final_file_content = f"# {title}\n> Tags: {tags}\n> Created: {datetime.datetime.now().strftime('%Y-%m-%d')}\n\n{content}"

    # 3. Generate Filename
    filename = f"{to_kebab_case(title)}.md"
    filepath = os.path.join(INBOX_DIR, filename)
    
    # 4. Write File
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(final_file_content)
    print(f"✅ Created note: {filepath}")
    
    # 5. Update Index
    # Generate a short summary from content (first 50 chars)
    summary = content.split('\n')[0][:50] + "..." if len(content) > 50 else content
    update_index(filename, title, tags, summary)

def command_check(args):
    """Handler for 'check' command."""
    keywords = [k.strip().lower() for k in args.keywords.split(',')]
    found = []
    
    if os.path.exists(INDEX_FILE):
        with open(INDEX_FILE, 'r', encoding='utf-8') as f:
            for line in f:
                if line.startswith("| ["):
                    lower_line = line.lower()
                    if any(k in lower_line for k in keywords):
                        # Extract filename from markdown link
                        match = re.search(r'\[(.*?)\]', line)
                        if match:
                            found.append(match.group(1))
    
    if found:
        print("WARN: Found potential duplicates:")
        for item in found:
            print(f"  - {item}")
    else:
        print("PASS: No duplicates found.")

def main():
    parser = argparse.ArgumentParser(description="Knowledge Gardener CLI")
    subparsers = parser.add_subparsers(dest="command", required=True)
    
    # New Command
    parser_new = subparsers.add_parser("new", help="Create a new knowledge note")
    parser_new.add_argument("--type", choices=["bug", "knowledge"], required=True, help="Type of note")
    parser_new.add_argument("--title", required=True, help="Title of the note")
    parser_new.add_argument("--tags", help="Comma-separated tags")
    parser_new.add_argument("--content", help="Content string")
    parser_new.add_argument("--content-file", help="Path to file containing content")
    parser_new.add_argument("--raw", action="store_true", help="Use content as-is without header injection")
    
    # Check Command
    parser_check = subparsers.add_parser("check", help="Check for duplicates")
    parser_check.add_argument("--keywords", required=True)

    args = parser.parse_args()
    
    if args.command == "new":
        command_new(args)
    elif args.command == "check":
        command_check(args)

if __name__ == "__main__":
    main()
