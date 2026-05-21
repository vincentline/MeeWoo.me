/**
 * ==================== 图片变换服务 (Image Transformer Service) ====================
 * 
 * 模块索引：
 * 1. 【loadImage】 - 加载图片，支持 URL/Blob/Base64
 * 2. 【transform】 - 主变换方法，支持 cover/contain 填充模式
 * 3. 【_calculateTransform】 - 计算变换参数（内部方法）
 * 4. 【_renderToCanvas】 - 渲染到 Canvas 并导出（内部方法）
 * 
 * 功能说明：
 * 独立的图片变换服务，提供图片加载、缩放、裁剪、填充等功能
 * 支持 cover（填充裁剪）和 contain（完整包含）两种填充模式
 * 
 * 使用方式：
 * MeeWoo.Services.ImageTransformer.loadImage(source).then(img => {...})
 * MeeWoo.Services.ImageTransformer.transform(options).then(dataURL => {...})
 */

(function (global) {
  'use strict';

  global.MeeWoo = global.MeeWoo || {};
  global.MeeWoo.Services = global.MeeWoo.Services || {};

  var ImageTransformer = {
    /**
     * 加载图片
     * 支持 URL、Blob、Base64 格式的图片源
     * 
     * @param {string|Blob} source - 图片源，可以是 URL、Blob 或 Base64 字符串
     * @returns {Promise<HTMLImageElement>} 返回加载完成的图片元素
     * 
     * @example
     * // 加载 URL 图片
     * ImageTransformer.loadImage('https://example.com/image.png')
     * 
     * // 加载 Blob
     * ImageTransformer.loadImage(blob)
     * 
     * // 加载 Base64
     * ImageTransformer.loadImage('data:image/png;base64,...')
     */
    loadImage: function (source) {
      return new Promise(function (resolve, reject) {
        var img = new Image();
        
        img.onload = function () {
          resolve(img);
        };
        
        img.onerror = function (err) {
          reject(new Error('[ImageTransformer] 图片加载失败: ' + err));
        };
        
        // 设置跨域属性，允许加载跨域图片
        img.crossOrigin = 'Anonymous';
        
        // 根据源类型处理
        if (source instanceof Blob) {
          // Blob 类型：创建临时 URL
          var blobUrl = URL.createObjectURL(source);
          img.src = blobUrl;
        } else if (typeof source === 'string') {
          // 字符串类型：直接作为 src
          img.src = source;
        } else {
          reject(new Error('[ImageTransformer] 不支持的图片源类型'));
        }
      });
    },

    /**
     * 图片变换主方法
     * 根据目标尺寸和变换参数，对图片进行缩放、偏移、裁剪等处理
     * 
     * @param {Object} options - 变换配置选项
     * @param {string|Blob} options.source - 图片源（URL/Blob/Base64）
     * @param {number} options.targetWidth - 目标宽度
     * @param {number} options.targetHeight - 目标高度
     * @param {Object} [options.transform] - 变换参数
     * @param {number} [options.transform.offsetX=0] - X 轴偏移量
     * @param {number} [options.transform.offsetY=0] - Y 轴偏移量
     * @param {number} [options.transform.scale=1] - 缩放比例
     * @param {string} [options.fit='cover'] - 填充模式：'cover' 填充裁剪 | 'contain' 完整包含
     * @returns {Promise<string>} 返回 PNG 格式的 DataURL
     * 
     * @example
     * // cover 模式（填充裁剪）
     * ImageTransformer.transform({
     *   source: 'image.png',
     *   targetWidth: 500,
     *   targetHeight: 500,
     *   fit: 'cover'
     * })
     * 
     * // contain 模式（完整包含，可能留白）
     * ImageTransformer.transform({
     *   source: blob,
     *   targetWidth: 500,
     *   targetHeight: 500,
     *   fit: 'contain',
     *   transform: { offsetX: 10, offsetY: 20, scale: 1.2 }
     * })
     */
    transform: function (options) {
      var _this = this;
      
      return new Promise(function (resolve, reject) {
        // 参数校验
        if (!options || !options.source) {
          reject(new Error('[ImageTransformer] 缺少图片源参数'));
          return;
        }
        
        if (!options.targetWidth || !options.targetHeight) {
          reject(new Error('[ImageTransformer] 缺少目标尺寸参数'));
          return;
        }
        
        var targetWidth = options.targetWidth;
        var targetHeight = options.targetHeight;
        var transform = options.transform || { offsetX: 0, offsetY: 0, scale: 1 };
        var fit = options.fit || 'cover';
        
        // 加载图片
        _this.loadImage(options.source)
          .then(function (img) {
            // 计算变换参数
            var transformParams = _this._calculateTransform(
              img.width,
              img.height,
              targetWidth,
              targetHeight,
              transform,
              fit
            );
            
            // 渲染到 Canvas 并导出
            var dataURL = _this._renderToCanvas(
              img,
              targetWidth,
              targetHeight,
              transformParams
            );
            
            resolve(dataURL);
          })
          .catch(function (err) {
            reject(err);
          });
      });
    },

    /**
     * 计算变换参数
     * 根据填充模式和变换配置，计算图片的显示尺寸和位置
     * 
     * @private
     * @param {number} imgWidth - 原图宽度
     * @param {number} imgHeight - 原图高度
     * @param {number} targetWidth - 目标宽度
     * @param {number} targetHeight - 目标高度
     * @param {Object} transform - 变换参数 { offsetX, offsetY, scale }
     * @param {string} fit - 填充模式：'cover' | 'contain'
     * @returns {Object} 返回变换参数对象
     * 
     * @example
     * // cover 模式：取较大缩放比，保证填满目标区域
     * // contain 模式：取较小缩放比，保证图片完整显示
     */
    _calculateTransform: function (imgWidth, imgHeight, targetWidth, targetHeight, transform, fit) {
      var offsetX = transform.offsetX || 0;
      var offsetY = transform.offsetY || 0;
      var scale = transform.scale || 1;
      
      // 计算基础缩放比例
      var scaleX = targetWidth / imgWidth;
      var scaleY = targetHeight / imgHeight;
      
      // 根据填充模式选择缩放比例
      var baseScale;
      if (fit === 'cover') {
        // cover: 取较大值，保证填满目标区域（可能裁剪）
        baseScale = Math.max(scaleX, scaleY);
      } else {
        // contain: 取较小值，保证图片完整显示（可能留白）
        baseScale = Math.min(scaleX, scaleY);
      }
      
      // 应用用户缩放
      var finalScale = baseScale * scale;
      
      // 计算显示尺寸
      var displayWidth = imgWidth * finalScale;
      var displayHeight = imgHeight * finalScale;
      
      // 计算绘制位置（居中 + 偏移）
      var drawX = (targetWidth - displayWidth) / 2 + offsetX;
      var drawY = (targetHeight - displayHeight) / 2 + offsetY;
      
      return {
        displayWidth: displayWidth,
        displayHeight: displayHeight,
        drawX: drawX,
        drawY: drawY,
        scale: finalScale
      };
    },

    /**
     * 渲染到 Canvas 并导出
     * 创建 Canvas，绘制变换后的图片，导出为 DataURL
     * 
     * @private
     * @param {HTMLImageElement} img - 图片元素
     * @param {number} targetWidth - 目标宽度
     * @param {number} targetHeight - 目标高度
     * @param {Object} transformParams - 变换参数
     * @returns {string} 返回 PNG 格式的 DataURL
     */
    _renderToCanvas: function (img, targetWidth, targetHeight, transformParams) {
      // 创建 Canvas
      var canvas = document.createElement('canvas');
      canvas.width = targetWidth;
      canvas.height = targetHeight;
      
      var ctx = canvas.getContext('2d');
      
      // 清空画布（透明背景）
      ctx.clearRect(0, 0, targetWidth, targetHeight);
      
      // 绘制图片
      ctx.drawImage(
        img,
        0, 0, img.width, img.height,
        transformParams.drawX,
        transformParams.drawY,
        transformParams.displayWidth,
        transformParams.displayHeight
      );
      
      // 导出为 PNG DataURL
      return canvas.toDataURL('image/png', 1.0);
    }
  };

  global.MeeWoo.Services.ImageTransformer = ImageTransformer;

})(typeof window !== 'undefined' ? window : this);
