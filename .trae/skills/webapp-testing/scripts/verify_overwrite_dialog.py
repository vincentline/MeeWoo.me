"""验证覆盖确认弹窗的完整交互流程。

流程：
1. 生成 2 张测试 PNG 并上传
2. 点"开始压缩"压缩所有图片
3. 对第 1 张图：进对比弹窗 → +号 tab → 浮层 → 添加压缩图片 → 确认此版本
4. 对第 2 张图：同上
5. 再次点"开始压缩" → 验证覆盖确认弹窗出现
6. 验证列表项数量、内容
7. 测试"全部重压"/"全部保留"按钮
8. 测试"取消"按钮
9. 截图
"""

import os
from PIL import Image
from playwright.sync_api import sync_playwright

URL = 'http://localhost:4000/gadgets/png_compression.html'
ASSETS_DIR = os.path.dirname(os.path.abspath(__file__))
TEST_IMG_1 = os.path.join(ASSETS_DIR, '_test_img_a.png')
TEST_IMG_2 = os.path.join(ASSETS_DIR, '_test_img_b.png')


def make_test_images():
    """生成 2 张测试 PNG（不同颜色，便于区分）。"""
    Image.new('RGB', (200, 200), color=(255, 100, 100)).save(TEST_IMG_1)
    Image.new('RGB', (200, 200), color=(100, 100, 255)).save(TEST_IMG_2)
    print(f'测试图片已生成: {TEST_IMG_1}, {TEST_IMG_2}')


def wait_for_compression_done(page, timeout=15000):
    """等待压缩完成——进度条隐藏或下载区出现。"""
    try:
        page.wait_for_selector('#downloadSection:not([style*="display: none"])', timeout=timeout)
        print('  压缩完成（下载区已显示）')
        return True
    except Exception:
        print('  [警告] 等待压缩完成超时')
        return False


def confirm_one_image(page, img_index):
    """对第 img_index 张图（从 0 开始）执行对比确认流程。"""
    print(f'\n--- 对第 {img_index + 1} 张图执行对比确认 ---')
    # 点缩略图打开对比弹窗
    thumbs = page.locator('.image-card-thumb')
    thumbs.nth(img_index).click()
    page.wait_for_selector('#compareModalOverlay:not([style*="display: none"])', timeout=5000)
    page.wait_for_timeout(300)
    print('  对比弹窗已打开')

    # 点 +号 tab
    page.locator('.compare-tab--add').click()
    page.wait_for_timeout(300)
    # 浮层出现
    page.wait_for_selector('#comparePopover:not([style*="display: none"])', timeout=3000)
    print('  浮层已弹出')

    # 点"添加压缩图片"——触发试压（WASM 同步阻塞）
    page.locator('#comparePopoverCompressBtn').click()
    page.wait_for_timeout(1500)  # 等 WASM 试压完成
    print('  试压完成')

    # 点"确认此版本"
    page.locator('#compareConfirmBtn').click()
    page.wait_for_timeout(500)
    print('  已确认版本')

    # 确认后弹窗关闭——用 wait_for_function 检查 style.display
    page.wait_for_function(
        'document.getElementById("compareModalOverlay").style.display === "none"',
        timeout=3000
    )


