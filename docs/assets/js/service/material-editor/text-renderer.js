/**
 * ==================== 文字渲染服务 (Text Renderer Service) ====================
 * 
 * 模块索引：
 * 1. 【样式处理】 - filterTextStyle, convertStylesToCssString
 * 2. 【核心渲染】 - render, renderTextToCanvas
 * 3. 【辅助方法】 - parseStroke, parseGradient
 * 
 * 功能说明：
 * 独立的文字渲染服务，负责：
 * 1. CSS样式过滤和转换
 * 2. 将文字渲染到Canvas并导出DataURL
 * 3. 支持渐变填充、文字阴影、文字描边等特效
 * 
 * 使用方式：
 * MeeWoo.Services.TextRenderer.render(options).then(dataURL => { ... })
 */

(function (global) {
  'use strict';

  global.MeeWoo = global.MeeWoo || {};
  global.MeeWoo.Services = global.MeeWoo.Services || {};

  /**
   * 文字渲染服务
   */
  var TextRenderer = {
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

      styleStr = styleStr.replace(/\/\*[\s\S]*?\*\//g, '');

      var rules = styleStr.split(';');

      var blockedProperties = [
        'position',
        'top', 'bottom', 'left', 'right',
        'width', 'height', 'min-width', 'min-height', 'max-width', 'max-height',
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

        if (blockedProperties.indexOf(prop) !== -1) {
          continue;
        }

        styles[prop] = value;
      }

      var hasBackgroundClip = styles['-webkit-background-clip'] === 'text' || styles['background-clip'] === 'text';
      var hasTransparentColor = styles['color'] === 'transparent' || styles['-webkit-text-fill-color'] === 'transparent' || styles['text-fill-color'] === 'transparent';
      var bg = styles['background'] || styles['background-image'] || '';
      var isGradient = bg.indexOf('gradient') !== -1;

      if (hasBackgroundClip && !hasTransparentColor && isGradient) {
        styles['color'] = 'transparent';
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
     * ==================== 【核心渲染】 ====================
     * 文字渲染到Canvas的核心方法
     */

    /**
     * 渲染文字到Canvas并返回DataURL
     * @param {Object} options - 渲染配置
     * @param {number} options.width - 画布宽度
     * @param {number} options.height - 画布高度
     * @param {string} options.text - 文字内容（支持\n换行）
     * @param {string} options.style - CSS样式字符串
     * @param {Object} options.position - 百分比位置 {x: 50, y: 50}
     * @param {number} options.scale - 缩放比例
     * @param {string} options.align - 对齐方式 'left'|'center'|'right'
     * @returns {Promise<string>} 返回PNG格式的DataURL
     */
    render: function (options) {
      var _this = this;
      return new Promise(function (resolve, reject) {
        try {
          var width = options.width || 500;
          var height = options.height || 500;
          var text = options.text || '';
          var styleStr = options.style || '';
          var position = options.position || { x: 50, y: 50 };
          var scale = options.scale || 1.0;
          var align = options.align || 'left';

          if (!text) {
            reject(new Error('文字内容不能为空'));
            return;
          }

          var styles = _this.filterTextStyle(styleStr);

          var canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          var ctx = canvas.getContext('2d');

          ctx.clearRect(0, 0, width, height);

          var textCanvas = _this.renderTextToCanvas(text, styles, align);

          var textX = (position.x / 100) * width;
          var textY = (position.y / 100) * height;

          ctx.save();
          ctx.translate(textX, textY);
          ctx.scale(scale, scale);
          ctx.drawImage(textCanvas, -textCanvas.width / 2, -textCanvas.height / 2);
          ctx.restore();

          var dataURL = canvas.toDataURL('image/png');
          resolve(dataURL);
        } catch (error) {
          reject(error);
        }
      });
    },

    /**
     * 将文字渲染到独立的Canvas
     * @param {string} text - 文字内容
     * @param {Object} style - 样式对象
     * @param {string} align - 对齐方式
     * @returns {HTMLCanvasElement} 渲染后的Canvas
     */
    renderTextToCanvas: function (text, style, align) {
      var fontSize = parseFloat(style['font-size']) || 24;
      var fontFamily = style['font-family'] || 'sans-serif';
      var fontWeight = style['font-weight'] || 'normal';
      var fontStyle = style['font-style'] || 'normal';

      fontFamily = fontFamily.replace(/['"]/, '');

      var tempCanvas = document.createElement('canvas');
      tempCanvas.width = 1;
      tempCanvas.height = 1;
      var tempCtx = tempCanvas.getContext('2d');
      tempCtx.font = fontStyle + ' ' + fontWeight + ' ' + fontSize + 'px "' + fontFamily + '"';

      var lines = text.split('\n');
      var lineHeight = fontSize * 1.2;
      var totalHeight = lines.length * lineHeight;

      var maxWidth = 0;
      for (var i = 0; i < lines.length; i++) {
        var w = tempCtx.measureText(lines[i]).width;
        if (w > maxWidth) maxWidth = w;
      }

      var padding = Math.max(maxWidth, totalHeight) * 0.25;
      var canvasWidth = Math.ceil(maxWidth + padding * 2);
      var canvasHeight = Math.ceil(totalHeight + padding * 2);

      var canvas = document.createElement('canvas');
      canvas.width = canvasWidth;
      canvas.height = canvasHeight;
      var ctx = canvas.getContext('2d');

      ctx.font = fontStyle + ' ' + fontWeight + ' ' + fontSize + 'px "' + fontFamily + '"';

      ctx.clearRect(0, 0, canvasWidth, canvasHeight);

      ctx.save();

      var textAlign = align || 'left';
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
        var gradient = this.parseGradient(ctx, bgStr, textX, startY, totalHeight, maxWidth);
        if (gradient) {
          fillStyle = gradient;
        }
      }

      if (style['text-shadow']) {
        this.renderTextShadow(ctx, style['text-shadow'], lines, textX, startY, lineHeight, fillStyle);
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

      return canvas;
    },

    /**
     * ==================== 【辅助方法】 ====================
     * 解析和渲染辅助方法
     */

    /**
     * 解析描边样式字符串
     * @param {string} strokeStr - 描边样式，如 '2px #ffffff' 或 '1px transparent'
     * @returns {Object|null} 返回 {width, color} 或 null
     */
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

    /**
     * 解析渐变样式并创建Canvas渐变对象
     * @param {CanvasRenderingContext2D} ctx - Canvas上下文
     * @param {string} bgStr - 渐变CSS字符串
     * @param {number} textX - 文字X坐标
     * @param {number} startY - 起始Y坐标
     * @param {number} totalHeight - 文字总高度
     * @param {number} maxWidth - 最大宽度
     * @returns {CanvasGradient|null} 渐变对象或null
     */
    parseGradient: function (ctx, bgStr, textX, startY, totalHeight, maxWidth) {
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

      if (colors.length < 2) return null;

      if (colors[0].stop === null || isNaN(colors[0].stop)) colors[0].stop = 0;
      if (colors[colors.length - 1].stop === null || isNaN(colors[colors.length - 1].stop)) {
        colors[colors.length - 1].stop = 1;
      }

      var x0, y0, x1, y1;

      if (angle === 0) {
        x0 = textX; y0 = startY + totalHeight / 2; x1 = textX; y1 = startY - totalHeight / 2;
      } else if (angle === 90) {
        x0 = textX - maxWidth / 2; y0 = startY + totalHeight / 2; x1 = textX + maxWidth / 2; y1 = startY + totalHeight / 2;
      } else if (angle === 270) {
        x0 = textX + maxWidth / 2; y0 = startY + totalHeight / 2; x1 = textX - maxWidth / 2; y1 = startY + totalHeight / 2;
      } else {
        x0 = textX; y0 = startY - totalHeight / 2; x1 = textX; y1 = startY + totalHeight / 2;
      }

      var grad = ctx.createLinearGradient(x0, y0, x1, y1);

      for (var k = 0; k < colors.length; k++) {
        var s = Math.max(0, Math.min(1, colors[k].stop));
        grad.addColorStop(s, colors[k].color);
      }

      return grad;
    },

    /**
     * 渲染文字阴影
     * @param {CanvasRenderingContext2D} ctx - Canvas上下文
     * @param {string} shadowsStr - 阴影样式字符串
     * @param {Array} lines - 文字行数组
     * @param {number} textX - 文字X坐标
     * @param {number} startY - 起始Y坐标
     * @param {number} lineHeight - 行高
     * @param {string|CanvasGradient} fillStyle - 填充样式
     */
    renderTextShadow: function (ctx, shadowsStr, lines, textX, startY, lineHeight, fillStyle) {
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
  };

  global.MeeWoo.Services.TextRenderer = TextRenderer;
})(typeof window !== 'undefined' ? window : this);
