"""验证开发服/测试服样式差异修复（方案 A：@import 合并 CSS bundle）

修复目标：
1. 测试服 8085 上「开始压缩」.btn-primary 背景为深灰 rgb(91,91,91)，不再是白底+描边
2. 测试服 8085 上「确认此压缩质量」.btn-large-primary 背景为深灰
3. 测试服 8085 上传多张图片后，body 可滚动（overflow != hidden，scrollHeight > innerHeight）

根因：Vite 构建按哈希名重排 <link> 顺序，全局 styles.css 后加载覆盖工具 CSS
修复：png_compression.css 顶部 @import "../assets/css/styles.css"，HTML 删除 styles.css 的 <link>
     构建时合并到同一 bundle，全局规则在 bundle 顶部，工具覆盖规则在后
"""

import os
from PIL import Image
from playwright.sync_api import sync_playwright

# 8085 = scripts/start_server.py 起的静态服务，跑 docs/ 构建产物
URL = 'http://localhost:8085/gadgets/png_compression.html'
ASSETS_DIR = os.path.dirname(os.path.abspath(__file__))
TEST_IMG = os.path.join(ASSETS_DIR, '_test_parity.png')


def make_test_image():
    """生成 1 张测试 PNG（用于上传验证滚动）。"""
    Image.new('RGB', (300, 300), color=(120, 200, 80)).save(TEST_IMG)


def check_button_color(page, selector, label):
    """检查按钮背景色是否为深灰 rgb(91, 91, 91)。"""
    info = page.evaluate(
        """(sel) => {
            const el = document.querySelector(sel);
            if (!el) return { found: false };
            const cs = getComputedStyle(el);
            return {
                found: true,
                bg: cs.backgroundColor,
                color: cs.color,
                border: cs.border,
                borderColor: cs.borderColor
            };
        }""",
        selector
    )
    print(f'  [{label}] selector={selector}')
    if not info.get('found'):
        print(f'    ✗ 元素未找到')
        return False
    print(f'    bg={info["bg"]}, color={info["color"]}, borderColor={info["borderColor"]}')
    # 深灰 #5b5b5b = rgb(91, 91, 91)
    is_dark = 'rgb(91, 91, 91)' in info['bg'] or 'rgb(91,91,91)' in info['bg']
    if is_dark:
        print(f'    ✓ 深灰按钮生效')
        return True
    else:
        print(f'    ✗ 仍是白底+描边（修复失败）')
        return False


def check_scroll(page):
    """上传多张图片后检查 body 是否可滚动。"""
    # 上传 8 张图片，让图片列表足够长
    file_input = page.locator('#fileInput')
    for _ in range(8):
        file_input.set_input_files(TEST_IMG)
        page.wait_for_timeout(150)

    # 触发显示图片列表区
    page.wait_for_timeout(300)

    info = page.evaluate(
        """() => {
            const bodyStyle = getComputedStyle(document.body);
            const htmlStyle = getComputedStyle(document.documentElement);
            return {
                bodyOverflow: bodyStyle.overflow,
                bodyOverflowY: bodyStyle.overflowY,
                htmlOverflow: htmlStyle.overflow,
                htmlOverflowY: htmlStyle.overflowY,
                bodyScrollHeight: document.body.scrollHeight,
                innerHeight: window.innerHeight,
                canScroll: document.body.scrollHeight > window.innerHeight
            };
        }"""
    )
    print(f'  [滚动检查] body.overflow={info["bodyOverflow"]}, '
          f'body.overflowY={info["bodyOverflowY"]}')
    print(f'             html.overflow={info["htmlOverflow"]}, '
          f'html.overflowY={info["htmlOverflowY"]}')
    print(f'             scrollHeight={info["bodyScrollHeight"]}, '
          f'innerHeight={info["innerHeight"]}, '
          f'可滚动={info["canScroll"]}')

    overflow_ok = (info['bodyOverflow'] not in ('hidden',) and
                   info['bodyOverflowY'] not in ('hidden',) and
                   info['htmlOverflow'] not in ('hidden',) and
                   info['htmlOverflowY'] not in ('hidden',))
    scroll_ok = info['canScroll']

    if overflow_ok and scroll_ok:
        print(f'    ✓ 页面可滚动（修复生效）')
        return True
    else:
        if not overflow_ok:
            print(f'    ✗ overflow 仍是 hidden（全局 styles.css 赢了）')
        if not scroll_ok:
            print(f'    ✗ 内容高度未超过视口（无法验证滚动）')
        return False


def main():
    make_test_image()
    results = []

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page(viewport={'width': 1280, 'height': 800})
        page.goto(URL, wait_until='networkidle')

        print('\n=== 1. 检查开始压缩按钮（.btn-primary）===')
        # 工具栏默认隐藏，需要先让图片列表区显示——上传 1 张图
        page.locator('#fileInput').set_input_files(TEST_IMG)
        page.wait_for_timeout(300)
        r1 = check_button_color(page, '#compressBtn', '开始压缩按钮')
        results.append(('.btn-primary 深灰', r1))

        print('\n=== 2. 检查下载按钮（.btn-large-primary）===')
        # 下载区也默认隐藏，先触发压缩完成。直接检查元素计算样式即可
        r2 = check_button_color(page, '#downloadSelectedBtn', '下载按钮（hidden 状态也读计算样式）')
        results.append(('.btn-large-primary 深灰', r2))

        print('\n=== 3. 检查页面滚动（上传多张图片后）===')
        r3 = check_scroll(page)
        results.append(('页面可滚动', r3))

        # 顺手截图留档
        shot = os.path.join(ASSETS_DIR, '_verify_parity_8085.png')
        page.screenshot(path=shot, full_page=True)
        print(f'\n截图已保存: {shot}')

        browser.close()

    print('\n=== 汇总 ===')
    for name, ok in results:
        print(f'  [{"✓" if ok else "✗"}] {name}')
    print(f'\n通过率: {sum(1 for _, ok in results if ok)}/{len(results)}')


if __name__ == '__main__':
    main()
