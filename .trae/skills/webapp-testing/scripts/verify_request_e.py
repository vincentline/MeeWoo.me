"""验证请求 E 的 4 项改动：
1. 弹窗：取消/开始压缩按钮高度、圆角一致 + 标题"是否保留已确认压缩质量的图片？"
   + 说明"勾选需要保留的图片，不勾选将按全局压缩质量重新压缩"
2. 页面："压缩级别" → "全局压缩质量"
3. 预览弹窗："确认此版本" → "确认此压缩质量"
4. 预览弹窗 tab：4 行结构（质量标签 / 质量值 / 压缩前 / 压缩后）+ 突出第 2 行 + 高度调高
"""

import os
from PIL import Image
from playwright.sync_api import sync_playwright

URL = 'http://localhost:4000/gadgets/png_compression.html'
ASSETS_DIR = os.path.dirname(os.path.abspath(__file__))
TEST_IMG_1 = os.path.join(ASSETS_DIR, '_test_req_e_a.png')
TEST_IMG_2 = os.path.join(ASSETS_DIR, '_test_req_e_b.png')


def make_test_images():
    """生成 2 张测试 PNG（不同颜色）。"""
    Image.new('RGB', (200, 200), color=(255, 100, 100)).save(TEST_IMG_1)
    Image.new('RGB', (200, 200), color=(100, 100, 255)).save(TEST_IMG_2)
    print(f'测试图片已生成: {TEST_IMG_1}, {TEST_IMG_2}')


def wait_for_compression_done(page, timeout=15000):
    try:
        page.wait_for_selector('#downloadSection:not([style*="display: none"])', timeout=timeout)
        return True
    except Exception:
        print('  [警告] 等待压缩完成超时')
        return False


def confirm_one_image(page, img_index):
    """对第 img_index 张图执行对比确认流程，触发 trialResults 生成。"""
    print(f'\n--- 对第 {img_index + 1} 张图执行对比确认 ---')
    thumbs = page.locator('.image-card-thumb')
    thumbs.nth(img_index).click()
    page.wait_for_selector('#compareModalOverlay:not([style*="display: none"])', timeout=5000)
    page.wait_for_timeout(300)

    page.locator('.compare-tab--add').click()
    page.wait_for_timeout(300)
    page.wait_for_selector('#comparePopover:not([style*="display: none"])', timeout=3000)

    page.locator('#comparePopoverCompressBtn').click()
    page.wait_for_timeout(1500)

    page.locator('#compareConfirmBtn').click()
    page.wait_for_timeout(500)
    page.wait_for_function(
        'document.getElementById("compareModalOverlay").style.display === "none"',
        timeout=3000
    )


