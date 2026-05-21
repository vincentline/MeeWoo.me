/**
 * ==================== Konva 编辑器核心模块 (Konva Editor Core) ====================
 * 
 * 模块索引：
 * 1. 【核心功能】 - 编辑器初始化、舞台管理、图层管理
 * 2. 【状态集成】 - 与现有状态管理系统集成
 * 3. 【API 兼容】 - 保持与现有 API 的兼容性
 * 
 * 功能说明：
 * 提供 Konva 编辑器的核心功能，包括：
 * 1. 舞台和图层的创建与管理
 * 2. 与现有状态管理系统的集成
 * 3. 提供统一的 API 接口
 * 4. 支持现有素材编辑器的所有功能
 * 
 * 依赖模块：
 * - Konva 库
 * - MeeWoo.Core.MaterialState (状态管理)
 */

(function (window) {
    'use strict';

    // 确保命名空间存在
    window.MeeWoo = window.MeeWoo || {};
    window.MeeWoo.Core = window.MeeWoo.Core || {};

    /**
     * Konva 编辑器核心模块
     */
    var KonvaEditorCore = {
        /**
         * 初始化 Konva 编辑器核心
         * @param {string|HTMLElement} container - 容器元素或容器ID
         * @param {Object} options - 配置选项
         * @returns {Object} 编辑器核心实例
         */
        init: function (container, options) {
            // 确保 Konva 库已加载
            if (typeof Konva === 'undefined') {
                throw new Error('Konva library not loaded');
            }

            // 默认配置
            var defaultOptions = {
                width: 800,
                height: 600,
                backgroundColor: null,
                enableTransform: true,
                enableSelection: true
            };

            // 合并配置
            var config = Object.assign({}, defaultOptions, options);

            // 创建舞台
            var stage = this.createStage(container, config);

            // 创建图层
            var layers = this.createLayers(stage);

            // 创建编辑器核心实例
            var editorCore = {
                stage: stage,
                layers: layers,
                config: config,
                isInitialized: true,
                currentEditor: null
            };

            // 初始化事件
            this.initEvents(editorCore);

            return editorCore;
        },

        /**
         * 创建 Konva 舞台
         * @param {string|HTMLElement} container - 容器元素或容器ID
         * @param {Object} config - 配置选项
         * @returns {Konva.Stage} 舞台实例
         */
        createStage: function (container, config) {
            return new Konva.Stage({
                container: container,
                width: config.width,
                height: config.height
            });
        },

        /**
         * 创建图层
         * @param {Konva.Stage} stage - 舞台实例
         * @returns {Object} 图层集合
         */
        createLayers: function (stage) {
            // 背景层 - 用于显示底图、网格等固定元素
            var backgroundLayer = new Konva.Layer({
                name: 'backgroundLayer'
            });

            // 编辑层 - 用于放置可编辑的素材元素
            var editLayer = new Konva.Layer({
                name: 'editLayer'
            });

            // 辅助层 - 用于显示选择框、控制点、辅助线等临时元素
            var helperLayer = new Konva.Layer({
                name: 'helperLayer'
            });

            // UI层 - 用于显示工具栏、属性面板等UI组件
            var uiLayer = new Konva.Layer({
                name: 'uiLayer'
            });

            // 添加到舞台
            stage.add(backgroundLayer, editLayer, helperLayer, uiLayer);

            return {
                backgroundLayer: backgroundLayer,
                editLayer: editLayer,
                helperLayer: helperLayer,
                uiLayer: uiLayer
            };
        },

        /**
         * 初始化事件
         * @param {Object} editorCore - 编辑器核心实例
         */
        initEvents: function (editorCore) {
            var stage = editorCore.stage;

            // 存储事件监听器引用，便于后续清理
            editorCore.eventListeners = {
                resize: this.handleResize.bind(this, editorCore)
            };

            // 添加窗口大小变化事件监听
            window.addEventListener('resize', editorCore.eventListeners.resize);
        },

        /**
         * 处理窗口大小变化
         * @param {Object} editorCore - 编辑器核心实例
         */
        handleResize: function (editorCore) {
            var stage = editorCore.stage;
            var container = stage.container();
            
            if (container) {
                var rect = container.getBoundingClientRect();
                stage.width(rect.width);
                stage.height(rect.height);
                stage.draw();
            }
        },

        /**
         * 与现有状态管理系统集成
         * @param {Object} editorCore - 编辑器核心实例
         * @param {Object} editorState - 编辑器状态对象
         */
        integrateWithState: function (editorCore, editorState) {
            editorCore.currentEditor = editorState;
            
            // 同步舞台尺寸
            if (editorState.baseImageWidth && editorState.baseImageHeight) {
                this.updateStageSize(editorCore, editorState.baseImageWidth, editorState.baseImageHeight);
            }
        },

        /**
         * 更新舞台尺寸
         * @param {Object} editorCore - 编辑器核心实例
         * @param {number} width - 新宽度
         * @param {number} height - 新高度
         */
        updateStageSize: function (editorCore, width, height) {
            var stage = editorCore.stage;
            stage.width(width);
            stage.height(height);
            stage.draw();
        },

        /**
         * 获取指定图层
         * @param {Object} editorCore - 编辑器核心实例
         * @param {string} layerName - 图层名称
         * @returns {Konva.Layer|null} 图层实例或null
         */
        getLayer: function (editorCore, layerName) {
            return editorCore.layers[layerName] || null;
        },

        /**
         * 重绘指定图层
         * @param {Object} editorCore - 编辑器核心实例
         * @param {string|Array} layerNames - 图层名称或名称数组
         */
        redrawLayers: function (editorCore, layerNames) {
            if (typeof layerNames === 'string') {
                layerNames = [layerNames];
            }

            layerNames.forEach(function (layerName) {
                var layer = editorCore.layers[layerName];
                if (layer) {
                    layer.draw();
                }
            });
        },

        /**
         * 重绘所有图层
         * @param {Object} editorCore - 编辑器核心实例
         */
        redrawAll: function (editorCore) {
            var stage = editorCore.stage;
            stage.draw();
        },

        /**
         * 清除所有图层内容
         * @param {Object} editorCore - 编辑器核心实例
         */
        clearAllLayers: function (editorCore) {
            for (var layerName in editorCore.layers) {
                if (editorCore.layers.hasOwnProperty(layerName)) {
                    var layer = editorCore.layers[layerName];
                    layer.removeChildren();
                    layer.draw();
                }
            }
        },

        /**
         * 销毁编辑器核心实例
         * @param {Object} editorCore - 编辑器核心实例
         */
        destroy: function (editorCore) {
            // 清理事件监听器
            if (editorCore.eventListeners) {
                if (editorCore.eventListeners.resize) {
                    window.removeEventListener('resize', editorCore.eventListeners.resize);
                }
            }

            // 销毁舞台
            if (editorCore.stage) {
                editorCore.stage.destroy();
            }

            // 清空引用
            editorCore.isInitialized = false;
            editorCore.stage = null;
            editorCore.layers = null;
            editorCore.currentEditor = null;
        },

        /**
         * 创建图片元素
         * @param {Object} options - 图片选项
         * @returns {Konva.Image} 图片元素
         */
        createImage: function (options) {
            return new Konva.Image(options);
        },

        /**
         * 创建文本元素
         * @param {Object} options - 文本选项
         * @returns {Konva.Text} 文本元素
         */
        createText: function (options) {
            return new Konva.Text(options);
        },

        /**
         * 创建矩形元素
         * @param {Object} options - 矩形选项
         * @returns {Konva.Rect} 矩形元素
         */
        createRect: function (options) {
            return new Konva.Rect(options);
        },

        /**
         * 创建圆形元素
         * @param {Object} options - 圆形选项
         * @returns {Konva.Circle} 圆形元素
         */
        createCircle: function (options) {
            return new Konva.Circle(options);
        },

        /**
         * 创建转换器（用于元素变换）
         * @param {Object} options - 转换器选项
         * @returns {Konva.Transformer} 转换器实例
         */
        createTransformer: function (options) {
            return new Konva.Transformer(options);
        }
    };

    // 导出模块
    window.MeeWoo.Core.KonvaEditorCore = KonvaEditorCore;
})(window);
