/**
 * ==================== 素材编辑器主控模块 (Material Editor Main Controller) ====================
 * 
 * 模块索引：
 * 1. 【数据定义】 - data() - 编辑器状态和素材编辑状态定义
 * 2. 【计算属性】 - computed() - 样式处理和状态判断相关计算属性
 * 3. 【监听器】 - watch() - 监听编辑状态变化
 * 4. 【方法代理】 - methods() - 代理到各功能模块的方法
 * 
 * 功能说明：
 * 素材编辑器的主控制器，负责：
 * 1. 组织和协调各个子模块（状态管理、操作逻辑）
 * 2. 提供Vue Mixin接口
 * 3. 作为各功能模块的协调中心
 * 4. 使用 Konva.js 作为唯一的渲染引擎
 * 
 * 依赖模块：
 * - MeeWoo.Core.MaterialState (状态管理)
 * - MeeWoo.Core.MaterialOperations (操作逻辑)
 * 
 * 使用方式：
 * 在 app.js 中引入此文件及相关依赖，并将 MaterialEditor 作为 mixin 混入 Vue 实例
 */

(function (window) {
    'use strict';

    // 确保命名空间存在
    window.MeeWoo = window.MeeWoo || {};
    window.MeeWoo.Mixins = window.MeeWoo.Mixins || {};

    var MaterialEditor = {
        data: function () {
            return {
                editor: window.MeeWoo.Core.MaterialState.getDefaultEditorState(),
                materialEditStates: window.MeeWoo.Core.MaterialState.getDefaultMaterialEditStates(),
                stageInstance: null,
                baseLayerInstance: null,
                textLayerInstance: null,
                transformerInstance: null,
                exportAreaGuide: null,
                konvaLayers: {
                    backgroundLayer: null,
                    textLayer: null,
                    transformerLayer: null
                },
                textCanvas: null,
                textCanvasCtx: null
            };
        },

        computed: {
            editorTextStyleFiltered: function () {
                return window.MeeWoo.Core.MaterialOperations.filterTextStyle(this.editor.textStyle);
            },

            editorTextStyleString: function () {
                var styles = this.editorTextStyleFiltered;
                return window.MeeWoo.Core.MaterialOperations.convertStylesToCssString(styles);
            },

            hasEditInfo: function () {
                return this.editor.showRestoreBtn;
            }
        },

        watch: {
            'editor.baseImage': function () {
                this.updateRestoreBtnState();
                this.$nextTick(function () {
                    this.updateKonvaBaseImage();
                }.bind(this));
            },
            
            'editor.showImage': function (visible) {
                this.updateRestoreBtnState();
                if (this.baseLayerInstance && this.stageInstance) {
                    this.baseLayerInstance.visible(visible);
                    this.stageInstance.draw();
                }
            },
            
            'editor.showText': function (visible) {
                this.updateRestoreBtnState();
                if (this.textLayerInstance && this.stageInstance) {
                    this.textLayerInstance.visible(visible);
                    // 当显示文字时，需要重新渲染文字 canvas
                    if (visible) {
                        this.renderTextCanvas();
                    }
                    this.stageInstance.draw();
                }
            },
            
            'editor.imageOffsetX': function () {
                this.updateRestoreBtnState();
                this.syncKonvaBaseImageTransform();
            },
            'editor.imageOffsetY': function () {
                this.updateRestoreBtnState();
                this.syncKonvaBaseImageTransform();
            },
            'editor.imageScale': function () {
                this.updateRestoreBtnState();
                this.syncKonvaBaseImageTransform();
            },

            'editor.textContent': function () {
                this.renderTextCanvas();
                if (this.stageInstance) {
                    this.stageInstance.draw();
                }
            },
            
            'editor.textStyle': function () {
                this.renderTextCanvas();
                if (this.stageInstance) {
                    this.stageInstance.draw();
                }
            },
            
            'editor.textPosX': function () {
                this.syncKonvaTextPosition();
            },
            'editor.textPosY': function () {
                this.syncKonvaTextPosition();
            },
            
            'editor.textScale': function () {
                if (this.textLayerInstance && this.stageInstance) {
                    this.textLayerInstance.scaleX(this.editor.textScale);
                    this.textLayerInstance.scaleY(this.editor.textScale);
                    this.stageInstance.draw();
                }
            },
            
            'editor.textAlign': function () {
                this.renderTextCanvas();
                if (this.stageInstance) {
                    this.stageInstance.draw();
                }
            }
        },

        methods: {
            setTextAlign: function (align) {
                this.editor.textAlign = align;
            },

            updateRestoreBtnState: function () {
                window.MeeWoo.Core.MaterialState.updateRestoreButtonState(this.editor);
            },

            clearDragListeners: function () {},

            restoreOriginalMaterial: function () {
                window.MeeWoo.Core.MaterialOperations.restoreOriginalMaterial(this);
                this.$nextTick(function () {
                    this.updateKonvaBaseImage();
                    this.renderTextCanvas();
                    this.stageInstance.draw();
                }.bind(this));
            },
            
            clearAllMaterialEditStates: function () {
                this.materialEditStates = window.MeeWoo.Core.MaterialState.getDefaultMaterialEditStates();
            },

            initKonvaStage: function () {
                var _this = this;
                var container = this.$refs.editorPreviewContent;
                if (!container) {
                    console.error('Konva container not found');
                    return;
                }

                try {
                    if (typeof Konva === 'undefined') {
                        console.error('Konva library not loaded');
                        return;
                    }

                    var containerWidth = container.parentElement.clientWidth;
                    var containerHeight = container.parentElement.clientHeight;

                    if (this.stageInstance) {
                        this.clearKonvaContent();
                        
                        this.stageInstance.width(containerWidth);
                        this.stageInstance.height(containerHeight);
                        
                        this.textCanvas = null;
                        this.textCanvasCtx = null;
                        
                        this.initExportAreaGuide();
                        this.initKonvaTransformer();
                        
                        this.initKonvaBaseImage();
                        this.initKonvaTextLayer();
                        this.stageInstance.draw();
                        return;
                    }

                    this.stageInstance = new Konva.Stage({
                        container: container,
                        width: containerWidth,
                        height: containerHeight
                    });

                    this.konvaLayers.backgroundLayer = new Konva.Layer({
                        name: 'backgroundLayer'
                    });
                    this.stageInstance.add(this.konvaLayers.backgroundLayer);

                    this.konvaLayers.textLayer = new Konva.Layer({
                        name: 'textLayer'
                    });
                    this.stageInstance.add(this.konvaLayers.textLayer);

                    this.konvaLayers.transformerLayer = new Konva.Layer({
                        name: 'transformerLayer'
                    });
                    this.stageInstance.add(this.konvaLayers.transformerLayer);

                    this.initExportAreaGuide();
                    this.initKonvaTransformer();

                    this.initKonvaBaseImage();
                    this.initKonvaTextLayer();
                    this.stageInstance.draw();
                    this.initKonvaStageEvents();

                } catch (error) {
                    console.error('Failed to initialize Konva stage:', error);
                }
            },

            initExportAreaGuide: function () {
                if (!this.stageInstance) return;

                var stageWidth = this.stageInstance.width();
                var stageHeight = this.stageInstance.height();
                var exportWidth = this.editor.baseImageWidth || stageWidth;
                var exportHeight = this.editor.baseImageHeight || stageHeight;

                var exportX = (stageWidth - exportWidth) / 2;
                var exportY = (stageHeight - exportHeight) / 2;

                this.editor.exportAreaX = exportX;
                this.editor.exportAreaY = exportY;

                if (this.exportAreaGuide) {
                    this.exportAreaGuide.destroy();
                }

                this.exportAreaGuide = new Konva.Rect({
                    x: exportX,
                    y: exportY,
                    width: exportWidth,
                    height: exportHeight,
                    stroke: '#00a8ff',
                    strokeWidth: 1,
                    dash: [5, 5],
                    listening: false
                });

                this.konvaLayers.backgroundLayer.add(this.exportAreaGuide);
            },

            clearKonvaContent: function () {
                if (this.transformerInstance) {
                    this.transformerInstance.destroy();
                    this.transformerInstance = null;
                }
                
                if (this.exportAreaGuide) {
                    this.exportAreaGuide.destroy();
                    this.exportAreaGuide = null;
                }
                
                if (this.baseLayerInstance) {
                    this.baseLayerInstance.destroy();
                    this.baseLayerInstance = null;
                }
                
                if (this.textLayerInstance) {
                    this.textLayerInstance.destroy();
                    this.textLayerInstance = null;
                }
                
                this.textCanvas = null;
                this.textCanvasCtx = null;
                
                this.editor.activeElement = 'none';
            },

            initKonvaTransformer: function () {
                if (!this.stageInstance) return;

                this.transformerInstance = new Konva.Transformer({
                    rotateEnabled: false,
                    enabledAnchors: ['top-left', 'top-right', 'bottom-left', 'bottom-right'],
                    boundBoxFunc: function (oldBox, newBox) {
                        if (newBox.width < 20 || newBox.height < 20) {
                            return oldBox;
                        }
                        return newBox;
                    }
                });
                this.konvaLayers.transformerLayer.add(this.transformerInstance);
            },

            updateTransformer: function () {
                if (!this.transformerInstance || !this.stageInstance) return;

                var targetNode = null;
                if (this.editor.activeElement === 'image' && this.baseLayerInstance) {
                    targetNode = this.baseLayerInstance;
                } else if (this.editor.activeElement === 'text' && this.textLayerInstance) {
                    targetNode = this.textLayerInstance;
                }

                if (targetNode) {
                    this.transformerInstance.nodes([targetNode]);
                } else {
                    this.transformerInstance.nodes([]);
                }
                this.stageInstance.draw();
            },

            initKonvaBaseImage: function () {
                if (!this.stageInstance || this.baseLayerInstance) return;

                var _this = this;

                var exportCenterX = this.editor.exportAreaX + (this.editor.baseImageWidth / 2);
                var exportCenterY = this.editor.exportAreaY + (this.editor.baseImageHeight / 2);

                this.baseLayerInstance = new Konva.Group({
                    name: 'baseImageGroup',
                    draggable: false,
                    visible: this.editor.showImage,
                    x: exportCenterX + this.editor.imageOffsetX,
                    y: exportCenterY + this.editor.imageOffsetY,
                    scaleX: this.editor.imageScale,
                    scaleY: this.editor.imageScale
                });

                if (this.editor.baseImage) {
                    var img = new Image();
                    img.onload = function () {
                        var baseImage = new Konva.Image({
                            name: 'baseImage',
                            image: img,
                            width: img.width,
                            height: img.height,
                            offsetX: img.width / 2,
                            offsetY: img.height / 2
                        });

                        _this.baseLayerInstance.add(baseImage);
                        _this.konvaLayers.backgroundLayer.add(_this.baseLayerInstance);
                        _this.stageInstance.draw();

                        _this.bindBaseImageEvents();
                    };
                    img.crossOrigin = 'Anonymous';
                    img.src = this.editor.baseImage;
                } else {
                    this.konvaLayers.backgroundLayer.add(this.baseLayerInstance);
                }
            },

            bindBaseImageEvents: function () {
                var _this = this;
                
                if (!this.baseLayerInstance) return;

                var exportCenterX = this.editor.exportAreaX + (this.editor.baseImageWidth / 2);
                var exportCenterY = this.editor.exportAreaY + (this.editor.baseImageHeight / 2);

                this.baseLayerInstance.on('click tap', function (e) {
                    e.cancelBubble = true;
                    _this.editor.activeElement = 'image';
                    _this.baseLayerInstance.draggable(true);
                    _this.stageInstance.draggable(false);
                    _this.updateTransformer();
                });

                this.baseLayerInstance.on('dragstart', function () {
                    _this.editor.isImageDragging = true;
                });

                this.baseLayerInstance.on('dragmove', function () {
                    _this.editor.imageOffsetX = _this.baseLayerInstance.x() - exportCenterX;
                    _this.editor.imageOffsetY = _this.baseLayerInstance.y() - exportCenterY;
                });

                this.baseLayerInstance.on('dragend', function () {
                    _this.editor.isImageDragging = false;
                    _this.updateRestoreBtnState();
                });

                this.baseLayerInstance.on('transformstart', function () {
                    _this.editor.isImageDragging = true;
                });

                this.baseLayerInstance.on('transform', function () {
                    _this.editor.imageOffsetX = _this.baseLayerInstance.x() - exportCenterX;
                    _this.editor.imageOffsetY = _this.baseLayerInstance.y() - exportCenterY;
                    _this.editor.imageScale = _this.baseLayerInstance.scaleX();
                });

                this.baseLayerInstance.on('transformend', function () {
                    _this.editor.isImageDragging = false;
                    _this.editor.imageScale = parseFloat(_this.baseLayerInstance.scaleX().toFixed(2));
                    _this.updateRestoreBtnState();
                });
            },

            initKonvaTextLayer: function () {
                if (!this.stageInstance || this.textLayerInstance) return;

                var exportWidth = this.editor.baseImageWidth || 500;
                var exportHeight = this.editor.baseImageHeight || 500;
                var exportCenterX = this.editor.exportAreaX + (exportWidth / 2);
                var exportCenterY = this.editor.exportAreaY + (exportHeight / 2);

                this.textCanvas = null;
                this.textCanvasCtx = null;

                var textX = exportCenterX + ((this.editor.textPosX - 50) / 100) * exportWidth;
                var textY = exportCenterY + ((this.editor.textPosY - 50) / 100) * exportHeight;

                this.textLayerInstance = new Konva.Image({
                    name: 'textContent',
                    image: null,
                    visible: this.editor.showText,
                    draggable: false,
                    x: textX,
                    y: textY,
                    offsetX: 0,
                    offsetY: 0,
                    scaleX: this.editor.textScale,
                    scaleY: this.editor.textScale
                });

                this.konvaLayers.textLayer.add(this.textLayerInstance);
                this.bindTextEvents();
                this.renderTextCanvas();
            },

            renderTextCanvas: function () {
                var style = this.editorTextStyleFiltered;
                var text = this.editor.textContent;

                if (!text || !this.editor.showText) {
                    if (this.textCanvas && this.textCanvasCtx) {
                        this.textCanvasCtx.clearRect(0, 0, this.textCanvas.width, this.textCanvas.height);
                    }
                    if (this.textLayerInstance && this.stageInstance) {
                        this.stageInstance.draw();
                    }
                    return;
                }

                var fontSize = parseFloat(style['font-size']) || 24;
                var fontFamily = style['font-family'] || 'sans-serif';
                var fontWeight = style['font-weight'] || 'normal';
                var fontStyle = style['font-style'] || 'normal';

                fontFamily = fontFamily.replace(/['"]/g, '');

                var ctx;
                if (this.textCanvasCtx) {
                    ctx = this.textCanvasCtx;
                    ctx.font = fontStyle + ' ' + fontWeight + ' ' + fontSize + 'px "' + fontFamily + '"';
                } else {
                    var tempCanvas = document.createElement('canvas');
                    tempCanvas.width = 1;
                    tempCanvas.height = 1;
                    ctx = tempCanvas.getContext('2d');
                    ctx.font = fontStyle + ' ' + fontWeight + ' ' + fontSize + 'px "' + fontFamily + '"';
                }

                var lines = text.split('\n');
                var lineHeight = fontSize * 1.2;
                var totalHeight = lines.length * lineHeight;

                var maxWidth = 0;
                for (var i = 0; i < lines.length; i++) {
                    var w = ctx.measureText(lines[i]).width;
                    if (w > maxWidth) maxWidth = w;
                }

                var padding = Math.max(maxWidth, totalHeight) * 0.25;
                var canvasWidth = Math.ceil(maxWidth + padding * 2);
                var canvasHeight = Math.ceil(totalHeight + padding * 2);

                if (!this.textCanvas || this.textCanvas.width !== canvasWidth || this.textCanvas.height !== canvasHeight) {
                    this.textCanvas = document.createElement('canvas');
                    this.textCanvas.width = canvasWidth;
                    this.textCanvas.height = canvasHeight;
                    this.textCanvasCtx = this.textCanvas.getContext('2d');
                    ctx = this.textCanvasCtx;
                    ctx.font = fontStyle + ' ' + fontWeight + ' ' + fontSize + 'px "' + fontFamily + '"';

                    if (this.textLayerInstance) {
                        this.textLayerInstance.image(this.textCanvas);
                        this.textLayerInstance.offsetX(canvasWidth / 2);
                        this.textLayerInstance.offsetY(canvasHeight / 2);
                    }
                }

                ctx.clearRect(0, 0, canvasWidth, canvasHeight);

                ctx.save();

                var textAlign = this.editor.textAlign;
                var textX;
                if (textAlign === 'left') {
                    textX = padding;
                } else if (textAlign === 'right') {
                    textX = canvasWidth - padding;
                } else {
                    textX = canvasWidth / 2;
                }

                var startY = padding + (lineHeight / 2);

                ctx.textAlign = textAlign;
                ctx.textBaseline = 'middle';

                var fillStyle = style['color'] || '#000000';
                var bgStr = style['background'] || style['background-image'];
                var hasBackgroundClip = style['-webkit-background-clip'] === 'text' || style['background-clip'] === 'text';

                if (bgStr && bgStr.indexOf('gradient') !== -1 && hasBackgroundClip) {
                    var angleMatch = bgStr.match(/linear-gradient\((\d+)deg/);
                    var angle = angleMatch ? parseInt(angleMatch[1]) : 180;

                    var colors = [];
                    var colorRegex = /(#[0-9a-fA-F]+|rgba?\([^)]+\))\s*(\d+(?:\.\d+)?%?)/g;
                    var m;
                    while ((m = colorRegex.exec(bgStr)) !== null) {
                        var stop = m[2];
                        if (stop.indexOf('%') !== -1) {
                            stop = parseFloat(stop) / 100;
                        } else {
                            stop = parseFloat(stop) / 100;
                        }
                        colors.push({
                            color: m[1],
                            stop: stop
                        });
                    }

                    if (colors.length >= 2) {
                        if (colors[0].stop === null || isNaN(colors[0].stop)) colors[0].stop = 0;
                        if (colors[colors.length - 1].stop === null || isNaN(colors[colors.length - 1].stop)) {
                            colors[colors.length - 1].stop = 1;
                        }

                        var x0, y0, x1, y1;

                        if (angle === 0) {
                            x0 = textX; y0 = startY + totalHeight / 2; x1 = textX; y1 = startY - totalHeight / 2;
                        } else if (angle === 90) {
                            x0 = textX - maxWidth / 2; y0 = canvasHeight / 2; x1 = textX + maxWidth / 2; y1 = canvasHeight / 2;
                        } else if (angle === 270) {
                            x0 = textX + maxWidth / 2; y0 = canvasHeight / 2; x1 = textX - maxWidth / 2; y1 = canvasHeight / 2;
                        } else {
                            x0 = textX; y0 = startY - totalHeight / 2; x1 = textX; y1 = startY + totalHeight / 2;
                        }

                        var grad = ctx.createLinearGradient(x0, y0, x1, y1);

                        for (var k = 0; k < colors.length; k++) {
                            var s = Math.max(0, Math.min(1, colors[k].stop));
                            grad.addColorStop(s, colors[k].color);
                        }
                        fillStyle = grad;
                    }
                }

                if (style['text-shadow']) {
                    var shadowsStr = style['text-shadow'];

                    var tempStr = shadowsStr.replace(/rgba?\([^)]+\)/gi, function (match) {
                        return match.replace(/,/g, '|');
                    });

                    var shadowsArr = tempStr.split(',').map(function (s) {
                        return s.replace(/\|/g, ',').trim();
                    });

                    for (var i = 0; i < shadowsArr.length; i++) {
                        var shadow = shadowsArr[i];
                        var shadowMatch = shadow.match(/(-?[\d.]+(?:px)?|0)\s+(-?[\d.]+(?:px)?|0)(?:\s+(-?[\d.]+(?:px)?|0))?\s+(#[0-9a-fA-F]+|rgba?\([^)]+\))/i);

                        if (shadowMatch) {
                            ctx.save();
                            ctx.shadowOffsetX = parseFloat(shadowMatch[1]);
                            ctx.shadowOffsetY = parseFloat(shadowMatch[2]);
                            ctx.shadowBlur = shadowMatch[3] ? parseFloat(shadowMatch[3]) : 0;
                            ctx.shadowColor = shadowMatch[4];

                            ctx.fillStyle = fillStyle;
                            for (var lineIdx = 0; lineIdx < lines.length; lineIdx++) {
                                var lineY = startY + (lineIdx * lineHeight);
                                ctx.fillText(lines[lineIdx], textX, lineY);
                            }
                            ctx.restore();
                        }
                    }

                    ctx.shadowOffsetX = 0;
                    ctx.shadowOffsetY = 0;
                    ctx.shadowBlur = 0;
                }

                var strokeStr = style['-webkit-text-stroke'] || style['border'];
                if (strokeStr) {
                    var stroke = this.parseStroke(strokeStr);
                    if (stroke) {
                        ctx.lineWidth = stroke.width;

                        ctx.strokeStyle = (stroke.color === 'transparent' && fillStyle instanceof CanvasGradient)
                            ? fillStyle
                            : stroke.color;

                        ctx.lineJoin = 'round';
                        for (var lineIdx = 0; lineIdx < lines.length; lineIdx++) {
                            var lineY = startY + (lineIdx * lineHeight);
                            ctx.strokeText(lines[lineIdx], textX, lineY);
                        }
                    }
                }

                ctx.fillStyle = fillStyle;
                for (var lineIdx = 0; lineIdx < lines.length; lineIdx++) {
                    var lineY = startY + (lineIdx * lineHeight);
                    ctx.fillText(lines[lineIdx], textX, lineY);
                }

                ctx.restore();

                if (this.textLayerInstance && this.stageInstance) {
                    this.stageInstance.draw();
                }
            },

            parseStroke: function (strokeStr) {
                if (!strokeStr) return null;

                var match = strokeStr.match(/(-?[\d.]+(?:px|em)?)\s+(#[0-9a-fA-F]+|rgba?\([^)]+\)|transparent)/i);
                if (match) {
                    return {
                        width: parseFloat(match[1]),
                        color: match[2]
                    };
                }
                return null;
            },

            bindTextEvents: function () {
                var _this = this;

                if (!this.textLayerInstance) return;

                var exportWidth = this.editor.baseImageWidth || 500;
                var exportHeight = this.editor.baseImageHeight || 500;
                var exportCenterX = this.editor.exportAreaX + (exportWidth / 2);
                var exportCenterY = this.editor.exportAreaY + (exportHeight / 2);

                this.textLayerInstance.on('click tap', function (e) {
                    e.cancelBubble = true;
                    _this.editor.activeElement = 'text';
                    _this.textLayerInstance.draggable(true);
                    _this.stageInstance.draggable(false);
                    _this.updateTransformer();
                });

                this.textLayerInstance.on('dragstart', function () {
                    _this.editor.isTextDragging = true;
                });

                this.textLayerInstance.on('dragmove', function () {
                    var offsetX = _this.textLayerInstance.x() - exportCenterX;
                    var offsetY = _this.textLayerInstance.y() - exportCenterY;
                    _this.editor.textPosX = 50 + (offsetX / exportWidth) * 100;
                    _this.editor.textPosY = 50 + (offsetY / exportHeight) * 100;
                });

                this.textLayerInstance.on('dragend', function () {
                    _this.editor.isTextDragging = false;
                    _this.updateRestoreBtnState();
                });

                this.textLayerInstance.on('transformstart', function () {
                    _this.editor.isTextDragging = true;
                });

                this.textLayerInstance.on('transform', function () {
                    var offsetX = _this.textLayerInstance.x() - exportCenterX;
                    var offsetY = _this.textLayerInstance.y() - exportCenterY;
                    _this.editor.textPosX = 50 + (offsetX / exportWidth) * 100;
                    _this.editor.textPosY = 50 + (offsetY / exportHeight) * 100;
                    _this.editor.textScale = _this.textLayerInstance.scaleX();
                });

                this.textLayerInstance.on('transformend', function () {
                    _this.editor.isTextDragging = false;
                    _this.editor.textScale = parseFloat(_this.textLayerInstance.scaleX().toFixed(2));
                    _this.updateRestoreBtnState();
                });
            },

            initKonvaStageEvents: function () {
                var _this = this;

                this.stageInstance.on('click tap', function (e) {
                    if (e.target === _this.stageInstance) {
                        _this.editor.activeElement = 'none';
                        if (_this.baseLayerInstance) {
                            _this.baseLayerInstance.draggable(false);
                        }
                        if (_this.textLayerInstance) {
                            _this.textLayerInstance.draggable(false);
                        }
                        _this.stageInstance.draggable(true);
                        _this.updateTransformer();
                    } else {
                        _this.stageInstance.draggable(false);
                    }
                });

                this.stageInstance.on('wheel', function (e) {
                    e.evt.preventDefault();
                    
                    var oldScale = _this.stageInstance.scaleX();
                    var pointer = _this.stageInstance.getPointerPosition();
                    
                    var mousePointTo = {
                        x: (pointer.x - _this.stageInstance.x()) / oldScale,
                        y: (pointer.y - _this.stageInstance.y()) / oldScale
                    };
                    
                    var direction = e.evt.deltaY > 0 ? -1 : 1;
                    var newScale = direction > 0 ? oldScale * 1.05 : oldScale / 1.05;
                    newScale = Math.max(0.1, Math.min(5.0, newScale));
                    
                    _this.stageInstance.scale({ x: newScale, y: newScale });
                    
                    var newPos = {
                        x: pointer.x - mousePointTo.x * newScale,
                        y: pointer.y - mousePointTo.y * newScale
                    };
                    _this.stageInstance.position(newPos);
                    _this.stageInstance.batchDraw();
                    
                    _this.editor.scale = parseFloat(newScale.toFixed(2));
                });
            },

            updateKonvaBaseImage: function () {
                var _this = this;
                
                if (!this.baseLayerInstance || !this.editor.baseImage) return;

                var targetWidth = this.editor.baseImageWidth;
                var targetHeight = this.editor.baseImageHeight;

                var baseImage = this.baseLayerInstance.findOne('.baseImage');
                
                var img = new Image();
                img.onload = function () {
                    var imgWidth = img.width;
                    var imgHeight = img.height;

                    var displayWidth, displayHeight, offsetX = 0, offsetY = 0;

                    if (targetWidth && targetHeight) {
                        var scaleX = targetWidth / imgWidth;
                        var scaleY = targetHeight / imgHeight;
                        var scale = Math.max(scaleX, scaleY);

                        displayWidth = imgWidth * scale;
                        displayHeight = imgHeight * scale;

                        offsetX = (targetWidth - displayWidth) / 2;
                        offsetY = (targetHeight - displayHeight) / 2;
                    } else {
                        displayWidth = imgWidth;
                        displayHeight = imgHeight;
                        _this.editor.baseImageWidth = imgWidth;
                        _this.editor.baseImageHeight = imgHeight;
                    }

                    if (baseImage) {
                        baseImage.image(img);
                        baseImage.width(displayWidth);
                        baseImage.height(displayHeight);
                        baseImage.x(offsetX);
                        baseImage.y(offsetY);
                    } else {
                        var newBaseImage = new Konva.Image({
                            name: 'baseImage',
                            image: img,
                            width: displayWidth,
                            height: displayHeight,
                            x: offsetX,
                            y: offsetY
                        });
                        _this.baseLayerInstance.add(newBaseImage);
                    }
                    
                    _this.stageInstance.draw();
                };
                img.crossOrigin = 'Anonymous';
                img.src = this.editor.baseImage;
            },

            syncKonvaBaseImageTransform: function () {
                if (!this.baseLayerInstance) return;
                
                var exportCenterX = this.editor.exportAreaX + (this.editor.baseImageWidth / 2);
                var exportCenterY = this.editor.exportAreaY + (this.editor.baseImageHeight / 2);
                
                this.baseLayerInstance.x(exportCenterX + this.editor.imageOffsetX);
                this.baseLayerInstance.y(exportCenterY + this.editor.imageOffsetY);
                this.baseLayerInstance.scaleX(this.editor.imageScale);
                this.baseLayerInstance.scaleY(this.editor.imageScale);
                
                this.stageInstance.draw();
            },

            syncKonvaTextPosition: function () {
                if (!this.textLayerInstance || !this.stageInstance) return;
                
                var exportWidth = this.editor.baseImageWidth || 500;
                var exportHeight = this.editor.baseImageHeight || 500;
                var exportCenterX = this.editor.exportAreaX + (exportWidth / 2);
                var exportCenterY = this.editor.exportAreaY + (exportHeight / 2);
                
                var textX = exportCenterX + ((this.editor.textPosX - 50) / 100) * exportWidth;
                var textY = exportCenterY + ((this.editor.textPosY - 50) / 100) * exportHeight;
                
                this.textLayerInstance.x(textX);
                this.textLayerInstance.y(textY);
                
                this.stageInstance.draw();
            },

            openMaterialEditor: function (item) {
                var _this = this;
                window.MeeWoo.Core.MaterialOperations.openMaterialEditor(this, item);
                // 等待图片尺寸加载完成后再初始化 Konva stage
                var checkAndInit = function() {
                    _this.$nextTick(function() {
                        // 检查图片尺寸是否已加载
                        if (_this.editor.baseImageWidth && _this.editor.baseImageHeight) {
                            _this.initKonvaStage();
                        } else {
                            // 如果尺寸未加载，等待 baseImage 变化
                            var unwatch = _this.$watch('editor.baseImage', function(newVal) {
                                if (newVal && _this.editor.baseImageWidth && _this.editor.baseImageHeight) {
                                    unwatch();
                                    _this.$nextTick(function() {
                                        _this.initKonvaStage();
                                    });
                                }
                            });
                        }
                    });
                };
                checkAndInit();
            },

            loadAndSetImageDimensions: function (imgUrl) {
                window.MeeWoo.Core.MaterialOperations.loadAndSetImageDimensions(this, imgUrl);
                this.$nextTick(function () {
                    this.updateKonvaBaseImage();
                }.bind(this));
            },

            generateEditedMaterial: function () {
                var _this = this;
                return new Promise(function (resolve, reject) {
                    if (!_this.stageInstance) {
                        reject(new Error('Konva stage not initialized'));
                        return;
                    }

                    try {
                        var exportWidth = _this.editor.baseImageWidth;
                        var exportHeight = _this.editor.baseImageHeight;

                        var exportStage = new Konva.Stage({
                            container: document.createElement('div'),
                            width: exportWidth,
                            height: exportHeight
                        });

                        var exportLayer = new Konva.Layer();
                        exportStage.add(exportLayer);

                        if (_this.baseLayerInstance && _this.editor.showImage) {
                            var exportCenterX = exportWidth / 2;
                            var exportCenterY = exportHeight / 2;

                            var baseImage = _this.baseLayerInstance.findOne('.baseImage');
                            if (baseImage) {
                                var img = baseImage.image();
                                var newBaseImage = new Konva.Image({
                                    image: img,
                                    width: baseImage.width(),
                                    height: baseImage.height(),
                                    offsetX: baseImage.offsetX(),
                                    offsetY: baseImage.offsetY(),
                                    x: exportCenterX + _this.editor.imageOffsetX,
                                    y: exportCenterY + _this.editor.imageOffsetY,
                                    scaleX: _this.editor.imageScale,
                                    scaleY: _this.editor.imageScale
                                });
                                exportLayer.add(newBaseImage);
                            }
                        }

                        if (_this.textLayerInstance && _this.editor.showText && _this.textCanvas) {
                            var textCenterX = exportWidth / 2 + ((_this.editor.textPosX - 50) / 100) * exportWidth;
                            var textCenterY = exportHeight / 2 + ((_this.editor.textPosY - 50) / 100) * exportHeight;

                            var newTextImage = new Konva.Image({
                                image: _this.textCanvas,
                                x: textCenterX,
                                y: textCenterY,
                                offsetX: _this.textCanvas.width / 2,
                                offsetY: _this.textCanvas.height / 2,
                                scaleX: _this.editor.textScale,
                                scaleY: _this.editor.textScale
                            });
                            exportLayer.add(newTextImage);
                        }

                        exportStage.draw();

                        var dataURL = exportStage.toDataURL({
                            x: 0,
                            y: 0,
                            width: exportWidth,
                            height: exportHeight,
                            pixelRatio: 1,
                            mimeType: 'image/png',
                            quality: 1.0
                        });

                        exportStage.destroy();

                        resolve(dataURL);
                    } catch (error) {
                        reject(error);
                    }
                });
            },

            onPreviewAreaMouseDown: function (event) {},

            onImageMouseDown: function (event) {},

            onImageWheel: function (event) {},

            toggleEditorViewMode: function () {
                window.MeeWoo.Core.MaterialInteractions.toggleEditorViewMode(this);
            },

            onTextMouseDown: function (event) {},

            onTextWheel: function (event) {},

            onEditorFileChange: function (event) {
                window.MeeWoo.Core.MaterialInteractions.onEditorFileChange(this, event);
                this.$nextTick(function () {
                    this.updateKonvaBaseImage();
                }.bind(this));
            },

            triggerEditorUpload: function () {
                window.MeeWoo.Core.MaterialInteractions.triggerEditorUpload(this);
            },

            closeMaterialEditor: function () {
                window.MeeWoo.Core.MaterialOperations.closeMaterialEditor(this);
                if (this.transformerInstance) {
                    this.transformerInstance.destroy();
                    this.transformerInstance = null;
                }
                if (this.exportAreaGuide) {
                    this.exportAreaGuide.destroy();
                    this.exportAreaGuide = null;
                }
                if (this.textLayerInstance) {
                    this.textLayerInstance.destroy();
                    this.textLayerInstance = null;
                }
                if (this.baseLayerInstance) {
                    this.baseLayerInstance.destroy();
                    this.baseLayerInstance = null;
                }
                if (this.konvaLayers.backgroundLayer) {
                    this.konvaLayers.backgroundLayer.destroy();
                    this.konvaLayers.backgroundLayer = null;
                }
                if (this.konvaLayers.textLayer) {
                    this.konvaLayers.textLayer.destroy();
                    this.konvaLayers.textLayer = null;
                }
                if (this.konvaLayers.transformerLayer) {
                    this.konvaLayers.transformerLayer.destroy();
                    this.konvaLayers.transformerLayer = null;
                }
                if (this.stageInstance) {
                    this.stageInstance.destroy();
                    this.stageInstance = null;
                }
                this.textCanvas = null;
                this.textCanvasCtx = null;
            },

            saveMaterialEdit: function () {
                window.MeeWoo.Core.MaterialOperations.saveMaterialEdit(this);
            }
        }
    };

    window.MeeWoo.Mixins.MaterialEditor = MaterialEditor;
})(window);
