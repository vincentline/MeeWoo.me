"""验证覆盖确认弹窗优化：标题、说明、全选按钮、勾选项样式

优化点：
1. 标题："部分图片已确认压缩质量，批量压缩是否跳过这些图片？"
2. 说明：填充当前批量压缩质量数字
3. 按钮："全部跳过" / "全部批量压缩"
4. 勾选项："跳过"（深底白字，默认）/ "不跳过"（浅底灰字+描边）
5. 页面标签："批量压缩的压缩质量"
"""

import os
from PIL import Image
from playwright.sync_api import sync_playwright

URL = 'http://localhost:8085/gadgets/png_compression.html'
ASSETS_DIR = os.path.dirname(os.path.abspath(__file__))
TEST_IMG = os.path.join(ASSETS_DIR, '_test_overwrite.png')


def make_test_image():
    Image.new('RGB', (200, 200), color=(100, 200, 255)).save(TEST_IMG)


def main():
    make_test_image()
    results = []

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page(viewport={'width': 1280, 'height': 800})
        page.goto(URL, wait_until='networkidle')

        # 测试0：主页面"批量压缩的压缩质量"
        label_text = page.locator('.toolbar-label').text_content()
        print(f'\n=== 测试0：主页面标签 ===')
        print(f'  文案: "{label_text}"')
        ok = label_text == '批量压缩的压缩质量'
        print(f'  {"✓" if ok else "✗"}' + ('' if ok else f' 期望"批量压缩的压缩质量"'))
        results.append(('页面标签', ok))

        # 上传 2 张图片
        img1 = os.path.join(ASSETS_DIR, '_test_req_e_a.png')
        img2 = os.path.join(ASSETS_DIR, '_test_req_e_b.png')
        if not os.path.exists(img1):
            Image.new('RGB', (150, 150), (255, 100, 100)).save(img1)
        if not os.path.exists(img2):
            Image.new('RGB', (150, 150), (100, 255, 100)).save(img2)

        page.locator('#fileInput').set_input_files(img1)
        page.wait_for_timeout(200)
        page.locator('#fileInput').set_input_files(img2)
        page.wait_for_timeout(500)

        # 压缩第一张图（推荐 70），然后确认版本
        page.locator('.image-card-thumb').nth(0).click()
        page.wait_for_timeout(300)
        page.wait_for_selector('#compareModalOverlay:not([style*="display: none"])', timeout=5000)
        page.wait_for_timeout(300)

        # 试压对比
        page.locator('.compare-tab--add').click()
        page.wait_for_timeout(300)
        page.wait_for_selector('#comparePopover:not([style*="display: none"])', timeout=3000)
        page.locator('#comparePopoverCompressBtn').click()
        page.wait_for_timeout(2000)

        # 确认此压缩质量
        page.locator('#compareConfirmBtn').click()
        page.wait_for_timeout(500)
        page.wait_for_function(
            'document.getElementById("compareModalOverlay").style.display === "none"',
            timeout=3000
        )

        # 现在点开始压缩——应该触发覆盖确认弹窗
        page.locator('#compressBtn').click()
        page.wait_for_timeout(500)

        # 弹窗是否出现
        overlay_visible = page.locator('#overwriteOverlay').evaluate('el => el.style.display !== "none"')
        print(f'\n=== 测试1：弹窗是否出现 ===')
        print(f'  弹窗可见: {overlay_visible}')
        results.append(('弹窗出现', overlay_visible))

        if overlay_visible:
            # 测试2：标题
            title = page.locator('#overwriteTitle').text_content()
            print(f'\n=== 测试2：标题 ===')
            print(f'  标题: "{title}"')
            ok = title == '部分图片已确认压缩质量，批量压缩是否跳过这些图片？'
            print(f'  {"✓" if ok else "✗"}' + ('' if ok else f' 期望"部分图片..."'))
            results.append(('标题文案', ok))

            # 测试3：说明文字（含质量数字）
            hint = page.locator('#overwriteHint').text_content()
            print(f'\n=== 测试3：说明文字 ===')
            print(f'  说明: "{hint}"')
            ok = '选中将跳过批量压缩' in hint and '不跳过将采用批量压缩的压缩质量' in hint
            # 检查质量数字在括号中不为 ?
            hint_q = page.locator('#overwriteHintQuality').text_content()
            print(f'  质量数字: "{hint_q}"')
            ok = ok and hint_q != '?' and hint_q.isdigit()
            print(f'  {"✓" if ok else "✗"}' + ('' if ok else ' 期望含质量数字'))
            results.append(('说明含质量数字', ok))

            # 测试4：按钮文字
            keep_all = page.locator('#overwriteKeepAll').text_content()
            recompress_all = page.locator('#overwriteRecompressAll').text_content()
            print(f'\n=== 测试4：按钮文案 ===')
            print(f'  全选按钮: "{keep_all}"')
            print(f'  全不选按钮: "{recompress_all}"')
            ok = keep_all == '全部跳过' and recompress_all == '全部批量压缩'
            print(f'  {"✓" if ok else "✗"}' + ('' if ok else f' 期望"全部跳过"+"全部批量压缩"'))
            results.append(('按钮文案', ok))

            # 测试5：勾选项默认"跳过"+深底白字
            toggle = page.locator('.overwrite-toggle').first
            toggle_text = toggle.text_content()
            toggle_bg = toggle.evaluate('el => getComputedStyle(el).backgroundColor')
            toggle_color = toggle.evaluate('el => getComputedStyle(el).color')
            print(f'\n=== 测试5：勾选项默认状态 ===')
            print(f'  文字: "{toggle_text}"')
            print(f'  背景色: {toggle_bg}')
            print(f'  文字色: {toggle_color}')
            ok = toggle_text == '跳过'
            print(f'  {"✓" if ok else "✗"} 默认显示"跳过"' +
                  ('' if ok else f' 实际"{toggle_text}"'))
            results.append(('默认跳过', ok))

            # 测试6：点击切换为"不跳过"
            toggle.click()
            page.wait_for_timeout(200)
            toggle_text2 = toggle.text_content()
            toggle_bg2 = toggle.evaluate('el => getComputedStyle(el).backgroundColor')
            toggle_color2 = toggle.evaluate('el => getComputedStyle(el).color')
            print(f'\n=== 测试6：切换为不跳过 ===')
            print(f'  文字: "{toggle_text2}"')
            print(f'  背景色: {toggle_bg2}')
            print(f'  文字色: {toggle_color2}')
            ok = toggle_text2 == '不跳过'
            print(f'  {"✓" if ok else "✗"} 切换为"不跳过"' +
                  ('' if ok else f' 实际"{toggle_text2}"'))
            results.append(('切换不跳过', ok))

            # 测试7："全部跳过"按钮效果
            page.locator('#overwriteKeepAll').click()
            page.wait_for_timeout(200)
            all_toggle_texts = page.locator('.overwrite-toggle').all_text_contents()
            all_skip = all(t == '跳过' for t in all_toggle_texts)
            print(f'\n=== 测试7："全部跳过"全选 ===')
            print(f'  所有 toggle: {all_toggle_texts}')
            print(f'  {"✓" if all_skip else "✗"} 全部"跳过"' +
                  ('' if all_skip else ''))
            results.append(('全部跳过', all_skip))

            # 测试8："全部批量压缩"按钮效果
            page.locator('#overwriteRecompressAll').click()
            page.wait_for_timeout(200)
            all_toggle_texts2 = page.locator('.overwrite-toggle').all_text_contents()
            all_noskip = all(t == '不跳过' for t in all_toggle_texts2)
            print(f'\n=== 测试8："全部批量压缩"全不选 ===')
            print(f'  所有 toggle: {all_toggle_texts2}')
            print(f'  {"✓" if all_noskip else "✗"} 全部"不跳过"' +
                  ('' if all_noskip else ''))
            results.append(('全部批量压缩', all_noskip))

            # 截图
            shot = os.path.join(ASSETS_DIR, '_verify_overwrite.png')
            page.screenshot(path=shot, full_page=True)
            print(f'\n截图已保存: {shot}')

        browser.close()

    print('\n=== 汇总 ===')
    for name, ok in results:
        print(f'  [{"✓" if ok else "✗"}] {name}')
    print(f'\n通过率: {sum(1 for _, ok in results if ok)}/{len(results)}')


if __name__ == '__main__':
    main()
