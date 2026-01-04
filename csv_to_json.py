import json
import csv

# 定义需要处理的样式key列表
STYLE_KEYS = [
    'name01',
    'Username01',
    'Assistant',
    'img_2103118107',
    'img_2103118097',
    'img_394'
]

# 读取CSV
rows = []
with open('docs/assets/dar_svga/file-list.csv', 'r', encoding='utf-8-sig') as f:
    reader = csv.DictReader(f)
    rows = list(reader)

# 转换为JSON格式
result = []
for row in rows:
    item = {
        'name': row['name'],
        'svga': row['svga']
    }
    
    text_style = {}
    
    for key in STYLE_KEYS:
        # 检查该key是否有任何属性有值
        has_style = any([
            row.get(f'{key}_fontWeight'),
            row.get(f'{key}_fillColor'),
            row.get(f'{key}_strokeColor'),
            row.get(f'{key}_strokeWidth'),
            row.get(f'{key}_textShadow'),
            row.get(f'{key}_gradient_colors'),
            row.get(f'{key}_multiShadow')
        ])
        
        if has_style:
            style_obj = {}
            
            if row.get(f'{key}_fontWeight'):
                style_obj['fontWeight'] = row[f'{key}_fontWeight']
            if row.get(f'{key}_fillColor'):
                style_obj['fillColor'] = row[f'{key}_fillColor']
            if row.get(f'{key}_strokeColor'):
                style_obj['strokeColor'] = row[f'{key}_strokeColor']
            
            stroke_width = row.get(f'{key}_strokeWidth')
            if stroke_width:
                style_obj['strokeWidth'] = float(stroke_width) if '.' in stroke_width else int(stroke_width)
                
            if row.get(f'{key}_textShadow'):
                style_obj['textShadow'] = row[f'{key}_textShadow']
            
            # 处理gradient
            if row.get(f'{key}_gradient_colors'):
                colors = row[f'{key}_gradient_colors'].split('|')
                pos_str = row.get(f'{key}_gradient_positions', '')
                if pos_str:
                    positions = [float(p) for p in pos_str.split('|')]
                else:
                    # 如果没有位置信息，默认为均匀分布或由使用方处理
                    positions = []
                
                style_obj['gradient'] = {
                    'colors': colors,
                    'positions': positions
                }
            
            # 处理multiShadow
            if row.get(f'{key}_multiShadow'):
                style_obj['multiShadow'] = row[f'{key}_multiShadow'].split('|')
                
            text_style[key] = style_obj
            
    if text_style:
        item['textStyle'] = text_style
    
    result.append(item)

# 写入JSON
with open('docs/assets/dar_svga/file-list.json', 'w', encoding='utf-8') as f:
    json.dump(result, f, ensure_ascii=False, indent=2)

print(f'✅ 已转换 {len(result)} 条数据到 file-list.json')
