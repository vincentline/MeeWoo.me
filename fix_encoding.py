# -*- coding: utf-8 -*-
"""修复CSS文件中的中文乱码"""
import re

# 读取文件
with open('docs/assets/css/styles.css', 'r', encoding='utf-8') as f:
    lines = f.readlines()

# 已知乱码行的行号和修正内容（行号从1开始）
fixes = {
    1310: '/* 暗黑模式 */\n',
    1345: '/* 进度条 */\n',
    1389: '/* 进度条滑块 */\n',
    2873: '/* 标题区 */\n',
    3109: '/* 尺寸输入 */\n',
    3195: '/* Disabled状态样式 */\n',
    3217: '/* 输入框wrapper disabled */\n',
    3240: '/* 输入框disabled */\n',
    3270: '/* 暗黑模式disabled状态 */\n',
}

# 修复指定行
for line_num, fix_content in fixes.items():
    if line_num <= len(lines):
        lines[line_num - 1] = fix_content

# 写回文件
with open('docs/assets/css/styles.css', 'w', encoding='utf-8') as f:
    f.writelines(lines)

print(f'修复完成，修复了 {len(fixes)} 处乱码')
