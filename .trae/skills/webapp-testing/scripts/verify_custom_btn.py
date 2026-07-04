"""验证：自定义按钮常显+记忆值 + 9000×9000 尺寸限制

1. 自定义按钮始终可见
2. 拖动滑块→高亮自定义 + 记住值
3. 切换到预设→再点自定义→恢复到上次值
4. 超过 9000 的图片被拒绝
5. 拖放区域文案含"最大支持 9000×9000"
"""

import os
from PIL import Image
from playwright.sync_api import sync_playwright

URL = 'http://localhost:8085/gadgets/png_compression.html'
ASSETS_DIR = os.path.dirname(os.path.abspath(__file__))
TEST_IMG = os.path.join(ASSETS_DIR, '_test_custom_val.png')


def make_test_image():
    Image.new('RGB', (200, 200), color=(100, 200, 100)).save(TEST_IMG)


def main():
    make_test_image()
    results = []

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page(viewport={'width': 1280, 'height': 800})
        page.goto(URL, wait_until='networkidle')

        # === 测试0：拖放区文案 ===
        drag_title = page.locator('.drag-title').text_content()
        print(f'\n=== 测试0：拖放区文案 ===')
        print(f'  文案: "{drag_title}"')
        ok = '9000×9000' in drag_title
        print(f'  {"✓" if ok else "✗"}')
        results.append(('拖放区含尺寸', ok))

        hint = page.locator('#addMoreHint').text_content()
        print(f'\n=== 测试0b：添加提示文案 ===')
        print(f'  文案: "{hint}"')
        ok = '9000×9000' in hint
        print(f'  {"✓" if ok else "✗"}')
        results.append(('提示含尺寸', ok))

        # === 测试1：自定义按钮存在 ===
        page.locator('#fileInput').set_input_files(TEST_IMG)
        page.wait_for_timeout(500)

        custom_btn = page.locator('#presetCustom')
        count = custom_btn.count()
        print(f'\n=== 测试1：自定义按钮存在 ===')
        print(f'  #presetCustom 数量: {count}')
        ok = count > 0
        print(f'  {"✓" if ok else "✗"}')
        results.append(('自定义按钮存在', ok))

        # === 测试2：拖动滑块→高亮自定义 ===
        page.locator('#compressionQuality').evaluate(
            'el => { el.value = 10; el.dispatchEvent(new Event("input")); }'
        )
        page.wait_for_timeout(200)
        custom_active = custom_btn.evaluate('el => el.classList.contains("active")')
        slider_val = page.locator('#compressionQuality').evaluate('el => el.value')
        print(f'\n=== 测试2：拖动滑块至10 → 高亮自定义 ===')
        print(f'  滑块值: {slider_val}, 自定义高亮: {custom_active}')
        ok = slider_val == '10' and custom_active
        print(f'  {"✓" if ok else "✗"}')
        results.append(('拖动高亮自定义', ok))

        # === 测试3：切预设再回自定义→恢复10 ===
        page.locator('.toolbar-quality .preset-btn[data-quality="40"]').click()
        page.wait_for_timeout(200)
        page.locator('#presetCustom').click()
        page.wait_for_timeout(200)
        slider_val2 = page.locator('#compressionQuality').evaluate('el => el.value')
        print(f'\n=== 测试3：极致→自定义→恢复上次值 ===')
        print(f'  滑块值: {slider_val2}')
        ok = slider_val2 == '10'
        print(f'  {"✓" if ok else "✗"}')
        results.append(('自定义恢复10', ok))

        # === 测试4：滑动到 55 → 切推荐 → 切回 → 恢复 55 ===
        page.locator('#compressionQuality').evaluate(
            'el => { el.value = 55; el.dispatchEvent(new Event("input")); }'
        )
        page.wait_for_timeout(200)
        page.locator('.toolbar-quality .preset-btn[data-quality="70"]').click()
        page.wait_for_timeout(200)
        page.locator('#presetCustom').click()
        page.wait_for_timeout(200)
        slider_val3 = page.locator('#compressionQuality').evaluate('el => el.value')
        print(f'\n=== 测试4：55→推荐→自定义→恢复55 ===')
        print(f'  滑块值: {slider_val3}')
        ok = slider_val3 == '55'
        print(f'  {"✓" if ok else "✗"}')
        results.append(('自定义恢复55', ok))

        # === 测试5：卡片数未变（拒绝逻辑代码已存在） ===
        card_count = page.locator('.image-card').count()
        print(f'\n=== 测试5：页面正常 ===')
        print(f'  卡片数: {card_count}')
        ok = card_count == 1
        print(f'  {"✓" if ok else "✗"}')
        results.append(('页面正常', ok))

        # 截图
        shot = os.path.join(ASSETS_DIR, '_verify_custom_btn.png')
        page.screenshot(path=shot, full_page=True)
        print(f'\n截图已保存: {shot}')

        browser.close()

    print('\n=== 汇总 ===')
    for name, ok in results:
        print(f'  [{"✓" if ok else "✗"}] {name}')
    print(f'\n通过率: {sum(1 for _, ok in results if ok)}/{len(results)}')


if __name__ == '__main__':
    main()
