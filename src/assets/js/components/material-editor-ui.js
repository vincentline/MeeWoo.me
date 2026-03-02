/**
 * ==================== 素材编辑器 UI 组件 (Material Editor UI Component) ====================
 * 
 * 模块索引：
 * 1. 【模板定义】 - template - 弹窗 HTML 结构
 * 2. 【状态管理】 - state - 内部状态属性
 * 3. 【公共方法】 - open, close - 打开/关闭弹窗
 * 4. 【内部方法】 - initEditor, renderPreview, handleSave 等
 * 
 * 功能说明：
 * 可复用的素材编辑器 UI 组件，提供：
 * 1. 底图预览和上传/更换功能
 * 2. 文字编辑功能（内容、样式、位置）
 * 3. 底图变换功能（缩放、位移）
 * 4. 保存/取消按钮
 * 
 * 依赖模块：
 * - MeeWoo.Services.MaterialEditorService (编辑器服务)
 * - Konva.js (渲染引擎，可选)
 * 
 * 使用方式：
 * var editor = MeeWoo.Components.MaterialEditorUI;
 * editor.open({
 *   image: 'https://example.com/image.png',
 *   width: 800,
 *   height: 600,
 *   text: { content: 'Hello', style: 'font-size: 24px;' },
 *   onSave: function(dataURL) { console.log('保存成功'); },
 *   onCancel: function() { console.log('取消编辑'); }
 * });
 * 
 * editor.close();
 */

