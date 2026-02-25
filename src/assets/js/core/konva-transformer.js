/**
 * ==================== Konva 变换控制器模块 (Konva Transformer Controller) ====================
 * 
 * 模块索引：
 * 1. 【变换初始化】 - Transformer 创建和配置
 * 2. 【变换绑定】 - 将 Transformer 绑定到元素
 * 3. 【变换约束】 - 变换约束和限制
 * 4. 【变换事件】 - 变换事件处理
 * 5. 【变换状态】 - 变换状态管理
 * 6. 【性能优化】 - 事件节流和性能优化
 * 
 * 功能说明：
 * 负责 Konva 元素的变换管理，使用 Konva.Transformer 实现元素的变换操作，包括：
 * 1. 元素缩放（Scale）
 * 2. 元素旋转（Rotate）
 * 3. 元素倾斜（Skew）
 * 4. 元素拖拽（Drag）
 * 5. 变换约束（如比例锁定）
 * 6. 变换事件处理
 * 7. 变换状态管理
 * 8. 性能优化功能
 * 
 * 命名空间：MeeWoo.Core.KonvaTransformer
 */

(function (window) {
    'use strict';

    // 确保命名空间存在
    window.MeeWoo = window.MeeWoo || {};
    window.MeeWoo.Core = window.MeeWoo.Core || {};

    /**
     * Konva 变换控制器模块
     */
    var KonvaTransformer = {
        /**
         * 初始化变换控制器
         * @param {Object} stageInstance - 舞台实例对象
         * @param {Object} options - 变换控制器配置选项
         * @returns {Object} 变换控制器实例
         */
        initTransformer: function (stageInstance, options) {
            // 确保 Konva 库已加载
            if (typeof Konva === 'undefined') {
                throw new Error('Konva library not loaded');
            }

            // 默认配置
            var defaultOptions = {
                borderStroke: '#0099ff',
                borderStrokeWidth: 1,
                cornerStroke: '#0099ff',
                cornerStrokeWidth: 1,
                cornerRadius: 5,
                cornerFill: '#ffffff',
                cornerSize: 10,
                rotatingPointOffset: 40,
                rotatingPointRadius: 8,
                enabledAnchors: ['top-left', 'top-center', 'top-right', 'middle-left', 'middle-right', 'bottom-left', 'bottom-center', 'bottom-right', 'rotater'],
                padding: 5,
                keepRatio: false,
                centeredScaling: false,
                centeredRotation: true,
                allowEmptySelection: false,
                // 性能优化选项
                performance: {
                    enableThrottling: true,
                    throttleDelay: 16, // 约60fps
                    enableBatchRendering: true
                }
            };

            // 合并配置
            var config = Object.assign({}, defaultOptions, options);

            // 创建 Transformer
            var transformer = new Konva.Transformer({
                name: 'element-transformer',
                borderStroke: config.borderStroke,
                borderStrokeWidth: config.borderStrokeWidth,
                cornerStroke: config.cornerStroke,
                cornerStrokeWidth: config.cornerStrokeWidth,
                cornerRadius: config.cornerRadius,
                cornerFill: config.cornerFill,
                cornerSize: config.cornerSize,
                rotatingPointOffset: config.rotatingPointOffset,
                rotatingPointRadius: config.rotatingPointRadius,
                enabledAnchors: config.enabledAnchors,
                padding: config.padding,
                keepRatio: config.keepRatio,
                centeredScaling: config.centeredScaling,
                centeredRotation: config.centeredRotation,
                allowEmptySelection: config.allowEmptySelection
            });

            // 添加到辅助图层
            if (stageInstance.layers.helperLayer) {
                stageInstance.layers.helperLayer.add(transformer);
                stageInstance.layers.helperLayer.draw();
            }

            // 变换状态
            var transformerState = {
                transformer: transformer,
                stageInstance: stageInstance,
                config: config,
                isTransforming: false,
                currentElement: null,
                startTransformState: null,
                transformHistory: [],
                // 性能优化相关
                performance: {
                    lastTransformTime: 0,
                    isDragging: false,
                    isScaling: false,
                    isRotating: false
                }
            };

            // 初始化变换事件
            this.initTransformEvents(transformerState);

            return transformerState;
        },

        /**
         * 初始化变换事件
         * @param {Object} transformerState - 变换状态对象
         */
        initTransformEvents: function (transformerState) {
            var transformer = transformerState.transformer;
            var config = transformerState.config;

            // 创建事件处理函数
            var eventHandlers = {
                transformstart: this.handleTransformStart.bind(this, transformerState),
                transformend: this.handleTransformEnd.bind(this, transformerState),
                rotatestart: this.handleRotateStart.bind(this, transformerState),
                rotateend: this.handleRotateEnd.bind(this, transformerState),
                scalestart: this.handleScaleStart.bind(this, transformerState),
                scaleend: this.handleScaleEnd.bind(this, transformerState),
                dragstart: this.handleDragStart.bind(this, transformerState),
                dragend: this.handleDragEnd.bind(this, transformerState)
            };

            // 为高频事件创建节流版本
            var throttledHandlers = {};
            if (config.performance.enableThrottling && typeof MeeWoo.Core.KonvaPerformance !== 'undefined') {
                var throttleDelay = config.performance.throttleDelay || 16;
                throttledHandlers = {
                    transform: MeeWoo.Core.KonvaPerformance.throttle(
                        this.handleTransform.bind(this, transformerState),
                        throttleDelay
                    ),
                    rotate: MeeWoo.Core.KonvaPerformance.throttle(
                        this.handleRotate.bind(this, transformerState),
                        throttleDelay
                    ),
                    scale: MeeWoo.Core.KonvaPerformance.throttle(
                        this.handleScale.bind(this, transformerState),
                        throttleDelay
                    ),
                    dragmove: MeeWoo.Core.KonvaPerformance.throttle(
                        this.handleDragMove.bind(this, transformerState),
                        throttleDelay
                    )
                };
            } else {
                // 不使用节流
                throttledHandlers = {
                    transform: this.handleTransform.bind(this, transformerState),
                    rotate: this.handleRotate.bind(this, transformerState),
                    scale: this.handleScale.bind(this, transformerState),
                    dragmove: this.handleDragMove.bind(this, transformerState)
                };
            }

            // 绑定事件监听器
            transformer.on('transformstart', eventHandlers.transformstart);
            transformer.on('transform', throttledHandlers.transform);
            transformer.on('transformend', eventHandlers.transformend);

            transformer.on('rotatestart', eventHandlers.rotatestart);
            transformer.on('rotate', throttledHandlers.rotate);
            transformer.on('rotateend', eventHandlers.rotateend);

            transformer.on('scalestart', eventHandlers.scalestart);
            transformer.on('scale', throttledHandlers.scale);
            transformer.on('scaleend', eventHandlers.scaleend);

            transformer.on('dragstart', eventHandlers.dragstart);
            transformer.on('dragmove', throttledHandlers.dragmove);
            transformer.on('dragend', eventHandlers.dragend);

            // 存储事件处理器引用，便于后续清理
            transformerState.eventHandlers = {
                ...eventHandlers,
                ...throttledHandlers
            };
        },

        /**
         * 绑定变换控制器到元素
         * @param {Object} transformerState - 变换状态对象
         * @param {Konva.Node|Array} elements - 要绑定的元素或元素数组
         */
        attachTransformer: function (transformerState, elements) {
            var transformer = transformerState.transformer;

            if (!Array.isArray(elements)) {
                elements = [elements];
            }

            // 确保元素是 Konva.Node 实例
            elements = elements.filter(function (element) {
                return element && element instanceof Konva.Node;
            });

            if (elements.length === 0) {
                return;
            }

            // 绑定到元素
            transformer.nodes(elements);
            transformer.visible(true);
            
            // 更新当前元素
            transformerState.currentElement = elements[0];
            
            // 重绘图层
            transformer.getLayer().draw();
        },

        /**
         * 解绑变换控制器
         * @param {Object} transformerState - 变换状态对象
         */
        detachTransformer: function (transformerState) {
            var transformer = transformerState.transformer;
            
            // 清空绑定的元素
            transformer.nodes([]);
            transformer.visible(false);
            
            // 清空当前元素
            transformerState.currentElement = null;
            
            // 重绘图层
            transformer.getLayer().draw();
        },

        /**
         * 更新变换控制器配置
         * @param {Object} transformerState - 变换状态对象
         * @param {Object} config - 要更新的配置
         */
        updateTransformerConfig: function (transformerState, config) {
            var transformer = transformerState.transformer;
            
            // 更新配置
            Object.assign(transformerState.config, config);
            
            // 更新 Transformer 属性
            transformer.setAttrs(config);
            
            // 重绘图层
            transformer.getLayer().draw();
        },

        /**
         * 设置比例锁定
         * @param {Object} transformerState - 变换状态对象
         * @param {boolean} keepRatio - 是否保持比例
         */
        setKeepRatio: function (transformerState, keepRatio) {
            var transformer = transformerState.transformer;
            
            transformer.setAttr('keepRatio', keepRatio);
            transformerState.config.keepRatio = keepRatio;
            
            transformer.getLayer().draw();
        },

        /**
         * 设置启用的锚点
         * @param {Object} transformerState - 变换状态对象
         * @param {Array} anchors - 要启用的锚点数组
         */
        setEnabledAnchors: function (transformerState, anchors) {
            var transformer = transformerState.transformer;
            
            transformer.setAttr('enabledAnchors', anchors);
            transformerState.config.enabledAnchors = anchors;
            
            transformer.getLayer().draw();
        },

        /**
         * 处理变换开始事件
         * @param {Object} transformerState - 变换状态对象
         * @param {Konva.Event} e - 事件对象
         */
        handleTransformStart: function (transformerState, e) {
            transformerState.isTransforming = true;
            
            // 保存初始变换状态
            transformerState.startTransformState = this.saveTransformState(transformerState.currentElement);
            
            // 触发变换开始事件
            this.triggerTransformEvent(transformerState, 'transformstart', e);
        },

        /**
         * 处理变换进行中事件
         * @param {Object} transformerState - 变换状态对象
         * @param {Konva.Event} e - 事件对象
         */
        handleTransform: function (transformerState, e) {
            // 触发变换进行中事件
            this.triggerTransformEvent(transformerState, 'transform', e);
            
            // 使用批量渲染（如果启用）
            if (transformerState.config.performance.enableBatchRendering && transformerState.stageInstance) {
                var layersToUpdate = [transformerState.stageInstance.layers.editLayer, transformerState.stageInstance.layers.helperLayer];
                layersToUpdate.forEach(function (layer) {
                    if (layer) {
                        if (transformerState.stageInstance.performanceOptimizer && transformerState.stageInstance.performanceOptimizer.batchRenderer) {
                            transformerState.stageInstance.performanceOptimizer.batchRenderer.addRenderTask(layer);
                        } else {
                            layer.draw();
                        }
                    }
                });
            }
        },

        /**
         * 处理变换结束事件
         * @param {Object} transformerState - 变换状态对象
         * @param {Konva.Event} e - 事件对象
         */
        handleTransformEnd: function (transformerState, e) {
            transformerState.isTransforming = false;
            
            // 保存变换历史
            this.saveTransformHistory(transformerState);
            
            // 触发变换结束事件
            this.triggerTransformEvent(transformerState, 'transformend', e);
            
            // 立即执行所有待处理的渲染任务
            if (transformerState.stageInstance && transformerState.stageInstance.performanceOptimizer && transformerState.stageInstance.performanceOptimizer.batchRenderer) {
                transformerState.stageInstance.performanceOptimizer.batchRenderer.flush();
            }
        },

        /**
         * 处理旋转开始事件
         * @param {Object} transformerState - 变换状态对象
         * @param {Konva.Event} e - 事件对象
         */
        handleRotateStart: function (transformerState, e) {
            transformerState.performance.isRotating = true;
            // 触发旋转开始事件
            this.triggerTransformEvent(transformerState, 'rotatestart', e);
        },

        /**
         * 处理旋转进行中事件
         * @param {Object} transformerState - 变换状态对象
         * @param {Konva.Event} e - 事件对象
         */
        handleRotate: function (transformerState, e) {
            // 触发旋转进行中事件
            this.triggerTransformEvent(transformerState, 'rotate', e);
            
            // 使用批量渲染（如果启用）
            if (transformerState.config.performance.enableBatchRendering && transformerState.stageInstance) {
                var layersToUpdate = [transformerState.stageInstance.layers.editLayer, transformerState.stageInstance.layers.helperLayer];
                layersToUpdate.forEach(function (layer) {
                    if (layer) {
                        if (transformerState.stageInstance.performanceOptimizer && transformerState.stageInstance.performanceOptimizer.batchRenderer) {
                            transformerState.stageInstance.performanceOptimizer.batchRenderer.addRenderTask(layer);
                        } else {
                            layer.draw();
                        }
                    }
                });
            }
        },

        /**
         * 处理旋转结束事件
         * @param {Object} transformerState - 变换状态对象
         * @param {Konva.Event} e - 事件对象
         */
        handleRotateEnd: function (transformerState, e) {
            transformerState.performance.isRotating = false;
            // 触发旋转结束事件
            this.triggerTransformEvent(transformerState, 'rotateend', e);
            
            // 立即执行所有待处理的渲染任务
            if (transformerState.stageInstance && transformerState.stageInstance.performanceOptimizer && transformerState.stageInstance.performanceOptimizer.batchRenderer) {
                transformerState.stageInstance.performanceOptimizer.batchRenderer.flush();
            }
        },

        /**
         * 处理缩放开始事件
         * @param {Object} transformerState - 变换状态对象
         * @param {Konva.Event} e - 事件对象
         */
        handleScaleStart: function (transformerState, e) {
            transformerState.performance.isScaling = true;
            // 触发缩放开始事件
            this.triggerTransformEvent(transformerState, 'scalestart', e);
        },

        /**
         * 处理缩放进行中事件
         * @param {Object} transformerState - 变换状态对象
         * @param {Konva.Event} e - 事件对象
         */
        handleScale: function (transformerState, e) {
            // 触发缩放进行中事件
            this.triggerTransformEvent(transformerState, 'scale', e);
            
            // 使用批量渲染（如果启用）
            if (transformerState.config.performance.enableBatchRendering && transformerState.stageInstance) {
                var layersToUpdate = [transformerState.stageInstance.layers.editLayer, transformerState.stageInstance.layers.helperLayer];
                layersToUpdate.forEach(function (layer) {
                    if (layer) {
                        if (transformerState.stageInstance.performanceOptimizer && transformerState.stageInstance.performanceOptimizer.batchRenderer) {
                            transformerState.stageInstance.performanceOptimizer.batchRenderer.addRenderTask(layer);
                        } else {
                            layer.draw();
                        }
                    }
                });
            }
        },

        /**
         * 处理缩放结束事件
         * @param {Object} transformerState - 变换状态对象
         * @param {Konva.Event} e - 事件对象
         */
        handleScaleEnd: function (transformerState, e) {
            transformerState.performance.isScaling = false;
            // 触发缩放结束事件
            this.triggerTransformEvent(transformerState, 'scaleend', e);
            
            // 立即执行所有待处理的渲染任务
            if (transformerState.stageInstance && transformerState.stageInstance.performanceOptimizer && transformerState.stageInstance.performanceOptimizer.batchRenderer) {
                transformerState.stageInstance.performanceOptimizer.batchRenderer.flush();
            }
        },

        /**
         * 处理拖拽开始事件
         * @param {Object} transformerState - 变换状态对象
         * @param {Konva.Event} e - 事件对象
         */
        handleDragStart: function (transformerState, e) {
            transformerState.performance.isDragging = true;
            // 触发拖拽开始事件
            this.triggerTransformEvent(transformerState, 'dragstart', e);
        },

        /**
         * 处理拖拽进行中事件
         * @param {Object} transformerState - 变换状态对象
         * @param {Konva.Event} e - 事件对象
         */
        handleDragMove: function (transformerState, e) {
            // 触发拖拽进行中事件
            this.triggerTransformEvent(transformerState, 'dragmove', e);
            
            // 使用批量渲染（如果启用）
            if (transformerState.config.performance.enableBatchRendering && transformerState.stageInstance) {
                var layersToUpdate = [transformerState.stageInstance.layers.editLayer, transformerState.stageInstance.layers.helperLayer];
                layersToUpdate.forEach(function (layer) {
                    if (layer) {
                        if (transformerState.stageInstance.performanceOptimizer && transformerState.stageInstance.performanceOptimizer.batchRenderer) {
                            transformerState.stageInstance.performanceOptimizer.batchRenderer.addRenderTask(layer);
                        } else {
                            layer.draw();
                        }
                    }
                });
            }
        },

        /**
         * 处理拖拽结束事件
         * @param {Object} transformerState - 变换状态对象
         * @param {Konva.Event} e - 事件对象
         */
        handleDragEnd: function (transformerState, e) {
            transformerState.performance.isDragging = false;
            // 触发拖拽结束事件
            this.triggerTransformEvent(transformerState, 'dragend', e);
            
            // 立即执行所有待处理的渲染任务
            if (transformerState.stageInstance && transformerState.stageInstance.performanceOptimizer && transformerState.stageInstance.performanceOptimizer.batchRenderer) {
                transformerState.stageInstance.performanceOptimizer.batchRenderer.flush();
            }
        },

        /**
         * 触发变换事件
         * @param {Object} transformerState - 变换状态对象
         * @param {string} eventName - 事件名称
         * @param {Konva.Event} e - 原始事件对象
         */
        triggerTransformEvent: function (transformerState, eventName, e) {
            var stage = transformerState.stageInstance.stage;
            
            // 触发自定义事件
            stage.fire('transform:' + eventName, {
                transformerState: transformerState,
                event: e,
                element: transformerState.currentElement
            });
        },

        /**
         * 保存元素变换状态
         * @param {Konva.Node} element - 要保存状态的元素
         * @returns {Object} 变换状态
         */
        saveTransformState: function (element) {
            if (!element || !(element instanceof Konva.Node)) {
                return null;
            }

            // 保存位置、缩放、旋转、倾斜等状态
            return {
                x: element.x(),
                y: element.y(),
                scaleX: element.scaleX(),
                scaleY: element.scaleY(),
                rotation: element.rotation(),
                skewX: element.skewX(),
                skewY: element.skewY(),
                width: element.width(),
                height: element.height()
            };
        },

        /**
         * 恢复元素变换状态
         * @param {Konva.Node} element - 要恢复状态的元素
         * @param {Object} state - 要恢复的状态
         */
        restoreTransformState: function (element, state) {
            if (!element || !(element instanceof Konva.Node) || !state) {
                return;
            }

            // 恢复位置、缩放、旋转、倾斜等状态
            element.setAttrs({
                x: state.x,
                y: state.y,
                scaleX: state.scaleX,
                scaleY: state.scaleY,
                rotation: state.rotation,
                skewX: state.skewX,
                skewY: state.skewY
            });

            // 重绘图层
            element.getLayer().draw();
        },

        /**
         * 保存变换历史
         * @param {Object} transformerState - 变换状态对象
         */
        saveTransformHistory: function (transformerState) {
            if (!transformerState.currentElement) {
                return;
            }

            // 保存当前变换状态
            var currentState = this.saveTransformState(transformerState.currentElement);
            var startState = transformerState.startTransformState;

            if (startState && currentState) {
                // 添加到历史记录
                transformerState.transformHistory.push({
                    startState: startState,
                    endState: currentState,
                    element: transformerState.currentElement,
                    timestamp: Date.now()
                });

                // 限制历史记录数量
                if (transformerState.transformHistory.length > 100) {
                    transformerState.transformHistory.shift();
                }
            }
        },

        /**
         * 获取变换控制器实例
         * @param {Object} transformerState - 变换状态对象
         * @returns {Konva.Transformer} 变换控制器实例
         */
        getTransformer: function (transformerState) {
            return transformerState.transformer;
        },

        /**
         * 获取当前绑定的元素
         * @param {Object} transformerState - 变换状态对象
         * @returns {Konva.Node|null} 当前绑定的元素
         */
        getCurrentElement: function (transformerState) {
            return transformerState.currentElement;
        },

        /**
         * 销毁变换控制器
         * @param {Object} transformerState - 变换状态对象
         */
        destroyTransformer: function (transformerState) {
            var transformer = transformerState.transformer;
            
            // 解绑事件监听器
            if (transformer) {
                transformer.off('transformstart');
                transformer.off('transform');
                transformer.off('transformend');
                transformer.off('rotatestart');
                transformer.off('rotate');
                transformer.off('rotateend');
                transformer.off('scalestart');
                transformer.off('scale');
                transformer.off('scaleend');
                transformer.off('dragstart');
                transformer.off('dragmove');
                transformer.off('dragend');
                
                // 移除变换控制器
                transformer.destroy();
            }
            
            // 清空引用
            transformerState.transformer = null;
            transformerState.currentElement = null;
            transformerState.transformHistory = [];
            transformerState.eventHandlers = null;
            transformerState.performance = null;
        }
    };

    // 导出模块
    window.MeeWoo.Core.KonvaTransformer = KonvaTransformer;
})(window);