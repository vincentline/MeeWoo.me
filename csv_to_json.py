import json
import csv

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
    
    # 判断是否有textStyle数据
    has_name01 = any([
        row.get('name01_fontWeight'),
        row.get('name01_fillColor'),
        row.get('name01_strokeColor'),
        row.get('name01_strokeWidth'),
        row.get('name01_textShadow'),
        row.get('name01_gradient_colors'),
        row.get('name01_multiShadow')
    ])
    
    has_username01 = any([
        row.get('Username01_fontWeight'),
        row.get('Username01_fillColor'),
        row.get('Username01_strokeColor'),
        row.get('Username01_strokeWidth'),
        row.get('Username01_textShadow'),
        row.get('Username01_gradient_colors'),
        row.get('Username01_multiShadow')
    ])
    
    if has_name01 or has_username01:
        item['textStyle'] = {}
        
        # 处理name01
        if has_name01:
            name01 = {}
            
            if row.get('name01_fontWeight'):
                name01['fontWeight'] = row['name01_fontWeight']
            if row.get('name01_fillColor'):
                name01['fillColor'] = row['name01_fillColor']
            if row.get('name01_strokeColor'):
                name01['strokeColor'] = row['name01_strokeColor']
            if row.get('name01_strokeWidth'):
                name01['strokeWidth'] = float(row['name01_strokeWidth']) if '.' in row['name01_strokeWidth'] else int(row['name01_strokeWidth'])
            if row.get('name01_textShadow'):
                name01['textShadow'] = row['name01_textShadow']
            
            # 处理gradient
            if row.get('name01_gradient_colors'):
                colors = row['name01_gradient_colors'].split('|')
                positions = [float(p) for p in row['name01_gradient_positions'].split('|')]
                name01['gradient'] = {
                    'colors': colors,
                    'positions': positions
                }
            
            # 处理multiShadow
            if row.get('name01_multiShadow'):
                name01['multiShadow'] = row['name01_multiShadow'].split('|')
            
            item['textStyle']['name01'] = name01
        
        # 处理Username01
        if has_username01:
            username01 = {}
            
            if row.get('Username01_fontWeight'):
                username01['fontWeight'] = row['Username01_fontWeight']
            if row.get('Username01_fillColor'):
                username01['fillColor'] = row['Username01_fillColor']
            if row.get('Username01_strokeColor'):
                username01['strokeColor'] = row['Username01_strokeColor']
            if row.get('Username01_strokeWidth'):
                username01['strokeWidth'] = float(row['Username01_strokeWidth']) if '.' in row['Username01_strokeWidth'] else int(row['Username01_strokeWidth'])
            if row.get('Username01_textShadow'):
                username01['textShadow'] = row['Username01_textShadow']
            
            # 处理gradient
            if row.get('Username01_gradient_colors'):
                colors = row['Username01_gradient_colors'].split('|')
                positions = [float(p) for p in row['Username01_gradient_positions'].split('|')]
                username01['gradient'] = {
                    'colors': colors,
                    'positions': positions
                }
            
            # 处理multiShadow
            if row.get('Username01_multiShadow'):
                username01['multiShadow'] = row['Username01_multiShadow'].split('|')
            
            item['textStyle']['Username01'] = username01
    
    result.append(item)

# 写入JSON
with open('docs/assets/dar_svga/file-list.json', 'w', encoding='utf-8') as f:
    json.dump(result, f, ensure_ascii=False, indent=2)

print(f'✅ 已转换 {len(result)} 条数据到 file-list.json')
