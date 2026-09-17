"""
验证浮层在 + 号 tab 上方弹出且完整可见
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

    page.goto('http://localhost:4002/gadgets/png_compression.html')
    page.wait_for_load_state('networkidle')

    page.set_input_files('#fileInput', png_path)
    page.wait_for_timeout(800)

    page.click('.image-card-thumb')
    page.wait_for_timeout(300)

    # 点击 + 号 tab
    page.click('.compare-tab--add')
    page.wait_for_timeout(300)

    # 检查浮层、tabs、modal 的位置关系
    info = page.evaluate("""() => {
        const popover = document.getElementById('comparePopover');
        const tabs = document.getElementById('compareTabs');
        const modal = document.getElementById('compareModal');
        const addTab = document.querySelector('.compare-tab--add');
        const pr = popover.getBoundingClientRect();
        const tr = tabs.getBoundingClientRect();
        const mr = modal.getBoundingClientRect();
        const ar = addTab.getBoundingClientRect();
        return {
            popover: { x: pr.x, y: pr.y, w: pr.width, h: pr.height, bottom: pr.bottom },
            tabs: { x: tr.x, y: tr.y, h: tr.height, top: tr.top },
            addTab: { x: ar.x, y: ar.y, w: ar.width, h: ar.height, center_x: ar.x + ar.width/2 },
            modal: { x: mr.x, y: mr.y, w: mr.width, h: mr.height, top: mr.top, bottom: mr.bottom },
            popoverAboveTabs: pr.bottom <= tr.top + 1,  // 浮层底部应在 tabs 顶部上方
            popoverInModal: pr.top >= mr.top && pr.bottom <= mr.bottom,  // 浮层应在 modal 内
            popoverCenteredOnAddTab: Math.abs((pr.x + pr.width/2) - (ar.x + ar.width/2)) < 2
        };
    }""")
    print('浮层位置:', info)

    page.screenshot(path='.trae/temp/popover_above.png', full_page=False)

    print()
    print('=== 验证结论 ===')
    ok = (info['popoverAboveTabs'] and info['popoverInModal'] and info['popoverCenteredOnAddTab'])
    if ok:
        print('✓ 浮层在 tabs 上方、在 modal 内部、水平居中于 + 号 tab')
    else:
        print('✗ 问题：')
        if not info['popoverAboveTabs']:
            print('  - 浮层未在 tabs 上方')
        if not info['popoverInModal']:
            print('  - 浮层超出 modal 边界')
        if not info['popoverCenteredOnAddTab']:
            print('  - 浮层未水平居中于 + 号 tab')

    browser.close()
