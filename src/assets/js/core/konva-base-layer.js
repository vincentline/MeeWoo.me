/**
 * ==================== Konva 底图层管理模块 (Konva Base Layer Manager) ====================
 * 
 * 模块索引：
 * 1. 【核心功能】 - 底图层初始化、管理和操作
 * 2. 【事件处理】 - 底图层事件监听和处理
 * 3. 【状态同步】 - 与编辑器状态同步
 * 
 * 功能说明：
 * 负责 Konva 底图层的创建、管理和维护，提供底图层相关的核心功能，包括：
 * 1. 底图层初始化和配置
 * 2. 底图的显示/隐藏控制
 * 3. 底图的拖拽移动
 * 4. 底图的缩放调整
 * 5. 底图的替换功能
 * 6. 与现有状态管理系统的集成
 * 
 * 命名空间：MeeWoo.Core.KonvaBaseLayer
 */

(function (window) {
    'use strict';

    // 确保命名空间存在
    window.MeeWoo = window.MeeWoo || {};
    window.MeeWoo.Core = window.MeeWoo.Core || {};

    /**
     * Konva 底图层管理模块
     */
    var KonvaBaseLayer = {
        /**
         * 初始化底图层
         * @param {Object} stageInstance - 舞台实例对象
         * @param {Object} vueInstance - Vue实例
         * @returns {Object} 底图层实例对象
         */
        initBaseLayer: function (stageInstance, vueInstance) {
            // 确保 Konva 库已加载
            if (typeof Konva === 'undefined') {
                throw new Error('Konva library not loaded');
            }

            // 获取背景图层
            var backgroundLayer = stageInstance.layers.backgroundLayer;
            if (!backgroundLayer) {
                throw new Error('Background layer not found');
            }

            // 创建底图实例
            var baseImage = new Konva.Image({
                image: null,
                x: 0,
                y: 0,
                width: 0,
                height: 0,
                visible: vueInstance.editor.showImage
            });

            // 添加到底图图层
            backgroundLayer.add(baseImage);

            // 存储底图层实例
            var baseLayerInstance = {
                baseImage: baseImage,
                stageInstance: stageInstance,
                vueInstance: vueInstance,
                isInitialized: true
            };

            // 初始化事件
            this.initBaseLayerEvents(baseLayerInstance);

            // 同步状态
            this.syncState(baseLayerInstance);

            return baseLayerInstance;
        },

        /**
         * 初始化底图层事件
         * @param {Object} baseLayerInstance - 底图层实例对象
         */
        initBaseLayerEvents: function (baseLayerInstance) {
            var baseImage = baseLayerInstance.baseImage;
            var vueInstance = baseLayerInstance.vueInstance;

            // 点击事件
            baseImage.on('click tap', function (e) {
                // 阻止事件冒泡，避免与预览区域事件冲突
                e.cancelBubble = true;
                
                // 激活底图层
                vueInstance.editor.activeElement = 'image';
                vueInstance.editor.lastClickElement = 'image';
                vueInstance.editor.lastClickTime = Date.now();
            });

            // 拖动开始事件
            baseImage.on('dragstart', function () {
                vueInstance.editor.isImageDragging = true;
                vueInstance.editor.imageDragStartX = vueInstance.editor.imageOffsetX;
                vueInstance.editor.imageDragStartY = vueInstance.editor.imageOffsetY;
            });

            // 拖动移动事件
            baseImage.on('dragmove', function () {
                var position = baseImage.position();
                vueInstance.editor.imageOffsetX = position.x;
                vueInstance.editor.imageOffsetY = position.y;
            });

            // 拖动结束事件
            baseImage.on('dragend', function () {
                vueInstance.editor.isImageDragging = false;
                // 更新恢复按钮状态
                if (vueInstance.updateRestoreBtnState) {
                    vueInstance.updateRestoreBtnState();
                }
            });
        },

        /**
         * 同步状态
         * @param {Object} baseLayerInstance - 底图层实例对象
         */
        syncState: function (baseLayerInstance) {
            var baseImage = baseLayerInstance.baseImage;
            var vueInstance = baseLayerInstance.vueInstance;

            // 同步显示状态
            baseImage.visible(vueInstance.editor.showImage);

            // 同步位置
            baseImage.position({
                x: vueInstance.editor.imageOffsetX,
                y: vueInstance.editor.imageOffsetY
            });

            // 同步缩放
            baseImage.scale({
                x: vueInstance.editor.imageScale,
                y: vueInstance.editor.imageScale
            });

            // 重绘图层
            baseLayerInstance.stageInstance.layers.backgroundLayer.draw();
        },

        /**
         * 更新底图
         * @param {Object} baseLayerInstance - 底图层实例对象
         * @param {HTMLImageElement|string} image - 图片对象或图片URL
         */
        updateBaseImage: function (baseLayerInstance, image) {
            var baseImage = baseLayerInstance.baseImage;
            var vueInstance = baseLayerInstance.vueInstance;

            if (typeof image === 'string') {
                // 如果是URL，创建图片对象
                var img = new Image();
                img.onload = function () {
                    baseImage.image(img);
                    baseImage.width(img.width);
                    baseImage.height(img.height);
                    // 同步状态
                    vueInstance.editor.baseImageWidth = img.width;
                    vueInstance.editor.baseImageHeight = img.height;
                    // 重绘图层
                    baseLayerInstance.stageInstance.layers.backgroundLayer.draw();
                };
                img.onerror = function () {
                    console.error('Failed to load base image');
                };
                // 允许跨域
                img.crossOrigin = 'Anonymous';
                img.src = image;
            } else if (image instanceof HTMLImageElement) {
                // 如果是图片对象，直接使用
                baseImage.image(image);
                baseImage.width(image.width);
                baseImage.height(image.height);
                // 同步状态
                vueInstance.editor.baseImageWidth = image.width;
                vueInstance.editor.baseImageHeight = image.height;
                // 重绘图层
                baseLayerInstance.stageInstance.layers.backgroundLayer.draw();
            }
        },

        /**
         * 显示/隐藏底图
         * @param {Object} baseLayerInstance - 底图层实例对象
         * @param {boolean} visible - 是否可见
         */
        setBaseImageVisible: function (baseLayerInstance, visible) {
            var baseImage = baseLayerInstance.baseImage;
            baseImage.visible(visible);
            // 重绘图层
            baseLayerInstance.stageInstance.layers.backgroundLayer.draw();
        },

        /**
         * 设置底图位置
         * @param {Object} baseLayerInstance - 底图层实例对象
         * @param {number} x - X坐标
         * @param {number} y - Y坐标
         */
        setBaseImagePosition: function (baseLayerInstance, x, y) {
            var baseImage = baseLayerInstance.baseImage;
            baseImage.position({ x: x, y: y });
            // 重绘图层
            baseLayerInstance.stageInstance.layers.backgroundLayer.draw();
        },

        /**
         * 设置底图缩放
         * @param {Object} baseLayerInstance - 底图层实例对象
         * @param {number} scale - 缩放比例
         */
        setBaseImageScale: function (baseLayerInstance, scale) {
            var baseImage = baseLayerInstance.baseImage;
            baseImage.scale({ x: scale, y: scale });
            // 重绘图层
            baseLayerInstance.stageInstance.layers.backgroundLayer.draw();
        },

        /**
         * 启用/禁用底图拖拽
         * @param {Object} baseLayerInstance - 底图层实例对象
         * @param {boolean} draggable - 是否可拖拽
         */
        setBaseImageDraggable: function (baseLayerInstance, draggable) {
            var baseImage = baseLayerInstance.baseImage;
            baseImage.draggable(draggable);
        },

        /**
         * 销毁底图层实例
         * @param {Object} baseLayerInstance - 底图层实例对象
         */
        destroyBaseLayer: function (baseLayerInstance) {
            var baseImage = baseLayerInstance.baseImage;
            if (baseImage) {
                // 移除事件监听器
                baseImage.off('click tap');
                baseImage.off('dragstart');
                baseImage.off('dragmove');
                baseImage.off('dragend');
                // 从图层中移除
                baseImage.remove();
            }
            // 清空引用
            baseLayerInstance.isInitialized = false;
            baseLayerInstance.baseImage = null;
            baseLayerInstance.stageInstance = null;
            baseLayerInstance.vueInstance = null;
        }
    };

    // 导出模块
    window.MeeWoo.Core.KonvaBaseLayer = KonvaBaseLayer;
})(window);
