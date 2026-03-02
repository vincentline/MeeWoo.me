/**
 * ==================== YYEVA Key素材管理面板组件 ====================
 * 
 * 功能说明：
 * 用于管理YYEVA格式双通道MP4的key素材，支持图片、视频和文本的替换
 * 
 * 面板结构：
 * - 标题区：key素材替换
 * - 信息区：显示图片key和文本key数量
 * - 说明区：使用说明
 * - 图片key区：显示图片key列表，支持图片/视频替换和恢复
 *   - 图片替换：显示静态图片预览
 *   - 视频替换：显示中间帧预览，hover时自动播放
 * - 文本key区：显示文本key列表，支持输入和恢复
 * - 底部按钮：取消和确定
 * 
 * @author MeeWoo Team
 * @version 1.1.0
 * ====================================================================
 */

(function () {
  var template = `
    <div class="side-panel side-panel--right yyeva-key-panel" :class="{'show': visible}">
      <div class="side-panel-container">
        <!-- 标题区 -->
        <div class="side-panel-header">
          <h3 class="side-panel-title">key素材替换</h3>
          <div class="side-panel-divider"></div>
        </div>

        <!-- 信息区 -->
        <div class="yyeva-key-info-section">
          <div class="yyeva-key-info-row">图片key数量：{{ imageKeyCount }}个</div>
          <div class="yyeva-key-info-row">文本key数量：{{ textKeyCount }}个</div>
          <div class="yyeva-key-hint">
            您可以上传图片、视频或填写文本，替换播放器中的key内容。
            视频素材将与主播放器同步播放。替换后点击确定按钮保存更改。
          </div>
        </div>

        <!-- 搜索区
        <div class="yyeva-key-search">
          <input type="text" class="material-search-input" placeholder="搜索key名称..." v-model="searchQuery" />
        </div> -->

        <!-- 图片key区 -->
        <div class="yyeva-key-section" v-if="filteredImageKeys.length > 0">
          <div class="yyeva-key-section-title">图片key</div>
          <div class="yyeva-key-list">
            <div v-for="key in filteredImageKeys" :key="key.effectTag" class="yyeva-key-item">
              <div class="yyeva-key-thumb" :style="{ backgroundColor: '#f0f0f0' }"
                   @mouseenter="handleThumbMouseEnter(key)"
                   @mouseleave="handleThumbMouseLeave(key)">
                <!-- 视频替换：显示中间帧预览，hover时播放视频 -->
                <template v-if="localReplacedVideos[key.effectTag]">
                  <img v-show="!isHoveringThumb[key.effectTag]"
                       :src="localReplacedVideos[key.effectTag].posterFrame"
                       class="yyeva-key-thumb-img" />
                  <video v-show="isHoveringThumb[key.effectTag]"
                         :ref="'video_' + key.effectTag"
                         :src="localReplacedVideos[key.effectTag].videoUrl"
                         class="yyeva-key-thumb-video"
                         muted loop playsinline></video>
                  <div class="yyeva-key-thumb-badge">视频</div>
                </template>
                <!-- 图片替换：显示静态图片 -->
                <img v-else-if="localReplacedImages[key.effectTag]"
                     :src="localReplacedImages[key.effectTag]"
                     class="yyeva-key-thumb-img" />
                <!-- 无替换：显示占位符 -->
                <div v-else class="yyeva-key-thumb-placeholder">无预览</div>
              </div>
              <div class="yyeva-key-info">
                <div class="yyeva-key-name" :title="key.effectTag">{{ key.effectTag }}</div>
                <div class="yyeva-key-meta">尺寸：{{ key.effectWidth }} × {{ key.effectHeight }}</div>
                <div v-if="localReplacedVideos[key.effectTag]" class="yyeva-key-meta yyeva-key-meta-video">类型：视频素材</div>
              </div>
              <div class="yyeva-key-actions">
                <button class="yyeva-key-btn-replace" @click="triggerMediaUpload(key)">
                  替换素材
                </button>
                <button v-if="localReplacedVideos[key.effectTag]" 
                        class="yyeva-key-btn-mute" 
                        :class="{'muted': localReplacedVideosMuted[key.effectTag]}"
                        @click="toggleVideoMute(key)" 
                        :title="localReplacedVideosMuted[key.effectTag] ? '取消静音' : '静音'">
                  <svg v-if="localReplacedVideosMuted[key.effectTag]" width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M11 5L6 9H2v6h4l5 4V5zM23 9l-6 6M17 9l6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                  <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M11 5L6 9H2v6h4l5 4V5zM15.54 8.46a5 5 0 010 7.07M19.07 4.93a10 10 0 010 14.14" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </button>
                <button v-if="localReplacedImages[key.effectTag] || localReplacedVideos[key.effectTag]"
                        class="material-btn-close" @click="restoreMedia(key)" title="恢复默认"></button>
              </div>
            </div>
          </div>
        </div>

        <!-- 文本key区 -->
        <div class="yyeva-key-section" v-if="filteredTextKeys.length > 0">
          <div class="yyeva-key-section-title">文本key</div>
          <div class="yyeva-key-list">
            <div v-for="key in filteredTextKeys" :key="key.effectTag" class="yyeva-key-item">
              <div class="yyeva-key-info yyeva-key-info-full">
                <div class="yyeva-key-name" :title="key.effectTag">{{ key.effectTag }}</div>
                <div class="yyeva-key-text-input">
                  <input type="text" class="base-input yyeva-key-text-field" 
                    v-model="localReplacedTexts[key.effectTag]" 
                    @input="handleTextInput(key)"
                    placeholder="输入替换文本..." />
                  <button v-if="localReplacedTexts[key.effectTag]" class="material-btn-close" @click="restoreText(key)" title="恢复默认"></button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 空状态 -->
        <div v-if="filteredImageKeys.length === 0 && filteredTextKeys.length === 0" class="yyeva-key-empty">
          未找到key素材
        </div>

        <!-- 底部按钮 -->
        <div class="side-panel-footer">
          <button title="关闭" class="material-btn-back" @click="close">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M12 16L6 10L12 4" stroke="#333333" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path>
            </svg>
            <span>取消</span>
          </button>
          <button class="btn-large-secondary" @click="confirm" title="确定">
            确定
          </button>
        </div>
      </div>
    </div>
  `;

  window.MeeWoo = window.MeeWoo || {};
  window.MeeWoo.Components = window.MeeWoo.Components || {};

  window.MeeWoo.Components.YyevaKeyPanel = {
    template: template,
    props: {
      visible: {
        type: Boolean,
        default: false
      },
      imageKeys: {
        type: Array,
        default: function () { return []; }
      },
      textKeys: {
        type: Array,
        default: function () { return []; }
      },
      replacedImages: {
        type: Object,
        default: function () { return {}; }
      },
      replacedTexts: {
        type: Object,
        default: function () { return {}; }
      },
      replacedVideos: {
        type: Object,
        default: function () { return {}; }
      },
      playerMuted: {
        type: Boolean,
        default: false
      }
    },
    data: function () {
      return {
        searchQuery: '',
        localReplacedImages: {},
        localReplacedTexts: {},
        localReplacedVideos: {},  // 存储视频替换信息 { effectTag: { videoUrl, posterFrame } }
        localReplacedVideosMuted: {}, // 存储视频静音状态 { effectTag: boolean }
        isHoveringThumb: {}       // 记录鼠标悬停状态
      };
    },
    computed: {
      imageKeyCount: function () {
        return this.imageKeys.length;
      },
      textKeyCount: function () {
        return this.textKeys.length;
      },
      filteredImageKeys: function () {
        if (!this.searchQuery) {
          return this.imageKeys;
        }
        var query = this.searchQuery.toLowerCase();
        return this.imageKeys.filter(function (key) {
          return key.effectTag.toLowerCase().includes(query);
        });
      },
      filteredTextKeys: function () {
        if (!this.searchQuery) {
          return this.textKeys;
        }
        var query = this.searchQuery.toLowerCase();
        return this.textKeys.filter(function (key) {
          return key.effectTag.toLowerCase().includes(query);
        });
      }
    },
    watch: {
      visible: function (newVal) {
        if (newVal) {
          // 重置搜索和悬停状态
          this.searchQuery = '';
          this.isHoveringThumb = {};
          // 复制外部状态到本地
          this.localReplacedImages = Object.assign({}, this.replacedImages);
          this.localReplacedTexts = Object.assign({}, this.replacedTexts);
          this.localReplacedVideos = this._deepCopyVideos(this.replacedVideos);
          // 初始化静音状态（默认静音）
          this.localReplacedVideosMuted = this._initVideosMuted(this.replacedVideos);
        }
      },
      replacedImages: function (newVal) {
        this.localReplacedImages = Object.assign({}, newVal);
      },
      replacedTexts: function (newVal) {
        this.localReplacedTexts = Object.assign({}, newVal);
      },
      replacedVideos: function (newVal) {
        this.localReplacedVideos = this._deepCopyVideos(newVal);
        this.localReplacedVideosMuted = this._initVideosMuted(newVal);
      }
    },
    methods: {
      close: function () {
        // 停止所有预览视频
        this._stopAllPreviewVideos();
        this.$emit('close');
      },
      confirm: function () {
        // 停止所有预览视频
        this._stopAllPreviewVideos();
        this.$emit('confirm', {
          replacedImages: this.localReplacedImages,
          replacedTexts: this.localReplacedTexts,
          replacedVideos: this.localReplacedVideos,
          replacedVideosMuted: this.localReplacedVideosMuted
        });
      },
      
      // ==================== 媒体上传相关方法 ====================
      
      /**
       * 触发媒体文件上传（支持图片和视频）
       */
      triggerMediaUpload: function (key) {
        var fileInput = document.createElement('input');
        fileInput.type = 'file';
        // 同时支持图片和视频
        fileInput.accept = 'image/*,video/mp4,video/webm';
        fileInput.style.display = 'none';
        fileInput.onchange = function (event) {
          this.handleMediaUpload(key, event);
          document.body.removeChild(fileInput);
        }.bind(this);
        document.body.appendChild(fileInput);
        fileInput.click();
      },
      
      /**
       * 处理媒体文件上传（根据类型分发）
       */
      handleMediaUpload: function (key, event) {
        var file = event.target.files[0];
        if (!file) return;
        
        // 根据文件类型分发处理
        if (file.type.startsWith('video/')) {
          this.handleVideoUpload(key, file);
        } else if (file.type.startsWith('image/')) {
          this.handleImageUpload(key, file);
        }
      },
      
      /**
       * 处理图片上传
       */
      handleImageUpload: function (key, file) {
        var self = this;
        var reader = new FileReader();
        reader.onload = function (e) {
          // 清除可能存在的视频替换
          if (self.localReplacedVideos[key.effectTag]) {
            self._revokeVideoUrl(key.effectTag);
            self.$delete(self.localReplacedVideos, key.effectTag);
          }
          // 设置图片替换
          self.$set(self.localReplacedImages, key.effectTag, e.target.result);
          self.$emit('image-replaced', {
            effectTag: key.effectTag,
            imageData: e.target.result
          });
        };
        reader.readAsDataURL(file);
      },
      
      /**
       * 处理视频上传
       */
      handleVideoUpload: function (key, file) {
        var self = this;
        
        // 提取中间帧作为预览图
        this.extractMiddleFrameFromFile(file, function (posterFrame) {
          // 清除可能存在的图片替换
          if (self.localReplacedImages[key.effectTag]) {
            self.$delete(self.localReplacedImages, key.effectTag);
          }
          // 清除可能存在的旧视频替换
          if (self.localReplacedVideos[key.effectTag]) {
            self._revokeVideoUrl(key.effectTag);
          }
          // 保存视频信息
          var videoUrl = URL.createObjectURL(file);
          self.$set(self.localReplacedVideos, key.effectTag, {
            videoUrl: videoUrl,
            posterFrame: posterFrame
          });
          // 传递 videoUrl 给父组件
          self.$emit('video-replaced', {
            effectTag: key.effectTag,
            videoUrl: videoUrl,
            posterFrame: posterFrame
          });
        });
      },
      
      /**
       * 从视频中提取中间帧（50%位置）- 接受 File 对象
       */
      extractMiddleFrameFromFile: function (file, callback) {
        var videoUrl = URL.createObjectURL(file);
        this.extractMiddleFrame(videoUrl, function (posterFrame) {
          URL.revokeObjectURL(videoUrl);
          callback(posterFrame);
        });
      },

      /**
       * 从视频中提取中间帧（50%位置）
       */
      extractMiddleFrame: function (videoUrl, callback) {
        var video = document.createElement('video');
        
        video.muted = true;
        
        var handled = false;
        
        video.onloadedmetadata = function () {
          if (handled) return;
          var targetTime = video.duration / 2;
          if (video.readyState >= 2) {
            video.currentTime = targetTime;
          }
        };
        
        video.oncanplay = function () {
          if (handled) return;
          if (video.readyState >= 3) {
            handled = true;
            video.currentTime = video.duration / 2;
          }
        };
        
        video.onseeked = function () {
          if (video.videoWidth <= 0 || video.videoHeight <= 0) {
            callback(null);
            return;
          }
          var canvas = document.createElement('canvas');
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          var ctx = canvas.getContext('2d');
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          
          var posterFrame = canvas.toDataURL('image/jpeg', 0.8);
          callback(posterFrame);
          
          canvas.width = 0;
          video.removeAttribute('src');
          video.load();
        };
        
        video.onerror = function () {
          console.error('[YYEVA Key Panel] 提取视频帧失败', {
            src: video.src,
            error: video.error,
            errorMessage: video.error ? video.error.message : 'unknown',
            networkState: video.networkState,
            readyState: video.readyState
          });
          callback(null);
          video.removeAttribute('src');
          video.load();
        };
        
        video.src = videoUrl;
        video.load();
      },
      
      /**
       * 恢复媒体素材（图片或视频）
       */
      restoreMedia: function (key) {
        // 如果是视频替换，需要释放 Object URL
        if (this.localReplacedVideos[key.effectTag]) {
          this._revokeVideoUrl(key.effectTag);
          this.$delete(this.localReplacedVideos, key.effectTag);
          this.$emit('video-restored', key.effectTag);
        }
        // 如果是图片替换
        if (this.localReplacedImages[key.effectTag]) {
          this.$delete(this.localReplacedImages, key.effectTag);
          this.$emit('image-restored', key.effectTag);
        }
      },
      
      // 兼容旧方法
      triggerImageUpload: function (key) {
        this.triggerMediaUpload(key);
      },
      restoreImage: function (key) {
        this.restoreMedia(key);
      },
      restoreText: function (key) {
        // Vue 2 必须使用 $delete 删除属性，否则视图不会更新
        this.$delete(this.localReplacedTexts, key.effectTag);
        this.$emit('text-restored', key.effectTag);
      },
      handleTextInput: function (key) {
        this.$emit('text-input', {
          effectTag: key.effectTag,
          text: this.localReplacedTexts[key.effectTag]
        });
      },
      
      // ==================== 预览区交互方法 ====================
      
      /**
       * 鼠标进入预览区：播放视频
       */
      handleThumbMouseEnter: function (key) {
        this.$set(this.isHoveringThumb, key.effectTag, true);
        // 如果是视频替换，开始播放
        if (this.localReplacedVideos[key.effectTag]) {
          this.$nextTick(function () {
            var videoRef = this.$refs['video_' + key.effectTag];
            if (videoRef && videoRef[0]) {
              videoRef[0].currentTime = 0;
              videoRef[0].play().catch(function () {});
            }
          }.bind(this));
        }
      },
      
      /**
       * 鼠标离开预览区：暂停视频
       */
      handleThumbMouseLeave: function (key) {
        this.$set(this.isHoveringThumb, key.effectTag, false);
        // 如果是视频替换，暂停播放
        if (this.localReplacedVideos[key.effectTag]) {
          var videoRef = this.$refs['video_' + key.effectTag];
          if (videoRef && videoRef[0]) {
            videoRef[0].pause();
          }
        }
      },
      
      // ==================== 内部工具方法 ====================
      
      /**
       * 深拷贝视频替换对象（不复制 videoElement）
       */
      _deepCopyVideos: function (videos) {
        var copy = {};
        for (var tag in videos) {
          if (videos.hasOwnProperty(tag)) {
            copy[tag] = {
              videoUrl: videos[tag].videoUrl,
              posterFrame: videos[tag].posterFrame
            };
          }
        }
        return copy;
      },
      
      /**
       * 初始化视频静音状态（默认跟随播放器静音状态）
       */
      _initVideosMuted: function (videos) {
        var muted = {};
        var defaultMuted = this.playerMuted;
        for (var tag in videos) {
          if (videos.hasOwnProperty(tag)) {
            muted[tag] = videos[tag].muted !== undefined ? videos[tag].muted : defaultMuted;
          }
        }
        return muted;
      },
      
      /**
       * 切换视频静音状态
       */
      toggleVideoMute: function (key) {
        var currentMuted = this.localReplacedVideosMuted[key.effectTag];
        this.$set(this.localReplacedVideosMuted, key.effectTag, !currentMuted);
        this.$emit('video-mute-changed', {
          effectTag: key.effectTag,
          muted: !currentMuted
        });
      },
      
      /**
       * 释放视频 Object URL
       */
      _revokeVideoUrl: function (effectTag) {
        var videoData = this.localReplacedVideos[effectTag];
        if (videoData && videoData.videoUrl && videoData.videoUrl.startsWith('blob:')) {
          URL.revokeObjectURL(videoData.videoUrl);
        }
      },
      
      /**
       * 停止所有预览视频
       */
      _stopAllPreviewVideos: function () {
        for (var tag in this.localReplacedVideos) {
          var videoRef = this.$refs['video_' + tag];
          if (videoRef && videoRef[0]) {
            videoRef[0].pause();
          }
        }
        this.isHoveringThumb = {};
      }
    }
  };

  // 确保 Vue 加载完成后注册组件（适配 Vue2）
  function registerComponent() {
    if (window.Vue) {
      // 注册组件，让 Vue 识别<yyeva-key-panel>标签
      Vue.component('yyeva-key-panel', window.MeeWoo.Components.YyevaKeyPanel);
    } else {
      // 如果 Vue 还没加载，使用定时器服务轮询检测
      if (window.MeeWoo && window.MeeWoo.Service && window.MeeWoo.Service.TimerService) {
        // 使用轮询方式，每 600ms 检查一次，最多等待 30 秒
        window.MeeWoo.Service.TimerService.createPoll(
          function () { return window.Vue !== undefined; },  // 条件：Vue 已加载
          function () { /* 轮询中，不需要回调 */ },          // 每次轮询的回调（空）
          600,                                                // 间隔
          30000,                                              // 超时 30 秒
          'component-register'                                // 分组
        );
      } else {
        // 降级方案：使用原生 setTimeout 递归
        setTimeout(registerComponent, 600);
      }
    }
  }

  // 执行注册
  registerComponent();

})(window);