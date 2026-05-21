/**
 * ==================== 素材合成服务 (Material Composer Service) ====================
 * 
 * 功能说明：
 * 提供素材图层合成功能，将底图和文字层合成为最终图片
 * 使用 Konva.js 作为渲染引擎，支持 PNG/JPEG 格式导出
 * 
 * 主要方法：
 * - compose(options) - 主合成方法，合成底图和文字层
 * 
 * 依赖：
 * - Konva.js（全局变量 Konva）
 * 
 * 使用示例：
 * var dataURL = await MeeWoo.Services.MaterialComposer.compose({
 *   background: 'data:image/png;base64,...',
 *   textLayer: 'data:image/png;base64,...',
 *   width: 800,
 *   height: 600,
 *   format: 'png',
 *   quality: 0.92
 * });
 */

(function (global) {
  'use strict';

  global.MeeWoo = global.MeeWoo || {};
  global.MeeWoo.Services = global.MeeWoo.Services || {};

  /**
   * 素材合成服务对象
   * 提供图层合成功能，将多个图层合成为最终图片
   */
  var MaterialComposer = {
    /**
     * 合成素材图层
     * 将底图和文字层按指定尺寸合成为最终图片
     * 
     * @param {Object} options - 合成配置参数
     * @param {string} [options.background] - 底图 DataURL（可选）
     * @param {string} [options.textLayer] - 文字层 DataURL（可选）
     * @param {number} options.width - 导出宽度（像素）
     * @param {number} options.height - 导出高度（像素）
     * @param {string} [options.format='png'] - 导出格式 'png' | 'jpeg'
     * @param {number} [options.quality=0.92] - JPEG 质量 0-1（仅 format='jpeg' 时有效）
     * @returns {Promise<string>} 返回合成后的 DataURL
     * 
     * @example
     * // 合成底图和文字层
     * var result = await MaterialComposer.compose({
     *   background: 'data:image/png;base64,...',
     *   textLayer: 'data:image/png;base64,...',
     *   width: 800,
     *   height: 600
     * });
     * 
     * @example
     * // 仅导出文字层（无底图）
     * var result = await MaterialComposer.compose({
     *   textLayer: 'data:image/png;base64,...',
     *   width: 500,
     *   height: 500,
     *   format: 'jpeg',
     *   quality: 0.9
     * });
     */
    compose: function (options) {
      var _this = this;

      return new Promise(function (resolve, reject) {
        // 检查 Konva 是否存在
        if (typeof Konva === 'undefined') {
          reject(new Error('[MaterialComposer] Konva library not loaded'));
          return;
        }

        // 验证必要参数
        if (!options || typeof options !== 'object') {
          reject(new Error('[MaterialComposer] Invalid options: options is required'));
          return;
        }

        var width = options.width;
        var height = options.height;

        if (!width || !height || width <= 0 || height <= 0) {
          reject(new Error('[MaterialComposer] Invalid dimensions: width and height must be positive numbers'));
          return;
        }

        // 解析导出格式和质量
        var format = options.format || 'png';
        var quality = typeof options.quality === 'number' ? options.quality : 0.92;

        // 验证格式
        if (format !== 'png' && format !== 'jpeg') {
          reject(new Error('[MaterialComposer] Invalid format: must be "png" or "jpeg"'));
          return;
        }

        // 验证质量范围
        if (quality < 0 || quality > 1) {
          reject(new Error('[MaterialComposer] Invalid quality: must be between 0 and 1'));
          return;
        }

        // 检查是否有任何图层需要合成
        var hasBackground = options.background && typeof options.background === 'string';
        var hasTextLayer = options.textLayer && typeof options.textLayer === 'string';

        if (!hasBackground && !hasTextLayer) {
          reject(new Error('[MaterialComposer] No layers to compose: at least one of background or textLayer is required'));
          return;
        }

        try {
          // 创建临时容器
          var container = document.createElement('div');
          container.style.display = 'none';
          document.body.appendChild(container);

          // 创建临时 Konva Stage
          var stage = new Konva.Stage({
            container: container,
            width: width,
            height: height
          });

          var layer = new Konva.Layer();
          stage.add(layer);

          // 加载图层的 Promise 数组
          var loadPromises = [];

          // 加载并绘制底图
          if (hasBackground) {
            var bgPromise = _this.loadImage(options.background).then(function (img) {
              var bgImage = new Konva.Image({
                image: img,
                x: 0,
                y: 0,
                width: width,
                height: height
              });
              layer.add(bgImage);
            });
            loadPromises.push(bgPromise);
          }

          // 加载并绘制文字层（居中叠加）
          if (hasTextLayer) {
            var textPromise = _this.loadImage(options.textLayer).then(function (img) {
              // 计算居中位置
              var imgWidth = img.width;
              var imgHeight = img.height;
              var x = (width - imgWidth) / 2;
              var y = (height - imgHeight) / 2;

              var textImage = new Konva.Image({
                image: img,
                x: x,
                y: y,
                width: imgWidth,
                height: imgHeight
              });
              layer.add(textImage);
            });
            loadPromises.push(textPromise);
          }

          // 等待所有图层加载完成后导出
          Promise.all(loadPromises).then(function () {
            stage.draw();

            // 构建 MIME 类型
            var mimeType = format === 'jpeg' ? 'image/jpeg' : 'image/png';

            // 导出为 DataURL
            var dataURL = stage.toDataURL({
              x: 0,
              y: 0,
              width: width,
              height: height,
              pixelRatio: 1,
              mimeType: mimeType,
              quality: quality
            });

            // 销毁临时 Stage
            stage.destroy();

            // 移除临时容器
            if (container.parentNode) {
              container.parentNode.removeChild(container);
            }

            resolve(dataURL);
          }).catch(function (error) {
            // 清理资源
            stage.destroy();
            if (container.parentNode) {
              container.parentNode.removeChild(container);
            }
            reject(new Error('[MaterialComposer] Failed to load images: ' + error.message));
          });

        } catch (error) {
          reject(new Error('[MaterialComposer] Compose failed: ' + error.message));
        }
      });
    },

    /**
     * 加载图片
     * 将 DataURL 或 URL 转换为 Image 对象
     * 
     * @param {string} src - 图片源（DataURL 或 URL）
     * @returns {Promise<HTMLImageElement>} 返回加载完成的 Image 对象
     * @private
     */
    loadImage: function (src) {
      return new Promise(function (resolve, reject) {
        var img = new Image();

        img.onload = function () {
          resolve(img);
        };

        img.onerror = function () {
          reject(new Error('Failed to load image: ' + src.substring(0, 50) + '...'));
        };

        // 设置跨域属性
        img.crossOrigin = 'Anonymous';
        img.src = src;
      });
    },

    /**
     * 合成多个图层（高级方法）
     * 支持更灵活的图层配置，每个图层可指定位置、尺寸、透明度等
     * 
     * @param {Object} options - 合成配置参数
     * @param {number} options.width - 导出宽度
     * @param {number} options.height - 导出高度
     * @param {Array<Object>} options.layers - 图层数组，按顺序从底到顶叠加
     * @param {string} options.layers[].src - 图层图片源（DataURL）
     * @param {number} [options.layers[].x=0] - 图层 X 坐标
     * @param {number} [options.layers[].y=0] - 图层 Y 坐标
     * @param {number} [options.layers[].width] - 图层宽度（默认使用图片原始宽度）
     * @param {number} [options.layers[].height] - 图层高度（默认使用图片原始高度）
     * @param {number} [options.layers[].opacity=1] - 图层透明度 0-1
     * @param {string} [options.format='png'] - 导出格式 'png' | 'jpeg'
     * @param {number} [options.quality=0.92] - JPEG 质量 0-1
     * @returns {Promise<string>} 返回合成后的 DataURL
     */
    composeLayers: function (options) {
      var _this = this;

      return new Promise(function (resolve, reject) {
        // 检查 Konva 是否存在
        if (typeof Konva === 'undefined') {
          reject(new Error('[MaterialComposer] Konva library not loaded'));
          return;
        }

        // 验证必要参数
        if (!options || typeof options !== 'object') {
          reject(new Error('[MaterialComposer] Invalid options: options is required'));
          return;
        }

        var width = options.width;
        var height = options.height;
        var layers = options.layers;

        if (!width || !height || width <= 0 || height <= 0) {
          reject(new Error('[MaterialComposer] Invalid dimensions: width and height must be positive numbers'));
          return;
        }

        if (!layers || !Array.isArray(layers) || layers.length === 0) {
          reject(new Error('[MaterialComposer] Invalid layers: must be a non-empty array'));
          return;
        }

        // 解析导出格式和质量
        var format = options.format || 'png';
        var quality = typeof options.quality === 'number' ? options.quality : 0.92;

        try {
          // 创建临时容器
          var container = document.createElement('div');
          container.style.display = 'none';
          document.body.appendChild(container);

          // 创建临时 Konva Stage
          var stage = new Konva.Stage({
            container: container,
            width: width,
            height: height
          });

          var layer = new Konva.Layer();
          stage.add(layer);

          // 按顺序加载所有图层
          var loadPromises = layers.map(function (layerConfig, index) {
            return _this.loadImage(layerConfig.src).then(function (img) {
              var imgWidth = layerConfig.width || img.width;
              var imgHeight = layerConfig.height || img.height;
              var x = typeof layerConfig.x === 'number' ? layerConfig.x : 0;
              var y = typeof layerConfig.y === 'number' ? layerConfig.y : 0;
              var opacity = typeof layerConfig.opacity === 'number' ? layerConfig.opacity : 1;

              var konvaImage = new Konva.Image({
                image: img,
                x: x,
                y: y,
                width: imgWidth,
                height: imgHeight,
                opacity: Math.max(0, Math.min(1, opacity))
              });
              layer.add(konvaImage);
            });
          });

          // 等待所有图层加载完成后导出
          Promise.all(loadPromises).then(function () {
            stage.draw();

            // 构建 MIME 类型
            var mimeType = format === 'jpeg' ? 'image/jpeg' : 'image/png';

            // 导出为 DataURL
            var dataURL = stage.toDataURL({
              x: 0,
              y: 0,
              width: width,
              height: height,
              pixelRatio: 1,
              mimeType: mimeType,
              quality: quality
            });

            // 销毁临时 Stage
            stage.destroy();

            // 移除临时容器
            if (container.parentNode) {
              container.parentNode.removeChild(container);
            }

            resolve(dataURL);
          }).catch(function (error) {
            // 清理资源
            stage.destroy();
            if (container.parentNode) {
              container.parentNode.removeChild(container);
            }
            reject(new Error('[MaterialComposer] Failed to load layer images: ' + error.message));
          });

        } catch (error) {
          reject(new Error('[MaterialComposer] Compose layers failed: ' + error.message));
        }
      });
    }
  };

  // 挂载到命名空间
  global.MeeWoo.Services.MaterialComposer = MaterialComposer;

})(typeof window !== 'undefined' ? window : this);
