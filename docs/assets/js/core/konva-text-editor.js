/**
 * ==================== Konva 文案层编辑模块 (Konva Text Editor) ====================
 * 
 * 模块索引：
 * 1. 【文案层管理】 - 文案层的创建、显示/隐藏、更新
 * 2. 【内容编辑】 - 文本内容的编辑和管理
 * 3. 【样式编辑】 - 文本样式的编辑和管理（包括渐变、描边、阴影等）
 * 4. 【交互控制】 - 拖拽移动和缩放调整
 * 5. 【状态管理】 - 与现有状态管理系统的集成
 * 
 * 功能说明：
 * 提供基于 Konva.Text 的文案层编辑功能，包括：
 * 1. 显示/隐藏文案层
 * 2. 内容编辑
 * 3. 样式编辑（包括渐变、描边、阴影等效果）
 * 4. 拖拽移动和缩放调整
 * 5. 与现有状态管理系统的集成
 * 
 * 命名空间：MeeWoo.Core.KonvaTextEditor
 */

(function (window) {
    'use strict';

    // 确保命名空间存在
    window.MeeWoo = window.MeeWoo || {};
    window.MeeWoo.Core = window.MeeWoo.Core || {};

    /**
     * Konva 文案层编辑模块
     */
    var KonvaTextEditor = {
        /**
         * ==================== 【文案层管理】 ====================
         */

        /**
         * 创建文案层元素
         * @param {Object} config - 文本配置
         * @param {Object} vueInstance - Vue实例（可选）
         * @returns {Konva.Text} 文本元素实例
         */
        createTextLayer: function (config, vueInstance) {
            // 确保 Konva 库已加载
            if (typeof Konva === 'undefined') {
                throw new Error('Konva library not loaded');
            }

            var defaultConfig = {
                x: 0,
                y: 0,
                text: '文案内容',
                fontSize: 24,
                fontFamily: 'Arial',
                fill: '#000000',
                align: 'center',
                verticalAlign: 'middle',
                draggable: true,
                id: 'text-layer-' + Date.now() + '-' + Math.floor(Math.random() * 10000)
            };

            var textConfig = Object.assign({}, defaultConfig, config);
            var textElement = new Konva.Text(textConfig);

            // 设置元素数据
            textElement.setAttr('elementType', 'text');
            textElement.setAttr('elementData', textConfig);
            textElement.setAttr('isTextLayer', true);

            // 如果提供了 Vue 实例，添加点击事件处理
            if (vueInstance) {
                this.initTextLayerEvents(textElement, vueInstance);
            }

            return textElement;
        },

        /**
         * 初始化文本层事件
         * @param {Konva.Text} textElement - 文本元素实例
         * @param {Object} vueInstance - Vue实例
         */
        initTextLayerEvents: function (textElement, vueInstance) {
            // 点击事件
            textElement.on('click tap', function (e) {
                // 阻止事件冒泡，避免与预览区域事件冲突
                e.cancelBubble = true;
                
                // 激活文本层
                vueInstance.editor.activeElement = 'text';
                vueInstance.editor.lastClickElement = 'text';
                vueInstance.editor.lastClickTime = Date.now();
            });

            // 拖动开始事件
            textElement.on('dragstart', function () {
                vueInstance.editor.isTextDragging = true;
                vueInstance.editor.textDragStartX = vueInstance.editor.textPosX;
                vueInstance.editor.textDragStartY = vueInstance.editor.textPosY;
            });

            // 拖动移动事件
            textElement.on('dragmove', function () {
                var position = textElement.position();
                // 计算相对于画布的百分比位置
                var stageWidth = vueInstance.editor.baseImageWidth || 500;
                var stageHeight = vueInstance.editor.baseImageHeight || 500;
                var percentX = (position.x / stageWidth) * 100;
                var percentY = (position.y / stageHeight) * 100;
                vueInstance.editor.textPosX = percentX;
                vueInstance.editor.textPosY = percentY;
            });

            // 拖动结束事件
            textElement.on('dragend', function () {
                vueInstance.editor.isTextDragging = false;
                // 更新恢复按钮状态
                if (vueInstance.updateRestoreBtnState) {
                    vueInstance.updateRestoreBtnState();
                }
            });
        },

        /**
         * 显示文案层
         * @param {Konva.Text} textElement - 文本元素实例
         */
        showTextLayer: function (textElement) {
            if (textElement && textElement instanceof Konva.Text) {
                textElement.visible(true);
                textElement.getLayer().draw();
            }
        },

        /**
         * 隐藏文案层
         * @param {Konva.Text} textElement - 文本元素实例
         */
        hideTextLayer: function (textElement) {
            if (textElement && textElement instanceof Konva.Text) {
                textElement.visible(false);
                textElement.getLayer().draw();
            }
        },

        /**
         * 切换文案层显示/隐藏状态
         * @param {Konva.Text} textElement - 文本元素实例
         * @returns {boolean} 切换后的显示状态
         */
        toggleTextLayer: function (textElement) {
            if (textElement && textElement instanceof Konva.Text) {
                var newVisibility = !textElement.visible();
                textElement.visible(newVisibility);
                textElement.getLayer().draw();
                return newVisibility;
            }
            return false;
        },

        /**
         * ==================== 【内容编辑】 ====================
         */

        /**
         * 更新文本内容
         * @param {Konva.Text} textElement - 文本元素实例
         * @param {string} content - 新的文本内容
         */
        updateTextContent: function (textElement, content) {
            if (textElement && textElement instanceof Konva.Text) {
                textElement.text(content);
                
                // 更新元素数据
                var elementData = textElement.getAttr('elementData') || {};
                elementData.text = content;
                textElement.setAttr('elementData', elementData);
                
                textElement.getLayer().draw();
            }
        },

        /**
         * 获取文本内容
         * @param {Konva.Text} textElement - 文本元素实例
         * @returns {string} 文本内容
         */
        getTextContent: function (textElement) {
            if (textElement && textElement instanceof Konva.Text) {
                return textElement.text();
            }
            return '';
        },

        /**
         * ==================== 【样式编辑】 ====================
         */

        /**
         * 更新文本样式
         * @param {Konva.Text} textElement - 文本元素实例
         * @param {Object} style - 样式对象
         */
        updateTextStyle: function (textElement, style) {
            if (textElement && textElement instanceof Konva.Text) {
                // 更新元素属性
                textElement.setAttrs(style);
                
                // 更新元素数据
                var elementData = textElement.getAttr('elementData') || {};
                textElement.setAttr('elementData', Object.assign({}, elementData, style));
                
                textElement.getLayer().draw();
            }
        },

        /**
         * 创建线性渐变填充
         * @param {Konva.Stage} stage - Konva 舞台实例
         * @param {Object} options - 渐变选项
         * @returns {Konva.LinearGradient} 线性渐变实例
         */
        createLinearGradient: function (stage, options) {
            var defaultOptions = {
                x0: 0,
                y0: 0,
                x1: 100,
                y1: 0,
                stops: [0, 'red', 1, 'blue']
            };

            var gradientOptions = Object.assign({}, defaultOptions, options);
            return new Konva.LinearGradient(gradientOptions);
        },

        /**
         * 创建径向渐变填充
         * @param {Konva.Stage} stage - Konva 舞台实例
         * @param {Object} options - 渐变选项
         * @returns {Konva.RadialGradient} 径向渐变实例
         */
        createRadialGradient: function (stage, options) {
            var defaultOptions = {
                cx: 50,
                cy: 50,
                r: 50,
                stops: [0, 'red', 1, 'blue']
            };

            var gradientOptions = Object.assign({}, defaultOptions, options);
            return new Konva.RadialGradient(gradientOptions);
        },

        /**
         * 设置文本描边
         * @param {Konva.Text} textElement - 文本元素实例
         * @param {Object} strokeOptions - 描边选项
         */
        setTextStroke: function (textElement, strokeOptions) {
            if (textElement && textElement instanceof Konva.Text) {
                var defaultStrokeOptions = {
                    stroke: '#000000',
                    strokeWidth: 1
                };

                var options = Object.assign({}, defaultStrokeOptions, strokeOptions);
                textElement.stroke(options.stroke);
                textElement.strokeWidth(options.strokeWidth);
                
                // 更新元素数据
                var elementData = textElement.getAttr('elementData') || {};
                elementData.stroke = options.stroke;
                elementData.strokeWidth = options.strokeWidth;
                textElement.setAttr('elementData', elementData);
                
                textElement.getLayer().draw();
            }
        },

        /**
         * 设置文本阴影
         * @param {Konva.Text} textElement - 文本元素实例
         * @param {Object} shadowOptions - 阴影选项
         */
        setTextShadow: function (textElement, shadowOptions) {
            if (textElement && textElement instanceof Konva.Text) {
                var defaultShadowOptions = {
                    shadowColor: 'black',
                    shadowBlur: 0,
                    shadowOffsetX: 0,
                    shadowOffsetY: 0,
                    shadowOpacity: 0.5
                };

                var options = Object.assign({}, defaultShadowOptions, shadowOptions);
                textElement.shadowColor(options.shadowColor);
                textElement.shadowBlur(options.shadowBlur);
                textElement.shadowOffsetX(options.shadowOffsetX);
                textElement.shadowOffsetY(options.shadowOffsetY);
                textElement.shadowOpacity(options.shadowOpacity);
                
                // 更新元素数据
                var elementData = textElement.getAttr('elementData') || {};
                elementData.shadowColor = options.shadowColor;
                elementData.shadowBlur = options.shadowBlur;
                elementData.shadowOffsetX = options.shadowOffsetX;
                elementData.shadowOffsetY = options.shadowOffsetY;
                elementData.shadowOpacity = options.shadowOpacity;
                textElement.setAttr('elementData', elementData);
                
                textElement.getLayer().draw();
            }
        },

        /**
         * ==================== 【交互控制】 ====================
         */

        /**
         * 启用文本元素的拖拽功能
         * @param {Konva.Text} textElement - 文本元素实例
         * @param {Function} dragEndCallback - 拖拽结束回调函数
         */
        enableTextDragging: function (textElement, dragEndCallback) {
            if (textElement && textElement instanceof Konva.Text) {
                textElement.draggable(true);
                
                // 添加拖拽结束事件监听
                if (typeof dragEndCallback === 'function') {
                    textElement.on('dragend', function () {
                        dragEndCallback({
                            x: textElement.x(),
                            y: textElement.y()
                        });
                    });
                }
            }
        },

        /**
         * 禁用文本元素的拖拽功能
         * @param {Konva.Text} textElement - 文本元素实例
         */
        disableTextDragging: function (textElement) {
            if (textElement && textElement instanceof Konva.Text) {
                textElement.draggable(false);
            }
        },

        /**
         * 设置文本元素位置
         * @param {Konva.Text} textElement - 文本元素实例
         * @param {number} x - X 坐标
         * @param {number} y - Y 坐标
         */
        setTextPosition: function (textElement, x, y) {
            if (textElement && textElement instanceof Konva.Text) {
                textElement.position({ x: x, y: y });
                
                // 更新元素数据
                var elementData = textElement.getAttr('elementData') || {};
                elementData.x = x;
                elementData.y = y;
                textElement.setAttr('elementData', elementData);
                
                textElement.getLayer().draw();
            }
        },

        /**
         * 获取文本元素位置
         * @param {Konva.Text} textElement - 文本元素实例
         * @returns {Object} 位置对象 { x, y }
         */
        getTextPosition: function (textElement) {
            if (textElement && textElement instanceof Konva.Text) {
                return {
                    x: textElement.x(),
                    y: textElement.y()
                };
            }
            return { x: 0, y: 0 };
        },

        /**
         * 设置文本元素缩放
         * @param {Konva.Text} textElement - 文本元素实例
         * @param {number} scaleX - X 轴缩放比例
         * @param {number} scaleY - Y 轴缩放比例
         */
        setTextScale: function (textElement, scaleX, scaleY) {
            if (textElement && textElement instanceof Konva.Text) {
                textElement.scale({ x: scaleX, y: scaleY });
                
                // 更新元素数据
                var elementData = textElement.getAttr('elementData') || {};
                elementData.scaleX = scaleX;
                elementData.scaleY = scaleY;
                textElement.setAttr('elementData', elementData);
                
                textElement.getLayer().draw();
            }
        },

        /**
         * 获取文本元素缩放
         * @param {Konva.Text} textElement - 文本元素实例
         * @returns {Object} 缩放对象 { x, y }
         */
        getTextScale: function (textElement) {
            if (textElement && textElement instanceof Konva.Text) {
                return {
                    x: textElement.scaleX(),
                    y: textElement.scaleY()
                };
            }
            return { x: 1, y: 1 };
        },

        /**
         * ==================== 【状态管理】 ====================
         */

        /**
         * 从编辑器状态创建文本元素
         * @param {Object} editorState - 编辑器状态
         * @param {Object} vueInstance - Vue实例（可选）
         * @returns {Konva.Text} 文本元素实例
         */
        createTextFromState: function (editorState, vueInstance) {
            // 计算实际位置（基于百分比）
            var stageWidth = editorState.baseImageWidth || 500;
            var stageHeight = editorState.baseImageHeight || 500;
            var x = (editorState.textPosX || 50) / 100 * stageWidth;
            var y = (editorState.textPosY || 50) / 100 * stageHeight;

            var textConfig = {
                x: x,
                y: y,
                text: editorState.textContent || '文案内容',
                fontSize: 24,
                fontFamily: 'Arial',
                fill: '#000000',
                align: editorState.textAlign || 'center',
                verticalAlign: 'middle',
                scaleX: editorState.textScale || 1,
                scaleY: editorState.textScale || 1
            };

            // 如果有文本样式，解析并应用
            if (editorState.textStyle) {
                try {
                    var styleObj = this.parseTextStyle(editorState.textStyle);
                    Object.assign(textConfig, styleObj);
                } catch (e) {
                    console.error('Failed to parse text style:', e);
                }
            }

            return this.createTextLayer(textConfig, vueInstance);
        },

        /**
         * 将文本元素状态同步到编辑器状态
         * @param {Konva.Text} textElement - 文本元素实例
         * @param {Object} editorState - 编辑器状态
         */
        syncTextToState: function (textElement, editorState) {
            if (textElement && textElement instanceof Konva.Text) {
                // 计算百分比位置
                var stageWidth = editorState.baseImageWidth || 500;
                var stageHeight = editorState.baseImageHeight || 500;
                var xPercent = (textElement.x() / stageWidth) * 100;
                var yPercent = (textElement.y() / stageHeight) * 100;

                // 更新编辑器状态
                editorState.textContent = textElement.text();
                editorState.textPosX = Math.max(0, Math.min(100, xPercent));
                editorState.textPosY = Math.max(0, Math.min(100, yPercent));
                editorState.textScale = textElement.scaleX(); // 假设 x 和 y 缩放相同
                editorState.textAlign = textElement.align();
                
                // 生成文本样式
                editorState.textStyle = this.generateTextStyle(textElement);
            }
        },

        /**
         * 解析文本样式字符串
         * @param {string} styleString - 样式字符串
         * @returns {Object} 样式对象
         */
        parseTextStyle: function (styleString) {
            var styleObj = {};
            var stylePairs = styleString.split(';');
            
            stylePairs.forEach(function (pair) {
                var parts = pair.split(':');
                if (parts.length === 2) {
                    var property = parts[0].trim();
                    var value = parts[1].trim();
                    
                    // 转换为 Konva 兼容的属性名
                    switch (property) {
                        case 'font-size':
                            styleObj.fontSize = parseInt(value);
                            break;
                        case 'font-family':
                            styleObj.fontFamily = value;
                            break;
                        case 'color':
                            styleObj.fill = value;
                            break;
                        case 'text-align':
                            styleObj.align = value;
                            break;
                        case 'font-weight':
                            styleObj.fontStyle = value;
                            break;
                        case 'font-style':
                            styleObj.fontStyle = value;
                            break;
                    }
                }
            });
            
            return styleObj;
        },

        /**
         * 生成文本样式字符串
         * @param {Konva.Text} textElement - 文本元素实例
         * @returns {string} 样式字符串
         */
        generateTextStyle: function (textElement) {
            var styles = [];
            
            styles.push('font-size: ' + textElement.fontSize() + 'px');
            styles.push('font-family: ' + textElement.fontFamily());
            styles.push('color: ' + textElement.fill());
            styles.push('text-align: ' + textElement.align());
            
            if (textElement.fontStyle()) {
                styles.push('font-style: ' + textElement.fontStyle());
            }
            
            if (textElement.fontWeight()) {
                styles.push('font-weight: ' + textElement.fontWeight());
            }
            
            return styles.join('; ');
        },

        /**
         * 应用富文本样式
         * @param {Konva.Text} textElement - 文本元素实例
         * @param {Object} richTextStyle - 富文本样式对象
         */
        applyRichTextStyle: function (textElement, richTextStyle) {
            if (textElement && textElement instanceof Konva.Text) {
                // 应用基本样式
                if (richTextStyle.fontSize) textElement.fontSize(richTextStyle.fontSize);
                if (richTextStyle.fontFamily) textElement.fontFamily(richTextStyle.fontFamily);
                if (richTextStyle.fontStyle) textElement.fontStyle(richTextStyle.fontStyle);
                if (richTextStyle.fontWeight) textElement.fontWeight(richTextStyle.fontWeight);
                if (richTextStyle.align) textElement.align(richTextStyle.align);
                if (richTextStyle.verticalAlign) textElement.verticalAlign(richTextStyle.verticalAlign);
                
                // 应用填充样式
                if (richTextStyle.fill) {
                    textElement.fill(richTextStyle.fill);
                } else if (richTextStyle.gradient) {
                    // 应用渐变
                    if (richTextStyle.gradient.type === 'linear') {
                        var linearGradient = this.createLinearGradient(textElement.getStage(), richTextStyle.gradient.options);
                        textElement.fill(linearGradient);
                    } else if (richTextStyle.gradient.type === 'radial') {
                        var radialGradient = this.createRadialGradient(textElement.getStage(), richTextStyle.gradient.options);
                        textElement.fill(radialGradient);
                    }
                }
                
                // 应用描边
                if (richTextStyle.stroke) {
                    this.setTextStroke(textElement, richTextStyle.stroke);
                }
                
                // 应用阴影
                if (richTextStyle.shadow) {
                    this.setTextShadow(textElement, richTextStyle.shadow);
                }
                
                // 更新元素数据
                var elementData = textElement.getAttr('elementData') || {};
                Object.assign(elementData, richTextStyle);
                textElement.setAttr('elementData', elementData);
                
                textElement.getLayer().draw();
            }
        }
    };

    // 导出模块
    window.MeeWoo.Core.KonvaTextEditor = KonvaTextEditor;
})(window);