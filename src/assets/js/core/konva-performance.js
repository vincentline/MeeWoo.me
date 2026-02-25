/**
 * ==================== Konva 性能优化模块 (Konva Performance Optimizer) ====================
 * 
 * 模块索引：
 * 1. 【渲染缓存】 - 减少重复渲染，提高渲染性能
 * 2. 【事件节流】 - 优化高频事件处理，提高操作流畅度
 * 3. 【批量渲染】 - 减少渲染次数，提高性能
 * 4. 【性能监控】 - 监控性能指标，用于调优
 * 
 * 功能说明：
 * 提供 Konva 相关的性能优化功能，包括：
 * 1. 渲染缓存机制
 * 2. 事件节流和防抖
 * 3. 批量渲染管理
 * 4. 性能监控工具
 * 
 * 命名空间：MeeWoo.Core.KonvaPerformance
 */

(function (window) {
    'use strict';

    // 确保命名空间存在
    window.MeeWoo = window.MeeWoo || {};
    window.MeeWoo.Core = window.MeeWoo.Core || {};

    /**
     * Konva 性能优化模块
     */
    var KonvaPerformance = {
        /**
         * ==================== 【渲染缓存】 ====================
         * 减少重复渲染，提高渲染性能
         */

        /**
         * 创建渲染缓存管理器
         * @returns {Object} 缓存管理器实例
         */
        createCacheManager: function () {
            var cacheManager = {
                // 缓存存储
                caches: {},
                
                // 添加元素到缓存
                addToCache: function (elementId, cacheData) {
                    this.caches[elementId] = {
                        data: cacheData,
                        timestamp: Date.now()
                    };
                },
                
                // 从缓存获取元素
                getFromCache: function (elementId) {
                    var cache = this.caches[elementId];
                    if (cache) {
                        // 更新缓存时间戳
                        cache.timestamp = Date.now();
                        return cache.data;
                    }
                    return null;
                },
                
                // 从缓存移除元素
                removeFromCache: function (elementId) {
                    delete this.caches[elementId];
                },
                
                // 清除过期缓存
                clearExpiredCache: function (maxAge) {
                    var now = Date.now();
                    for (var id in this.caches) {
                        if (this.caches.hasOwnProperty(id)) {
                            if (now - this.caches[id].timestamp > maxAge) {
                                delete this.caches[id];
                            }
                        }
                    }
                },
                
                // 清除所有缓存
                clearAllCache: function () {
                    this.caches = {};
                }
            };
            
            return cacheManager;
        },

        /**
         * ==================== 【事件节流】 ====================
         * 优化高频事件处理，提高操作流畅度
         */

        /**
         * 节流函数
         * @param {Function} func - 要执行的函数
         * @param {number} wait - 等待时间（毫秒）
         * @returns {Function} 节流后的函数
         */
        throttle: function (func, wait) {
            var context, args, result;
            var timeout = null;
            var previous = 0;
            
            var later = function () {
                previous = Date.now();
                timeout = null;
                result = func.apply(context, args);
                if (!timeout) context = args = null;
            };
            
            return function () {
                var now = Date.now();
                var remaining = wait - (now - previous);
                context = this;
                args = arguments;
                
                if (remaining <= 0 || remaining > wait) {
                    if (timeout) {
                        clearTimeout(timeout);
                        timeout = null;
                    }
                    previous = now;
                    result = func.apply(context, args);
                    if (!timeout) context = args = null;
                } else if (!timeout) {
                    timeout = setTimeout(later, remaining);
                }
                return result;
            };
        },

        /**
         * 防抖函数
         * @param {Function} func - 要执行的函数
         * @param {number} wait - 等待时间（毫秒）
         * @param {boolean} immediate - 是否立即执行
         * @returns {Function} 防抖后的函数
         */
        debounce: function (func, wait, immediate) {
            var timeout;
            
            return function executedFunction() {
                var context = this;
                var args = arguments;
                
                var later = function() {
                    timeout = null;
                    if (!immediate) func.apply(context, args);
                };
                
                var callNow = immediate && !timeout;
                
                clearTimeout(timeout);
                timeout = setTimeout(later, wait);
                
                if (callNow) func.apply(context, args);
            };
        },

        /**
         * ==================== 【批量渲染】 ====================
         * 减少渲染次数，提高性能
         */

        /**
         * 创建批量渲染管理器
         * @param {number} batchDelay - 批处理延迟（毫秒）
         * @returns {Object} 批量渲染管理器实例
         */
        createBatchRenderer: function (batchDelay) {
            var batchDelay = batchDelay || 16; // 默认约60fps
            var renderQueue = [];
            var timeoutId = null;
            
            var batchRenderer = {
                // 添加渲染任务到队列
                addRenderTask: function (layer) {
                    if (layer && layer instanceof Konva.Layer && !renderQueue.includes(layer)) {
                        renderQueue.push(layer);
                        this.scheduleRender();
                    }
                },
                
                // 调度渲染
                scheduleRender: function () {
                    if (timeoutId) return;
                    
                    timeoutId = setTimeout(function () {
                        batchRenderer.executeRender();
                    }, batchDelay);
                },
                
                // 执行渲染
                executeRender: function () {
                    if (renderQueue.length === 0) return;
                    
                    // 批量渲染所有图层
                    renderQueue.forEach(function (layer) {
                        try {
                            layer.draw();
                        } catch (e) {
                            console.error('Error rendering layer:', e);
                        }
                    });
                    
                    // 清空队列
                    renderQueue = [];
                    timeoutId = null;
                },
                
                // 立即执行渲染
                flush: function () {
                    if (timeoutId) {
                        clearTimeout(timeoutId);
                        timeoutId = null;
                    }
                    this.executeRender();
                },
                
                // 清空渲染队列
                clearQueue: function () {
                    if (timeoutId) {
                        clearTimeout(timeoutId);
                        timeoutId = null;
                    }
                    renderQueue = [];
                }
            };
            
            return batchRenderer;
        },

        /**
         * ==================== 【性能监控】 ====================
         * 监控性能指标，用于调优
         */

        /**
         * 创建性能监控器
         * @returns {Object} 性能监控器实例
         */
        createPerformanceMonitor: function () {
            var monitor = {
                // 性能数据
                performanceData: {
                    renderTime: [],
                    eventTime: [],
                    transformTime: []
                },
                
                // 开始计时
                startTime: function (type) {
                    return {
                        type: type,
                        start: Date.now()
                    };
                },
                
                // 结束计时并记录
                endTime: function (timer) {
                    var end = Date.now();
                    var duration = end - timer.start;
                    
                    if (this.performanceData[timer.type]) {
                        this.performanceData[timer.type].push(duration);
                        
                        // 限制数据量
                        if (this.performanceData[timer.type].length > 100) {
                            this.performanceData[timer.type].shift();
                        }
                    }
                    
                    return duration;
                },
                
                // 获取平均时间
                getAverageTime: function (type) {
                    var data = this.performanceData[type];
                    if (!data || data.length === 0) return 0;
                    
                    var sum = data.reduce(function (a, b) { return a + b; }, 0);
                    return sum / data.length;
                },
                
                // 获取最大时间
                getMaxTime: function (type) {
                    var data = this.performanceData[type];
                    if (!data || data.length === 0) return 0;
                    
                    return Math.max.apply(null, data);
                },
                
                // 清除性能数据
                clearData: function (type) {
                    if (type) {
                        this.performanceData[type] = [];
                    } else {
                        for (var key in this.performanceData) {
                            if (this.performanceData.hasOwnProperty(key)) {
                                this.performanceData[key] = [];
                            }
                        }
                    }
                },
                
                // 打印性能报告
                printReport: function () {
                    console.log('=== Konva Performance Report ===');
                    for (var type in this.performanceData) {
                        if (this.performanceData.hasOwnProperty(type)) {
                            var avg = this.getAverageTime(type);
                            var max = this.getMaxTime(type);
                            console.log(type + ': avg=' + avg.toFixed(2) + 'ms, max=' + max.toFixed(2) + 'ms');
                        }
                    }
                }
            };
            
            return monitor;
        },

        /**
         * ==================== 【工具函数】 ====================
         * 辅助性能优化的工具函数
         */

        /**
         * 检查元素是否在可视区域内
         * @param {Konva.Node} element - Konva 元素
         * @param {Konva.Stage} stage - Konva 舞台
         * @returns {boolean} 是否在可视区域内
         */
        isElementInViewport: function (element, stage) {
            if (!element || !stage) return false;
            
            var box = element.getClientRect();
            var stageBox = {
                x: 0,
                y: 0,
                width: stage.width(),
                height: stage.height()
            };
            
            return !(box.x > stageBox.x + stageBox.width ||
                     box.x + box.width < stageBox.x ||
                     box.y > stageBox.y + stageBox.height ||
                     box.y + box.height < stageBox.y);
        },

        /**
         * 优化复杂样式的渲染
         * @param {Konva.Node} element - Konva 元素
         * @param {boolean} enable - 是否启用优化
         */
        optimizeComplexStyles: function (element, enable) {
            if (!element) return;
            
            if (enable) {
                // 启用缓存
                if (element.cache) {
                    try {
                        element.cache();
                    } catch (e) {
                        console.warn('Error caching element:', e);
                    }
                }
                
                // 减少阴影质量以提高性能
                if (element.getAttr('shadowBlur')) {
                    element.setAttr('shadowBlur', Math.min(element.getAttr('shadowBlur'), 10));
                }
            } else {
                // 禁用缓存
                if (element.clearCache) {
                    try {
                        element.clearCache();
                    } catch (e) {
                        console.warn('Error clearing cache:', e);
                    }
                }
            }
        },

        /**
         * 初始化性能优化
         * @param {Object} stageInstance - 舞台实例
         * @returns {Object} 性能优化器实例
         */
        initPerformanceOptimizer: function (stageInstance) {
            var optimizer = {
                cacheManager: this.createCacheManager(),
                batchRenderer: this.createBatchRenderer(),
                performanceMonitor: this.createPerformanceMonitor(),
                stageInstance: stageInstance
            };
            
            return optimizer;
        }
    };

    // 导出模块
    window.MeeWoo.Core.KonvaPerformance = KonvaPerformance;
})(window);