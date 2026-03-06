import os
import re

RULES_DIR = r".trae/rules/modules"

def to_pascal_case(kebab_str):
    return "".join(word.title() for word in kebab_str.split("-"))

def fix_legacy_rules():
    print("Fixing legacy rules...")
    print("-" * 30)
    
    fixed_count = 0
    
    if not os.path.exists(RULES_DIR):
        print(f"Directory not found: {RULES_DIR}")
        return

    for root, dirs, files in os.walk(RULES_DIR):
        for file in files:
            if file.endswith(".ts.md"):
                file_path = os.path.join(root, file)
                try:
                    with open(file_path, 'r', encoding='utf-8') as f:
                        content = f.read()
                    
                    # Skip if already has interface
                    if "export interface" in content:
                        continue
                        
                    # Generate Interface Name
                    filename_no_ext = file.replace(".ts.md", "")
                    interface_name = to_pascal_case(filename_no_ext) + "Rules"
                    
                    # Create Interface Definition
                    interface_block = f"""
/**
 * {interface_name}
 * Auto-generated interface for legacy rule file.
 */
export interface {interface_name} {{
  /** 
   * 规则描述 
   * @description 请将下方的 Markdown 内容逐步迁移到此结构化字段中
   */
  description: string;
}}

"""
                    # Insert at the beginning, after the title if exists
                    lines = content.splitlines()
                    new_lines = []
                    inserted = False
                    
                    for i, line in enumerate(lines):
                        new_lines.append(line)
                        # Insert after the first H1 title
                        if not inserted and line.strip().startswith("# "):
                            new_lines.append(interface_block)
                            inserted = True
                            
                    # If no H1 found, insert at top
                    if not inserted:
                        new_lines.insert(0, interface_block)
                        
                    # Write back
                    with open(file_path, 'w', encoding='utf-8') as f:
                        f.write("\n".join(new_lines))
                        
                    print(f"✅ Fixed: {file} -> Added {interface_name}")
                    fixed_count += 1
                            
                except Exception as e:
                    print(f"Error processing {file}: {e}")

    if fixed_count > 0:
        print(f"\n🎉 Successfully fixed {fixed_count} files.")
    else:
        print("\n✨ No legacy files found needing repair.")

if __name__ == "__main__":
    fix_legacy_rules()
