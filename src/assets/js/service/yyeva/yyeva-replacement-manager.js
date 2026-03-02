/**
 * YYEVA 替换资源管理器
 * 
 * 【职责】
 * 统一管理 YYEVA 模式下的图片、文本、视频替换逻辑，
 * 负责视频元素的创建、销毁、状态同步。
 * 
 * 【功能】
 * 1. 视频元素生命周期管理（创建、销毁、复用）
 * 2. 播放状态同步（播放/暂停/进度/静音）
 * 3. 渲染器配置更新
 * 
 * 【主要属性】
 * - app: 应用实例引用
 * - replacedImages: 替换的图片集合
 * - replacedTexts: 替换的文本集合
 * - replacedVideos: 替换的视频集合
 * - videoElements: 视频元素映射表
 * 
 * 【核心方法】
 * - createVideoElement: 创建视频元素
 * - syncPlayState: 同步播放状态
 * - syncMuted: 同步静音状态
 * - syncTime: 同步播放进度
 * - clearAll: 清理所有资源
 */
function YyevaReplacementManager(app) {
  this.app = app;
  this.replacedImages = {};
  this.replacedTexts = {};
  this.replacedVideos = {};
  this.videoElements = {};
}

YyevaReplacementManager.prototype = {
  /**
   * 创建视频元素
   * 
   * @param {string} effectTag - 视频标签，用于标识替换位置
   * @param {string} videoUrl - 视频地址（blob URL 或 http URL）
   * @param {boolean} muted - 是否静音，未传则使用播放器当前静音状态
   * @returns {HTMLVideoElement} 创建的视频元素
   * 
   * 【实现思路】
   * 1. 检查是否已存在相同 URL 的视频元素，有则复用并更新静音状态
   * 2. 如存在不同 URL 的视频元素，先销毁旧的
   * 3. 创建新视频元素，设置属性和事件监听
   * 4. 视频加载完成后同步播放进度和状态
   */
  createVideoElement: function (effectTag, videoUrl, muted) {
    var existing = this.replacedVideos[effectTag];
    if (existing && existing.videoUrl === videoUrl) {
      this.setVideoMuted(effectTag, muted);
      return existing.videoElement;
    }

    if (existing) {
      this._destroyVideoElement(effectTag);
    }

    var video = document.createElement('video');
    video.src = videoUrl;
    video.muted = muted !== undefined ? muted : this.app.isMuted;
    video.loop = false;
    video.playsInline = true;
    video.preload = 'auto';

    var self = this;
    video.onloadedmetadata = function () {
      if (self.app.yyevaVideo) {
        self._syncVideoTime(video, self.app.yyevaVideo.currentTime, self.app.yyevaVideo.duration);
        if (!self.app.yyevaVideo.paused) {
          video.play().catch(function () {});
        }
      }
    };

    this.videoElements[effectTag] = video;
    this.replacedVideos[effectTag] = {
      videoUrl: videoUrl,
      videoElement: video,
      muted: video.muted
    };

    return video;
  },

  /**
   * 销毁视频元素（内部方法）
   * 
   * @param {string} effectTag - 视频标签
   * 
   * 【实现思路】
   * 1. 暂停视频并清空源地址
   * 2. 从映射表中移除
   */
  _destroyVideoElement: function (effectTag) {
    var video = this.videoElements[effectTag];
    if (video) {
      video.pause();
      video.src = '';
      video = null;
      delete this.videoElements[effectTag];
    }
    delete this.replacedVideos[effectTag];
  },

  /**
   * 同步所有替换视频的播放状态
   * 
   * @param {boolean} isPlaying - 是否播放
   */
  syncPlayState: function (isPlaying) {
    for (var tag in this.replacedVideos) {
      var vidData = this.replacedVideos[tag];
      if (vidData.videoElement && vidData.videoElement.readyState >= 2) {
        if (isPlaying) {
          vidData.videoElement.play().catch(function () {});
        } else {
          vidData.videoElement.pause();
        }
      }
    }
  },

  /**
   * 同步所有替换视频的静音状态
   * 
   * @param {boolean} isMuted - 是否静音
   */
  syncMuted: function (isMuted) {
    for (var tag in this.replacedVideos) {
      var vidData = this.replacedVideos[tag];
      if (vidData.videoElement) {
        vidData.videoElement.muted = isMuted;
        vidData.muted = isMuted;
      }
    }
  },

  /**
   * 设置单个视频的静音状态
   * 
   * @param {string} effectTag - 视频标签
   * @param {boolean} muted - 是否静音
   */
  setVideoMuted: function (effectTag, muted) {
    var vidData = this.replacedVideos[effectTag];
    if (vidData && vidData.videoElement) {
      vidData.videoElement.muted = muted;
      vidData.muted = muted;
    }
  },

  /**
   * 同步所有替换视频的播放进度
   * 
   * @param {number} currentTime - 当前播放时间（秒）
   */
  syncTime: function (currentTime) {
    if (!this.app.yyevaVideo) return;
    var mainDuration = this.app.yyevaVideo.duration;

    for (var tag in this.replacedVideos) {
      var vidData = this.replacedVideos[tag];
      if (vidData.videoElement && vidData.videoElement.readyState >= 2) {
        this._syncVideoTime(vidData.videoElement, currentTime, mainDuration);
      }
    }
  },

  /**
   * 同步单个视频的播放进度（内部方法）
   * 
   * @param {HTMLVideoElement} video - 视频元素
   * @param {number} currentTime - 主视频当前时间
   * @param {number} mainDuration - 主视频总时长
   * 
   * 【实现思路】
   * 直接同步时间，不按比例缩放：
   * - 替换视频时长 <= 主视频：直接同步时间
   * - 替换视频时长 > 主视频：只在主视频时间范围内播放，超出则暂停
   */
  _syncVideoTime: function (video, currentTime, mainDuration) {
    if (!video || video.readyState < 2) return;
    
    var videoDuration = video.duration;
    
    if (videoDuration <= mainDuration) {
      if (Math.abs(video.currentTime - currentTime) > 0.05) {
        video.currentTime = currentTime;
      }
      if (this.app.yyevaVideo && !this.app.yyevaVideo.paused && video.paused) {
        video.play().catch(function () {});
      }
    } else {
      if (currentTime <= mainDuration) {
        if (Math.abs(video.currentTime - currentTime) > 0.05) {
          video.currentTime = currentTime;
        }
        if (this.app.yyevaVideo && !this.app.yyevaVideo.paused && video.paused) {
          video.play().catch(function () {});
        }
      } else {
        video.pause();
      }
    }
  },

  /**
   * 更新渲染器配置
   * 
   * 将所有替换的文本、图片、视频应用到 YYEVA 渲染器
   */
  updateRenderer: function () {
    if (!this.app.yyevaRenderer) return;

    for (var textTag in this.replacedTexts) {
      this.app.yyevaRenderer.setText(textTag, { text: this.replacedTexts[textTag] });
    }

    for (var imgTag in this.replacedImages) {
      this.app.yyevaRenderer.setImage(imgTag, this.replacedImages[imgTag]);
    }

    for (var vidTag in this.replacedVideos) {
      var vidData = this.replacedVideos[vidTag];
      if (vidData.videoElement) {
        this.app.yyevaRenderer.setVideo(vidTag, {
          videoUrl: vidData.videoUrl,
          videoElement: vidData.videoElement
        });
      }
    }
  },

  /**
   * 清除所有替换资源
   * 
   * 销毁所有视频元素，清空图片、文本、视频集合
   */
  clearAll: function () {
    for (var tag in this.replacedVideos) {
      this._destroyVideoElement(tag);
    }
    this.replacedImages = {};
    this.replacedTexts = {};
    this.replacedVideos = {};
  },

  /**
   * 获取替换视频列表
   * 
   * @returns {Object} 替换视频集合
   */
  getReplacedVideos: function () {
    return this.replacedVideos;
  }
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = YyevaReplacementManager;
}
