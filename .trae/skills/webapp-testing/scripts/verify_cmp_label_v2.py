"""验证对比弹窗两项优化：标签文案格式 + tab 质量值小字后缀

v2：
1. 右侧标签 → "压缩后（压缩质量：推荐）"格式
2. tab 预设值（极致/推荐/高质）→ 第二行加小字实际值，如"推荐（70）"
   自定义值 → 保持原样加粗大字，如"10"
"""

import os
from PIL import Image
from playwright.sync_api import sync_playwright

URL = 'http://localhost:8085/gadgets/png_compression.html'
ASSETS_DIR = os.path.dirname(os.path.abspath(__file__))
TEST_IMG = os.path.join(ASSETS_DIR, '_test_label_v2.png')


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
        ok = label == '压缩后'
        print(f'  {"✓" if ok else "✗"} 默认文案' + ('' if ok else f' 期望"压缩后"'))
        results.append(('默认文案=压缩后', ok))

        # 先跑两次试压：推荐(70) + 高质(90)
        print('\n=== 测试2：第一次试压（推荐 70）===')
        page.locator('.compare-tab--add').click()
        page.wait_for_timeout(300)
        page.wait_for_selector('#comparePopover:not([style*="display: none"])', timeout=3000)
        page.locator('#comparePopoverCompressBtn').click()
        page.wait_for_timeout(2000)

        print('\n=== 测试3：第二次试压（高质量 90）===')
        page.locator('.compare-tab--add').click()
        page.wait_for_timeout(300)
        page.wait_for_selector('#comparePopover:not([style*="display: none"])', timeout=3000)
        page.locator('#comparePopover .preset-btn[data-quality="90"]').click()
        page.wait_for_timeout(200)
        page.locator('#comparePopoverCompressBtn').click()
        page.wait_for_timeout(2000)

        # 测试4：标签格式为 "压缩后（压缩质量：高质）"
        label = page.locator('#compareImageRight .compare-label').text_content()
        print(f'\n=== 测试4：标签文案格式 ===')
        print(f'  标签文案: "{label}"')
        ok = label == '压缩后（压缩质量：高质）'
        print(f'  {"✓" if ok else "✗"}' + ('' if ok else f' 期望"压缩后（压缩质量：高质）"'))
        results.append(('新格式→压缩后（压缩质量：高质）', ok))

        # 测试5：tab 预设值显示小字后缀
        tabs = page.locator('.compare-tab:not(.compare-tab--add)')
        tab_count = tabs.count()
        print(f'\n=== 测试5：tab 预设值小字后缀（共 {tab_count} 个 tab）===')
        # 查找 tab 中的 quality-value-num 元素
        num_el = page.locator('.compare-tab-quality-value-num').first
        num_text = num_el.text_content()
        print(f'  小字后缀文案: "{num_text}"')
        # 第一个 tab 是推荐 (70)，看后缀
        first_tab_text = tabs.nth(0).locator('.compare-tab-quality-value').text_content()
        first_num_text = tabs.nth(0).locator('.compare-tab-quality-value-num').text_content()
        print(f'  第 1 个 tab: 大字="{first_tab_text}"，小字="{first_num_text}"')
        ok_num = first_num_text == '（70）'
        print(f'  {"✓" if ok_num else "✗"} 推荐 tab 后缀 (70)' +
              ('' if ok_num else f' 期望"（70）"'))
        results.append(('tab推荐显示小字（70）', ok_num))

        # 第二个 tab 是高质 (90)
        if tab_count >= 2:
            second_tab_text = tabs.nth(1).locator('.compare-tab-quality-value').text_content()
            second_num_text = tabs.nth(1).locator('.compare-tab-quality-value-num').text_content()
            print(f'  第 2 个 tab: 大字="{second_tab_text}"，小字="{second_num_text}"')
            ok_num2 = second_num_text == '（90）'
            print(f'  {"✓" if ok_num2 else "✗"} 高质 tab 后缀 (90)' +
                  ('' if ok_num2 else f' 期望"（90）"'))
            results.append(('tab高质显示小字（90）', ok_num2))

        # 测试6：切换至推荐(70)验证标签文案
        if tab_count >= 2:
            tabs.nth(0).click()
            page.wait_for_timeout(300)
            label = page.locator('#compareImageRight .compare-label').text_content()
            print(f'\n=== 测试6：切换至推荐 tab 后标签 ===')
            print(f'  标签文案: "{label}"')
            ok = label == '压缩后（压缩质量：推荐）'
            print(f'  {"✓" if ok else "✗"}' + ('' if ok else f' 期望"压缩后（压缩质量：推荐）"'))
            results.append(('推荐→压缩后（压缩质量：推荐）', ok))

        # 截图留档
        shot = os.path.join(ASSETS_DIR, '_verify_cmp_label_v2.png')
        page.screenshot(path=shot, full_page=True)
        print(f'\n截图已保存: {shot}')

        browser.close()

    print('\n=== 汇总 ===')
    for name, ok in results:
        print(f'  [{"✓" if ok else "✗"}] {name}')
    print(f'\n通过率: {sum(1 for _, ok in results if ok)}/{len(results)}')


if __name__ == '__main__':
    main()
