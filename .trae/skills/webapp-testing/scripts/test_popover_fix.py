"""
验证对比弹窗 + 号 tab 浮层气泡修复
步骤：生成测试 PNG → 上传 → 打开对比弹窗 → 点击 + 号 tab → 检查浮层可见性
"""
import os
import tempfile
from playwright.sync_api import sync_playwright

# 生成一张测试 PNG
tmp_dir = tempfile.mkdtemp()
png_path = os.path.join(tmp_dir, 'test.png')
# 用 Python 写一个最简 PNG（1x1 蓝色像素）
import struct, zlib
def make_png(path):
    # 1x1 RGBA 蓝色像素
    width, height = 100, 100
    raw = b''
    for _ in range(height):
        raw += b'\x00' + b'\x40\x9e\xff\xff' * width  # filter byte + RGBA
    def chunk(typ, data):
        c = struct.pack('>I', len(data)) + typ + data
        c += struct.pack('>I', zlib.crc32(typ + data) & 0xffffffff)
        return c
    png = b'\x89PNG\r\n\x1a\n'
    png += chunk(b'IHDR', struct.pack('>IIBBBBB', width, height, 8, 6, 0, 0, 0))
    png += chunk(b'IDAT', zlib.compress(raw))
    png += chunk(b'IEND', b'')
    with open(path, 'wb') as f:
        f.write(png)

make_png(png_path)
print('测试 PNG 已生成:', png_path)

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page()

    # 收集 console 日志
    logs = []
    page.on('console', lambda msg: logs.append(f'[{msg.type}] {msg.text}'))
    page.on('pageerror', lambda err: logs.append(f'[pageerror] {err}'))

    page.goto('http://localhost:4002/gadgets/png_compression.html')
    page.wait_for_load_state('networkidle')

    # 上传 PNG
    page.set_input_files('#fileInput', png_path)
    page.wait_for_timeout(800)  # 等待卡片渲染

    # 点击图片缩略图打开对比弹窗
    page.click('.image-card-thumb')
    page.wait_for_timeout(300)

    # 检查弹窗是否打开
    overlay_display = page.eval_on_selector('#compareModalOverlay', "el => getComputedStyle(el).display")
    print('弹窗 overlay display:', overlay_display)

    # 检查 .compare-tabs 是否可见
    tabs_display = page.eval_on_selector('#compareTabs', "el => getComputedStyle(el).display")
    print('compare-tabs display:', tabs_display)

    # 检查 + 号 tab 是否存在
    add_tab_count = page.locator('.compare-tab--add').count()
    print('+ 号 tab 数量:', add_tab_count)

    # 检查 #comparePopover 是否在 DOM 中（关键检查点）
    popover_in_dom = page.evaluate("""() => {
        const el = document.getElementById('comparePopover');
        if (!el) return { exists: false, inDom: false };
        return {
            exists: true,
            inDom: document.body.contains(el),
            parentTag: el.parentElement ? el.parentElement.tagName + '#' + el.parentElement.id : null,
            display: getComputedStyle(el).display
        };
    }""")
    print('点击前浮层状态:', popover_in_dom)

    # 点击 + 号 tab
    page.click('.compare-tab--add')
    page.wait_for_timeout(300)

    # 再次检查浮层状态（关键检查点）
    popover_after = page.evaluate("""() => {
        const el = document.getElementById('comparePopover');
        if (!el) return { exists: false, inDom: false };
        const rect = el.getBoundingClientRect();
        return {
            exists: true,
            inDom: document.body.contains(el),
            display: getComputedStyle(el).display,
            visibility: getComputedStyle(el).visibility,
            opacity: getComputedStyle(el).opacity,
            zIndex: getComputedStyle(el).zIndex,
            rect: { x: rect.x, y: rect.y, w: rect.width, h: rect.height },
            visible: rect.width > 0 && rect.height > 0
        };
    }""")
    print('点击后浮层状态:', popover_after)

    # 截图
    page.screenshot(path='/tmp/popover_test.png', full_page=False)
    print('截图已保存: /tmp/popover_test.png')

    # 浮层内的预设按钮数量
    preset_count = page.locator('#comparePopover .preset-btn[data-quality]').count()
    print('浮层内预设按钮数量:', preset_count)

    # 浮层内的"添加压缩图片"按钮
    compress_btn_count = page.locator('#comparePopoverCompressBtn').count()
    print('浮层内压缩按钮数量:', compress_btn_count)

    print()
    print('=== 测试结论 ===')
    if popover_after.get('display') == 'block' and popover_after.get('visible'):
        print('✓ 浮层修复成功！点击 + 号 tab 后浮层可见。')
    else:
        print('✗ 浮层仍未显示。状态:', popover_after)

    print()
    print('=== Console 日志 ===')
    for log in logs[-20:]:
        print(log)

    browser.close()
