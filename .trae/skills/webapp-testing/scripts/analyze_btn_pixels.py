"""
像素级分析按钮截图——检查左右边缘是否有白色细线
"""
from PIL import Image

img = Image.open('f:/my_tools/Stardot-Official/projects/MeeWoo/.tmp_btn_screenshot.png')
print('图片尺寸:', img.size)
print('图片模式:', img.mode)

w, h = img.size

# 检查左边缘和右边缘的像素
print('\n=== 左边缘前 5 列像素（y=中间行）===')
mid_y = h // 2
for x in range(min(5, w)):
    pixel = img.getpixel((x, mid_y))
    print(f'  x={x}, y={mid_y}: {pixel}')

print('\n=== 右边缘后 5 列像素（y=中间行）===')
for x in range(max(0, w-5), w):
    pixel = img.getpixel((x, mid_y))
    print(f'  x={x}, y={mid_y}: {pixel}')

# 统计每列的"白色像素"数量（白色 = R,G,B 都 > 240）
print('\n=== 各列白色像素统计（前 5 列 + 后 5 列）===')
for x in list(range(min(5, w))) + list(range(max(0, w-5), w)):
    white_count = 0
    for y in range(h):
        p = img.getpixel((x, y))
        if isinstance(p, tuple) and len(p) >= 3:
            r, g, b = p[0], p[1], p[2]
            if r > 240 and g > 240 and b > 240:
                white_count += 1
    print(f'  x={x}: 白色像素 {white_count}/{h}')

# 检查按钮主色（应该是蓝色 rgb(64,158,255)）
print('\n=== 按钮中心像素 ===')
center_pixel = img.getpixel((w//2, h//2))
print(f'  中心点 ({w//2}, {h//2}): {center_pixel}')

# 找出所有非蓝色且非白色的像素（可能是细线）
print('\n=== 非蓝色且非白色的边缘像素 ===')
blue = (64, 158, 255)
for x in range(w):
    for y in range(h):
        p = img.getpixel((x, y))
        if isinstance(p, tuple) and len(p) >= 3:
            r, g, b = p[0], p[1], p[2]
            # 非蓝色（差异大）
            is_blue = abs(r-64) < 30 and abs(g-158) < 30 and abs(b-255) < 30
            # 非白色
            is_white = r > 240 and g > 240 and b > 240
            # 非透明
            is_transparent = len(p) >= 4 and p[3] < 10
            if not is_blue and not is_white and not is_transparent:
                # 只报告边缘像素（前 3 列或后 3 列）
                if x < 3 or x > w - 4:
                    print(f'  ({x}, {y}): {p}')
