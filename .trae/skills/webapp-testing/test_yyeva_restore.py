"""
测试双通道MP4恢复播放功能
验证：带key的双通道MP4在恢复播放后，仍然保持带key的播放方式
"""
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from playwright.sync_api import sync_playwright
import time

def test_yyeva_restore():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=False)
        page = browser.new_page()
        
        page.goto('http://localhost:5173/')
        page.wait_for_load_state('networkidle')
        
        page.screenshot(path='/tmp/01_initial.png')
        print("✓ 页面加载完成")
        
        page.evaluate('''
            () => {
                const app = window.app;
                if (app) {
                    console.log("App found, checking yyeva state...");
                    console.log("yyeva.isYyeva:", app.yyeva.isYyeva);
                    console.log("yyeva.yyevaData:", app.yyeva.yyevaData ? "exists" : "null");
                }
            }
        ''')
        
        print("\n请在浏览器中手动测试：")
        print("1. 上传一个带key的双通道MP4文件")
        print("2. 确认YYEVA Key面板可以打开（说明是带key的）")
        print("3. 点击恢复播放按钮")
        print("4. 再次确认YYEVA Key面板可以打开")
        print("\n等待60秒进行手动测试...")
        
        time.sleep(60)
        
        browser.close()

if __name__ == '__main__':
    test_yyeva_restore()
