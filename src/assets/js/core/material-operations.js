/**
 * ==================== 素材编辑器操作模块 (Material Operations) ====================
 * 
 * 模块索引：
 * 1. 【样式处理】 - CSS样式过滤和处理相关方法
 * 2. 【编辑器控制】 - 素材编辑器控制相关方法
 * 
 * 功能说明：
 * 提供素材编辑器的操作功能，包括：
 * 1. CSS样式处理和过滤
 * 2. 素材编辑器控制操作
 * 
 * 注意：渲染功能已迁移到 Konva.js，由 material-editor.js 直接处理
 * 
 * 使用方式：
 * 在 material-editor.js 中引入此文件，并使用 MeeWoo.Core.MaterialOperations 模块
 */

(function (window) {
    'use strict';

    // 确保命名空间
    window.MeeWoo = window.MeeWoo || {};
    window.MeeWoo.Core = window.MeeWoo.Core || {};

    /**
     * 素材编辑器操作模块
     */
    var MaterialOperations = {
        /**
         * ==================== 【样式处理】 ====================
         * CSS样式过滤和处理相关方法
         */

        /**
         * 过滤CSS样式，只保留允许的属性，过滤掉布局相关属性
         * 避免用户粘贴的CSS包含 position/width/height 等破坏布局
         * @param {string} styleStr - 原始样式字符串
         * @returns {Object} 过滤后的样式对象
         */
        filterTextStyle: function (styleStr) {
            if (!styleStr) return {};

            var styles = {};

            // 去除注释
            styleStr = styleStr.replace(/\/\*[\s\S]*?\*\//g, '');

            // 分割属性
            var rules = styleStr.split(';');

            // 黑名单：布局、尺寸、定位相关的属性
            var blockedProperties = [
                'position',
                'top', 'bottom', 'left', 'right',
                'width', 'height', 'min-width', 'min-height', 'max-width', 'max-height',
                // 'display', // 允许 display 以支持某些文字特效
                'flex', 'flex-grow', 'flex-shrink', 'flex-basis', 'flex-direction', 'flex-wrap', 'flex-flow',
                'justify-content', 'justify-items', 'justify-self',
                'align-content', 'align-items', 'align-self',
                'place-content', 'place-items', 'place-self',
                'order', 'gap',
                'margin', 'margin-top', 'margin-right', 'margin-bottom', 'margin-left',
                'z-index',
                'transform', 'transform-origin',
                'float', 'clear',
                'white-space',
                'overflow', 'overflow-x', 'overflow-y',
                'line-height',
                'text-decoration', 'text-decoration-line', 'text-decoration-style', 'text-decoration-color', 'text-decoration-thickness'
            ];

            for (var i = 0; i < rules.length; i++) {
                var rule = rules[i].trim();
                if (!rule) continue;

                var colonIndex = rule.indexOf(':');
                if (colonIndex === -1) continue;

                var prop = rule.substring(0, colonIndex).trim().toLowerCase();
                var value = rule.substring(colonIndex + 1).trim();

                if (!prop || !value) continue;

                // 检查是否在黑名单中
                if (blockedProperties.indexOf(prop) !== -1) {
                    continue;
                }

                styles[prop] = value;
            }

            // 自动修复：如果使用了 background-clip: text，必须确保文字颜色透明
            // 仅当背景是渐变时才自动修复（因为我们只支持渐变背景，不支持图片背景）
            var hasBackgroundClip = styles['-webkit-background-clip'] === 'text' || styles['background-clip'] === 'text';
            var hasTransparentColor = styles['color'] === 'transparent' || styles['-webkit-text-fill-color'] === 'transparent' || styles['text-fill-color'] === 'transparent';
            var bg = styles['background'] || styles['background-image'] || '';
            var isGradient = bg.indexOf('gradient') !== -1;

            if (hasBackgroundClip && !hasTransparentColor && isGradient) {
                styles['color'] = 'transparent';
                // 某些浏览器可能需要这个
                if (!styles['-webkit-text-fill-color']) {
                    styles['-webkit-text-fill-color'] = 'transparent';
                }
            }

            return styles;
        },

        /**
         * 将样式对象转换为CSS字符串
         * @param {Object} styles - 样式对象
         * @returns {string} CSS字符串
         */
        convertStylesToCssString: function (styles) {
            var str = '';
            for (var key in styles) {
                if (styles.hasOwnProperty(key)) {
                    str += key + ':' + styles[key] + ';';
                }
            }
            return str;
        },

        /**
         * ==================== 【编辑器控制】 ====================
         * 素材编辑器控制相关方法
         */

        /**
         * 恢复原始素材图
         * @param {Object} vueInstance - Vue实例
         * @param {string|number} indexOrKey - 索引或素材键值（可选）
         */
        restoreOriginalMaterial: function (vueInstance, indexOrKey) {
            var targetKey;
            var material;

            // 如果提供了索引或键值，直接使用
            if (indexOrKey !== undefined) {
                if (typeof indexOrKey === 'number') {
                    material = vueInstance.materialList[indexOrKey];
                    if (material) {
                        targetKey = material.imageKey;
                    }
                } else {
                    targetKey = indexOrKey;
                    material = vueInstance.materialList.find(function (item) {
                        return item.imageKey === targetKey;
                    });
                }
            } else {
                // 否则使用编辑器当前的targetKey
                targetKey = vueInstance.editor.targetKey;
                if (targetKey) {
                    material = vueInstance.materialList.find(function (item) {
                        return item.imageKey === targetKey;
                    });
                }
            }

            if (!targetKey || !material) return;

            // 1. 清除编辑状态记录
            window.MeeWoo.Core.MaterialState.clearMaterialEditState(vueInstance.materialEditStates, targetKey);

            // 2. 恢复素材列表中的预览图为原图
            // 恢复 previewUrl 为 originalUrl 或 originalData
            if (material.originalUrl) {
                material.previewUrl = material.originalUrl;
            } else if (material.originalData) {
                material.previewUrl = material.originalData.startsWith('data:') ? material.originalData : ('data:image/png;base64,' + material.originalData);
            }

            material.isReplaced = false;

            // 3. 移除替换记录 - 使用新对象触发响应式更新
            if (vueInstance.replacedImages) {
                var newReplacedImages = Object.assign({}, vueInstance.replacedImages);
                delete newReplacedImages[targetKey];
                vueInstance.replacedImages = newReplacedImages;
            }

            // 4. 如果编辑器正在打开且当前编辑的是该素材，重置编辑器内部状态为默认值
            if (vueInstance.editor && vueInstance.editor.targetKey === targetKey) {
                vueInstance.editor.showImage = true;
                vueInstance.editor.showText = false; // 关闭显示文案按钮
                vueInstance.editor.textContent = '示例文案'; // 内容恢复默认
                vueInstance.editor.textStyle = 'color: white;\ntext-shadow: 1px 1px 2px #000000;\nfont-size: 24px;\nfont-weight: bold;';
                vueInstance.editor.textPosX = 50;
                vueInstance.editor.textPosY = 50;
                vueInstance.editor.textScale = 1.0;
                vueInstance.editor.textAlign = 'left'; // 重置对齐方式为左对齐
                vueInstance.editor.imageOffsetX = 0;
                vueInstance.editor.imageOffsetY = 0;
                vueInstance.editor.imageScale = 1.0;
                vueInstance.editor.showRestoreBtn = false; // 显式重置按钮状态

                // 恢复视图状态为居中100%显示
                vueInstance.editor.scale = 1.0; // 重置缩放比例为100%
                vueInstance.editor.offsetX = 0; // 重置水平偏移为0
                vueInstance.editor.offsetY = 0; // 重置垂直偏移为0
                vueInstance.editor.viewMode = 'fit-height'; // 重置视图模式为适应高度

                // 5. 恢复底图为原始图
                vueInstance.editor.baseImage = material.originalUrl || material.previewUrl;
            }

            // 6. 重新渲染 SVGA
            if (vueInstance.applyReplacedMaterials) {
                vueInstance.applyReplacedMaterials();
            }

            // 提示用户
            if (vueInstance.showToast) {
                vueInstance.showToast('已恢复原图');
            }
        },

        /**
         * 打开素材编辑器
         * @param {Object} vueInstance - Vue实例
         * @param {Object} item - 素材对象
         */
        openMaterialEditor: function (vueInstance, item) {
            var material = item;

            // 兼容旧的索引调用方式（防御性编程）
            if (typeof item === 'number') {
                material = vueInstance.materialList[item];
            }

            if (!material) {
                return;
            }

            // 加载html2canvas库
            if (vueInstance.loadLibrary) {
                vueInstance.loadLibrary('html2canvas', true).catch(function (err) {
                    // 忽略加载错误，html2canvas会在需要时重新加载
                });
            }

            // 初始化编辑器状态
            // 使用 imageKey 作为唯一标识，而不是 index
            vueInstance.editor.targetKey = material.imageKey;
            vueInstance.editor.show = true;
            
            // 刷新用户类型配置，控制AI生成按钮的显示/隐藏
            if (window.MeeWoo && window.MeeWoo.Controllers && window.MeeWoo.Controllers.UserTypeController) {
                setTimeout(() => {
                    window.MeeWoo.Controllers.UserTypeController.refresh();
                }, 0);
            }
            
            vueInstance.editor.loading = false;
            vueInstance.editor.viewMode = 'fit-height'; // 默认适应高度模式
            vueInstance.editor.scale = 1.0;
            vueInstance.editor.offsetX = 0;
            vueInstance.editor.offsetY = 0;



            // 恢复之前的编辑状态 或 初始化默认值
            var savedState = vueInstance.materialEditStates[material.imageKey];
            if (savedState) {
                vueInstance.editor.showImage = savedState.showImage;
                vueInstance.editor.showText = savedState.showText;
                vueInstance.editor.textContent = savedState.textContent || '';
                vueInstance.editor.textStyle = savedState.textStyle || '';
                vueInstance.editor.textPosX = savedState.textPosX !== undefined ? savedState.textPosX : 50;
                vueInstance.editor.textPosY = savedState.textPosY !== undefined ? savedState.textPosY : 50;
                vueInstance.editor.textScale = savedState.textScale !== undefined ? savedState.textScale : 1.0;
                vueInstance.editor.textAlign = savedState.textAlign !== undefined ? savedState.textAlign : 'left';
                vueInstance.editor.imageOffsetX = savedState.imageOffsetX !== undefined ? savedState.imageOffsetX : 0;
                vueInstance.editor.imageOffsetY = savedState.imageOffsetY !== undefined ? savedState.imageOffsetY : 0;
                vueInstance.editor.imageScale = savedState.imageScale !== undefined ? savedState.imageScale : 1.0;
            } else {
                vueInstance.editor.showImage = true;
                vueInstance.editor.showText = false;
                vueInstance.editor.textContent = '示例文案';
                vueInstance.editor.textStyle = 'color: white;\ntext-shadow: 1px 1px 2px #000000;\nfont-size: 24px;\nfont-weight: bold;';
                vueInstance.editor.textPosX = 50;
                vueInstance.editor.textPosY = 50;
                vueInstance.editor.textScale = 1.0;
                vueInstance.editor.textAlign = 'left';
                vueInstance.editor.imageOffsetX = 0;
                vueInstance.editor.imageOffsetY = 0;
                vueInstance.editor.imageScale = 1.0;
            }

            // 重置激活状态
            vueInstance.editor.activeElement = 'none';
            vueInstance.editor.lastClickElement = 'none';
            vueInstance.editor.lastClickTime = 0;

            // 重置尺寸，确保每次打开素材时都能获取正确的尺寸
            vueInstance.editor.baseImageWidth = 0;
            vueInstance.editor.baseImageHeight = 0;

            // 获取当前显示的图片 - 重要！只使用原始图，不使用合成图
            // 1. 首先尝试使用原始图（originalUrl）
            // 2. 如果不存在，尝试使用原始数据（originalData）
            // 3. 注意：永远不使用material.previewUrl，因为它是最终合成的图片（底图+文字）
            var imgUrl;
            if (material.originalUrl) {
                // 优先使用原始图URL
                imgUrl = material.originalUrl;
            } else if (material.originalData) {
                // 如果没有originalUrl，使用originalData（通常是base64格式）
                imgUrl = material.originalData.startsWith('data:') ? material.originalData : ('data:image/png;base64,' + material.originalData);
            } else {
                // 作为最后的备选，才使用material.previewUrl（避免无法显示）
                // 但这不是理想情况，因为previewUrl是合成图
                imgUrl = material.previewUrl;
            }

            // 设置默认底图，用于 hasEditInfo 比较
            vueInstance.editor.defaultBaseImage = imgUrl;
            // 初始化按钮状态
            if (vueInstance.updateRestoreBtnState) {
                vueInstance.updateRestoreBtnState();
            }

            // 编辑器底图逻辑（重要！）：
            // 1. 如果有保存的编辑状态中的customBaseImage，使用它（用户上传的自定义底图）
            // 2. 否则使用上面获取的原始图
            // 
            // 注意：replacedImages和material.previewUrl是最终合成的图片（底图+文字），
            // 不应该用作编辑器的底图，否则会导致文字重复显示

            if (savedState && savedState.customBaseImage) {
                // 使用保存的自定义底图（用户通过"更换底图"上传的图）
                imgUrl = savedState.customBaseImage;
                // 恢复保存的原始尺寸
                if (savedState.originalBaseImageWidth && savedState.originalBaseImageHeight) {
                    vueInstance.editor.baseImageWidth = savedState.originalBaseImageWidth;
                    vueInstance.editor.baseImageHeight = savedState.originalBaseImageHeight;
                }
            }

            // 先重置 baseImage 为 null，确保 Vue 的 $watch 能被触发
            // 这样即使打开同一个素材，也能正确触发 Konva 重新渲染
            vueInstance.editor.baseImage = null;

            // 加载图片
            this.loadImage(vueInstance, imgUrl);
        },

        /**
         * 加载图片（不改变尺寸）
         * @param {Object} vueInstance - Vue实例
         * @param {string} imgUrl - 图片URL
         */
        loadImage: function (vueInstance, imgUrl) {
            var img = new Image();
            img.onload = function () {
                // 如果尺寸未设置，才使用图片尺寸
                if (!vueInstance.editor.baseImageWidth || !vueInstance.editor.baseImageHeight) {
                    vueInstance.editor.baseImageWidth = img.width;
                    vueInstance.editor.baseImageHeight = img.height;
                }
                vueInstance.editor.baseImage = imgUrl;
            };
            img.onerror = function () {
                // 忽略图片加载错误
            };
            // 允许跨域
            img.crossOrigin = 'Anonymous';
            img.src = imgUrl;
        },

        /**
         * 加载图片并设置尺寸
         * @param {Object} vueInstance - Vue实例
         * @param {string} imgUrl - 图片URL
         */
        loadAndSetImageDimensions: function (vueInstance, imgUrl) {
            var img = new Image();
            img.onload = function () {
                vueInstance.editor.baseImageWidth = img.width;
                vueInstance.editor.baseImageHeight = img.height;
                vueInstance.editor.baseImage = imgUrl;
            };
            img.onerror = function () {
                // 忽略图片加载错误
            };
            // 允许跨域
            img.crossOrigin = 'Anonymous';
            img.src = imgUrl;
        },

        /**
         * 关闭素材编辑器
         * @param {Object} vueInstance - Vue实例
         */
        closeMaterialEditor: function (vueInstance) {
            vueInstance.editor.show = false;
        },

        /**
         * 保存素材编辑
         * @param {Object} vueInstance - Vue实例
         */
        saveMaterialEdit: function (vueInstance) {
            // 检查是否有编辑状态
            var hasEditState = false;
            var editorState = vueInstance.editor;
            
            // 1. 检查底图是否变更
            var defaultImg = editorState.defaultBaseImage;
            if (defaultImg && editorState.baseImage !== defaultImg) hasEditState = true;

            // 2. 检查显示开关
            else if (!editorState.showImage) hasEditState = true;
            else if (editorState.showText) hasEditState = true;

            // 3. 检查底图变换
            else if (editorState.imageOffsetX !== 0) hasEditState = true;
            else if (editorState.imageOffsetY !== 0) hasEditState = true;
            else if (Math.abs(editorState.imageScale - 1.0) > 0.001) hasEditState = true;

            // 如果没有编辑状态，直接关闭窗口
            if (!hasEditState) {
                vueInstance.editor.show = false;
                return;
            }

            vueInstance.editor.loading = true;

            // 生成编辑后的素材图
            vueInstance.generateEditedMaterial().then(function (dataURL) {
                // 更新素材列表中的预览图
                var targetKey = vueInstance.editor.targetKey;
                if (targetKey) {
                    var material = vueInstance.materialList.find(function (item) {
                        return item.imageKey === targetKey;
                    });

                    if (material) {
                        // 保存编辑状态
                        window.MeeWoo.Core.MaterialState.saveMaterialEditState(
                            vueInstance.materialEditStates,
                            targetKey,
                            vueInstance.editor
                        );

                        // 更新素材预览图
                        material.previewUrl = dataURL;
                        // 更新替换图片映射
                        vueInstance.replacedImages[targetKey] = dataURL;
                        // 设置isReplaced为true，显示恢复原图按钮
                        material.isReplaced = true;

                        // 将替换后的图片应用到SVGA播放器
                        if (vueInstance.svgaPlayer) {
                            var img = new Image();
                            img.onload = function () {
                                vueInstance.svgaPlayer.setImage(img, targetKey);
                            };
                            img.src = dataURL;
                        }

                        // 关闭编辑器
                        vueInstance.editor.show = false;
                        vueInstance.editor.loading = false;

                        // 显示成功提示
                        if (vueInstance.showToast) {
                            vueInstance.showToast('素材编辑已保存');
                        }
                    }
                }
            }).catch(function (error) {
                vueInstance.editor.loading = false;
                if (vueInstance.showToast) {
                    vueInstance.showToast('保存失败，请重试');
                }
            });
        }
    };

    // 导出模块
    window.MeeWoo.Core.MaterialOperations = MaterialOperations;
})(window);