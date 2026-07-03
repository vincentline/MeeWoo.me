"""验证请求 E 修复轮（P1 + P2 共 6 项）：

P1-1: 亮色模式 #overwriteClose 关闭按钮对比度（浅底深色 ×）
P1-2: 暗黑模式 .overwrite-meta .quality 文字颜色（浅灰 #b0b0b0）
P1-3: 暗黑模式 .compare-tab--add:hover 文字/边框颜色（浅色）
P1-暗黑: 暗黑模式 #overwriteClose 样式（深底浅 ×）
P2-4: 卡片"已确认压缩质量"文案统一
P2-6: tab 第 4 行 "→ " 带空格
"""

import os
from PIL import Image
from playwright.sync_api import sync_playwright

URL = 'http://localhost:4000/gadgets/png_compression.html'
ASSETS_DIR = os.path.dirname(os.path.abspath(__file__))
TEST_IMG = os.path.join(ASSETS_DIR, '_test_fixes.png')


def make_test_image():
    Image.new('RGB', (200, 200), color=(255, 100, 100)).save(TEST_IMG)


def main():
    make_test_image()
    results = []

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page(viewport={'width': 1280, 'height': 900})
        page.on('console', lambda msg: print(f'[CONSOLE {msg.type}] {msg.text}') if msg.type == 'error' else None)

        page.goto(URL)
        page.wait_for_load_state('networkidle')

        # === P1-1: 亮色模式 #overwriteClose 样式 ===
        print('\n=== P1-1: 亮色模式 #overwriteClose 关闭按钮对比度 ===')
        # 先上传 + 压缩 + 确认 1 张图，触发覆盖弹窗
        page.locator('#fileInput').set_input_files([TEST_IMG])
        page.wait_for_timeout(800)
        page.locator('#compressBtn').click()
        page.wait_for_selector('#downloadSection:not([style*="display: none"])', timeout=15000)

        # 对比确认
        page.locator('.image-card-thumb').first.click()
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

        # 再次点开始压缩 → 弹出覆盖弹窗
        page.locator('#compressBtn').click()
        page.wait_for_selector('#overwriteOverlay:not([style*="display: none"])', timeout=3000)

        light_close = page.evaluate("""() => {
            const btn = document.getElementById('overwriteClose');
            const cs = getComputedStyle(btn);
            return {
                background: cs.backgroundColor,
                color: cs.color
            };
        }""")
        print(f'  亮色模式 #overwriteClose: bg={light_close["background"]} color={light_close["color"]}')
        # 期望：浅底（var(--bg-hover) = #f5f5f7 → rgb(245, 245, 247)）+ 深色文字（var(--text-secondary) = #818181）
        ok_p1_1 = (
            '245, 245, 247' in light_close['background'] and
            '129, 129, 129' in light_close['color']
        )
        print(f'  {"✓" if ok_p1_1 else "✗"} {"通过" if ok_p1_1 else "失败"}')
        results.append(('P1-1 亮色模式 #overwriteClose 对比度', ok_p1_1))

        # === P1-2 + P1-3 + P1-暗黑: 暗黑模式下三处样式 ===
        print('\n=== P1-2/3/暗黑: 暗黑模式 3 处对比度修复 ===')
        # 先关闭覆盖弹窗，否则会拦截 .theme-toggle 点击
        page.locator('#overwriteCancel').click()
        page.wait_for_timeout(300)
        # 切换暗黑模式
        page.locator('.theme-toggle').click()
        page.wait_for_timeout(500)
        is_dark = page.evaluate("document.body.classList.contains('dark-mode')")
        print(f'  暗黑模式已启用: {is_dark}')
        assert is_dark, '暗黑模式未启用'

        # 重新点开始压缩 → 弹窗再次出现（在暗黑模式下）
        page.locator('#compressBtn').click()
        page.wait_for_selector('#overwriteOverlay:not([style*="display: none"])', timeout=3000)

        # P1-暗黑: #overwriteClose 暗黑模式样式
        dark_close = page.evaluate("""() => {
            const btn = document.getElementById('overwriteClose');
            const cs = getComputedStyle(btn);
            return { background: cs.backgroundColor, color: cs.color };
        }""")
        print(f'  P1-暗黑 #overwriteClose: bg={dark_close["background"]} color={dark_close["color"]}')
        # 期望：深底（#404040 → rgb(64, 64, 64)）+ 浅文字（#cccccc → rgb(204, 204, 204)）
        ok_p1_dark = (
            '64, 64, 64' in dark_close['background'] and
            '204, 204, 204' in dark_close['color']
        )
        print(f'  {"✓" if ok_p1_dark else "✗"} P1-暗黑 {"通过" if ok_p1_dark else "失败"}')
        results.append(('P1-暗黑 暗黑模式 #overwriteClose', ok_p1_dark))

        # P1-2: .overwrite-meta .quality 暗黑模式文字色
        dark_quality = page.evaluate("""() => {
            const el = document.querySelector('.overwrite-meta .quality');
            if (!el) return { error: 'no .overwrite-meta .quality element' };
            const cs = getComputedStyle(el);
            return { color: cs.color };
        }""")
        print(f'  P1-2 .overwrite-meta .quality: color={dark_quality.get("color")}')
        # 期望：#b0b0b0 → rgb(176, 176, 176)
        ok_p1_2 = '176, 176, 176' in dark_quality.get('color', '')
        print(f'  {"✓" if ok_p1_2 else "✗"} P1-2 {"通过" if ok_p1_2 else "失败"}')
        results.append(('P1-2 暗黑模式 .overwrite-meta .quality 文字色', ok_p1_2))

        # P1-3: .compare-tab--add:hover 暗黑模式样式（需先关闭弹窗打开对比弹窗）
        page.locator('#overwriteCancel').click()
        page.wait_for_timeout(300)
        page.locator('.image-card-thumb').first.click()
        page.wait_for_selector('#compareModalOverlay:not([style*="display: none"])', timeout=5000)
        page.wait_for_timeout(300)

        # 用 JS 强制 hover 状态：直接读 CSS 规则
        dark_add_hover = page.evaluate("""() => {
            // 遍历样式表查找 body.dark-mode .compare-tab--add:hover
            for (const sheet of document.styleSheets) {
                try {
                    for (const rule of sheet.cssRules) {
                        if (rule.selectorText === 'body.dark-mode .compare-tab--add:hover') {
                            return {
                                borderColor: rule.style.borderColor,
                                color: rule.style.color
                            };
                        }
                    }
                } catch (e) { /* cross-origin sheet */ }
            }
            return { error: 'rule not found' };
        }""")
        print(f'  P1-3 body.dark-mode .compare-tab--add:hover: border={dark_add_hover.get("borderColor")} color={dark_add_hover.get("color")}')
        ok_p1_3 = (
            dark_add_hover.get('borderColor') in ('#aaaaaa', 'rgb(170, 170, 170)')
        ) and (
            dark_add_hover.get('color') in ('#cccccc', 'rgb(204, 204, 204)')
        )
        print(f'  {"✓" if ok_p1_3 else "✗"} P1-3 {"通过" if ok_p1_3 else "失败"}')
        results.append(('P1-3 暗黑模式 .compare-tab--add:hover 对比度', ok_p1_3))

        # 关闭对比弹窗
        page.locator('#compareModalClose').click()
        page.wait_for_timeout(300)

        # === P2-4: 卡片"已确认压缩质量"文案 ===
        print('\n=== P2-4: 卡片"已确认压缩质量"文案统一 ===')
        card_confirmed = page.evaluate("""() => {
            const el = document.querySelector('.image-card-confirmed');
            if (!el) return { error: 'no .image-card-confirmed element' };
            return {
                text: el.textContent,
                display: getComputedStyle(el).display
            };
        }""")
        print(f'  .image-card-confirmed: text={card_confirmed.get("text")!r} display={card_confirmed.get("display")}')
        # 期望：含"已确认压缩质量"
        ok_p2_4 = '已确认压缩质量' in (card_confirmed.get('text') or '')
        print(f'  {"✓" if ok_p2_4 else "✗"} {"通过" if ok_p2_4 else "失败"}')
        results.append(('P2-4 卡片"已确认压缩质量"文案', ok_p2_4))

        # === P2-6: tab 第 4 行 "→ " 带空格 ===
        print('\n=== P2-6: tab 第 4 行 "→ " 带空格 ===')
        # 重新打开对比弹窗（已有 trialResults）
        page.locator('.image-card-thumb').first.click()
        page.wait_for_selector('#compareModalOverlay:not([style*="display: none"])', timeout=5000)
        page.wait_for_timeout(300)

        tab_after_text = page.evaluate("""() => {
            const el = document.querySelector('.compare-tab:not(.compare-tab--add) .compare-tab-size-after');
            return el ? el.textContent : null;
        }""")
        print(f'  第 4 行文字: {tab_after_text!r}')
        # 期望：以 "→ " 开头（→ + 空格）
        ok_p2_6 = tab_after_text and tab_after_text.startswith('→ ')
        print(f'  {"✓" if ok_p2_6 else "✗"} {"通过" if ok_p2_6 else "失败"}')
        results.append(('P2-6 tab 第 4 行 "→ " 带空格', ok_p2_6))

        page.screenshot(path='verify_request_e_fixes_dark.png')
        print('  截图: verify_request_e_fixes_dark.png')

        # === 综合结论 ===
        print('\n=== 综合结论 ===')
        all_ok = all(r[1] for r in results)
        for name, ok in results:
            print(f'  {"✓" if ok else "✗"} {name}')
        if all_ok:
            print('\n✅ 请求 E 修复轮全部 6 项验证通过！')
        else:
            print('\n❌ 部分验证失败，详见上方日志')

        browser.close()
        return 0 if all_ok else 1


if __name__ == '__main__':
    exit(main())
