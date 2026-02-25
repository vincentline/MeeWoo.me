from playwright.sync_api import sync_playwright
import time
import os
import json
import datetime

class EditorTest:
    def __init__(self, test_file_path):
        self.test_file_path = test_file_path
        self.results = {
            "start_time": datetime.datetime.now().isoformat(),
            "tests": [],
            "summary": {
                "total": 0,
                "passed": 0,
                "failed": 0,
                "errors": []
            }
        }
    
    def log_test(self, name, passed, message=None, response_time=None):
        """记录测试结果"""
        test_result = {
            "name": name,
            "passed": passed,
            "message": message,
            "response_time": response_time,
            "timestamp": datetime.datetime.now().isoformat()
        }
        self.results["tests"].append(test_result)
        self.results["summary"]["total"] += 1
        if passed:
            self.results["summary"]["passed"] += 1
            status = "✅"
        else:
            self.results["summary"]["failed"] += 1
            self.results["summary"]["errors"].append(message)
            status = "❌"
        
        response_time_str = f" ({response_time:.2f}ms)" if response_time else ""
        print(f"{status} {name}{response_time_str}")
        if message:
            print(f"   {message}")
    
    def save_results(self):
        """保存测试结果到文件"""
        self.results["end_time"] = datetime.datetime.now().isoformat()
        output_file = "test_results.json"
        with open(output_file, "w", encoding="utf-8") as f:
            json.dump(self.results, f, ensure_ascii=False, indent=2)
        print(f"\n📊 测试结果已保存到 {output_file}")
    
    def run(self):
        """运行所有测试"""
        with sync_playwright() as p:
            # 启动浏览器（非无头模式）
            browser = p.chromium.launch(headless=False)
            page = browser.new_page()
            
            try:
                # 导航到本地开发服务器
                page.goto('http://localhost:4005')
                page.wait_for_load_state('networkidle')
                self.log_test("页面加载", True, "页面加载完成")
                
                # 等待页面完全初始化
                time.sleep(2)
                
                # 测试1: 上传测试文件
                start_time = time.time()
                if self.upload_test_file(page):
                    response_time = (time.time() - start_time) * 1000
                    self.log_test("上传测试文件", True, "测试文件上传成功", response_time)
                else:
                    response_time = (time.time() - start_time) * 1000
                    self.log_test("上传测试文件", False, "测试文件上传失败", response_time)
                    return False
                
                # 等待文件加载完成
                time.sleep(5)
                
                # 测试2: 测试播放控制
                start_time = time.time()
                if self.test_playback_controls(page):
                    response_time = (time.time() - start_time) * 1000
                    self.log_test("播放控制", True, "播放控制功能正常", response_time)
                else:
                    response_time = (time.time() - start_time) * 1000
                    self.log_test("播放控制", False, "播放控制功能异常", response_time)
                
                # 测试3: 测试素材替换功能
                start_time = time.time()
                if self.test_material_replacement(page):
                    response_time = (time.time() - start_time) * 1000
                    self.log_test("素材替换", True, "素材替换功能正常", response_time)
                else:
                    response_time = (time.time() - start_time) * 1000
                    self.log_test("素材替换", False, "素材替换功能异常", response_time)
                
                # 测试4: 测试文字编辑功能
                start_time = time.time()
                if self.test_text_editing(page):
                    response_time = (time.time() - start_time) * 1000
                    self.log_test("文字编辑", True, "文字编辑功能正常", response_time)
                else:
                    response_time = (time.time() - start_time) * 1000
                    self.log_test("文字编辑", False, "文字编辑功能异常", response_time)
                
                # 测试5: 测试状态管理
                start_time = time.time()
                if self.test_state_management(page):
                    response_time = (time.time() - start_time) * 1000
                    self.log_test("状态管理", True, "状态管理功能正常", response_time)
                else:
                    response_time = (time.time() - start_time) * 1000
                    self.log_test("状态管理", False, "状态管理功能异常", response_time)
                
                # 测试6: 测试导出功能
                start_time = time.time()
                if self.test_export_functions(page):
                    response_time = (time.time() - start_time) * 1000
                    self.log_test("导出功能", True, "导出功能正常", response_time)
                else:
                    response_time = (time.time() - start_time) * 1000
                    self.log_test("导出功能", False, "导出功能异常", response_time)
                
                # 测试7: 测试性能和响应时间
                start_time = time.time()
                if self.test_performance(page):
                    response_time = (time.time() - start_time) * 1000
                    self.log_test("性能测试", True, "性能和响应时间正常", response_time)
                else:
                    response_time = (time.time() - start_time) * 1000
                    self.log_test("性能测试", False, "性能或响应时间异常", response_time)
                
            except Exception as e:
                self.log_test("测试执行", False, f"测试执行过程中出错: {str(e)}")
            finally:
                # 关闭浏览器
                browser.close()
                
                # 保存测试结果
                self.save_results()
                
                # 打印测试总结
                self.print_summary()
                
                return self.results["summary"]["failed"] == 0
    
    def upload_test_file(self, page):
        """上传测试文件"""
        try:
            # 检查文件是否存在
            if not os.path.exists(self.test_file_path):
                print(f"❌ 测试文件不存在: {self.test_file_path}")
                return False
            
            # 找到文件输入元素并上传文件
            file_input = page.locator('input[type="file"]')
            if file_input.is_visible():
                # 上传测试文件
                file_input.set_input_files(self.test_file_path)
                print('📁 测试文件上传完成')
                return True
            else:
                print('❌ 文件上传区域不可见')
                return False
        except Exception as e:
            print(f"❌ 上传文件时出错: {str(e)}")
            return False
    
    def test_playback_controls(self, page):
        """测试播放控制功能"""
        try:
            # 检查是否显示播放控制
            if page.locator('button:has-text("播放")').is_visible() or page.locator('button:has-text("暂停")').is_visible():
                print('▶️  播放控制可见')
                
                # 测试播放/暂停功能
                play_button = page.locator('button:has-text("播放")')
                pause_button = page.locator('button:has-text("暂停")')
                
                if play_button.is_visible():
                    play_button.click()
                    time.sleep(1)
                    if pause_button.is_visible():
                        print('▶️  播放功能正常')
                elif pause_button.is_visible():
                    pause_button.click()
                    time.sleep(1)
                    if play_button.is_visible():
                        print('⏸️  暂停功能正常')
                
                return True
            else:
                print('❌ 播放控制不可见')
                return False
        except Exception as e:
            print(f"❌ 测试播放控制时出错: {str(e)}")
            return False
    
    def test_material_replacement(self, page):
        """测试素材替换功能"""
        try:
            # 查找素材面板按钮
            material_button = page.locator('text=素材')
            if material_button.is_visible():
                material_button.click()
                print('🎨 打开素材面板')
                time.sleep(2)
                
                # 查找素材列表
                if page.locator('.material-list').is_visible():
                    print('🎨 素材列表可见')
                    
                    # 尝试点击第一个素材
                    first_material = page.locator('.material-item').first
                    if first_material.is_visible():
                        first_material.click()
                        print('🎨 点击第一个素材')
                        time.sleep(2)
                        
                        # 检查是否打开素材编辑器
                        if page.locator('.material-editor').is_visible():
                            print('🎨 素材编辑器打开成功')
                            return True
                        else:
                            print('❌ 素材编辑器未打开')
                            return False
                    else:
                        print('❌ 素材列表为空')
                        return False
                else:
                    print('❌ 素材列表不可见')
                    return False
            else:
                print('❌ 素材按钮不可见')
                return False
        except Exception as e:
            print(f"❌ 测试素材替换时出错: {str(e)}")
            return False
    
    def test_text_editing(self, page):
        """测试文字编辑功能"""
        try:
            # 检查素材编辑器是否打开
            if page.locator('.material-editor').is_visible():
                # 查找文字编辑相关元素
                text_input = page.locator('input[placeholder="请输入文字"]')
                if text_input.is_visible():
                    # 输入测试文字
                    test_text = "测试文字"
                    text_input.fill(test_text)
                    print(f'📝 输入测试文字: {test_text}')
                    time.sleep(1)
                    
                    # 检查文字是否输入成功
                    if text_input.input_value() == test_text:
                        print('📝 文字输入成功')
                        return True
                    else:
                        print('❌ 文字输入失败')
                        return False
                else:
                    print('❌ 文字输入框不可见')
                    return False
            else:
                print('❌ 素材编辑器未打开')
                return False
        except Exception as e:
            print(f"❌ 测试文字编辑时出错: {str(e)}")
            return False
    
    def test_state_management(self, page):
        """测试状态管理功能"""
        try:
            # 查找恢复播放按钮
            restore_button = page.locator('text=恢复播放')
            if restore_button.is_visible():
                restore_button.click()
                print('🔄 点击恢复播放按钮')
                time.sleep(2)
                
                # 检查是否恢复到初始状态
                if page.locator('button:has-text("播放")').is_visible() or page.locator('button:has-text("暂停")').is_visible():
                    print('🔄 恢复播放功能正常')
                    return True
                else:
                    print('❌ 恢复播放功能异常')
                    return False
            else:
                print('❌ 恢复播放按钮不可见')
                return False
        except Exception as e:
            print(f"❌ 测试状态管理时出错: {str(e)}")
            return False
    
    def test_export_functions(self, page):
        """测试导出功能"""
        try:
            # 查找导出按钮
            export_button = page.locator('text=导出')
            if export_button.is_visible():
                export_button.click()
                print('💾 打开导出菜单')
                time.sleep(2)
                
                # 检查是否显示导出选项
                if page.locator('text=导出GIF').is_visible() or page.locator('text=导出MP4').is_visible():
                    print('💾 导出选项可见')
                    return True
                else:
                    print('❌ 导出选项不可见')
                    return False
            else:
                print('❌ 导出按钮不可见')
                return False
        except Exception as e:
            print(f"❌ 测试导出功能时出错: {str(e)}")
            return False
    
    def test_performance(self, page):
        """测试性能和响应时间"""
        try:
            # 测试操作响应时间
            print('⏱️  测试操作响应时间...')
            
            # 测试1: 点击操作响应时间
            start_time = time.time()
            play_button = page.locator('button:has-text("播放")')
            pause_button = page.locator('button:has-text("暂停")')
            
            if play_button.is_visible():
                play_button.click()
            elif pause_button.is_visible():
                pause_button.click()
            
            response_time = (time.time() - start_time) * 1000
            print(f'⏱️  点击操作响应时间: {response_time:.2f}ms')
            
            # 测试2: 素材面板打开响应时间
            start_time = time.time()
            material_button = page.locator('text=素材')
            if material_button.is_visible():
                material_button.click()
            
            response_time = (time.time() - start_time) * 1000
            print(f'⏱️  素材面板打开响应时间: {response_time:.2f}ms')
            
            # 所有操作响应时间都应小于100ms
            return response_time < 100
        except Exception as e:
            print(f"❌ 测试性能时出错: {str(e)}")
            return False
    
    def print_summary(self):
        """打印测试总结"""
        print('\n📊 测试总结')
        print('=' * 50)
        print(f"总测试数: {self.results['summary']['total']}")
        print(f"通过测试: {self.results['summary']['passed']}")
        print(f"失败测试: {self.results['summary']['failed']}")
        print(f"成功率: {self.results['summary']['passed'] / self.results['summary']['total'] * 100:.1f}%")
        
        if self.results['summary']['errors']:
            print('\n❌ 失败原因:')
            for error in self.results['summary']['errors']:
                print(f"   - {error}")
        
        print('=' * 50)
        if self.results['summary']['failed'] == 0:
            print('🎉 所有测试通过！编辑功能正常工作。')
        else:
            print('💥 部分测试失败，需要进一步检查。')

if __name__ == '__main__':
    # 测试文件路径
    test_file_path = os.path.join(os.getcwd(), 'test_files', 'test.svga')
    print(f"测试文件路径: {test_file_path}")
    
    # 创建测试实例并运行测试
    test = EditorTest(test_file_path)
    success = test.run()
    
    if success:
        print('\n🎊 测试成功完成！')
    else:
        print('\n💥 测试失败，请检查错误信息。')
