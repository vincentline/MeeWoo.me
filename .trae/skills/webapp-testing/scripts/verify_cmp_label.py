"""验证对比弹窗右侧"压缩后"标签动态显示压缩质量

需求：选择对比 tab 后，右上角"压缩后"文案实时变成"压缩质量X压缩后"
- 选择推荐(70) tab → 显示"压缩质量推荐压缩后"
- 选择高质量(90) tab → 显示"压缩质量高质压缩后"
- 打开新弹窗 → 重置为"压缩后"
"""

import os
from PIL import Image
from playwright.sync_api import sync_playwright

URL = 'http://localhost:8085/gadgets/png_compression.html'
ASSETS_DIR = os.path.dirname(os.path.abspath(__file__))
TEST_IMG = os.path.join(ASSETS_DIR, '_test_label.png')


def make_test_image():
    Image.new('RGB', (200, 200), color=(255, 100, 100)).save(TEST_IMG)


def main():
    make_test_image()
    results = []

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page(viewport={'width': 1280, 'height': 800})
        page.goto(URL, wait_until='networkidle')

        # 上传 1 张测试图片
        page.locator('#fileInput').set_input_files(TEST_IMG)
        page.wait_for_timeout(500)

        # 点击缩略图打开对比弹窗
        thumb = page.locator('.image-card-thumb').first
        thumb.click()
        page.wait_for_selector('#compareModalOverlay:not([style*="display: none"])', timeout=5000)
        page.wait_for_timeout(300)

        # 测试1：弹窗刚打开时，标签应为默认"压缩后"
        label = page.locator('#compareImageRight .compare-label').text_content()
        print(f'\n=== 测试1：弹窗打开时标签 ===')
        print(f'  标签文案: "{label}"')
        if label == '压缩后':
            print(f'  ✓ 默认文案正确')
            results.append(('默认文案=压缩后', True))
        else:
            print(f'  ✗ 期望"压缩后"，实际"{label}"')
            results.append(('默认文案=压缩后', False))

        # 先跑两次试压，生成多个 tab
        print('\n=== 测试2：第一次试压（推荐 70）===')
        page.locator('.compare-tab--add').click()
        page.wait_for_timeout(300)
        page.wait_for_selector('#comparePopover:not([style*="display: none"])', timeout=3000)
        page.locator('#comparePopoverCompressBtn').click()
        page.wait_for_timeout(2000)

        # 点击 + 添加第二个压缩
        print('\n=== 测试3：第二次试压（高质量 90）===')
        page.locator('.compare-tab--add').click()
        page.wait_for_timeout(300)
        page.wait_for_selector('#comparePopover:not([style*="display: none"])', timeout=3000)
        # 先选"高质"的预设按钮(90)——注意限定在 #comparePopover 内部，避免匹配主页面
        page.locator('#comparePopover .preset-btn[data-quality="90"]').click()
        page.wait_for_timeout(200)
        page.locator('#comparePopoverCompressBtn').click()
        page.wait_for_timeout(2000)

        # 现在有推荐(70) 高质(90) 两个 tab
        # 第二次试压后自动选中新增的 tab(90)，标签应显示"压缩质量高质压缩后"
        label = page.locator('#compareImageRight .compare-label').text_content()
        print(f'\n=== 测试4：新增 tab 自动选中后标签 ===')
        print(f'  标签文案: "{label}"')
        if label == '压缩质量高质压缩后':
            print(f'  ✓ 新增 tab 自动选中，标签正确显示')
            results.append(('新tab自动选中→压缩质量高质压缩后', True))
        else:
            print(f'  ✗ 期望"压缩质量高质压缩后"，实际"{label}"')
            results.append(('新tab自动选中→压缩质量高质压缩后', False))

        # 点击第一个 tab（推荐 70），验证标签切换
        tabs = page.locator('.compare-tab:not(.compare-tab--add)')
        tab_count = tabs.count()
        print(f'\n  共 {tab_count} 个 tab')
        if tab_count >= 2:
            tabs.nth(0).click()
            page.wait_for_timeout(300)

            label = page.locator('#compareImageRight .compare-label').text_content()
            print(f'\n=== 测试5：切换至推荐 tab 后标签 ===')
            print(f'  标签文案: "{label}"')
            if label == '压缩质量推荐压缩后':
                print(f'  ✓ 切换到推荐后正确显示')
                results.append(('推荐→压缩质量推荐压缩后', True))
            else:
                print(f'  ✗ 期望"压缩质量推荐压缩后"，实际"{label}"')
                results.append(('推荐→压缩质量推荐压缩后', False))

            # 再切回高质
            tabs.nth(1).click()
            page.wait_for_timeout(300)

            label = page.locator('#compareImageRight .compare-label').text_content()
            print(f'\n=== 测试6：切回高质 tab 后标签 ===')
            print(f'  标签文案: "{label}"')
            if label == '压缩质量高质压缩后':
                print(f'  ✓ 切回高质后正确显示')
                results.append(('高质→压缩质量高质压缩后', True))
            else:
                print(f'  ✗ 期望"压缩质量高质压缩后"，实际"{label}"')
                results.append(('高质→压缩质量高质压缩后', False))

        # 截图留档
        shot = os.path.join(ASSETS_DIR, '_verify_cmp_label.png')
        page.screenshot(path=shot, full_page=True)
        print(f'\n截图已保存: {shot}')

        browser.close()

    print('\n=== 汇总 ===')
    for name, ok in results:
        print(f'  [{"✓" if ok else "✗"}] {name}')
    print(f'\n通过率: {sum(1 for _, ok in results if ok)}/{len(results)}')


if __name__ == '__main__':
    main()
