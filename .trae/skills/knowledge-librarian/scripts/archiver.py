import argparse
import os
import re
import datetime
import sys
import subprocess
import signal

# Constants
INBOX_DIR = r".trae/rules/inbox"
TEMPLATES_DIR = r".trae/skills/knowledge-librarian/templates"
MODULES_DIR = r".trae/rules/modules"

# Ensure directories exist
os.makedirs(INBOX_DIR, exist_ok=True)
os.makedirs(TEMPLATES_DIR, exist_ok=True)
os.makedirs(MODULES_DIR, exist_ok=True)

class TimeoutError(Exception):
    pass

def handler(signum, frame):
    raise TimeoutError("Command timed out")

def run_with_timeout(cmd, timeout=30):
    """Run a command with a timeout."""
    # Windows doesn't support signal.alarm, so we use subprocess timeout
    try:
        result = subprocess.run(cmd, shell=True, check=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE, timeout=timeout)
        return True, result.stdout.decode('utf-8')
    except subprocess.TimeoutExpired:
        return False, "Timeout expired"
    except subprocess.CalledProcessError as e:
        return False, e.stderr.decode('utf-8')

def to_pascal_case(s):
    """Converts a string to PascalCase."""
    # Remove non-alphanumeric characters (except spaces)
    s = re.sub(r'[^\w\s]', '', s)
    return "".join(word.title() for word in s.split())

def get_template_content(template_name):
    """Reads template content based on name."""
    filename = f"{template_name}_module.md"
    # Mapping for template aliases
    if template_name == "new": filename = "new_module.md"
    
    path = os.path.join(TEMPLATES_DIR, filename)
    try:
        with open(path, 'r', encoding='utf-8') as f:
            return f.read()
    except FileNotFoundError:
        print(f"⚠️ Template {filename} not found, using default.")
        return "# [ModuleName]\n\n## Overview\n\n[Description]\n"

def parse_markdown_source(source_path):
    """Reads source markdown and tries to extract title and content."""
    try:
        with open(source_path, 'r', encoding='utf-8') as f:
            content = f.read()
            
        lines = content.splitlines()
        title = "Untitled"
        body = content
        
        # Try to extract H1 title
        for line in lines:
            if line.startswith("# "):
                title = line[2:].strip()
                break
                
        return title, body
    except Exception as e:
        print(f"❌ Error reading source file: {e}")
        sys.exit(1)

def generate_ts_interface(name, description):
    """Generates a TS interface block."""
    return f"""
/**
 * {to_pascal_case(name)}Rules
 * @description {description}
 */
export interface {to_pascal_case(name)}Rules {{
  /** 
   * 规则描述 
   */
  description: string;
}}
"""

def command_create(args):
    """Handler for 'create' command."""
    source_path = args.source
    target_path = args.target
    template_type = args.template
    verify_cmd = args.verify_cmd
    timeout = args.timeout

    print(f"[1/4] Reading source: {source_path}...")
    title, body = parse_markdown_source(source_path)
    
    print(f"[2/4] Generating content using template '{template_type}'...")
    template_content = get_template_content(template_type)
    
    # Simple Template Filling
    # 1. Replace [ModuleName] with Title
    content = template_content.replace("[ModuleName]", title)
    content = content.replace("[Short Description]", f"Rules for {title}")
    
    # 2. Inject TS Interface if missing (for new_module template it's there, for others maybe not)
    # The templates seem to have placeholders.
    # Strategy: If it's a 'new' or 'reference' template, we try to be smart about interface naming.
    # Otherwise, we just append the source body to the end or replace a placeholder if we had one.
    
    # Since our source body is the "Meat", and the template is the "Skeleton".
    # We will append the Source Body after the template's header section to preserve structure.
    # But wait, the source body already has headers.
    
    # BETTER STRATEGY: 
    # 1. Create the TS Interface block at the top.
    # 2. Append the Source Body below it.
    
    interface_block = generate_ts_interface(title, f"Generated from {os.path.basename(source_path)}")
    
    final_content = f"# {title}\n\n{interface_block}\n\n{body}"
    
    # 3. Verification (Optional)
    if verify_cmd:
        print(f"[3/4] Verifying with command: {verify_cmd}...")
        success, output = run_with_timeout(verify_cmd, timeout)
        if not success:
            print(f"⚠️ Verification Failed: {output}")
            # We don't abort, just warn, as per plan.
        else:
            print("✅ Verification Passed.")
    else:
        print("[3/4] Skipping verification (no command provided).")

    # 4. Write Target
    print(f"[4/4] Writing to target: {target_path}...")
    os.makedirs(os.path.dirname(target_path), exist_ok=True)
    with open(target_path, 'w', encoding='utf-8') as f:
        f.write(final_content)
        
    print(f"✅ Successfully created module: {target_path}")

def command_merge(args):
    """Handler for 'merge' command."""
    source_path = args.source
    target_path = args.target
    
    print(f"[1/2] Reading source: {source_path}...")
    title, body = parse_markdown_source(source_path)
    
    if not os.path.exists(target_path):
        print(f"❌ Target file does not exist: {target_path}")
        sys.exit(1)
        
    print(f"[2/2] Appending to target: {target_path}...")
    
    # Prepare append content
    append_content = f"\n\n## {title} (Merged)\n\n{body}\n"
    
    with open(target_path, 'a', encoding='utf-8') as f:
        f.write(append_content)
        
    # Check line count
    with open(target_path, 'r', encoding='utf-8') as f:
        line_count = len(f.readlines())
        if line_count > 300:
            print(f"⚠️ Warning: Target file is now {line_count} lines long. Consider splitting.")
            
    print(f"✅ Successfully merged into: {target_path}")

def main():
    parser = argparse.ArgumentParser(description="Knowledge Librarian Archiver CLI")
    subparsers = parser.add_subparsers(dest="command", required=True)
    
    # Create Command
    parser_create = subparsers.add_parser("create", help="Create a new rule module from inbox note")
    parser_create.add_argument("--source", required=True, help="Path to inbox source file")
    parser_create.add_argument("--target", required=True, help="Path to target rule file")
    parser_create.add_argument("--template", choices=["new", "guide", "concept", "reference"], default="new", help="Template type")
    parser_create.add_argument("--verify-cmd", help="Command to verify code existence (e.g. grep)")
    parser_create.add_argument("--timeout", type=int, default=30, help="Timeout for verification in seconds")
    
    # Merge Command
    parser_merge = subparsers.add_parser("merge", help="Merge inbox note into existing rule module")
    parser_merge.add_argument("--source", required=True, help="Path to inbox source file")
    parser_merge.add_argument("--target", required=True, help="Path to target rule file")

    args = parser.parse_args()
    
    if args.command == "create":
        command_create(args)
    elif args.command == "merge":
        command_merge(args)

if __name__ == "__main__":
    main()
