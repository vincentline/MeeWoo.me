// SVGA像素处理服务
// 用于管理Worker池和处理双通道MP4转SVGA过程中的像素级操作

(function(global) {
  'use strict';

  // Ensure namespace
  window.MeeWoo = window.MeeWoo || {};
  window.MeeWoo.Services = window.MeeWoo.Services || {};

  class SvgaPixelService {
    constructor() {
      this.workerPool = null;
      this.isInitialized = false;
      this.workerPath = 'assets/js/service/svga/svga-pixel-worker.js';
    }

    /**
     * 初始化服务
     */
    async init() {
      if (this.isInitialized) return;

      try {
        // 检查是否已经有WorkerPool实例
        if (window.MeeWoo.Services.WorkerPool) {
          this.workerPool = window.MeeWoo.Services.WorkerPool;
          console.log('Using existing WorkerPool instance');
        } else {
          // 动态加载WorkerPool
          await this._loadWorkerPool();
        }

        this.isInitialized = true;
        console.log('SvgaPixelService initialized successfully');
      } catch (error) {
        console.error('Failed to initialize SvgaPixelService:', error);
        throw error;
      }
    }

    /**
     * 加载WorkerPool
     * @private
     */
    async _loadWorkerPool() {
      return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = 'assets/js/service/dual-channel/worker-pool.js';
        script.onload = () => {
          if (window.MeeWoo.Services.WorkerPool) {
            this.workerPool = window.MeeWoo.Services.WorkerPool;
            resolve();
          } else {
            reject(new Error('WorkerPool not found after loading'));
          }
        };
        script.onerror = () => {
          reject(new Error('Failed to load worker-pool.js'));
        };
        document.head.appendChild(script);
      });
    }

    /**
     * 处理单个帧
     * @param {Uint8ClampedArray} frameData - 帧数据
     * @param {string} alphaPosition - Alpha通道位置 ('left' | 'right')
     * @param {number} width - 原始宽度
     * @param {number} height - 原始高度
     * @param {number} scaledWidth - 缩放后宽度
     * @param {number} scaledHeight - 缩放后高度
     * @param {Object} options - 选项
     * @returns {Promise<Object>} 处理结果
     */
    async processFrame(frameData, alphaPosition, width, height, scaledWidth, scaledHeight, options = {}) {
      await this.init();

      return this.workerPool.submitTask('processFrame', {
        frameData: frameData,
        alphaPosition: alphaPosition,
        width: width,
        height: height,
        scaledWidth: scaledWidth,
        scaledHeight: scaledHeight
      }, {
        onProgress: options.onProgress,
        priority: options.priority || 5
      });
    }

    /**
     * 批量处理多个帧
     * @param {Array<Uint8ClampedArray>} frames - 帧数据数组
     * @param {string} alphaPosition - Alpha通道位置 ('left' | 'right')
     * @param {number} width - 原始宽度
     * @param {number} height - 原始高度
     * @param {number} scaledWidth - 缩放后宽度
     * @param {number} scaledHeight - 缩放后高度
     * @param {Object} options - 选项
     * @returns {Promise<Array<Object>>} 处理结果数组
     */
    async processFrames(frames, alphaPosition, width, height, scaledWidth, scaledHeight, options = {}) {
      await this.init();

      return this.workerPool.submitTask('processFrames', {
        frames: frames,
        alphaPosition: alphaPosition,
        width: width,
        height: height,
        scaledWidth: scaledWidth,
        scaledHeight: scaledHeight
      }, {
        onProgress: options.onProgress,
        priority: options.priority || 5
      });
    }

    /**
     * 清理内存
     */
    async clearMemory() {
      await this.init();

      return this.workerPool.submitTask('clearMemory', {});
    }

    /**
     * 获取服务状态
     * @returns {Object} 状态信息
     */
    getStatus() {
      if (!this.workerPool) {
        return {
          initialized: this.isInitialized,
          workerPool: null
        };
      }

      return {
        initialized: this.isInitialized,
        workerPool: this.workerPool.getStatus()
      };
    }

    /**
     * 获取统计信息
     * @returns {Object} 统计信息
     */
    getStats() {
      if (!this.workerPool) {
        return null;
      }

      return this.workerPool.getStats();
    }

    /**
     * 重置统计信息
     */
    resetStats() {
      if (this.workerPool) {
        this.workerPool.resetStats();
      }
    }
  }

  // 导出单例
  const svgaPixelService = new SvgaPixelService();
  window.MeeWoo.Services.SvgaPixelService = svgaPixelService;

  // 全局访问
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = SvgaPixelService;
  } else {
    global.SvgaPixelService = SvgaPixelService;
  }

})(typeof window !== 'undefined' ? window : this);
