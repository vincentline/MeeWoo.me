/**
 * Konva 性能测试脚本
 * 用于测试优化后的编辑操作响应时间
 */

(function () {
    'use strict';

    /**
     * 性能测试工具
     */
    var PerformanceTest = {
        /**
         * 测试结果
         */
        results: {},

        /**
         * 开始测试
         * @param {string} testName - 测试名称
         * @returns {number} 开始时间戳
         */
        startTest: function (testName) {
            console.log('开始测试: ' + testName);
            this.results[testName] = {
                startTime: Date.now(),
                endTime: 0,
                duration: 0
            };
            return this.results[testName].startTime;
        },

        /**
         * 结束测试
         * @param {string} testName - 测试名称
         * @returns {number} 测试持续时间（毫秒）
         */
        endTest: function (testName) {
            if (!this.results[testName]) {
                console.error('测试不存在: ' + testName);
                return 0;
            }

            this.results[testName].endTime = Date.now();
            this.results[testName].duration = this.results[testName].endTime - this.results[testName].startTime;
            
            console.log('测试完成: ' + testName + ' - ' + this.results[testName].duration + 'ms');
            return this.results[testName].duration;
        },

        /**
         * 打印测试报告
         */
        printReport: function () {
            console.log('\n=== Konva 性能测试报告 ===');
            
            var allPassed = true;
            var maxDuration = 0;
            
            for (var testName in this.results) {
                if (this.results.hasOwnProperty(testName)) {
                    var duration = this.results[testName].duration;
                    var passed = duration <= 100;
                    var status = passed ? '✓ 通过' : '✗ 失败';
                    
                    console.log(testName + ': ' + duration + 'ms ' + status);
                    
                    if (!passed) {
                        allPassed = false;
                    }
                    
                    if (duration > maxDuration) {
                        maxDuration = duration;
                    }
                }
            }
            
            console.log('\n=== 测试摘要 ===');
            console.log('最长响应时间: ' + maxDuration + 'ms');
            console.log('整体状态: ' + (allPassed ? '全部通过' : '部分失败'));
            console.log('性能目标: 编辑操作响应时间不超过 100ms');
        },

        /**
         * 测试舞台初始化性能
         */
        testStageInit: function () {
            var testName = '舞台初始化';
            this.startTest(testName);
            
            try {
                // 创建测试容器
                var container = document.createElement('div');
                container.id = 'test-container';
                container.style.width = '800px';
                container.style.height = '600px';
                document.body.appendChild(container);
                
                // 初始化舞台
                var stageInstance = MeeWoo.Core.KonvaStage.initStage('test-container', {
                    width: 800,
                    height: 600,
                    performance: {
                        enableBatchRendering: true,
                        enableLayerCaching: true
                    }
                });
                
                this.endTest(testName);
                
                // 清理
                MeeWoo.Core.KonvaStage.destroyStage(stageInstance);
                document.body.removeChild(container);
            } catch (e) {
                console.error('测试失败: ' + testName, e);
                this.endTest(testName);
            }
        },

        /**
         * 测试元素创建性能
         */
        testElementCreation: function () {
            var testName = '元素创建';
            this.startTest(testName);
            
            try {
                // 创建测试容器
                var container = document.createElement('div');
                container.id = 'test-container';
                container.style.width = '800px';
                container.style.height = '600px';
                document.body.appendChild(container);
                
                // 初始化舞台
                var stageInstance = MeeWoo.Core.KonvaStage.initStage('test-container', {
                    width: 800,
                    height: 600
                });
                
                // 创建多个元素
                for (var i = 0; i < 50; i++) {
                    var element = MeeWoo.Core.KonvaElement.createElement('rect', {
                        x: Math.random() * 700,
                        y: Math.random() * 500,
                        width: 50,
                        height: 50,
                        fill: '#ff0000',
                        stroke: '#000000',
                        strokeWidth: 1
                    });
                    MeeWoo.Core.KonvaElement.addElementToLayer(element, stageInstance.layers.editLayer);
                }
                
                this.endTest(testName);
                
                // 清理
                MeeWoo.Core.KonvaStage.destroyStage(stageInstance);
                document.body.removeChild(container);
            } catch (e) {
                console.error('测试失败: ' + testName, e);
                this.endTest(testName);
            }
        },

        /**
         * 测试拖拽操作性能
         */
        testDragOperation: function () {
            var testName = '拖拽操作';
            this.startTest(testName);
            
            try {
                // 创建测试容器
                var container = document.createElement('div');
                container.id = 'test-container';
                container.style.width = '800px';
                container.style.height = '600px';
                document.body.appendChild(container);
                
                // 初始化舞台
                var stageInstance = MeeWoo.Core.KonvaStage.initStage('test-container', {
                    width: 800,
                    height: 600
                });
                
                // 创建测试元素
                var rect = MeeWoo.Core.KonvaElement.createElement('rect', {
                    x: 100,
                    y: 100,
                    width: 100,
                    height: 100,
                    fill: '#ff0000',
                    draggable: true
                });
                MeeWoo.Core.KonvaElement.addElementToLayer(rect, stageInstance.layers.editLayer);
                
                // 初始化变换器
                var transformerState = MeeWoo.Core.KonvaTransformer.initTransformer(stageInstance, {
                    performance: {
                        enableThrottling: true,
                        enableBatchRendering: true
                    }
                });
                MeeWoo.Core.KonvaTransformer.attachTransformer(transformerState, rect);
                
                // 模拟拖拽操作
                var startX = 100, startY = 100;
                var endX = 300, endY = 300;
                
                // 触发拖拽开始
                rect.fire('dragstart', { x: startX, y: startY });
                
                // 触发多次拖拽移动
                for (var i = 0; i < 50; i++) {
                    var x = startX + (endX - startX) * i / 50;
                    var y = startY + (endY - startY) * i / 50;
                    rect.fire('dragmove', { x: x, y: y });
                    rect.x(x);
                    rect.y(y);
                }
                
                // 触发拖拽结束
                rect.fire('dragend', { x: endX, y: endY });
                
                this.endTest(testName);
                
                // 清理
                MeeWoo.Core.KonvaTransformer.destroyTransformer(transformerState);
                MeeWoo.Core.KonvaStage.destroyStage(stageInstance);
                document.body.removeChild(container);
            } catch (e) {
                console.error('测试失败: ' + testName, e);
                this.endTest(testName);
            }
        },

        /**
         * 测试缩放操作性能
         */
        testScaleOperation: function () {
            var testName = '缩放操作';
            this.startTest(testName);
            
            try {
                // 创建测试容器
                var container = document.createElement('div');
                container.id = 'test-container';
                container.style.width = '800px';
                container.style.height = '600px';
                document.body.appendChild(container);
                
                // 初始化舞台
                var stageInstance = MeeWoo.Core.KonvaStage.initStage('test-container', {
                    width: 800,
                    height: 600
                });
                
                // 创建测试元素
                var rect = MeeWoo.Core.KonvaElement.createElement('rect', {
                    x: 200,
                    y: 200,
                    width: 100,
                    height: 100,
                    fill: '#ff0000',
                    draggable: true
                });
                MeeWoo.Core.KonvaElement.addElementToLayer(rect, stageInstance.layers.editLayer);
                
                // 初始化变换器
                var transformerState = MeeWoo.Core.KonvaTransformer.initTransformer(stageInstance, {
                    performance: {
                        enableThrottling: true,
                        enableBatchRendering: true
                    }
                });
                MeeWoo.Core.KonvaTransformer.attachTransformer(transformerState, rect);
                
                // 模拟缩放操作
                var startScale = 1.0;
                var endScale = 2.0;
                
                // 触发缩放开始
                rect.fire('scalestart');
                
                // 触发多次缩放
                for (var i = 0; i < 50; i++) {
                    var scale = startScale + (endScale - startScale) * i / 50;
                    rect.fire('scale');
                    rect.scaleX(scale);
                    rect.scaleY(scale);
                }
                
                // 触发缩放结束
                rect.fire('scaleend');
                
                this.endTest(testName);
                
                // 清理
                MeeWoo.Core.KonvaTransformer.destroyTransformer(transformerState);
                MeeWoo.Core.KonvaStage.destroyStage(stageInstance);
                document.body.removeChild(container);
            } catch (e) {
                console.error('测试失败: ' + testName, e);
                this.endTest(testName);
            }
        },

        /**
         * 测试批量更新性能
         */
        testBatchUpdate: function () {
            var testName = '批量更新';
            this.startTest(testName);
            
            try {
                // 创建测试容器
                var container = document.createElement('div');
                container.id = 'test-container';
                container.style.width = '800px';
                container.style.height = '600px';
                document.body.appendChild(container);
                
                // 初始化舞台
                var stageInstance = MeeWoo.Core.KonvaStage.initStage('test-container', {
                    width: 800,
                    height: 600
                });
                
                // 创建多个测试元素
                var elements = [];
                for (var i = 0; i < 50; i++) {
                    var rect = MeeWoo.Core.KonvaElement.createElement('rect', {
                        x: Math.random() * 700,
                        y: Math.random() * 500,
                        width: 50,
                        height: 50,
                        fill: '#ff0000',
                        draggable: true
                    });
                    MeeWoo.Core.KonvaElement.addElementToLayer(rect, stageInstance.layers.editLayer);
                    elements.push(rect);
                }
                
                // 使用批量更新
                MeeWoo.Core.KonvaElement.batchUpdateElements(elements, {
                    fill: '#00ff00',
                    stroke: '#000000',
                    strokeWidth: 2
                });
                
                this.endTest(testName);
                
                // 清理
                MeeWoo.Core.KonvaStage.destroyStage(stageInstance);
                document.body.removeChild(container);
            } catch (e) {
                console.error('测试失败: ' + testName, e);
                this.endTest(testName);
            }
        },

        /**
         * 运行所有测试
         */
        runAllTests: function () {
            console.log('开始运行 Konva 性能测试...');
            
            // 等待 DOM 加载完成
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', function () {
                    PerformanceTest.runTests();
                });
            } else {
                PerformanceTest.runTests();
            }
        },

        /**
         * 运行测试
         */
        runTests: function () {
            this.testStageInit();
            this.testElementCreation();
            this.testDragOperation();
            this.testScaleOperation();
            this.testBatchUpdate();
            this.printReport();
        }
    };

    // 导出到全局
    window.PerformanceTest = PerformanceTest;

    // 自动运行测试
    if (typeof window !== 'undefined') {
        // 延迟运行，确保所有库都已加载
        setTimeout(function () {
            PerformanceTest.runAllTests();
        }, 1000);
    }
})();

// 运行测试
if (typeof PerformanceTest !== 'undefined') {
    PerformanceTest.runAllTests();
}