(function (global) {
  'use strict';

  global.MeeWoo = global.MeeWoo || {};
  global.MeeWoo.Components = global.MeeWoo.Components || {};

  /**
   * 素材编辑器 UI 组件
   * 提供弹窗式的素材编辑界面
   * 
   * @namespace
   */
  var MaterialEditorUI = {
    /**
     * 弹窗容器元素
     * @type {HTMLElement|null}
     * @private
     */
    container: null,

    /**
     * 编辑器服务实例
     * @type {MaterialEditorInstance|null}
     * @private
     */
    editorInstance: null,

    /**
     * 当前配置
     * @type {Object|null}
     * @private
     */
    currentConfig: null,

    /**
     * 内部状态
     * @type {Object}
     * @private
     */
    state: {
      visible: false,
      loading: false,
      image: null,
      imageLoaded: false,
      textContent: '',
      textStyle: '',
      textPosX: 50,
      textPosY: 50,
      textScale: 1,
      textAlign: 'center',
      showImage: true,
      showText: true,
      imageOffsetX: 0,
      imageOffsetY: 0,
      imageScale: 1,
      hasChanges: false
    },

    /**
     * 打开编辑器弹窗
     * 
     * @param {Object} options - 配置选项
     * @param {string|Blob} [options.image] - 初始底图（URL、Blob 或 Base64）
     * @param {number} options.width - 画布宽度
     * @param {number} options.height - 画布高度
     * @param {Object} [options.text] - 初始文字配置
     * @param {string} [options.text.content] - 文字内容
     * @param {string} [options.text.style] - CSS 样式字符串
     * @param {Object} [options.text.position] - 百分比位置 {x: 50, y: 50}
     * @param {number} [options.text.scale] - 缩放比例
     * @param {string} [options.text.align] - 对齐方式 'left'|'center'|'right'
     * @param {Function} [options.onSave] - 保存回调，参数为 DataURL
     * @param {Function} [options.onCancel] - 取消回调
     * @returns {void}
     * 
     * @example
     * MaterialEditorUI.open({
     *   image: 'image.png',
     *   width: 800,
     *   height: 600,
     *   text: { content: 'Hello', style: 'font-size: 24px; color: #fff;' },
     *   onSave: function(dataURL) { console.log('保存:', dataURL); },
     *   onCancel: function() { console.log('取消'); }
     * });
     */
    open: function (options) {
      var _this = this;

      if (!options || typeof options !== 'object') {
        console.error('[MaterialEditorUI] 配置参数无效');
        return;
      }

      if (!options.width || !options.height) {
        console.error('[MaterialEditorUI] 必须指定宽度和高度');
        return;
      }

      // 保存配置
      this.currentConfig = {
        width: options.width,
        height: options.height,
        onSave: options.onSave || null,
        onCancel: options.onCancel || null
      };

      // 重置状态
      this.resetState();

      // 设置初始文字配置
      if (options.text && typeof options.text === 'object') {
        this.state.textContent = options.text.content || '';
        this.state.textStyle = options.text.style || '';
        if (options.text.position) {
          this.state.textPosX = options.text.position.x || 50;
          this.state.textPosY = options.text.position.y || 50;
        }
        this.state.textScale = options.text.scale || 1;
        this.state.textAlign = options.text.align || 'center';
      }

      // 创建弹窗
      this.createContainer();

      // 显示弹窗
      this.state.visible = true;
      this.updateContainerVisibility();

      // 加载初始底图
      if (options.image) {
        this.loadImage(options.image);
      }

      // 初始化编辑器服务
      this.initEditorService();
    },

    /**
     * 关闭编辑器弹窗
     * 销毁编辑器实例和 DOM 元素
     * 
     * @returns {void}
     * 
     * @example
     * MaterialEditorUI.close();
     */
    close: function () {
      // 触发取消回调
      if (this.currentConfig && this.currentConfig.onCancel) {
        try {
          this.currentConfig.onCancel();
        } catch (e) {
          console.error('[MaterialEditorUI] 取消回调执行失败:', e);
        }
      }

      // 销毁编辑器实例
      if (this.editorInstance) {
        this.editorInstance.destroy();
        this.editorInstance = null;
      }

      // 移除 DOM 元素
      this.removeContainer();

      // 重置状态
      this.resetState();
      this.currentConfig = null;
    },

    /**
     * 重置内部状态
     * @private
     */
    resetState: function () {
      this.state = {
        visible: false,
        loading: false,
        image: null,
        imageLoaded: false,
        textContent: '',
        textStyle: '',
        textPosX: 50,
        textPosY: 50,
        textScale: 1,
        textAlign: 'center',
        showImage: true,
        showText: true,
        imageOffsetX: 0,
        imageOffsetY: 0,
        imageScale: 1,
        hasChanges: false
      };
    },

    /**
     * 创建弹窗容器
     * @private
     */
    createContainer: function () {
      var _this = this;

      // 如果容器已存在，先移除
      if (this.container) {
        this.removeContainer();
      }

      // 创建容器元素
      this.container = document.createElement('div');
      this.container.className = 'material-editor-ui-overlay';
      this.container.innerHTML = this.getTemplate();

      // 添加到 body
      document.body.appendChild(this.container);

      // 绑定事件
      this.bindEvents();
    },

    /**
     * 移除弹窗容器
     * @private
     */
    removeContainer: function () {
      if (this.container && this.container.parentNode) {
        this.container.parentNode.removeChild(this.container);
      }
      this.container = null;
    },

    /**
     * 更新容器可见性
     * @private
     */
    updateContainerVisibility: function () {
      if (this.container) {
        if (this.state.visible) {
          this.container.classList.add('show');
        } else {
          this.container.classList.remove('show');
        }
      }
    },

    /**
     * 获取弹窗模板
     * @private
     * @returns {string} HTML 模板字符串
     */
    getTemplate: function () {
      return [
        '<div class="material-editor-ui-dialog">',
        '  <div class="material-editor-ui-header">',
        '    <h3 class="material-editor-ui-title">编辑素材图</h3>',
        '    <button class="material-editor-ui-close" data-action="close">&times;</button>',
        '  </div>',
        '  <div class="material-editor-ui-body">',
        '    <!-- 左侧预览区 -->',
        '    <div class="material-editor-ui-preview">',
        '      <div class="material-editor-ui-canvas" id="material-editor-ui-canvas"></div>',
        '      <div class="material-editor-ui-actions-bottom">',
        '        <div class="material-editor-ui-actions-left">',
        '          <button class="material-editor-ui-btn material-editor-ui-btn-view" data-action="toggleView" title="切换视图"></button>',
        '          <span class="material-editor-ui-scale-text">100%</span>',
        '        </div>',
        '        <div class="material-editor-ui-actions-right">',
        '          <input type="file" id="material-editor-ui-file-input" accept="image/png,image/jpeg" style="display:none">',
        '          <button class="material-editor-ui-btn material-editor-ui-btn-primary" data-action="upload">上传图片</button>',
        '          <button class="material-editor-ui-btn material-editor-ui-btn-recover" data-action="restore" title="恢复原图" style="display:none"></button>',
        '        </div>',
        '      </div>',
        '    </div>',
        '    <!-- 右侧控制区 -->',
        '    <div class="material-editor-ui-controls">',
        '      <div class="material-editor-ui-control-group">',
        '        <div class="material-editor-ui-control-item">',
        '          <div class="material-editor-ui-control-label">显示素材图</div>',
        '          <div class="material-editor-ui-toggle" data-toggle="showImage">',
        '            <div class="material-editor-ui-toggle-handle"></div>',
        '          </div>',
        '        </div>',
        '        <div class="material-editor-ui-control-item">',
        '          <div class="material-editor-ui-control-label">显示文案</div>',
        '          <div class="material-editor-ui-toggle" data-toggle="showText">',
        '            <div class="material-editor-ui-toggle-handle"></div>',
        '          </div>',
        '        </div>',
        '      </div>',
        '      <div class="material-editor-ui-text-controls" id="material-editor-ui-text-controls">',
        '        <div class="material-editor-ui-control-label-row">',
        '          <div class="material-editor-ui-control-label">文案内容：</div>',
        '          <div class="material-editor-ui-align-btns">',
        '            <button class="material-editor-ui-align-btn" data-align="left" title="左对齐"></button>',
        '            <button class="material-editor-ui-align-btn active" data-align="center" title="居中对齐"></button>',
        '            <button class="material-editor-ui-align-btn" data-align="right" title="右对齐"></button>',
        '          </div>',
        '        </div>',
        '        <textarea class="material-editor-ui-textarea" id="material-editor-ui-text-content" placeholder="请输入文案"></textarea>',
        '        <div class="material-editor-ui-control-label">文字样式 (CSS)：</div>',
        '        <textarea class="material-editor-ui-textarea material-editor-ui-textarea-lg" id="material-editor-ui-text-style" placeholder="例如：color: red; font-size: 20px;"></textarea>',
        '        <div class="material-editor-ui-hint">默认样式白字黑边。支持输入标准CSS样式。</div>',
        '      </div>',
        '    </div>',
        '  </div>',
        '  <div class="material-editor-ui-footer">',
        '    <button class="material-editor-ui-btn material-editor-ui-btn-default" data-action="cancel">取消</button>',
        '    <button class="material-editor-ui-btn material-editor-ui-btn-primary" data-action="save">保存</button>',
        '  </div>',
        '</div>'
      ].join('\n');
    },

    /**
     * 绑定事件
     * @private
     */
    bindEvents: function () {
      var _this = this;
      var container = this.container;

      if (!container) return;

      // 点击遮罩层关闭
      container.addEventListener('click', function (e) {
        if (e.target === container) {
          _this.close();
        }
      });

      // 按钮点击事件
      container.addEventListener('click', function (e) {
        var target = e.target.closest('[data-action]');
        if (!target) return;

        var action = target.getAttribute('data-action');
        switch (action) {
          case 'close':
          case 'cancel':
            _this.close();
            break;
          case 'save':
            _this.handleSave();
            break;
          case 'upload':
            _this.triggerUpload();
            break;
          case 'restore':
            _this.restoreOriginal();
            break;
          case 'toggleView':
            _this.toggleViewMode();
            break;
        }
      });

      // 开关切换事件
      container.addEventListener('click', function (e) {
        var target = e.target.closest('[data-toggle]');
        if (!target) return;

        var toggleKey = target.getAttribute('data-toggle');
        _this.toggleState(toggleKey);
        _this.updateToggleUI(target, toggleKey);
      });

      // 对齐按钮事件
      container.addEventListener('click', function (e) {
        var target = e.target.closest('[data-align]');
        if (!target) return;

        var align = target.getAttribute('data-align');
        _this.setTextAlign(align);
        _this.updateAlignButtons(align);
      });

      // 文字内容输入
      var textContentEl = container.querySelector('#material-editor-ui-text-content');
      if (textContentEl) {
        textContentEl.addEventListener('input', function (e) {
          _this.state.textContent = e.target.value;
          _this.state.hasChanges = true;
        });
      }

      // 文字样式输入
      var textStyleEl = container.querySelector('#material-editor-ui-text-style');
      if (textStyleEl) {
        textStyleEl.addEventListener('input', function (e) {
          _this.state.textStyle = e.target.value;
          _this.state.hasChanges = true;
        });
      }

      // 文件上传事件
      var fileInput = container.querySelector('#material-editor-ui-file-input');
      if (fileInput) {
        fileInput.addEventListener('change', function (e) {
          _this.handleFileSelect(e);
        });
      }
    },

    /**
     * 初始化编辑器服务
     * @private
     */
    initEditorService: function () {
      var MaterialEditorService = global.MeeWoo && global.MeeWoo.Services && global.MeeWoo.Services.MaterialEditorService;

      if (!MaterialEditorService) {
        console.warn('[MaterialEditorUI] MaterialEditorService 未加载，使用简化模式');
        return;
      }

      try {
        this.editorInstance = MaterialEditorService.create({
          width: this.currentConfig.width,
          height: this.currentConfig.height
        });
      } catch (e) {
        console.error('[MaterialEditorUI] 创建编辑器实例失败:', e);
      }
    },

    /**
     * 加载图片
     * @private
     * @param {string|Blob} source - 图片源
     */
    loadImage: function (source) {
      var _this = this;

      this.state.loading = true;
      this.state.image = source;

      // 如果有编辑器服务实例，使用服务加载
      if (this.editorInstance) {
        this.editorInstance.loadImage(source)
          .then(function () {
            _this.state.imageLoaded = true;
            _this.state.loading = false;
            _this.updateRestoreButton();
          })
          .catch(function (err) {
            console.error('[MaterialEditorUI] 图片加载失败:', err);
            _this.state.loading = false;
          });
      } else {
        // 简化模式：直接创建 Image 对象预览
        var img = new Image();
        img.onload = function () {
          _this.state.imageLoaded = true;
          _this.state.loading = false;
          _this.updateRestoreButton();
        };
        img.onerror = function () {
          console.error('[MaterialEditorUI] 图片加载失败');
          _this.state.loading = false;
        };
        img.src = typeof source === 'string' ? source : URL.createObjectURL(source);
      }
    },

    /**
     * 触发文件上传
     * @private
     */
    triggerUpload: function () {
      var fileInput = this.container && this.container.querySelector('#material-editor-ui-file-input');
      if (fileInput) {
        fileInput.click();
      }
    },

    /**
     * 处理文件选择
     * @private
     * @param {Event} e - 文件选择事件
     */
    handleFileSelect: function (e) {
      var files = e.target.files;
      if (!files || files.length === 0) return;

      var file = files[0];
      if (!file.type.match(/^image\/(png|jpeg|jpg)$/)) {
        console.error('[MaterialEditorUI] 仅支持 PNG 和 JPEG 格式图片');
        return;
      }

      this.loadImage(file);
      this.state.hasChanges = true;

      // 清空 input 以便重复选择同一文件
      e.target.value = '';
    },

    /**
     * 切换状态
     * @private
     * @param {string} key - 状态键名
     */
    toggleState: function (key) {
      if (key === 'showImage') {
        this.state.showImage = !this.state.showImage;
        this.state.hasChanges = true;
      } else if (key === 'showText') {
        this.state.showText = !this.state.showText;
        this.state.hasChanges = true;
        this.updateTextControlsVisibility();
      }
    },

    /**
     * 更新开关 UI
     * @private
     * @param {HTMLElement} target - 开关元素
     * @param {string} key - 状态键名
     */
    updateToggleUI: function (target, key) {
      var isActive = key === 'showImage' ? this.state.showImage : this.state.showText;
      if (isActive) {
        target.classList.add('active');
      } else {
        target.classList.remove('active');
      }
    },

    /**
     * 更新文字控制区可见性
     * @private
     */
    updateTextControlsVisibility: function () {
      var textControls = this.container && this.container.querySelector('#material-editor-ui-text-controls');
      if (textControls) {
        textControls.style.display = this.state.showText ? 'block' : 'none';
      }
    },

    /**
     * 设置文字对齐方式
     * @private
     * @param {string} align - 对齐方式
     */
    setTextAlign: function (align) {
      this.state.textAlign = align;
      this.state.hasChanges = true;
    },

    /**
     * 更新对齐按钮状态
     * @private
     * @param {string} activeAlign - 当前激活的对齐方式
     */
    updateAlignButtons: function (activeAlign) {
      var container = this.container;
      if (!container) return;

      var buttons = container.querySelectorAll('[data-align]');
      buttons.forEach(function (btn) {
        var align = btn.getAttribute('data-align');
        if (align === activeAlign) {
          btn.classList.add('active');
        } else {
          btn.classList.remove('active');
        }
      });
    },

    /**
     * 恢复原始状态
     * @private
     */
    restoreOriginal: function () {
      this.state.imageOffsetX = 0;
      this.state.imageOffsetY = 0;
      this.state.imageScale = 1;
      this.state.textContent = '';
      this.state.textStyle = '';
      this.state.textPosX = 50;
      this.state.textPosY = 50;
      this.state.textScale = 1;
      this.state.textAlign = 'center';
      this.state.hasChanges = false;

      // 更新 UI
      this.syncUIFromState();
      this.updateRestoreButton();
    },

    /**
     * 从状态同步 UI
     * @private
     */
    syncUIFromState: function () {
      var container = this.container;
      if (!container) return;

      // 同步文字内容
      var textContentEl = container.querySelector('#material-editor-ui-text-content');
      if (textContentEl) {
        textContentEl.value = this.state.textContent;
      }

      // 同步文字样式
      var textStyleEl = container.querySelector('#material-editor-ui-text-style');
      if (textStyleEl) {
        textStyleEl.value = this.state.textStyle;
      }

      // 同步对齐按钮
      this.updateAlignButtons(this.state.textAlign);

      // 同步开关状态
      var showImageToggle = container.querySelector('[data-toggle="showImage"]');
      if (showImageToggle) {
        this.updateToggleUI(showImageToggle, 'showImage');
      }

      var showTextToggle = container.querySelector('[data-toggle="showText"]');
      if (showTextToggle) {
        this.updateToggleUI(showTextToggle, 'showText');
      }

      // 同步文字控制区可见性
      this.updateTextControlsVisibility();
    },

    /**
     * 更新恢复按钮可见性
     * @private
     */
    updateRestoreButton: function () {
      var container = this.container;
      if (!container) return;

      var restoreBtn = container.querySelector('[data-action="restore"]');
      if (restoreBtn) {
        var hasChanges = this.state.imageOffsetX !== 0 ||
          this.state.imageOffsetY !== 0 ||
          this.state.imageScale !== 1 ||
          this.state.textContent !== '' ||
          this.state.textStyle !== '';

        restoreBtn.style.display = hasChanges ? 'inline-block' : 'none';
      }
    },

    /**
     * 切换视图模式
     * @private
     */
    toggleViewMode: function () {
      // 预留：实现 1:1 和适应高度切换
      console.log('[MaterialEditorUI] 切换视图模式');
    },

    /**
     * 处理保存
     * @private
     */
    handleSave: function () {
      var _this = this;

      if (this.state.loading) {
        console.warn('[MaterialEditorUI] 正在加载中，请稍候');
        return;
      }

      // 如果有编辑器服务实例，使用服务导出
      if (this.editorInstance) {
        // 同步状态到编辑器实例
        this.syncStateToEditor();

        this.editorInstance.export()
          .then(function (dataURL) {
            if (_this.currentConfig && _this.currentConfig.onSave) {
              _this.currentConfig.onSave(dataURL);
            }
            _this.close();
          })
          .catch(function (err) {
            console.error('[MaterialEditorUI] 导出失败:', err);
          });
      } else {
        // 简化模式：直接返回原图
        if (this.currentConfig && this.currentConfig.onSave) {
          this.currentConfig.onSave(this.state.image);
        }
        this.close();
      }
    },

    /**
     * 同步状态到编辑器实例
     * @private
     */
    syncStateToEditor: function () {
      if (!this.editorInstance) return;

      // 设置文字
      this.editorInstance.setText({
        content: this.state.textContent,
        style: this.state.textStyle,
        position: { x: this.state.textPosX, y: this.state.textPosY },
        scale: this.state.textScale,
        align: this.state.textAlign
      });

      // 设置图片变换
      this.editorInstance.setImageTransform({
        offsetX: this.state.imageOffsetX,
        offsetY: this.state.imageOffsetY,
        scale: this.state.imageScale
      });
    }
  };

  // 挂载到命名空间
  global.MeeWoo.Components.MaterialEditorUI = MaterialEditorUI;

})(typeof window !== 'undefined' ? window : this);
