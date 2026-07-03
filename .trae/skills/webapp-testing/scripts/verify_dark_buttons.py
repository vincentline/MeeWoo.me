"""验证 PNG 压缩工具的蓝色按钮已改为深色样式按钮。

检查项：
1. CSS 变量 --btn-dark / --btn-dark-hover / --btn-dark-active 的值
2. .btn-select-files（选择文件）背景色 = #5b5b5b
3. #compressBtn（开始压缩）背景色 = #5b5b5b
4. #downloadSelectedBtn（打包下载选中）背景色 = #5b5b5b
5. 截图主页面

预期：所有按钮背景色为 rgb(91, 91, 91)（即 #5b5b5b），不再是蓝色 rgb(64, 158, 255)。
"""

from playwright.sync_api import sync_playwright

URL = 'http://localhost:4000/gadgets/png_compression.html'
EXPECTED_DARK = 'rgb(91, 91, 91)'      # #5b5b5b
EXPECTED_BLUE = 'rgb(64, 158, 255)'    # #409eff（不应再出现）
SCREENSHOT_PATH = 'verify_dark_buttons_main.png'


def check(page, selector, label):
    """检查单个按钮的背景色。"""
    btn = page.locator(selector).first
    if btn.count() == 0:
        print(f'  [SKIP] {label} ({selector})——元素不存在')
        return None
    bg = btn.evaluate('el => getComputedStyle(el).backgroundColor')
    is_dark = bg == EXPECTED_DARK
    is_blue = bg == EXPECTED_BLUE
    status = 'OK' if is_dark else ('FAIL' if is_blue else 'UNKNOWN')
    print(f'  [{status}] {label}: backgroundColor = {bg}')
    return bg


def main():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page(viewport={'width': 1280, 'height': 900})
        page.goto(URL)
        page.wait_for_load_state('networkidle')

        # 1. 检查 CSS 变量
        print('=== 1. CSS 变量检查 ===')
        vars_to_check = ['--btn-dark', '--btn-dark-hover', '--btn-dark-active', '--primary-blue']
        for v in vars_to_check:
            val = page.evaluate(f'getComputedStyle(document.documentElement).getPropertyValue("{v}").trim()')
            print(f'  {v} = {val!r}')

        # 2. 检查按钮背景色
        print('\n=== 2. 按钮背景色检查 ===')
        check(page, '.btn-select-files', '选择文件 (.btn-select-files)')
        check(page, '#compressBtn', '开始压缩 (#compressBtn)')
        check(page, '#downloadSelectedBtn', '打包下载选中 (#downloadSelectedBtn)')

        # 3. 截图主页面
        print('\n=== 3. 截图主页面 ===')
        page.screenshot(path=SCREENSHOT_PATH, full_page=False)
        print(f'  截图已保存: {SCREENSHOT_PATH}')

        # 4. hover + 号 tab 验证（需要进入对比模式，此处仅验证 CSS 规则）
        print('\n=== 4. +号 tab hover 样式（CSS 规则静态检查）===')
        # 直接读 CSS 规则，看 .compare-tab--add:hover 是否用 --btn-dark
        rule_found = page.evaluate('''() => {
          for (const sheet of document.styleSheets) {
            try {
              for (const rule of sheet.cssRules) {
                if (rule.selectorText === '.compare-tab--add:hover') {
                  return rule.cssText;
                }
              }
            } catch (e) { /* 跨域样式表跳过 */ }
          }
          return null;
        }''')
        print(f'  .compare-tab--add:hover 规则: {rule_found}')
        if rule_found and '--btn-dark' in rule_found:
            print('  [OK] 已使用 --btn-dark 变量')
        elif rule_found and 'primary-blue' in rule_found:
            print('  [FAIL] 仍在使用 primary-blue！')
        else:
            print('  [UNKNOWN] 未找到规则或变量未识别')

        # 5. #comparePopoverCompressBtn 的 box-shadow 检查
        print('\n=== 5. #comparePopoverCompressBtn box-shadow 静态检查 ===')
        btn_rule = page.evaluate('''() => {
          for (const sheet of document.styleSheets) {
            try {
              for (const rule of sheet.cssRules) {
                if (rule.selectorText === '#comparePopoverCompressBtn') {
                  return rule.cssText;
                }
              }
            } catch (e) {}
          }
          return null;
        }''')
        print(f'  #comparePopoverCompressBtn 规则: {btn_rule}')
        if btn_rule and '--btn-dark' in btn_rule:
            print('  [OK] 已使用 --btn-dark 变量')
        elif btn_rule and 'primary-blue' in btn_rule:
            print('  [FAIL] 仍在使用 primary-blue！')

        browser.close()
        print('\n验证完成。')


if __name__ == '__main__':
    main()
