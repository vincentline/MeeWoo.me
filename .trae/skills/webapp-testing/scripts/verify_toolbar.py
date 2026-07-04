"""验证工具栏优化：滑块一直显示 + 按钮重排 + 预设同步

优化点：
1. 滑块始终可见（不再需要点自定义才出现）
2. 点击预设按钮自动同步滑块数值
3. 手动拖动滑块 → 取消预设高亮（切到自定义模式）
4. 按钮顺序：批量压缩 | 清空列表
5. 清空列表按钮样式 = .btn-primary 同款
"""

import os
from PIL import Image
from playwright.sync_api import sync_playwright

URL = 'http://localhost:8085/gadgets/png_compression.html'
ASSETS_DIR = os.path.dirname(os.path.abspath(__file__))
TEST_IMG = os.path.join(ASSETS_DIR, '_test_toolbar.png')


def make_test_image():
    Image.new('RGB', (200, 200), color=(100, 150, 200)).save(TEST_IMG)


def main():
    make_test_image()
    results = []

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page(viewport={'width': 1280, 'height': 800})
        page.goto(URL, wait_until='networkidle')

        # 上传 1 张图片让工具栏显示
        page.locator('#fileInput').set_input_files(TEST_IMG)
        page.wait_for_timeout(500)

        # 测试1：滑块始终可见（不再 display:none）
        slider_visible = page.locator('#qualityCustomPanel').evaluate(
            'el => getComputedStyle(el).display !== "none"'
        )
        print(f'\n=== 测试1：滑块始终可见 ===')
        print(f'  可见: {slider_visible}')
        print(f'  {"✓" if slider_visible else "✗"}')
        results.append(('滑块始终可见', slider_visible))

        # 测试2：自定义按钮已移除
        custom_btn = page.locator('#presetCustomBtn').count()
        print(f'\n=== 测试2：自定义按钮已移除 ===')
        print(f'  #presetCustomBtn 数量: {custom_btn}')
        ok = custom_btn == 0
        print(f'  {"✓" if ok else "✗"}')
        results.append(('自定义按钮已移除', ok))

        # 测试3：清空列表按钮是 .btn-primary
        clear_btn_class = page.locator('#clearBtn').evaluate('el => el.className')
        print(f'\n=== 测试3：清空列表按钮样式 ===')
        print(f'  class: "{clear_btn_class}"')
        ok = 'btn-primary' in clear_btn_class
        print(f'  {"✓" if ok else "✗"} 是 btn-primary')
        results.append(('清空列表=btn-primary', ok))

        # 测试4：按钮顺序——批量压缩 在 清空列表 前面
        btn_order = page.locator('.toolbar-actions button:not([style*="display: none"])').all_text_contents()
        print(f'\n=== 测试4：按钮顺序 ===')
        print(f'  顺序: {btn_order}')
        compress_idx = btn_order.index('批量压缩') if '批量压缩' in btn_order else -1
        clear_idx = btn_order.index('清空列表') if '清空列表' in btn_order else -1
        ok = compress_idx >= 0 and clear_idx >= 0 and compress_idx < clear_idx
        print(f'  {"✓" if ok else "✗"} 批量压缩({compress_idx}) 在 清空列表({clear_idx}) 之前')
        results.append(('按钮顺序正确', ok))

        # 测试5：点击"极致压缩"预设 → 滑块同步为 40
        page.locator('.quality-presets .preset-btn[data-quality="40"]').click()
        page.wait_for_timeout(200)
        slider_val = page.locator('#compressionQuality').evaluate('el => el.value')
        value_text = page.locator('#compressionValue').text_content()
        print(f'\n=== 测试5：点击极致(40) → 滑块同步 ===')
        print(f'  滑块值: {slider_val}，显示值: {value_text}')
        ok = slider_val == '40' and value_text == '40'
        print(f'  {"✓" if ok else "✗"}')
        results.append(('滑块同步极致=40', ok))

        # 测试6：拖动滑块 → 取消预设高亮
        page.locator('#compressionQuality').evaluate('el => { el.value = 55; el.dispatchEvent(new Event("input")); }')
        page.wait_for_timeout(200)
        preset_active = page.locator('.quality-presets .preset-btn.active').count()
        slider_val2 = page.locator('#compressionQuality').evaluate('el => el.value')
        value_text2 = page.locator('#compressionValue').text_content()
        print(f'\n=== 测试6：拖动滑块至55 → 取消预设高亮 ===')
        print(f'  激活预设数: {preset_active}，滑块值: {slider_val2}，显示值: {value_text2}')
        ok = preset_active == 0 and slider_val2 == '55' and value_text2 == '55'
        print(f'  {"✓" if ok else "✗"}')
        results.append(('拖动切自定义', ok))

        # 截图
        shot = os.path.join(ASSETS_DIR, '_verify_toolbar.png')
        page.screenshot(path=shot, full_page=True)
        print(f'\n截图已保存: {shot}')

        browser.close()

    print('\n=== 汇总 ===')
    for name, ok in results:
        print(f'  [{"✓" if ok else "✗"}] {name}')
    print(f'\n通过率: {sum(1 for _, ok in results if ok)}/{len(results)}')


if __name__ == '__main__':
    main()
