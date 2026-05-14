#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
CSS 文字样式 → dar_svga/file-list.json textStyle 转换器

功能：
- 将设计师给定的 CSS 文字样式换算为 file-list.json 中 textStyle 的 JSON 格式
- 自动过滤 Canvas 2D 不支持的 CSS 属性
- 支持单个 text-shadow / 多重 multiShadow / linear-gradient 渐变

用法：
  # 从标准输入读取 CSS，输出 textStyle JSON
  python css_to_json.py < style.css

  # 从文件读取
  python css_to_json.py --input style.css

  # 命令行直传 CSS（推荐，免临时文件）
  python css_to_json.py --css-text "font-weight: 700; color: #FFF;"

  # 指定素材 key 名（默认 name01）
  python css_to_json.py --key Username01 --css-text "..."

  # 输出完整 file-list 条目（需要 --name 和 --svga-url）
  python css_to_json.py --name Dnew --svga-url "https://..." --css-text "..."

  # 直接插入到 file-list.json
  python css_to_json.py --name Dnew --svga-url "https://..." \
    --css-text "..." --file-list src/assets/dar_svga/file-list.json

作者：MeeWoo 团队
最后修改：2026-05-15
"""

import re
import sys
import json
import argparse


def parse_css(css_text):
    """
    解析 CSS 文本，提取支持的样式属性
    
    Args:
        css_text: CSS 字符串
    
    Returns:
        dict: { 属性名: 值 }
    """
    styles = {}
    
    # 移除注释
    css_text = re.sub(r'/\*.*?\*/', '', css_text, flags=re.DOTALL)
    
    # 逐条匹配 CSS 声明
    declarations = re.findall(r'([a-zA-Z\-]+)\s*:\s*([^;]+);', css_text)
    
    for prop, value in declarations:
        prop = prop.strip().lower()
        value = value.strip()
        styles[prop] = value
    
    return styles


def extract_linear_gradient(value):
    """
    从 CSS linear-gradient 值中提取颜色和位置
    
    Args:
        value: 如 "linear-gradient(180deg, #FFFAC5 0%, #FEFBD8 20.19%, ...)"
    
    Returns:
        dict: {"colors": [...], "positions": [...]} 或 None
    """
    # 匹配 linear-gradient(...) 内容
    match = re.search(r'linear-gradient\s*\(([^)]+(?:\([^)]*\))?[^)]*)\)', value)
    if not match:
        return None
    
    content = match.group(1)
    
    # 跳过角度参数（如 180deg）
    parts = content.split(',')
    # 第一个参数若是角度则跳过
    start_idx = 1 if re.match(r'\s*\d+(\.\d+)?(deg|rad|grad|turn)\s*$', parts[0].strip()) else 0
    
    colors = []
    positions = []
    
    for part in parts[start_idx:]:
        part = part.strip()
        # 匹配: #COLOR POSITION%
        m = re.match(r'(#[0-9a-fA-F]{3,8}|rgba?\s*\([^)]+\))\s+(\d+(?:\.\d+)?)\s*%?', part)
        if m:
            colors.append(m.group(1))
            positions.append(round(float(m.group(2)) / 100.0, 6))
    
    if not colors:
        return None
    
    return {"colors": colors, "positions": positions}


def extract_text_shadows(value):
    """
    从 CSS text-shadow 值中提取阴影列表
    
    Args:
        value: 如 "0px 1px 0px #BB3000, 0px 3px 0px #F85A0A"
    
    Returns:
        tuple: (textShadow 单条, multiShadow 列表) 或 (None, None)
    """
    # 按逗号分割（注意 rgba 中的逗号）
    shadows = re.split(r',(?![^(]*\))', value)
    shadows = [s.strip() for s in shadows if s.strip()]
    
    if not shadows:
        return None, None
    
    # 转换为标准格式（确保 px 后缀）
    result = []
    for s in shadows:
        result.append(s)
    
    if len(result) == 1:
        return result[0], None
    else:
        return result[0], result


def css_to_textstyle(css_text, key_name="name01"):
    """
    将 CSS 文本转换为 file-list.json textStyle 格式
    
    Args:
        css_text: CSS 字符串
        key_name: 素材 key 名称（默认 name01）
    
    Returns:
        dict: textStyle 条目
    """
    styles = parse_css(css_text)
    textstyle = {}
    
    # 1. font-weight
    if 'font-weight' in styles:
        textstyle['fontWeight'] = styles['font-weight']
    
    # 2. color → fillColor
    if 'color' in styles:
        textstyle['fillColor'] = styles['color']
    
    # 3. -webkit-text-stroke-color → strokeColor
    if '-webkit-text-stroke-color' in styles:
        textstyle['strokeColor'] = styles['-webkit-text-stroke-color']
    
    # 4. -webkit-text-stroke-width → strokeWidth (数字)
    if '-webkit-text-stroke-width' in styles:
        match = re.search(r'([\d.]+)', styles['-webkit-text-stroke-width'])
        if match:
            textstyle['strokeWidth'] = float(match.group(1))
    
    # 4b. border → strokeColor + strokeWidth（设计师常用 border 替代 text-stroke）
    # 仅当上面未通过 -webkit-text-stroke-* 设置时才生效
    if 'strokeColor' not in textstyle and 'strokeWidth' not in textstyle and 'border' in styles:
        border_match = re.match(r'([\d.]+)px\s+solid\s+(#[0-9a-fA-F]{3,8})', styles['border'])
        if border_match:
            textstyle['strokeWidth'] = float(border_match.group(1))
            textstyle['strokeColor'] = border_match.group(2)
    
    # 5. text-shadow → textShadow 或 multiShadow
    if 'text-shadow' in styles:
        single, multi = extract_text_shadows(styles['text-shadow'])
        if multi:
            textstyle['multiShadow'] = multi
        elif single and single.lower() != 'none':
            textstyle['textShadow'] = single
    
    # 6. background → gradient
    bg = styles.get('background', styles.get('background-image', ''))
    if 'linear-gradient' in bg or 'linear-gradient' in styles.get('background', ''):
        gradient_src = bg if 'linear-gradient' in bg else styles.get('background', '')
        gradient = extract_linear_gradient(gradient_src)
        if gradient:
            textstyle['gradient'] = gradient
    
    if not textstyle:
        return None
    
    return {key_name: textstyle}


def make_entry(name, svga_url, textstyle_dict):
    """生成 file-list.json 的完整条目"""
    return {
        "name": name,
        "svga": svga_url,
        "textStyle": textstyle_dict
    }


def add_to_file_list(file_list_path, entry):
    """将条目追加到 file-list.json"""
    try:
        with open(file_list_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
    except (FileNotFoundError, json.JSONDecodeError):
        print(f"⚠ 无法读取 {file_list_path}", file=sys.stderr)
        return False
    
    # 检查重复
    for item in data:
        if item.get('name') == entry['name']:
            print(f"⚠ 条目 '{entry['name']}' 已存在，跳过", file=sys.stderr)
            return False
    
    data.append(entry)
    
    with open(file_list_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
        f.write('\n')
    
    return True


def main():
    parser = argparse.ArgumentParser(
        description='CSS 文字样式 → dar_svga/file-list.json textStyle 转换器'
    )
    parser.add_argument('--input', '-i', help='输入 CSS 文件路径（默认从 stdin 读取）')
    parser.add_argument('--css-text', '-t', help='命令行直传 CSS 文本（推荐，免临时文件）')
    parser.add_argument('--key', '-k', default='name01',
                        help='素材 key 名称（默认 name01，如 Username01）')
    parser.add_argument('--name', '-n', help='头像框名称（生成完整条目时需要）')
    parser.add_argument('--svga-url', '-u', help='SVGA 素材链接（生成完整条目时需要）')
    parser.add_argument('--file-list', '-f', help='file-list.json 路径（直接插入条目）')
    parser.add_argument('--compact', '-c', action='store_true',
                        help='输出紧凑 JSON（不带缩进）')
    
    args = parser.parse_args()
    
    # 读取输入（优先级: --css-text > --input > stdin）
    if args.css_text:
        css_text = args.css_text
    elif args.input:
        try:
            with open(args.input, 'r', encoding='utf-8') as f:
                css_text = f.read()
        except FileNotFoundError:
            print(f"❌ 文件不存在: {args.input}", file=sys.stderr)
            sys.exit(1)
    else:
        css_text = sys.stdin.read()
    
    if not css_text.strip():
        print("❌ 输入为空", file=sys.stderr)
        sys.exit(1)
    
    # 转换
    textstyle = css_to_textstyle(css_text, args.key)
    if not textstyle:
        print("⚠ 未从 CSS 中提取到任何支持的样式属性", file=sys.stderr)
        print("支持的属性: font-weight, color, -webkit-text-stroke-*, text-shadow, background(linear-gradient)")
        sys.exit(1)
    
    # 输出
    indent = None if args.compact else 2
    
    if args.name and args.svga_url:
        entry = make_entry(args.name, args.svga_url, textstyle)
        
        if args.file_list:
            if add_to_file_list(args.file_list, entry):
                print(f"✅ 已添加 '{args.name}' 到 {args.file_list}")
            else:
                sys.exit(1)
        else:
            print(json.dumps(entry, ensure_ascii=False, indent=indent))
    else:
        print(json.dumps(textstyle, ensure_ascii=False, indent=indent))


if __name__ == '__main__':
    main()
