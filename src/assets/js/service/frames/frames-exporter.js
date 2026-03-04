/**
 * 序列帧导出服务
 * 功能：将动画转换为序列帧并打包为ZIP下载
 * 
 * 2026-03-05 重构：
 * 移除内部循环录制逻辑，改为配合 FrameCaptureService 使用的被动接收模式
 */

(function (global) {
  'use strict';

  global.MeeWoo = global.MeeWoo || {};
  global.MeeWoo.Service = global.MeeWoo.Service || {};

  class FramesExporter {
    constructor() {
      this.zip = null;
      this.framesFolder = null;
    }

    /**
     * 初始化JSZip
     */
    async initJSZip() {
      if (typeof JSZip === 'undefined') {
        throw new Error('JSZip library not loaded');
      }
      this.zip = new JSZip();
      this.framesFolder = this.zip.folder('frames');
    }

    /**
     * 添加一帧数据 (流式处理)
     * @param {Blob} blob 图片数据
     * @param {number} index 帧索引
     * @param {string} ext 扩展名 (默认 png)
     */
    async addFrame(blob, index, ext = 'png') {
      if (!this.zip || !this.framesFolder) {
        await this.initJSZip();
      }
      const frameName = `frame_${String(index).padStart(4, '0')}.${ext}`;
      this.framesFolder.file(frameName, blob, { binary: true });
    }

    /**
     * 生成并下载 ZIP 文件
     * @param {Function} onProgress 进度回调
     */
    async generateAndDownload(onProgress) {
      if (!this.zip) return;

      if (onProgress) onProgress(0, '正在生成ZIP文件...');

      try {
        const content = await this.zip.generateAsync({ type: 'blob' }, (metadata) => {
          if (onProgress) {
            onProgress(metadata.percent / 100, '正在打包...');
          }
        });

        this.downloadZip(content);
        
        if (onProgress) onProgress(1, '导出完成');

      } catch (error) {
        console.error('ZIP生成失败:', error);
        throw error;
      }
    }

    /**
     * 下载ZIP文件
     * @param {Blob} blob 
     */
    downloadZip(blob) {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `frames_${Date.now()}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      
      // 延迟释放
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    }

    /**
     * 重置状态
     */
    reset() {
      this.zip = null;
      this.framesFolder = null;
    }
  }

  global.MeeWoo.Service.FramesExporter = FramesExporter;

})(window);
