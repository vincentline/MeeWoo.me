/**
 * ==================== 素材编辑器服务 (Material Editor Service) ====================
 * 
 * 模块索引：
 * 1. 【静态方法】 - create
 * 2. 【实例方法】 - loadImage, setText, getImageTransform, setImageTransform, export, reset, destroy
 * 3. 【状态管理】 - 内部状态属性
 * 
 * 功能说明：
 * 素材编辑器的统一入口服务，组合以下三个服务：
 * 1. TextRenderer - 文字渲染服务
 * 2. ImageTransformer - 图片变换服务
 * 3. MaterialComposer - 素材合成服务
 * 
 * 使用方式：
 * var editor = MeeWoo.Services.MaterialEditorService.create({
 *   container: document.getElementById('editor'),
 *   width: 800,
 *   height: 600
 * });
 * 
 * editor.loadImage('image.png');
 * editor.setText({ content: 'Hello', style: 'font-size: 24px;' });
 * var result = await editor.export();
 */

(function (global) {
  'use strict';

  global.MeeWoo = global.MeeWoo || {};
  global.MeeWoo.Services = global.MeeWoo.Services || {};

  /**
   * 素材编辑器服务对象
   * 提供素材编辑器的创建和管理功能
   */
  var MaterialEditorService = {
    /**
     * 创建编辑器实例
     * 
     * @param {Object} config - 编辑器配置
     * @param {HTMLElement} [config.container] - DOM 容器元素（可选，用于 Konva 渲染）
     * @param {number} config.width - 画布宽度
     * @param {number} config.height - 画布高度
     * @returns {MaterialEditorInstance} 返回编辑器实例
     * 
     * @example
     * var editor = MaterialEditorService.create({
     *   width: 800,
     *   height: 600
     * });
     */
    create: function (config) {
      if (!config || typeof config !== 'object') {
        throw new Error('[MaterialEditorService] 配置参数无效');
      }

      if (!config.width || !config.height) {
        throw new Error('[MaterialEditorService] 必须指定宽度和高度');
      }

      return new MaterialEditorInstance(config);
    }
  };

  /**
   * 素材编辑器实例类
   * 管理单个编辑器实例的状态和操作
   * 
   * @class
   * @param {Object} config - 实例配置
   * @param {HTMLElement} [config.container] - DOM 容器元素
   * @param {number} config.width - 画布宽度
   * @param {number} config.height - 画布高度
   */
  function MaterialEditorInstance(config) {
    // 画布配置
    this.width = config.width;
    this.height = config.height;
    this.container = config.container || null;

    // 底图状态
    this.imageSource = null;
    this.imageWidth = 0;
    this.imageHeight = 0;
    this.imageLoaded = false;

    // 图片变换状态
    this.imageOffsetX = 0;
    this.imageOffsetY = 0;
    this.imageScale = 1;

    // 文字状态
    this.textContent = '';
    this.textStyle = '';
    this.textPosition = { x: 50, y: 50 };
    this.textScale = 1;
    this.textAlign = 'center';

    // 显示状态
    this.showImage = true;
    this.showText = true;

    // 实例状态
    this.destroyed = false;
  }

  /**
   * ==================== 【实例方法】 ====================
   * 编辑器实例的操作方法
   */

  /**
   * 加载底图
   * 支持 URL、Blob、Base64 格式的图片源
   * 
   * @param {string|Blob} source - 图片源
   * @returns {Promise<void>} 加载完成的 Promise
   * 
   * @example
   * editor.loadImage('https://example.com/image.png');
   * editor.loadImage(blob);
   */
  MaterialEditorInstance.prototype.loadImage = function (source) {
    var _this = this;

    this.checkDestroyed();

    return new Promise(function (resolve, reject) {
      var ImageTransformer = global.MeeWoo.Services.ImageTransformer;

      if (!ImageTransformer) {
        reject(new Error('[MaterialEditorService] ImageTransformer 服务未加载'));
        return;
      }

      ImageTransformer.loadImage(source)
        .then(function (img) {
          _this.imageSource = source;
          _this.imageWidth = img.width;
          _this.imageHeight = img.height;
          _this.imageLoaded = true;
          resolve();
        })
        .catch(function (err) {
          reject(new Error('[MaterialEditorService] 图片加载失败: ' + err.message));
        });
    });
  };

  /**
   * 设置文字
   * 配置文字内容、样式、位置、缩放和对齐方式
   * 
   * @param {Object} options - 文字配置
   * @param {string} options.content - 文字内容
   * @param {string} [options.style] - CSS 样式字符串
   * @param {Object} [options.position] - 百分比位置 {x: 50, y: 50}
   * @param {number} [options.scale] - 缩放比例
   * @param {string} [options.align] - 对齐方式 'left'|'center'|'right'
   * 
   * @example
   * editor.setText({
   *   content: 'Hello World',
   *   style: 'font-size: 32px; color: #ffffff;',
   *   position: { x: 50, y: 80 },
   *   scale: 1.2,
   *   align: 'center'
   * });
   */
  MaterialEditorInstance.prototype.setText = function (options) {
    this.checkDestroyed();

    if (!options || typeof options !== 'object') {
      throw new Error('[MaterialEditorService] 文字配置无效');
    }

    if (options.content !== undefined) {
      this.textContent = String(options.content);
    }

    if (options.style !== undefined) {
      this.textStyle = String(options.style);
    }

    if (options.position !== undefined && typeof options.position === 'object') {
      this.textPosition = {
        x: typeof options.position.x === 'number' ? options.position.x : 50,
        y: typeof options.position.y === 'number' ? options.position.y : 50
      };
    }

    if (options.scale !== undefined && typeof options.scale === 'number') {
      this.textScale = options.scale;
    }

    if (options.align !== undefined) {
      var validAligns = ['left', 'center', 'right'];
      if (validAligns.indexOf(options.align) !== -1) {
        this.textAlign = options.align;
      }
    }
  };

  /**
   * 获取图片变换参数
   * 返回当前的图片偏移和缩放配置
   * 
   * @returns {Object} 变换参数 {offsetX, offsetY, scale}
   * 
   * @example
   * var transform = editor.getImageTransform();
   * console.log(transform); // {offsetX: 0, offsetY: 0, scale: 1}
   */
  MaterialEditorInstance.prototype.getImageTransform = function () {
    this.checkDestroyed();

    return {
      offsetX: this.imageOffsetX,
      offsetY: this.imageOffsetY,
      scale: this.imageScale
    };
  };

  /**
   * 设置图片变换
   * 配置图片的偏移和缩放参数
   * 
   * @param {Object} options - 变换配置
   * @param {number} [options.offsetX] - X 轴偏移量
   * @param {number} [options.offsetY] - Y 轴偏移量
   * @param {number} [options.scale] - 缩放比例
   * 
   * @example
   * editor.setImageTransform({
   *   offsetX: 10,
   *   offsetY: -20,
   *   scale: 1.5
   * });
   */
  MaterialEditorInstance.prototype.setImageTransform = function (options) {
    this.checkDestroyed();

    if (!options || typeof options !== 'object') {
      throw new Error('[MaterialEditorService] 变换配置无效');
    }

    if (options.offsetX !== undefined && typeof options.offsetX === 'number') {
      this.imageOffsetX = options.offsetX;
    }

    if (options.offsetY !== undefined && typeof options.offsetY === 'number') {
      this.imageOffsetY = options.offsetY;
    }

    if (options.scale !== undefined && typeof options.scale === 'number') {
      this.imageScale = options.scale;
    }
  };

  /**
   * 导出编辑结果
   * 合成底图和文字层，返回最终的图片 DataURL
   * 
   * @returns {Promise<string>} 返回 PNG 格式的 DataURL
   * 
   * @example
   * var dataURL = await editor.export();
   * // dataURL: 'data:image/png;base64,...'
   */
  MaterialEditorInstance.prototype.export = function () {
    var _this = this;

    this.checkDestroyed();

    return new Promise(function (resolve, reject) {
      var ImageTransformer = global.MeeWoo.Services.ImageTransformer;
      var TextRenderer = global.MeeWoo.Services.TextRenderer;
      var MaterialComposer = global.MeeWoo.Services.MaterialComposer;

      // 检查依赖服务
      if (!ImageTransformer || !TextRenderer || !MaterialComposer) {
        reject(new Error('[MaterialEditorService] 依赖服务未加载'));
        return;
      }

      var tasks = [];

      // 底图处理任务
      var backgroundImage = null;
      if (_this.showImage && _this.imageLoaded && _this.imageSource) {
        var imageTask = ImageTransformer.transform({
          source: _this.imageSource,
          targetWidth: _this.width,
          targetHeight: _this.height,
          transform: {
            offsetX: _this.imageOffsetX,
            offsetY: _this.imageOffsetY,
            scale: _this.imageScale
          },
          fit: 'cover'
        }).then(function (dataURL) {
          backgroundImage = dataURL;
        });
        tasks.push(imageTask);
      }

      // 文字渲染任务
      var textLayerImage = null;
      if (_this.showText && _this.textContent) {
        var textTask = TextRenderer.render({
          width: _this.width,
          height: _this.height,
          text: _this.textContent,
          style: _this.textStyle,
          position: _this.textPosition,
          scale: _this.textScale,
          align: _this.textAlign
        }).then(function (dataURL) {
          textLayerImage = dataURL;
        });
        tasks.push(textTask);
      }

      // 等待所有任务完成
      Promise.all(tasks)
        .then(function () {
          // 检查是否有内容需要导出
          if (!backgroundImage && !textLayerImage) {
            reject(new Error('[MaterialEditorService] 没有可导出的内容'));
            return;
          }

          // 合成最终图片
          return MaterialComposer.compose({
            background: backgroundImage,
            textLayer: textLayerImage,
            width: _this.width,
            height: _this.height,
            format: 'png'
          });
        })
        .then(function (dataURL) {
          resolve(dataURL);
        })
        .catch(function (err) {
          reject(new Error('[MaterialEditorService] 导出失败: ' + err.message));
        });
    });
  };

  /**
   * 重置编辑状态
   * 清空所有编辑状态，恢复初始值
   * 
   * @example
   * editor.reset();
   */
  MaterialEditorInstance.prototype.reset = function () {
    this.checkDestroyed();

    // 重置底图状态
    this.imageSource = null;
    this.imageWidth = 0;
    this.imageHeight = 0;
    this.imageLoaded = false;

    // 重置图片变换状态
    this.imageOffsetX = 0;
    this.imageOffsetY = 0;
    this.imageScale = 1;

    // 重置文字状态
    this.textContent = '';
    this.textStyle = '';
    this.textPosition = { x: 50, y: 50 };
    this.textScale = 1;
    this.textAlign = 'center';

    // 重置显示状态
    this.showImage = true;
    this.showText = true;
  };

  /**
   * 销毁实例
   * 释放资源，标记实例为已销毁状态
   * 销毁后无法再使用任何方法
   * 
   * @example
   * editor.destroy();
   */
  MaterialEditorInstance.prototype.destroy = function () {
    // 清空所有状态
    this.imageSource = null;
    this.imageWidth = 0;
    this.imageHeight = 0;
    this.imageLoaded = false;
    this.imageOffsetX = 0;
    this.imageOffsetY = 0;
    this.imageScale = 1;
    this.textContent = '';
    this.textStyle = '';
    this.textPosition = { x: 50, y: 50 };
    this.textScale = 1;
    this.textAlign = 'center';
    this.showImage = true;
    this.showText = true;
    this.container = null;

    // 标记为已销毁
    this.destroyed = true;
  };

  /**
   * ==================== 【辅助方法】 ====================
   * 内部辅助方法
   */

  /**
   * 检查实例是否已销毁
   * @private
   * @throws {Error} 如果实例已销毁则抛出错误
   */
  MaterialEditorInstance.prototype.checkDestroyed = function () {
    if (this.destroyed) {
      throw new Error('[MaterialEditorService] 实例已销毁，无法执行操作');
    }
  };

  // 挂载到命名空间
  global.MeeWoo.Services.MaterialEditorService = MaterialEditorService;

})(typeof window !== 'undefined' ? window : this);