def main():
    make_test_images()
    results = []

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page(viewport={'width': 1280, 'height': 900})
        page.on('console', lambda msg: print(f'[CONSOLE {msg.type}] {msg.text}') if msg.type == 'error' else None)

        page.goto(URL)
        page.wait_for_load_state('networkidle')

        # === 改动 2: 页面文本"全局压缩质量" ===
        print('\n=== 改动 2: 页面文本"全局压缩质量" ===')
        toolbar_label = page.locator('.toolbar-label').first.text_content()
        print(f'  toolbar-label: {toolbar_label!r}')
        ok2 = toolbar_label == '全局压缩质量'
        print(f'  {"✓" if ok2 else "✗"} {"通过" if ok2 else "失败:应为 全局压缩质量"}')
        results.append(('页面文本"全局压缩质量"', ok2))

        # === 上传 2 张图片 + 压缩 ===
        print('\n=== 上传 2 张图片并压缩 ===')
        page.locator('#fileInput').set_input_files([TEST_IMG_1, TEST_IMG_2])
        page.wait_for_timeout(800)
        page.locator('#compressBtn').click()
        wait_for_compression_done(page)

        # === 对第 1 张图执行对比确认（顺便验证改动 3 + 改动 4）===
        print('\n=== 改动 3 + 4: 打开对比弹窗验证 ===')
        # 打开第 1 张图对比弹窗
        page.locator('.image-card-thumb').first.click()
        page.wait_for_selector('#compareModalOverlay:not([style*="display: none"])', timeout=5000)
        page.wait_for_timeout(300)

        # === 改动 3: 确认按钮"确认此压缩质量" ===
        print('\n=== 改动 3: 确认按钮"确认此压缩质量" ===')
        confirm_btn_text = page.locator('#compareConfirmBtn').text_content()
        print(f'  确认按钮文字: {confirm_btn_text!r}')
        ok3 = confirm_btn_text == '确认此压缩质量'
        print(f'  {"✓" if ok3 else "✗"} {"通过" if ok3 else "失败:应为 确认此压缩质量"}')
        results.append(('确认按钮"确认此压缩质量"', ok3))

        # 点 + 号 tab + 触发试压（生成有内容的 tab）
        print('\n--- 触发试压生成 4 行结构 tab ---')
        page.locator('.compare-tab--add').click()
        page.wait_for_timeout(300)
        page.wait_for_selector('#comparePopover:not([style*="display: none"])', timeout=3000)
        page.locator('#comparePopoverCompressBtn').click()
        page.wait_for_timeout(1500)  # 等 WASM 试压

        # === 改动 4: tab 4 行结构 ===
        print('\n=== 改动 4: tab 4 行结构（质量标签/质量值/压前/压后 + 突出第2行 + 高度调高）===')
        tab_info = page.evaluate("""() => {
            const tabs = document.querySelectorAll('.compare-tab:not(.compare-tab--add)');
            if (tabs.length === 0) return { error: '没有压缩结果 tab' };
            const tab = tabs[0];
            const labelEl = tab.querySelector('.compare-tab-quality-label');
            const valueEl = tab.querySelector('.compare-tab-quality-value');
            const beforeEl = tab.querySelector('.compare-tab-size-before');
            const afterEl = tab.querySelector('.compare-tab-size-after');
            const cs = getComputedStyle(tab);
            const valueCs = valueEl ? getComputedStyle(valueEl) : null;
            const labelCs = labelEl ? getComputedStyle(labelEl) : null;
            return {
                tabCount: tabs.length,
                label: labelEl ? labelEl.textContent : null,
                value: valueEl ? valueEl.textContent : null,
                before: beforeEl ? beforeEl.textContent : null,
                after: afterEl ? afterEl.textContent : null,
                hasOldLabelClass: !!tab.querySelector('.compare-tab-label'),
                hasOldSizeClass: !!tab.querySelector('.compare-tab-size'),
                tabWidth: cs.width,
                tabMinHeight: cs.minHeight,
                tabHeight: tab.getBoundingClientRect().height,
                valueFontSize: valueCs ? valueCs.fontSize : null,
                valueFontWeight: valueCs ? valueCs.fontWeight : null,
                labelFontSize: labelCs ? labelCs.fontSize : null,
                valueBiggerThanLabel: valueCs && labelCs ? (parseFloat(valueCs.fontSize) > parseFloat(labelCs.fontSize)) : false
            };
        }""")
        print(f'  tab 数量: {tab_info.get("tabCount")}')
        print(f'  第1行 (label): {tab_info.get("label")!r} (预期 "压缩质量：")')
        print(f'  第2行 (value): {tab_info.get("value")!r} (预期 "推荐" 或 "极致" 或 "高质" 或数字)')
        print(f'  第3行 (before): {tab_info.get("before")!r} (预期文件大小)')
        print(f'  第4行 (after): {tab_info.get("after")!r} (预期 →文件大小)')
        print(f'  旧 .compare-tab-label 残留: {tab_info.get("hasOldLabelClass")} (应 False)')
        print(f'  旧 .compare-tab-size 残留: {tab_info.get("hasOldSizeClass")} (应 False)')
        print(f'  tab width: {tab_info.get("tabWidth")}')
        print(f'  tab min-height: {tab_info.get("tabMinHeight")}')
        print(f'  tab 实际高度: {tab_info.get("tabHeight"):.1f}px')
        print(f'  第2行字号: {tab_info.get("valueFontSize")} (预期 16px，font-size-lg)')
        print(f'  第2行字重: {tab_info.get("valueFontWeight")} (预期 600)')
        print(f'  第1行字号: {tab_info.get("labelFontSize")} (预期 10px，font-size-xs)')
        print(f'  第2行字号 > 第1行字号: {tab_info.get("valueBiggerThanLabel")}')

        ok4 = (
            tab_info.get('label') == '压缩质量：' and
            tab_info.get('value') in ['极致', '推荐', '高质'] and
            tab_info.get('before') is not None and len(tab_info.get('before')) > 0 and
            tab_info.get('after') is not None and tab_info.get('after').startswith('→') and
            not tab_info.get('hasOldLabelClass') and
            not tab_info.get('hasOldSizeClass') and
            tab_info.get('tabHeight', 0) >= 80 and
            tab_info.get('valueFontSize') == '16px' and
            tab_info.get('valueFontWeight') == '600' and
            tab_info.get('valueBiggerThanLabel')
        )
        print(f'  {"✓" if ok4 else "✗"} {"通过" if ok4 else "失败"}')
        results.append(('tab 4 行结构 + 突出第2行 + 高度调高', ok4))

        # 截图：tab 4 行结构
        page.screenshot(path='verify_request_e_1_tab_4_lines.png')
        print('  截图: verify_request_e_1_tab_4_lines.png')

        # 关闭弹窗
        page.locator('#compareModalClose').click()
        page.wait_for_timeout(300)

        # === 对 2 张图分别确认版本，触发覆盖弹窗 ===
        print('\n--- 完成 2 张图的对比确认流程 ---')
        # 第 1 张已确认（但弹窗已关闭，需要重新打开确认？）
        # 实际上前面只是触发了试压 + 没有点确认按钮。再点确认按钮：
        # 上面流程没点确认按钮就关闭了，重新走一遍
        # 简化：直接对 2 张图都执行完整 confirm 流程
        # 第 1 张
        page.locator('.image-card-thumb').nth(0).click()
        page.wait_for_selector('#compareModalOverlay:not([style*="display: none"])', timeout=5000)
        page.wait_for_timeout(300)
        page.locator('#compareConfirmBtn').click()
        page.wait_for_function(
            'document.getElementById("compareModalOverlay").style.display === "none"',
            timeout=3000
        )
        # 第 2 张
        page.locator('.image-card-thumb').nth(1).click()
        page.wait_for_selector('#compareModalOverlay:not([style*="display: none"])', timeout=5000)
        page.wait_for_timeout(300)
        page.locator('.compare-tab--add').click()
        page.wait_for_timeout(300)
        page.wait_for_selector('#comparePopover:not([style*="display: none"])', timeout=3000)
        page.locator('#comparePopoverCompressBtn').click()
        page.wait_for_timeout(1500)
        page.locator('#compareConfirmBtn').click()
        page.wait_for_function(
            'document.getElementById("compareModalOverlay").style.display === "none"',
            timeout=3000
        )

        # === 改动 1: 弹窗按钮一致性 + 标题/说明文字 ===
        print('\n=== 改动 1: 弹窗按钮一致性 + 标题/说明文字 ===')
        page.locator('#compressBtn').click()
        page.wait_for_timeout(500)
        page.wait_for_selector('#overwriteOverlay:not([style*="display: none"])', timeout=3000)

        # 验证标题
        title = page.locator('#overwriteTitle').text_content()
        print(f'  标题: {title!r}')
        ok1_title = title == '是否保留已确认压缩质量的图片？'

        # 验证说明文字
        hint = page.locator('.overwrite-hint').text_content()
        print(f'  说明: {hint!r}')
        ok1_hint = hint == '勾选需要保留的图片，不勾选将按全局压缩质量重新压缩'

        # 验证按钮样式一致性
        btn_info = page.evaluate("""() => {
            const cancelBtn = document.getElementById('overwriteCancel');
            const startBtn = document.getElementById('overwriteStart');
            const cancelCs = getComputedStyle(cancelBtn);
            const startCs = getComputedStyle(startBtn);
            return {
                cancelHeight: cancelCs.height,
                cancelRadius: cancelCs.borderRadius,
                cancelMinWidth: cancelCs.minWidth,
                startHeight: startCs.height,
                startRadius: startCs.borderRadius,
                startMinWidth: startCs.minWidth,
                heightMatch: cancelCs.height === startCs.height,
                radiusMatch: cancelCs.borderRadius === startCs.borderRadius
            };
        }""")
        print(f'  取消按钮: height={btn_info["cancelHeight"]} radius={btn_info["cancelRadius"]} min-width={btn_info["cancelMinWidth"]}')
        print(f'  开始按钮: height={btn_info["startHeight"]} radius={btn_info["startRadius"]} min-width={btn_info["startMinWidth"]}')
        print(f'  高度一致: {btn_info["heightMatch"]}')
        print(f'  圆角一致: {btn_info["radiusMatch"]}')

        ok1_btn = (
            btn_info['heightMatch'] and
            btn_info['radiusMatch'] and
            btn_info['cancelHeight'] == '44px' and
            btn_info['cancelRadius'] in ['12px', '11.4px']  # radius-md=12px
        )
        ok1 = ok1_title and ok1_hint and ok1_btn
        print(f'  {"✓" if ok1 else "✗"} {"通过" if ok1 else "失败"}')
        if not ok1_title: print(f'    ✗ 标题不符')
        if not ok1_hint: print(f'    ✗ 说明文字不符')
        if not ok1_btn: print(f'    ✗ 按钮样式不一致')
        results.append(('弹窗按钮一致性 + 标题/说明文字', ok1))

        page.screenshot(path='verify_request_e_2_dialog.png')
        print('  截图: verify_request_e_2_dialog.png')

        # === 综合结论 ===
        print('\n=== 综合结论 ===')
        all_ok = all(r[1] for r in results)
        for name, ok in results:
            print(f'  {"✓" if ok else "✗"} {name}')
        if all_ok:
            print('\n✅ 请求 E 全部 4 项改动验证通过！')
        else:
            print('\n❌ 部分改动验证失败，详见上方日志')

        browser.close()
        return 0 if all_ok else 1


if __name__ == '__main__':
    exit(main())