def main():
    make_test_images()

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page(viewport={'width': 1280, 'height': 900})

        # 监听控制台错误
        page.on('console', lambda msg: print(f'[CONSOLE {msg.type}] {msg.text}') if msg.type == 'error' else None)

        page.goto(URL)
        page.wait_for_load_state('networkidle')
        print('页面已加载')

        # 1. 上传 2 张图片
        print('\n=== 1. 上传 2 张测试图片 ===')
        page.locator('#fileInput').set_input_files([TEST_IMG_1, TEST_IMG_2])
        page.wait_for_timeout(800)
        img_count = page.locator('.image-card').count()
        print(f'  已上传 {img_count} 张图片')
        assert img_count == 2, f'期望 2 张图，实际 {img_count}'

        # 2. 第一次压缩
        print('\n=== 2. 第一次压缩所有图片 ===')
        page.locator('#compressBtn').click()
        wait_for_compression_done(page)

        # 3. 对 2 张图分别确认版本
        print('\n=== 3. 对 2 张图分别确认版本 ===')
        confirm_one_image(page, 0)
        confirm_one_image(page, 1)

        # 4. 再次点"开始压缩"——应弹出覆盖确认弹窗
        print('\n=== 4. 再次点"开始压缩"——验证覆盖确认弹窗 ===')
        page.locator('#compressBtn').click()
        page.wait_for_timeout(500)

        overlay = page.locator('#overwriteOverlay')
        is_visible = overlay.is_visible()
        print(f'  覆盖确认弹窗可见: {is_visible}')
        assert is_visible, '覆盖确认弹窗未出现！'

        # 5. 验证标题
        title = page.locator('#overwriteTitle').text_content()
        print(f'  标题: {title}')
        assert '2' in title, f'标题应含 2 张，实际: {title}'

        # 6. 验证列表项
        items = page.locator('.overwrite-item')
        item_count = items.count()
        print(f'  列表项数量: {item_count}')
        assert item_count == 2, f'期望 2 项，实际 {item_count}'

        # 验证每项的元信息
        for i in range(item_count):
            name = items.nth(i).locator('.overwrite-name').text_content()
            meta = items.nth(i).locator('.overwrite-meta').text_content()
            cb_checked = items.nth(i).locator('input[type="checkbox"]').is_checked()
            print(f'  项 {i+1}: name={name!r} meta={meta!r} checked={cb_checked}')
            assert cb_checked, f'项 {i+1} 默认应勾选保留'

        # 7. 截图——默认状态
        page.screenshot(path='verify_overwrite_dialog_1_default.png')
        print('  截图: verify_overwrite_dialog_1_default.png')

        # 8. 测试"全部重压"
        print('\n=== 5. 测试"全部重压"按钮 ===')
        page.locator('#overwriteRecompressAll').click()
        page.wait_for_timeout(200)
        for i in range(item_count):
            cb_checked = items.nth(i).locator('input[type="checkbox"]').is_checked()
            print(f'  项 {i+1} checked={cb_checked}')
            assert not cb_checked, f'项 {i+1} 应取消勾选'

        # 9. 测试"全部保留"
        print('\n=== 6. 测试"全部保留"按钮 ===')
        page.locator('#overwriteKeepAll').click()
        page.wait_for_timeout(200)
        for i in range(item_count):
            cb_checked = items.nth(i).locator('input[type="checkbox"]').is_checked()
            print(f'  项 {i+1} checked={cb_checked}')
            assert cb_checked, f'项 {i+1} 应勾选'

        # 10. 手动取消第 1 张的勾选
        print('\n=== 7. 手动取消第 1 张勾选 ===')
        items.nth(0).locator('input[type="checkbox"]').click()
        page.wait_for_timeout(200)
        cb0 = items.nth(0).locator('input[type="checkbox"]').is_checked()
        cb1 = items.nth(1).locator('input[type="checkbox"]').is_checked()
        print(f'  项 1 checked={cb0} (应 False)')
        print(f'  项 2 checked={cb1} (应 True)')
        assert not cb0 and cb1

        page.screenshot(path='verify_overwrite_dialog_2_mixed.png')
        print('  截图: verify_overwrite_dialog_2_mixed.png')

        # 11. 测试"取消"按钮——弹窗关闭，不压缩
        print('\n=== 8. 测试"取消"按钮 ===')
        page.locator('#overwriteCancel').click()
        page.wait_for_timeout(300)
        is_visible_after = overlay.is_visible()
        print(f'  弹窗可见: {is_visible_after} (应 False)')
        assert not is_visible_after, '取消后弹窗应关闭'

        # 验证压缩按钮还在（未进入压缩状态）
        compress_btn_visible = page.locator('#compressBtn').is_visible()
        print(f'  压缩按钮可见: {compress_btn_visible} (应 True)')
        assert compress_btn_visible

        print('\n✅ 所有验证通过！')
        browser.close()


if __name__ == '__main__':
    main()
