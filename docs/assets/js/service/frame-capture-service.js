/**
 * 帧捕获服务
 * 功能：统一处理动画帧的跳转、等待、捕获逻辑，提供流式回调接口
 * 优势：
 * 1. 统一了 WebP、序列帧导出的控制逻辑
 * 2. 支持流式处理，避免一次性加载所有帧导致内存溢出
 * 3. 内置对象池和性能优化策略
 */

(function (global) {
  'use strict';

  global.MeeWoo = global.MeeWoo || {};
  global.MeeWoo.Service = global.MeeWoo.Service || {};

  class FrameCaptureService {
    constructor() {
      // 对象池：复用 canvas 以减少 GC
      this.sharedCanvas = null;
    }

    /**
     * 获取共享的 Canvas 对象
     * @param {number} width 
     * @param {number} height 
     */
    _getSharedCanvas(width, height) {
      if (!this.sharedCanvas) {
        this.sharedCanvas = document.createElement('canvas');
      }
      // 只有尺寸变化时才调整，避免不必要的重绘
      if (this.sharedCanvas.width !== width || this.sharedCanvas.height !== height) {
        this.sharedCanvas.width = width;
        this.sharedCanvas.height = height;
      }
      return this.sharedCanvas;
    }

    /**
     * 核心捕获方法
     * @param {Object} options 配置项
     * @param {number} options.fps 帧率
     * @param {number} options.totalFrames 总帧数
     * @param {number} options.width 输出宽度
     * @param {number} options.height 输出高度
     * @param {Function} options.onSeek (index) => Promise 跳转到指定帧的回调
     * @param {Function} options.onCapture () => canvas 获取当前画面源的回调
     * @param {Function} options.onFrame (blob, index) => Promise 处理每一帧数据的回调
     * @param {Function} options.onProgress (progress) => void 进度回调
     * @param {Function} options.shouldCancel () => boolean 检查是否取消的回调
     * @param {string} options.format 输出格式 'image/png' | 'image/jpeg' | 'image/webp'
     * @param {number} options.quality 输出质量 0-1
     */
    async capture(options) {
      const {
        fps,
        totalFrames,
        width,
        height,
        onSeek,
        onCapture,
        onFrame,
        onProgress,
        shouldCancel,
        format = 'image/png',
        quality = 0.9
      } = options;

      if (!onSeek || !onCapture || !onFrame) {
        throw new Error('FrameCaptureService: 缺少必要的回调函数 (onSeek, onCapture, onFrame)');
      }

      const tempCanvas = this._getSharedCanvas(width, height);
      const ctx = tempCanvas.getContext('2d', { willReadFrequently: true });

      for (let i = 0; i < totalFrames; i++) {
        // 1. 检查取消
        if (shouldCancel && shouldCancel()) {
          throw new Error('用户取消');
        }

        // 2. 跳转到指定帧
        try {
          await onSeek(i);
        } catch (e) {
          console.error(`FrameCaptureService: 第 ${i} 帧跳转失败`, e);
          // 容错：如果跳转失败，继续尝试下一帧，或者重试当前帧？目前策略是记录并继续，可能会导致丢帧或重复帧
        }

        // 3. 等待渲染 (统一解决渲染延迟问题)
        // 某些播放器（如 Lottie/SVGA）在 seek 后可能需要一小段时间才能上屏
        // 50ms 是一个经验值，既能保证大部分情况下的渲染，又不会太拖慢速度
        await new Promise(r => setTimeout(r, 50));

        // 4. 获取画面源
        const sourceCanvas = onCapture();
        if (!sourceCanvas) {
          console.warn(`FrameCaptureService: 第 ${i} 帧无法获取画面源`);
          continue; 
        }

        // 5. 绘制到临时 Canvas (调整尺寸 & 统一背景)
        ctx.clearRect(0, 0, width, height);
        // 如果需要透明背景支持，这里不需要 fillRect；如果需要强制白底，可以在这里加
        // ctx.fillStyle = '#ffffff';
        // ctx.fillRect(0, 0, width, height);
        ctx.drawImage(sourceCanvas, 0, 0, width, height);

        // 6. 获取 Blob 数据 (使用 toBlob 减少内存占用)
        const blob = await new Promise(resolve => {
          tempCanvas.toBlob(resolve, format, quality);
        });

        if (!blob) {
          console.warn(`FrameCaptureService: 第 ${i} 帧生成 Blob 失败`);
          continue;
        }

        // 7. 分发数据 (流式处理)
        // 注意：onFrame 处理完后，blob 会由 JS 引擎自动 GC，不需要手动 revoke（除非是 createObjectURL）
        await onFrame(blob, i);

        // 8. 更新进度
        if (onProgress) {
          onProgress((i + 1) / totalFrames);
        }
      }
    }
  }

  // 导出单例
  global.MeeWoo.Service.FrameCaptureService = new FrameCaptureService();

})(window);
