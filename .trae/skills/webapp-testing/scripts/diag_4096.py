"""诊断：4096×4096 图片压缩失败根因

生成真实 4096×4096 PNG，上传压缩，抓取控制台日志确定失败点。
"""

import os
import struct
import zlib
from playwright.sync_api import sync_playwright

URL = 'http://localhost:8085/gadgets/png_compression.html'
ASSETS_DIR = os.path.dirname(os.path.abspath(__file__))
BIG_PNG = os.path.join(ASSETS_DIR, '_test_4096.png')


def make_4096_png():
    """生成一张合法的 4096×4096 PNG（RGB 噪点，模拟真实图片）"""
    import random
    width, height = 4096, 4096
    raw = b''
    for y in range(height):
        raw += b'\x00'  # filter byte
        for x in range(width):
            raw += bytes([random.randint(0, 255), random.randint(0, 255), random.randint(0, 255)])

    def chunk(chunk_type, data):
        c = chunk_type + data
        return struct.pack('>I', len(data)) + c + struct.pack('>I', zlib.crc32(c) & 0xFFFFFFFF)

    ihdr = struct.pack('>IIBBBBB', width, height, 8, 2, 0, 0, 0)
    compressed = zlib.compress(raw)
    png = b'\x89PNG\r\n\x1a\n'
    png += chunk(b'IHDR', ihdr)
    png += chunk(b'IDAT', compressed)
    png += chunk(b'IEND', b'')
    
    with open(BIG_PNG, 'wb') as f:
        f.write(png)
    print(f'4096 PNG 已生成: {os.path.getsize(BIG_PNG)} bytes')


def main():
    make_4096_png()
    results = []

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page(viewport={'width': 1280, 'height': 800})
        
        # 收集控制台日志
        logs = []
        page.on('console', lambda msg: logs.append(f'[{msg.type}] {msg.text}'))

        page.goto(URL, wait_until='networkidle')

        # 上传 4096 图片
        page.locator('#fileInput').set_input_files(BIG_PNG)
        page.wait_for_timeout(2000)

        # 检查图片是否成功添加（有无卡片）
        card_count = page.locator('.image-card').count()
        print(f'\n=== 上传结果 ===')
        print(f'  卡片数: {card_count}')
        
        if card_count > 0:
            dims = page.locator('.image-card-dims').first.text_content()
            print(f'  尺寸显示: {dims}')

            # 点批量压缩
            page.locator('#compressBtn').click()
            # 等压缩完成
            try:
                page.wait_for_selector('#downloadSection:not([style*="display: none"])', timeout=120000)
                page.wait_for_timeout(1000)
            except Exception:
                print('  压缩超时或失败')

            # 查看压缩结果
            status = page.locator('.image-card-status').first.text_content()
            print(f'  压缩状态: {status}')
            
            meta = page.locator('.image-card-meta').first.text_content()
            print(f'  元信息: {meta}')

            # 检查是否有压缩率信息
            quality_el = page.locator('.image-card-quality').first
            quality_style = quality_el.evaluate('el => el.style.display')
            if quality_style != 'none':
                print(f'  质量信息: {quality_el.text_content()}')

        # 打印关键控制台日志
        print(f'\n=== 控制台关键日志（共 {len(logs)} 条）===')
        for log in logs:
            if any(kw in log.lower() for kw in ['compress', 'tinypng', 'error', 'fail', 'warn', '4096', 'size', 'canvas', 'image']):
                print(f'  {log[:200]}')

        if card_count == 0:
            # 可能被 reject 了，查看 toast
            print('\n=== Toast 检查 ===')
            toast = page.locator('.toast, #toast, [role="alert"]')
            if toast.count() > 0:
                for t in toast.all():
                    print(f'  Toast: {t.text_content()}')

        browser.close()

    print(f'\n=== 诊断完成 ===')


if __name__ == '__main__':
    main()
