"""
调查浮层内"添加压缩图片"按钮左右白色细线问题
"""
import os, tempfile, struct, zlib
from playwright.sync_api import sync_playwright

tmp_dir = tempfile.mkdtemp()
png_path = os.path.join(tmp_dir, 'test.png')

def make_png(path):
    width, height = 100, 100
    raw = b''
    for _ in range(height):
        raw += b'\x00' + b'\x40\x9e\xff\xff' * width
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

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page()

    page.goto('http://localhost:4000/gadgets/png_compression.html')
    page.wait_for_load_state('networkidle')

    page.set_input_files('#fileInput', png_path)
    page.wait_for_timeout(800)

    page.click('.image-card-thumb')
    page.wait_for_timeout(300)
    page.click('.compare-tab--add')
    page.wait_for_timeout(300)

    # 详细检查"添加压缩图片"按钮
    info = page.evaluate("""() => {
        const btn = document.getElementById('comparePopoverCompressBtn');
        const cs = getComputedStyle(btn);
        const rect = btn.getBoundingClientRect();
        // 检查伪元素
        const beforeCS = getComputedStyle(btn, '::before');
        const afterCS = getComputedStyle(btn, '::after');
        // 检查子元素
        const children = Array.from(btn.children).map(c => ({
            tag: c.tagName,
            class: c.className,
            text: c.textContent,
            rect: c.getBoundingClientRect()
        }));
        return {
            tag: btn.tagName,
            innerHTML: btn.innerHTML,
            textContent: btn.textContent,
            children: children,
            style: {
                background: cs.background,
                backgroundColor: cs.backgroundColor,
                border: cs.border,
                borderTop: cs.borderTop,
                borderLeft: cs.borderLeft,
                borderRight: cs.borderRight,
                borderBottom: cs.borderBottom,
                borderWidth: cs.borderWidth,
                borderStyle: cs.borderStyle,
                borderColor: cs.borderColor,
                borderRadius: cs.borderRadius,
                boxShadow: cs.boxShadow,
                outline: cs.outline,
                padding: cs.padding,
                width: cs.width,
                height: cs.height,
            },
            before: {
                content: beforeCS.content,
                display: beforeCS.display,
                background: beforeCS.background,
                border: beforeCS.border,
                width: beforeCS.width,
                height: beforeCS.height,
                position: beforeCS.position,
            },
            after: {
                content: afterCS.content,
                display: afterCS.display,
                background: afterCS.background,
                border: afterCS.border,
                width: afterCS.width,
                height: afterCS.height,
                position: afterCS.position,
            },
            rect: { x: rect.x, y: rect.y, w: rect.width, h: rect.height }
        };
    }""")
    import json
    print(json.dumps(info, indent=2, ensure_ascii=False))

    # 元素级截图——按钮本身
    btn = page.locator('#comparePopoverCompressBtn')
    btn.screenshot(path='f:/my_tools/Stardot-Official/projects/MeeWoo/.tmp_btn_screenshot.png')
    print('按钮截图: .tmp_btn_screenshot.png')

    # 整个浮层截图
    page.locator('#comparePopover').screenshot(path='f:/my_tools/Stardot-Official/projects/MeeWoo/.tmp_popover_screenshot.png')
    print('浮层截图: .tmp_popover_screenshot.png')

    browser.close()
