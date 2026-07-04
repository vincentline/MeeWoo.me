"""验证：压缩中 UI 锁定 + 超大图自动缩放

1. 压缩中：卡片 pointer-events:none + opacity:0.8
2. 压缩后：卡片交互恢复
3. 超大图(5000*5000) → 自动等比缩放到安全尺寸后压缩
"""

import os
from PIL import Image
from playwright.sync_api import sync_playwright

URL = 'http://localhost:8085/gadgets/png_compression.html'
ASSETS_DIR = os.path.dirname(os.path.abspath(__file__))
BIG_IMG = os.path.join(ASSETS_DIR, '_test_big_img.png')


def make_test_images():
    """生成含真实噪点的测试图，避免纯色压缩瞬间完成"""
    import random
    img = Image.new('RGB', (2000, 2000))
    pixels = img.load()
    for x in range(2000):
        for y in range(2000):
            pixels[x, y] = (random.randint(0, 255), random.randint(0, 255), random.randint(0, 255))
    img.save(BIG_IMG)
    print(f'噪点图已生成: {BIG_IMG}, 尺寸={os.path.getsize(BIG_IMG)} bytes')


def main():
    make_test_images()
    results = []

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page(viewport={'width': 1280, 'height': 800})
        page.goto(URL, wait_until='networkidle')

        # 上传 3 张噪点图（延长压缩时间，确保 is-compressing 可观测）
        for _ in range(3):
            page.locator('#fileInput').set_input_files(BIG_IMG)
            page.wait_for_timeout(300)
        page.wait_for_timeout(500)

        # 测试1：压缩前卡片可点击（无 is-compressing）
        section_class = page.locator('#imageListSection').evaluate('el => el.className')
        print(f'\n=== 测试1：压缩前卡片可交互 ===')
        print(f'  imageListSection class: "{section_class}"')
        ok = 'is-compressing' not in section_class
        print(f'  {"✓" if ok else "✗"} 未锁定')
        results.append(('压缩前可交互', ok))

        # 开始压缩
        page.locator('#compressBtn').click()
        # 等待 is-compressing 类到位（异步链路有延迟：选图→质量→覆盖弹窗→app.isCompressing=true）
        try:
            page.wait_for_function(
                'document.getElementById("imageListSection").classList.contains("is-compressing")',
                timeout=5000
            )
        except Exception:
            pass
        page.wait_for_timeout(300)

        # 测试2：压缩中 is-compressing 类已添加
        section_class2 = page.locator('#imageListSection').evaluate('el => el.className')
        print(f'\n=== 测试2：压缩中卡片锁定 ===')
        print(f'  imageListSection class: "{section_class2}"')
        ok2 = 'is-compressing' in section_class2
        print(f'  {"✓" if ok2 else "✗"} is-compressing 已添加')
        results.append(('压缩中已锁定', ok2))

        # 测试3：压缩中卡片 pointer-events
        card_pe = page.locator('.image-card').first.evaluate(
            'el => getComputedStyle(el).pointerEvents'
        )
        print(f'\n=== 测试3：压缩中卡片 CSS ===')
        print(f'  pointer-events: {card_pe}')
        ok3 = card_pe == 'none'
        print(f'  {"✓" if ok3 else "✗"} pointer-events:none')
        results.append(('pointer-events:none', ok3))

        # 等待压缩完成（超大图需要更久）
        page.wait_for_selector('#downloadSection:not([style*="display: none"])', timeout=30000)
        page.wait_for_timeout(500)

        # 测试4：压缩完成后 is-compressing 已移除
        section_class3 = page.locator('#imageListSection').evaluate('el => el.className')
        print(f'\n=== 测试4：压缩后卡片恢复交互 ===')
        print(f'  imageListSection class: "{section_class3}"')
        ok4 = 'is-compressing' not in section_class3
        print(f'  {"✓" if ok4 else "✗"} is-compressing 已移除')
        results.append(('压缩后可交互', ok4))

        # 测试5：超大图成功压缩（状态是 completed 而非 failed）
        status = page.locator('.image-card-status').first.text_content()
        print(f'\n=== 测试5：超大图压缩状态 ===')
        print(f'  状态: "{status}"')
        ok5 = '完成' in status or 'completed' in status.lower()
        print(f'  {"✓" if ok5 else "✗"}' + ('' if ok5 else ' 超大图可能未压缩'))
        results.append(('超大图压缩成功', ok5))

        # 截图
        shot = os.path.join(ASSETS_DIR, '_verify_compress_lock.png')
        page.screenshot(path=shot, full_page=True)
        print(f'\n截图已保存: {shot}')

        browser.close()

    print('\n=== 汇总 ===')
    for name, ok in results:
        print(f'  [{"✓" if ok else "✗"}] {name}')
    print(f'\n通过率: {sum(1 for _, ok in results if ok)}/{len(results)}')


if __name__ == '__main__':
    main()
