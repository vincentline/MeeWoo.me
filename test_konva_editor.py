# -*- coding: utf-8 -*-
"""
测试素材编辑器弹窗的Konva渲染
验证：原始素材图显示、上传图片显示、文案显示
"""
from playwright.sync_api import sync_playwright
import time

def test_material_editor():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=False)  # 非无头模式便于观察
        context = browser.new_context(
            viewport={'width': 1280, 'height': 800}
        )
        page = context.new_page()
        
        # 监听控制台日志
        page.on("console", lambda msg: print(f"[Console] {msg.type}: {msg.text}"))
        page.on("pageerror", lambda err: print(f"[Page Error] {err}"))
        
        print("1. 打开应用页面...")
        page.goto('http://localhost:8085')
        page.wait_for_load_state('networkidle')
        time.sleep(1)
        
        # 截图：初始页面
        page.screenshot(path='f:/my_tools/MeeWoo/MeeWoo/test_screenshots/01_initial_page.png')
        print("   已截图：初始页面")
        
        # 上传测试SVGA文件
        print("\n2. 上传测试SVGA文件...")
        file_input = page.locator('input[type="file"]').first
        file_input.set_input_files('f:/my_tools/MeeWoo/MeeWoo/test_files/test.svga')
        
        # 等待SVGA加载完成
        time.sleep(2)
        page.screenshot(path='f:/my_tools/MeeWoo/MeeWoo/test_screenshots/02_svga_loaded.png')
        print("   已截图：SVGA加载完成")
        
        # 点击素材管理按钮
        print("\n3. 打开素材管理面板...")
        material_btn = page.locator('.btn-material-manager').first
        if material_btn.is_visible():
            material_btn.click()
            time.sleep(1)
            page.screenshot(path='f:/my_tools/MeeWoo/MeeWoo/test_screenshots/03_material_panel.png')
            print("   已截图：素材管理面板")
        else:
            print("   未找到素材管理按钮，尝试查找其他按钮...")
            # 尝试查找包含"素材"的按钮
            buttons = page.locator('button').all()
            for btn in buttons:
                text = btn.inner_text()
                if '素材' in text or '管理' in text:
                    print(f"   找到按钮: {text}")
                    btn.click()
                    time.sleep(1)
                    break
        
        # 等待素材列表面板完全展开
        time.sleep(1)
        
        # 查找编辑素材图按钮并点击
        print("\n4. 点击编辑素材图按钮...")
        edit_btn = page.locator('.material-btn-edit').first
        if edit_btn.count() > 0:
            # 滚动到按钮位置
            edit_btn.scroll_into_view_if_needed()
            time.sleep(0.5)
            edit_btn.click()
            time.sleep(3)  # 等待弹窗动画和Konva初始化（CSS动画300ms + 初始化延迟）
            page.screenshot(path='f:/my_tools/MeeWoo/MeeWoo/test_screenshots/04_editor_opened.png')
            print("   已截图：素材编辑器弹窗")
        else:
            print("   未找到编辑按钮！")
        
        # 检查Konva画布是否存在
        print("\n5. 检查Konva画布...")
        canvas = page.locator('canvas').first
        if canvas.is_visible():
            print("   Konva画布已找到")
            # 获取画布尺寸
            box = canvas.bounding_box()
            print(f"   画布尺寸: {box}")
        else:
            print("   未找到Konva画布！")
        
        # 检查是否有显示文案的选项
        print("\n6. 尝试开启显示文案...")
        show_text_checkbox = page.locator('input[type="checkbox"]').filter(has_text='显示文案').first
        if show_text_checkbox.is_visible():
            show_text_checkbox.click()
            time.sleep(1)
            page.screenshot(path='f:/my_tools/MeeWoo/MeeWoo/test_screenshots/05_text_shown.png')
            print("   已截图：显示文案")
        else:
            # 尝试查找包含"文案"或"文字"的元素
            text_elements = page.locator('text=/文案|文字/').all()
            print(f"   找到 {len(text_elements)} 个文案相关元素")
            for el in text_elements[:3]:
                print(f"   - {el.inner_text()}")
        
        # 尝试上传图片
        print("\n7. 尝试上传图片...")
        upload_btn = page.locator('button:has-text("上传图片")').first
        if upload_btn.is_visible():
            # 找到文件输入框
            file_input = page.locator('.material-editor-modal input[type="file"]').first
            if file_input.is_visible() or file_input.is_enabled():
                file_input.set_input_files('f:/my_tools/MeeWoo/MeeWoo/test_files/test.png')
                time.sleep(2)
                page.screenshot(path='f:/my_tools/MeeWoo/MeeWoo/test_screenshots/06_image_uploaded.png')
                print("   已截图：上传图片后")
        
        print("\n8. 测试完成，关闭浏览器...")
        browser.close()
        print("   浏览器已关闭")

if __name__ == '__main__':
    test_material_editor()
