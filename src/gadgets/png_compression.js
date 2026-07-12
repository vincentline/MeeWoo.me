/**
 * PNG 压缩工具 - 交互重构版
 * 
 * 功能：
 * - 拖拽 + 点击选择 PNG 文件
 * - 图片卡片列表：缩略图/尺寸/大小/勾选/删除
 * - 预设压缩档位 + 自定义滑块
 * - 逐张压缩 + 取消机制（图间跳过）
 * - 对比预览弹窗：分割线拖拽对比 + 多压缩率试压 tab + 确认版本
 * - 多选打包下载（只下载确认版本）
 */
(function () {
  'use strict';

  // ==================== 状态管理 ====================

  const app = {
    images: [],
    isCompressing: false,
    cancelled: false,
    overwriteDialogOpen: false,
    compressedCount: 0,
    totalSizeBefore: 0,
    totalSizeAfter: 0,
    currentQuality: 70,
    lastCustomQuality: 70,
    theme: 'light',
    // 对比弹窗状态
    compareImageId: null,
    compareCurrentQuality: null
  };

  // ==================== DOM 引用 ====================

  const els = {};

  function cacheElements() {
    els.dragArea = document.getElementById('dragArea');
    els.fileInput = document.getElementById('fileInput');
    els.selectFilesBtn = document.getElementById('selectFilesBtn');
    els.addMoreHint = document.getElementById('addMoreHint');
    els.imageListSection = document.getElementById('imageListSection');
    els.imageGrid = document.getElementById('imageGrid');
    els.emptyHint = document.getElementById('emptyHint');
    els.compressBtn = document.getElementById('compressBtn');
    els.cancelBtn = document.getElementById('cancelBtn');
    els.clearBtn = document.getElementById('clearBtn');
    els.compressionQuality = document.getElementById('compressionQuality');
    els.compressionValue = document.getElementById('compressionValue');
    els.presetCustom = document.getElementById('presetCustom');
    els.overallProgress = document.getElementById('overallProgress');
    els.overallProgressFill = document.getElementById('overallProgressFill');
    els.overallProgressStats = document.getElementById('overallProgressStats');
    els.downloadSection = document.getElementById('downloadSection');
    els.downloadStats = document.getElementById('downloadStats');
    els.downloadSelectedBtn = document.getElementById('downloadSelectedBtn');
    els.themeToggle = document.querySelector('.theme-toggle');
    els.logoImg = document.querySelector('.logo-img');
    els.logoLink = document.querySelector('.logo-link');
    // 对比弹窗
    els.compareModalOverlay = document.getElementById('compareModalOverlay');
    els.compareModal = document.getElementById('compareModal');
    els.compareModalClose = document.getElementById('compareModalClose');
    els.compareModalTitle = document.getElementById('compareModalTitle');
    els.compareViewport = document.getElementById('compareViewport');
    els.compareImageLeft = document.getElementById('compareImageLeft');
    els.compareImageRight = document.getElementById('compareImageRight');
    els.compareDivider = document.getElementById('compareDivider');
    els.comparePlaceholder = document.getElementById('comparePlaceholder');
    els.compareTabs = document.getElementById('compareTabs');
    els.compareConfirm = document.getElementById('compareConfirm');
    els.compareConfirmBtn = document.getElementById('compareConfirmBtn');
    els.comparePopover = document.getElementById('comparePopover');
    els.comparePopoverQualityInput = document.getElementById('comparePopoverQualityInput');
    els.comparePopoverCompressBtn = document.getElementById('comparePopoverCompressBtn');
    els.compareZoomLabel = document.getElementById('compareZoomLabel');
    els.compareInnerLeft = els.compareImageLeft.querySelector('.compare-image-inner');
    els.compareInnerRight = els.compareImageRight.querySelector('.compare-image-inner');
    els.compareLabelRight = els.compareImageRight.querySelector('.compare-label');
    // 覆盖确认弹窗
    els.overwriteOverlay = document.getElementById('overwriteOverlay');
    els.overwriteClose = document.getElementById('overwriteClose');
    els.overwriteTitle = document.getElementById('overwriteTitle');
    els.overwriteList = document.getElementById('overwriteList');
    els.overwriteKeepAll = document.getElementById('overwriteKeepAll');
    els.overwriteRecompressAll = document.getElementById('overwriteRecompressAll');
    els.overwriteHintQuality = document.getElementById('overwriteHintQuality');
    els.overwriteCancel = document.getElementById('overwriteCancel');
    els.overwriteStart = document.getElementById('overwriteStart');
  }

  // ==================== 工具函数 ====================

  function formatSize(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  function showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'toast-message';
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(function () {
      if (toast.parentNode) toast.parentNode.removeChild(toast);
    }, 3000);
  }

  /**
   * 读取图片尺寸
   */
  function getImageDimensions(file) {
    return new Promise(function (resolve) {
      var img = new Image();
      var url = URL.createObjectURL(file);
      img.onload = function () {
        URL.revokeObjectURL(url);
        resolve({ width: img.naturalWidth, height: img.naturalHeight });
      };
      img.onerror = function () {
        URL.revokeObjectURL(url);
        resolve({ width: 0, height: 0 });
      };
      img.src = url;
    });
  }

  /**
   * 读取文件为 ArrayBuffer
   */
  function readFileAsArrayBuffer(file) {
    return new Promise(function (resolve, reject) {
      var reader = new FileReader();
      reader.onload = function (e) { resolve(e.target.result); };
      reader.onerror = reject;
      reader.readAsArrayBuffer(file);
    });
  }

  /**
   * 读取文件为 Data URL（用于预览）
   */
  function readFileAsDataURL(file) {
    return new Promise(function (resolve) {
      var reader = new FileReader();
      reader.onload = function (e) { resolve(e.target.result); };
      reader.readAsDataURL(file);
    });
  }

  /**
   * 获取当前质量值
   */
  function getCurrentQuality() {
    return app.currentQuality;
  }

  // ==================== 主题管理 ====================

  function setTheme(theme) {
    app.theme = theme;
    try { localStorage.setItem('theme', theme); } catch (e) { /* ignore */ }
    if (theme === 'dark') {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
    updateLogoImage();
  }

  function toggleTheme() {
    setTheme(app.theme === 'light' ? 'dark' : 'light');
  }

  function updateLogoImage() {
    if (!els.logoImg) return;
    var isDark = document.body.classList.contains('dark-mode');
    els.logoImg.src = isDark ? '../assets/img/logo_dark.png' : '../assets/img/logo.png';
  }

  // ==================== 文件处理 ====================

  /**
   * 处理文件列表（来自拖拽或 input）
   */
  function processFiles(files) {
    var pngFiles = [];
    for (var i = 0; i < files.length; i++) {
      var f = files[i];
      if (f.type === 'image/png' || f.name.toLowerCase().endsWith('.png')) {
        pngFiles.push(f);
      }
    }

    if (pngFiles.length === 0) {
      showToast('仅支持 PNG 格式的图片');
      return;
    }

    // 异步添加每张图
    pngFiles.forEach(function (file) {
      addImage(file);
    });

    updateListView();
  }

  var idCounter = 0;

  function addImage(file) {
    var image = {
      id: Date.now() + '_' + (idCounter++) + '_' + Math.random().toString(36).substr(2, 5),
      file: file,
      name: file.name,
      size: file.size,
      width: 0,
      height: 0,
      status: 'pending',
      progress: 0,
      compressedData: null,
      compressedSize: 0,
      compressionRate: 0,
      compressedQuality: null,
      confirmedQuality: null,
      trialResults: {},
      selected: false,
      dataUrl: null
    };

    app.images.push(image);
    app.totalSizeBefore += image.size;

    // 异步读取图片尺寸和预览
    getImageDimensions(file).then(function (dim) {
      image.width = dim.width;
      image.height = dim.height;
      updateImageCardMeta(image);
      checkImageSizeLimit(image);
    });

    readFileAsDataURL(file).then(function (dataUrl) {
      image.dataUrl = dataUrl;
      updateImageCardThumb(image);
    });

    renderImageCard(image);
  }

  /** 图片尺寸上限：宽或高超过此值拒绝添加 */
  var MAX_IMAGE_DIM = 4095;

  function checkImageSizeLimit(image) {
    if (image.width > MAX_IMAGE_DIM || image.height > MAX_IMAGE_DIM) {
      // 移除 DOM 卡片
      var card = getImageCard(image.id);
      if (card) card.remove();
      // 扣减总大小
      app.totalSizeBefore -= image.size;
      // 从数组移除
      var idx = app.images.indexOf(image);
      if (idx >= 0) app.images.splice(idx, 1);
      updateListView();
      showToast('"' + image.name + '" 尺寸超出限制（' + image.width + '×' + image.height + '），最大支持 ' + MAX_IMAGE_DIM + '×' + MAX_IMAGE_DIM);
    }
  }

  // ==================== 图片卡片渲染 ====================

  function renderImageCard(image) {
    var card = document.createElement('div');
    card.className = 'image-card';
    card.dataset.id = image.id;

    card.innerHTML =
      '<div class="image-card-header">' +
        '<input type="checkbox" class="image-card-checkbox" title="选择下载">' +
        '<button class="image-card-delete" title="删除">&times;</button>' +
      '</div>' +
      '<img class="image-card-thumb" alt="' + image.name + '">' +
      '<div class="image-card-info">' +
        '<span class="image-card-name" title="' + image.name + '">' + image.name + '</span>' +
        '<div class="image-card-meta">' +
          '<span class="image-card-dims">' + (image.width ? image.width + ' × ' + image.height : '读取中...') + '</span>' +
          '<span>·</span>' +
          '<span>' + formatSize(image.size) + '</span>' +
          '<span class="image-card-quality" style="display:none"></span>' +
        '</div>' +
        '<span class="image-card-status image-card-status--pending">等待</span>' +
        '<span class="image-card-result"></span>' +
        '<span class="image-card-confirmed"></span>' +
      '</div>' +
      '<div class="image-card-progress">' +
        '<div class="progress-bar"><div class="progress-fill" style="width:0%"></div></div>' +
      '</div>';

    // 绑定事件
    var checkbox = card.querySelector('.image-card-checkbox');
    checkbox.addEventListener('change', function () {
      image.selected = checkbox.checked;
      card.classList.toggle('image-card--selected', image.selected);
      updateDownloadButton();
    });

    card.querySelector('.image-card-delete').addEventListener('click', function (e) {
      e.stopPropagation();
      removeImage(image.id);
    });

    card.querySelector('.image-card-thumb').addEventListener('click', function () {
      openCompareModal(image.id);
    });

    els.imageGrid.appendChild(card);
  }

  function getImageCard(id) {
    return els.imageGrid.querySelector('.image-card[data-id="' + id + '"]');
  }

  function getImageById(id) {
    for (var i = 0; i < app.images.length; i++) {
      if (app.images[i].id === id) return app.images[i];
    }
    return null;
  }

  function updateImageCardThumb(image) {
    var card = getImageCard(image.id);
    if (!card || !image.dataUrl) return;
    var thumb = card.querySelector('.image-card-thumb');
    if (thumb) thumb.src = image.dataUrl;
  }

  function updateImageCardMeta(image) {
    var card = getImageCard(image.id);
    if (!card) return;
    var dimsEl = card.querySelector('.image-card-dims');
    if (dimsEl) dimsEl.textContent = image.width + ' × ' + image.height;
  }

  function updateImageCard(image) {
    var card = getImageCard(image.id);
    if (!card) return;

    // 状态标签
    var statusEl = card.querySelector('.image-card-status');
    statusEl.className = 'image-card-status image-card-status--' + image.status;
    var statusText = { pending: '等待', compressing: '压缩中...', completed: '已完成', failed: '失败' };
    statusEl.textContent = statusText[image.status] || image.status;

    // 压缩中脉冲动画
    card.classList.toggle('image-card--compressing', image.status === 'compressing');

    // 进度条
    var progressEl = card.querySelector('.image-card-progress');
    if (image.status === 'compressing') {
      progressEl.style.display = 'block';
      progressEl.querySelector('.progress-fill').style.width = image.progress + '%';
    } else {
      progressEl.style.display = 'none';
    }

    // 压缩结果
    var resultEl = card.querySelector('.image-card-result');
    if (image.status === 'completed' && image.compressedSize > 0) {
      resultEl.style.display = 'block';
      resultEl.textContent = '压缩后: ' + formatSize(image.compressedSize) + ' (-' + image.compressionRate + '%)';
    } else {
      resultEl.style.display = 'none';
    }

    // 确认版本
    var confirmedEl = card.querySelector('.image-card-confirmed');
    if (image.confirmedQuality !== null) {
      confirmedEl.style.display = 'block';
      confirmedEl.textContent = '已确认压缩质量: ' + getQualityLabel(image.confirmedQuality);
    } else {
      confirmedEl.style.display = 'none';
    }

    // 压缩级别标签（meta 行）
    var qualityEl = card.querySelector('.image-card-quality');
    if (image.compressedQuality !== null) {
      qualityEl.style.display = 'inline';
      qualityEl.textContent = '· ' + getQualityLabel(image.compressedQuality);
    } else {
      qualityEl.style.display = 'none';
    }
  }

  function removeImage(id) {
    if (app.isCompressing) {
      showToast('正在压缩中，无法删除');
      return;
    }

    var card = getImageCard(id);
    if (card) card.remove();

    app.images = app.images.filter(function (img) {
      if (img.id === id) {
        app.totalSizeBefore -= img.size;
        if (img.compressedSize > 0) app.totalSizeAfter -= img.compressedSize;
        return false;
      }
      return true;
    });

    updateListView();
  }

  function clearAllImages() {
    if (app.isCompressing) {
      showToast('正在压缩中，无法清空');
      return;
    }

    app.images = [];
    app.compressedCount = 0;
    app.totalSizeBefore = 0;
    app.totalSizeAfter = 0;
    els.imageGrid.innerHTML = '';

    updateListView();
  }

  // ==================== 列表视图控制 ====================

  function updateListView() {
    var hasImages = app.images.length > 0;

    els.imageListSection.style.display = hasImages ? 'block' : 'none';
    els.emptyHint.style.display = hasImages ? 'none' : 'block';
    els.dragArea.classList.toggle('has-images', hasImages);
    els.addMoreHint.style.display = hasImages ? 'block' : 'none';

    // 有图但全部删除后隐藏下载区
    if (!hasImages) {
      els.downloadSection.style.display = 'none';
      els.overallProgress.style.display = 'none';
      els.compressBtn.disabled = false;
    }
  }

  // ==================== 压缩级别控制 ====================

  function setQualityPreset(quality) {
    app.currentQuality = quality;
    els.compressionQuality.value = quality;
    els.compressionValue.textContent = quality;

    // 更新预设按钮激活状态——点击预设高亮对应按钮，取消自定义高亮
    var presetBtns = document.querySelectorAll('.toolbar-quality .preset-btn[data-quality]');
    presetBtns.forEach(function (btn) {
      btn.classList.toggle('active', parseInt(btn.dataset.quality) === quality);
    });
    // 取消自定义按钮高亮（预设值不是自定义）
    if (els.presetCustom) els.presetCustom.classList.remove('active');
  }

  // ==================== 压缩流程 ====================

  function getQualityLabel(quality) {
    if (quality === 40) return '极致';
    if (quality === 70) return '推荐';
    if (quality === 90) return '高质';
    return String(quality);
  }

  /**
   * 显示覆盖确认弹窗——点开始压缩时，若有已确认版本图片则询问是否保留
   * @param {Array} confirmedImages - 已确认版本的图片数组
   * @returns {Promise<Array<boolean>|null>} 每张图对应的保留标志（true=保留），用户取消返回 null
   */
  function showConfirmOverwriteDialog(confirmedImages) {
    return new Promise(function (resolve) {
      // 标题
      els.overwriteTitle.textContent = '部分图片已确认压缩质量，批量压缩是否跳过这些图片？';

      // 说明文字：动态填充当前批量压缩质量
      els.overwriteHintQuality.textContent = getCurrentQuality();

      // 渲染列表——checkbox 视觉隐藏，用 .overwrite-toggle 显示"跳过/不跳过"
      els.overwriteList.innerHTML = '';
      var checkboxes = [];
      confirmedImages.forEach(function (img) {
        var item = document.createElement('label');
        item.className = 'overwrite-item';

        // 隐藏的 checkbox——true=跳过（保留确认版本），默认 true
        var cb = document.createElement('input');
        cb.type = 'checkbox';
        cb.checked = true;
        cb.dataset.imageId = img.id;
        cb.className = 'overwrite-checkbox';
        checkboxes.push(cb);

        // 可见的切换标签：显示"跳过"或"不跳过"
        var toggle = document.createElement('span');
        toggle.className = 'overwrite-toggle';

        // 更新标签外观的回调
        var updateToggle = function () {
          if (cb.checked) {
            toggle.textContent = '跳过';
            toggle.className = 'overwrite-toggle overwrite-toggle--skip';
          } else {
            toggle.textContent = '不跳过';
            toggle.className = 'overwrite-toggle overwrite-toggle--noskip';
          }
        };
        updateToggle(); // 初始状态
        cb.addEventListener('change', updateToggle);

        var thumb = document.createElement('img');
        thumb.className = 'overwrite-thumb';
        thumb.src = img.dataUrl || '';
        thumb.alt = '';

        var info = document.createElement('div');
        info.className = 'overwrite-info';

        var name = document.createElement('div');
        name.className = 'overwrite-name';
        name.textContent = img.name;
        name.title = img.name;

        var meta = document.createElement('div');
        meta.className = 'overwrite-meta';
        var qualityText = getQualityLabel(img.confirmedQuality) + ' ' + img.confirmedQuality + '质量';
        var sizesText = formatSize(img.size) + ' → ' + formatSize(img.compressedSize);
        var rateText = '省 ' + img.compressionRate + '%';
        meta.innerHTML = '<span class="quality">' + qualityText + '</span>' +
                         '<span class="sizes">' + sizesText + '</span>' +
                         '<span class="rate">' + rateText + '</span>';

        info.appendChild(name);
        info.appendChild(meta);

        item.appendChild(cb);
        item.appendChild(toggle);
        item.appendChild(thumb);
        item.appendChild(info);

        els.overwriteList.appendChild(item);
      });

      // 显示弹窗
      els.overwriteOverlay.style.display = 'flex';
      app.overwriteDialogOpen = true;

      // 清理事件绑定——避免重复调用时叠加
      var cleanup = function () {
        els.overwriteKeepAll.onclick = null;
        els.overwriteRecompressAll.onclick = null;
        els.overwriteCancel.onclick = null;
        els.overwriteStart.onclick = null;
        els.overwriteClose.onclick = null;
        els.overwriteOverlay.style.display = 'none';
        app.overwriteDialogOpen = false;
      };

      // 全部跳过（全选）
      els.overwriteKeepAll.onclick = function () {
        checkboxes.forEach(function (cb) { cb.checked = true; cb.dispatchEvent(new Event('change')); });
      };

      // 全部批量压缩（全不选）
      els.overwriteRecompressAll.onclick = function () {
        checkboxes.forEach(function (cb) { cb.checked = false; cb.dispatchEvent(new Event('change')); });
      };

      // 取消（含关闭按钮）
      var onCancel = function () {
        cleanup();
        resolve(null);
      };
      els.overwriteCancel.onclick = onCancel;
      els.overwriteClose.onclick = onCancel;

      // 开始压缩——收集勾选状态（true=跳过保留确认版本）
      els.overwriteStart.onclick = function () {
        var keepFlags = checkboxes.map(function (cb) { return cb.checked; });
        cleanup();
        resolve(keepFlags);
      };
    });
  }

  async function startCompression() {
    if (app.isCompressing) return;
    if (app.overwriteDialogOpen) return; // 覆盖弹窗已打开，防止重入
    if (app.images.length === 0) {
      showToast('请先添加 PNG 图片');
      return;
    }

    var quality = getCurrentQuality();

    // 有勾选图片时只压缩勾选的，否则压缩全部
    var selectedImages = app.images.filter(function (img) { return img.selected; });
    var targetImages = selectedImages.length > 0 ? selectedImages : app.images;

    // 检测目标范围内已确认版本的图片——若有则弹窗询问是否保留
    // 避免静默覆盖用户在对比弹窗里精心调好的版本
    var confirmedImages = targetImages.filter(function (img) { return img.confirmedQuality !== null; });
    var keptImages = []; // 被用户选择保留的已确认图片
    if (confirmedImages.length > 0) {
      var keepFlags = await showConfirmOverwriteDialog(confirmedImages);
      if (keepFlags === null) {
        // 用户取消
        return;
      }
      // 勾选=保留确认版本，不勾选=重新压缩
      var keepIds = {};
      confirmedImages.forEach(function (img, i) {
        if (keepFlags[i]) {
          keepIds[img.id] = true;
          keptImages.push(img);
        }
      });
      var toRecompress = targetImages.filter(function (img) { return !keepIds[img.id]; });

      if (toRecompress.length === 0) {
        showToast('全部图片保留已确认压缩质量，无需重新压缩');
        showDownloadSection();
        return;
      }
      targetImages = toRecompress;
    }

    app.isCompressing = true;
    app.cancelled = false;
    app.compressedCount = 0;
    app.totalSizeAfter = 0;
    // 被保留的已确认图片，其压缩大小应计入总大小（否则下载统计会少算）
    keptImages.forEach(function (img) {
      app.totalSizeAfter += img.compressedSize || 0;
    });

    // UI 状态
    els.compressBtn.style.display = 'none';
    els.cancelBtn.style.display = 'inline-flex';
    els.overallProgress.style.display = 'block';
    els.downloadSection.style.display = 'none';
    // 压缩中禁止卡片交互（预览、勾选）
    document.getElementById('imageListSection').classList.add('is-compressing');

    var targetTotal = targetImages.length;

    // 逐张压缩
    for (var i = 0; i < targetImages.length; i++) {
      if (app.cancelled) break;

      var image = targetImages[i];
      image.status = 'compressing';
      image.progress = 0;
      image.compressedData = null;
      image.compressedSize = 0;
      image.compressionRate = 0;
      image.compressedQuality = null;
      image.confirmedQuality = null;
      image.trialResults = {};
      updateImageCard(image);

      try {
        var arrayBuffer = await readFileAsArrayBuffer(image.file);
        var uint8Array = new Uint8Array(arrayBuffer);

        // TinyPNG WASM 是同步阻塞的——压缩期间 JS 定时器不触发
        // 但 CSS animation（脉冲动画）仍能运行，提供视觉反馈
        var compressedData = await window.MeeWoo.Services.ImageCompressionService.compressImage(uint8Array, quality);

        image.status = 'completed';
        image.progress = 100;
        image.compressedData = compressedData;
        image.compressedSize = compressedData.length;
        image.compressionRate = Math.round((1 - compressedData.length / image.size) * 100);
        image.compressedQuality = quality;

        app.totalSizeAfter += compressedData.length;
      } catch (error) {
        console.error('压缩失败:', image.name, error);
        image.status = 'failed';
        image.compressedData = null;
      }

      app.compressedCount++;
      updateImageCard(image);
      updateOverallProgress(targetTotal);

    }

    app.isCompressing = false;
    // 恢复卡片交互
    document.getElementById('imageListSection').classList.remove('is-compressing');

    els.compressBtn.style.display = 'inline-flex';
    els.cancelBtn.style.display = 'none';

    showDownloadSection();
  }

  function cancelCompression() {
    app.cancelled = true;
    showToast('正在取消...');
  }

  function updateOverallProgress(total) {
    total = total || app.images.length;
    var pct = total > 0 ? Math.round((app.compressedCount / total) * 100) : 0;
    els.overallProgressFill.style.width = pct + '%';
    els.overallProgressStats.textContent = app.compressedCount + ' / ' + total + ' 张';
  }

  function showDownloadSection() {
    els.downloadSection.style.display = 'block';

    var completed = app.images.filter(function (img) { return img.status === 'completed'; }).length;
    var failed = app.images.filter(function (img) { return img.status === 'failed'; }).length;
    var totalRate = app.totalSizeBefore > 0
      ? Math.round((1 - app.totalSizeAfter / app.totalSizeBefore) * 100)
      : 0;

    els.downloadStats.innerHTML =
      '<p>压缩完成！成功 ' + completed + ' 张' + (failed > 0 ? '，失败 ' + failed + ' 张' : '') + '</p>' +
      '<p>压缩前总大小: ' + formatSize(app.totalSizeBefore) + '</p>' +
      '<p>压缩后总大小: ' + formatSize(app.totalSizeAfter) + '</p>' +
      '<p>总压缩率: ' + totalRate + '%</p>';

    updateDownloadButton();
  }

  // ==================== 对比预览弹窗 ====================

  function openCompareModal(imageId) {
    var image = getImageById(imageId);
    if (!image || !image.dataUrl) return;

    app.compareImageId = imageId;
    app.compareCurrentQuality = null;

    els.compareModalTitle.textContent = image.name;

    // 重置右侧标签为默认文案（未选中任何压缩质量时）
    els.compareLabelRight.textContent = '压缩后';

    // 重置状态——只清除 tab 按钮，保留 #comparePopover 浮层 DOM
    els.comparePlaceholder.style.display = 'block';
    els.compareTabs.style.display = 'none';
    var oldTabs = els.compareTabs.querySelectorAll('.compare-tab');
    for (var oi = 0; oi < oldTabs.length; oi++) {
      oldTabs[oi].remove();
    }
    els.compareConfirm.style.display = 'none';
    hideComparePopover();

    // 重置分割线到中间
    els.compareDivider.style.left = '50%';
    els.compareImageLeft.style.clipPath = 'inset(0 calc(50% + 1px) 0 0)';

    // 加载左侧原图到内层容器
    var leftImg = els.compareInnerLeft.querySelector('img');
    if (!leftImg) {
      leftImg = document.createElement('img');
      els.compareInnerLeft.appendChild(leftImg);
    }
    leftImg.src = image.dataUrl;

    // 右侧到内层容器
    var rightImg = els.compareInnerRight.querySelector('img');
    if (!rightImg) {
      rightImg = document.createElement('img');
      els.compareInnerRight.appendChild(rightImg);
    }

    // 重置缩放状态
    resetCompareZoom();

    if (image.compressedData && image.compressedQuality !== null) {
      // 将批量压缩结果写入试压缓存（不覆盖已有同质量试压结果）
      if (!image.trialResults[image.compressedQuality]) {
        image.trialResults[image.compressedQuality] = image.compressedData;
      }
      app.compareCurrentQuality = image.compressedQuality;
    } else {
      rightImg.src = '';
    }

    // 构建已有试压结果的 tab
    buildCompareTabs(image);

    // 保存并锁定背景滚动
    app._savedBodyOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    els.compareModalOverlay.style.display = 'flex';
  }

  function closeCompareModal() {
    els.compareModalOverlay.style.display = 'none';
    // 恢复背景滚动
    document.body.style.overflow = app._savedBodyOverflow || '';
    app.compareImageId = null;
  }

  function buildCompareTabs(image) {
    // 只清除 tab 按钮，保留浮层 DOM
    var existingTabs = els.compareTabs.querySelectorAll('.compare-tab');
    for (var ti = 0; ti < existingTabs.length; ti++) {
      existingTabs[ti].remove();
    }
    var qualities = Object.keys(image.trialResults).map(Number).sort(function (a, b) { return a - b; });

    // 渲染已有压缩结果 tab（4 行：质量标签 / 质量值 / 压缩前 / 压缩后）
    qualities.forEach(function (q) {
      var qualityLabel = getQualityLabel(q);
      var isPreset = (q === 40 || q === 70 || q === 90);
      // 预设值显示小字数值后缀，如"极致（40）"；自定义值保持原样加粗大字
      var qualityValueHtml = isPreset
        ? '<span class="compare-tab-quality-value">' + qualityLabel + '</span><span class="compare-tab-quality-value-num">（' + q + '）</span>'
        : '<span class="compare-tab-quality-value">' + qualityLabel + '</span>';
      var tab = document.createElement('button');
      tab.className = 'compare-tab';
      tab.innerHTML =
        '<span class="compare-tab-quality-label">压缩质量：</span>' +
        qualityValueHtml +
        '<span class="compare-tab-size-before">' + formatSize(image.size) + '</span>' +
        '<span class="compare-tab-size-after">→ ' + formatSize(image.trialResults[q].length) + '</span>';
      tab.addEventListener('click', function () {
        selectCompareTab(image, q);
      });
      els.compareTabs.appendChild(tab);
    });

    // + 号 tab：添加压缩图片——上 + 下文字
    var addTab = document.createElement('button');
    addTab.className = 'compare-tab compare-tab--add';
    addTab.title = '添加压缩图片进行对比';
    addTab.innerHTML = '<span class="compare-tab-add-icon">+</span><span class="compare-tab-add-label">添加对比</span>';
    addTab.addEventListener('click', function (e) {
      e.stopPropagation();
      showComparePopover(addTab);
    });
    els.compareTabs.appendChild(addTab);

    els.compareTabs.style.display = 'flex';

    if (qualities.length === 0) return;

    // 默认选中第一个
    if (!app.compareCurrentQuality || !image.trialResults[app.compareCurrentQuality]) {
      app.compareCurrentQuality = qualities[0];
    }
    updateCompareTabHighlight(image);
    showCompareResult(image, app.compareCurrentQuality);
  }

  function selectCompareTab(image, quality) {
    app.compareCurrentQuality = quality;
    updateCompareTabHighlight(image);
    showCompareResult(image, quality);
  }

  function updateCompareTabHighlight(image) {
    var tabs = els.compareTabs.querySelectorAll('.compare-tab:not(.compare-tab--add)');
    tabs.forEach(function (tab, idx) {
      var qualities = Object.keys(image.trialResults).map(Number).sort(function (a, b) { return a - b; });
      tab.classList.toggle('active', qualities[idx] === app.compareCurrentQuality);
    });
  }

  /**
   * 显示浮层气泡
   */
  function showComparePopover(anchorTab) {
    // 同步当前质量到浮层输入框
    els.comparePopoverQualityInput.value = app.currentQuality;
    var popoverPresetBtns = els.comparePopover.querySelectorAll('.preset-btn[data-quality]');
    popoverPresetBtns.forEach(function (btn) {
      btn.classList.toggle('active', parseInt(btn.dataset.quality) === app.currentQuality);
    });

    // 定位浮层在 + 号 tab 上方
    var tabRect = anchorTab.getBoundingClientRect();
    var tabsRect = els.compareTabs.getBoundingClientRect();
    els.comparePopover.style.left = (tabRect.left + tabRect.width / 2 - tabsRect.left) + 'px';
    els.comparePopover.style.display = 'block';
  }

  function hideComparePopover() {
    els.comparePopover.style.display = 'none';
  }

  function showCompareResult(image, quality) {
    var data = image.trialResults[quality];
    if (!data) return;

    var blob = new Blob([data], { type: 'image/png' });
    var url = URL.createObjectURL(blob);

    var rightImg = els.compareInnerRight.querySelector('img');
    if (rightImg) {
      // 回收旧 blob URL，避免内存泄漏
      if (rightImg.src && rightImg.src.startsWith('blob:')) {
        URL.revokeObjectURL(rightImg.src);
      }
      rightImg.src = url;
    }

    els.comparePlaceholder.style.display = 'none';
    els.compareConfirm.style.display = 'flex';
    // 动态更新右侧标签：显示"压缩后（压缩质量：推荐）"格式
    els.compareLabelRight.textContent = '压缩后（压缩质量：' + getQualityLabel(quality) + '）';
  }

  async function runTrialCompress() {
    var image = getImageById(app.compareImageId);
    if (!image) return;

    // 从浮层读取压缩率
    var modalQuality = parseInt(els.comparePopoverQualityInput.value) || getCurrentQuality();
    modalQuality = Math.max(10, Math.min(100, modalQuality));

    // 避免重复压缩同一质量
    if (image.trialResults[modalQuality]) {
      app.compareCurrentQuality = modalQuality;
      buildCompareTabs(image);
      selectCompareTab(image, modalQuality);
      hideComparePopover();
      return;
    }

    // 达到缓存上限
    if (Object.keys(image.trialResults).length >= 4) {
      showToast('最多支持 4 个压缩率对比，请先确认或关闭弹窗');
      return;
    }

    els.comparePopoverCompressBtn.disabled = true;
    els.comparePopoverCompressBtn.textContent = '压缩中...';

    try {
      var arrayBuffer = await readFileAsArrayBuffer(image.file);
      var uint8Array = new Uint8Array(arrayBuffer);
      var compressedData = await window.MeeWoo.Services.ImageCompressionService.compressImage(uint8Array, modalQuality);

      image.trialResults[modalQuality] = compressedData;
      app.compareCurrentQuality = modalQuality;

      hideComparePopover();
      buildCompareTabs(image);
      showCompareResult(image, modalQuality);
    } catch (error) {
      console.error('试压失败:', error);
      showToast('试压失败');
    }

    els.comparePopoverCompressBtn.disabled = false;
    els.comparePopoverCompressBtn.textContent = '添加压缩图片';
  }

  function confirmCompareVersion() {
    var image = getImageById(app.compareImageId);
    if (!image || app.compareCurrentQuality === null) return;

    var quality = app.compareCurrentQuality;
    var data = image.trialResults[quality];
    if (!data) return;

    // 将试压结果写入图片数据
    // 更新压缩后总大小：先减旧值再加新值，避免双重累加
    if (image.compressedSize > 0) {
      app.totalSizeAfter -= image.compressedSize;
    }

    image.compressedData = data;
    image.compressedSize = data.length;
    image.compressionRate = Math.round((1 - data.length / image.size) * 100);
    image.compressedQuality = quality;
    image.confirmedQuality = quality;
    image.status = 'completed';

    app.totalSizeAfter += data.length;
    if (app.compressedCount < app.images.length) app.compressedCount++;

    updateImageCard(image);
    updateOverallProgress();
    showDownloadSection();
    closeCompareModal();

    showToast('已确认压缩质量: ' + getQualityLabel(quality) + ' (' + formatSize(data.length) + ')');
  }

  // ==================== 分割线拖拽 ====================

  var isDragging = false;

  function startDrag(e) {
    isDragging = true;
    e.preventDefault();
  }

  function onDrag(e) {
    if (!isDragging) return;
    var rect = els.compareViewport.getBoundingClientRect();
    var x = e.clientX - rect.left;
    var pct = Math.max(5, Math.min(95, (x / rect.width) * 100));

    els.compareDivider.style.left = pct + '%';
    els.compareImageLeft.style.clipPath = 'inset(0 ' + (100 - pct) + '% 0 0)';
  }

  function stopDrag() {
    isDragging = false;
  }

  // ==================== 图片缩放与平移 ====================

  var compareZoom = 1;
  var compareOffsetX = 0;
  var compareOffsetY = 0;
  var isPanning = false;
  var panStartX = 0;
  var panStartY = 0;
  var panStartOffsetX = 0;
  var panStartOffsetY = 0;

  function resetCompareZoom() {
    compareZoom = 1;
    compareOffsetX = 0;
    compareOffsetY = 0;
    applyCompareTransform();
    els.compareZoomLabel.textContent = '100%';
  }

  function applyCompareTransform() {
    var t = 'translate(' + compareOffsetX + 'px, ' + compareOffsetY + 'px) scale(' + compareZoom + ')';
    els.compareInnerLeft.style.transform = t;
    els.compareInnerRight.style.transform = t;
  }

  function updateZoomLabel() {
    els.compareZoomLabel.textContent = Math.round(compareZoom * 100) + '%';
  }

  /**
   * 滚轮缩放——以鼠标位置为中心
   */
  function onCompareWheel(e) {
    e.preventDefault();
    var rect = els.compareViewport.getBoundingClientRect();
    var mx = e.clientX - rect.left;
    var my = e.clientY - rect.top;

    var delta = -Math.sign(e.deltaY) * 0.04; // 步进 4%
    var newZoom = compareZoom + delta;
    newZoom = Math.max(0.5, Math.min(5, newZoom)); // 限制 50%~500%

    if (newZoom === compareZoom) return;

    // 以鼠标位置为中心缩放：调整偏移使鼠标下的点不动
    var ratio = newZoom / compareZoom;
    compareOffsetX = mx - (mx - compareOffsetX) * ratio;
    compareOffsetY = my - (my - compareOffsetY) * ratio;
    compareZoom = newZoom;

    applyCompareTransform();
    updateZoomLabel();
  }

  /**
   * 鼠标拖拽平移
   */
  function onComparePanStart(e) {
    // 不拦截分割线拖拽
    if (e.target.closest('#compareDivider')) return;
    isPanning = true;
    panStartX = e.clientX;
    panStartY = e.clientY;
    panStartOffsetX = compareOffsetX;
    panStartOffsetY = compareOffsetY;
    els.compareViewport.style.cursor = 'grabbing';
    e.preventDefault();
  }

  function onComparePanMove(e) {
    if (!isPanning) return;
    compareOffsetX = panStartOffsetX + (e.clientX - panStartX);
    compareOffsetY = panStartOffsetY + (e.clientY - panStartY);
    applyCompareTransform();
  }

  function onComparePanEnd() {
    isPanning = false;
    els.compareViewport.style.cursor = 'grab';
  }

  // ==================== 下载 ====================

  /**
   * 动态更新下载按钮文字和状态
   */
  function updateDownloadButton() {
    var btn = els.downloadSelectedBtn;
    if (!btn) return;

    var selected = app.images.filter(function (img) { return img.selected; });
    var selectedCompressed = selected.filter(function (img) { return img.compressedData; });
    var allCompressed = app.images.filter(function (img) { return img.compressedData; });

    if (selected.length === 0) {
      // 没选中任何图：下载全部已压缩的
      if (allCompressed.length > 0) {
        btn.disabled = false;
        btn.textContent = '下载所有已压缩图片（' + allCompressed.length + '）';
      } else {
        btn.disabled = true;
        btn.textContent = '下载已压缩图片（无）';
      }
    } else if (selectedCompressed.length === 0) {
      // 选中了但都没压缩
      btn.disabled = true;
      btn.textContent = '下载已压缩图片（无）';
    } else {
      // 选中的有压缩过的
      btn.disabled = false;
      btn.textContent = '下载已压缩图片（' + selectedCompressed.length + '）';
    }
  }

  function downloadSelected() {
    var btn = els.downloadSelectedBtn;

    if (btn.disabled) {
      showToast('选中的图片尚未压缩，请先压缩后再下载');
      return;
    }

    var selected = app.images.filter(function (img) { return img.selected; });
    var hasSelection = selected.length > 0;

    // 没选中 → 下载全部已压缩；有选中 → 下载选中中已压缩的
    var targets = hasSelection
      ? selected.filter(function (img) { return img.compressedData; })
      : app.images.filter(function (img) { return img.compressedData; });

    if (targets.length === 0) {
      showToast('没有可下载的已压缩图片');
      return;
    }

    if (typeof JSZip === 'undefined') {
      showToast('JSZip 库未加载，无法打包下载');
      return;
    }

    var zip = new JSZip();
    targets.forEach(function (img) {
      var qualityLabel = img.compressedQuality !== null
        ? '_' + getQualityLabel(img.compressedQuality)
        : '';
      var name = img.name.replace(/\.png$/i, '') + qualityLabel + '_compressed.png';
      zip.file(name, img.compressedData);
    });

    zip.generateAsync({ type: 'blob' }).then(function (content) {
      var url = URL.createObjectURL(content);
      var a = document.createElement('a');
      a.href = url;
      a.download = 'compressed_pngs_' + new Date().getTime() + '.zip';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      showToast('下载完成（' + targets.length + ' 张）');
    }).catch(function (error) {
      console.error('打包下载失败:', error);
      showToast('打包下载失败');
    });
  }

  // ==================== 事件绑定 ====================

  function bindEvents() {
    // 文件输入：点击选择
    els.selectFilesBtn.addEventListener('click', function (e) {
      e.stopPropagation();
      els.fileInput.click();
    });

    els.fileInput.addEventListener('change', function () {
      if (els.fileInput.files.length > 0) {
        processFiles(els.fileInput.files);
        els.fileInput.value = '';
      }
    });

    // 拖拽
    els.dragArea.addEventListener('dragenter', function (e) { e.preventDefault(); els.dragArea.classList.add('drag-over'); });
    els.dragArea.addEventListener('dragover', function (e) { e.preventDefault(); els.dragArea.classList.add('drag-over'); });
    els.dragArea.addEventListener('dragleave', function (e) {
      if (e.currentTarget === e.target) els.dragArea.classList.remove('drag-over');
    });
    els.dragArea.addEventListener('drop', function (e) {
      e.preventDefault();
      els.dragArea.classList.remove('drag-over');
      processFiles(e.dataTransfer.files);
    });

    // 工具栏按钮
    els.compressBtn.addEventListener('click', startCompression);
    els.cancelBtn.addEventListener('click', cancelCompression);
    els.clearBtn.addEventListener('click', clearAllImages);

    // 压缩级别
    els.compressionQuality.addEventListener('input', function () {
      var val = parseInt(els.compressionQuality.value);
      els.compressionValue.textContent = val;
      app.currentQuality = val;
      app.lastCustomQuality = val; // 记住用户手动调整的最后一个值
      // 取消所有预设高亮，高亮自定义
      var presetBtns = document.querySelectorAll('.toolbar-quality .preset-btn[data-quality]');
      presetBtns.forEach(function (btn) { btn.classList.remove('active'); });
      if (els.presetCustom) els.presetCustom.classList.add('active');
    });

    // 预设档位点击
    document.querySelector('.toolbar-quality .quality-presets').addEventListener('click', function (e) {
      var btn = e.target.closest('button');
      if (!btn) return;
      // 自定义按钮——恢复到上次调整的数值
      if (btn.dataset.preset === 'custom') {
        var val = app.lastCustomQuality;
        els.compressionQuality.value = val;
        els.compressionValue.textContent = val;
        app.currentQuality = val;
        // 取消所有预设高亮，高亮自定义
        var presetBtns = document.querySelectorAll('.toolbar-quality .preset-btn[data-quality]');
        presetBtns.forEach(function (b) { b.classList.remove('active'); });
        if (els.presetCustom) els.presetCustom.classList.add('active');
        return;
      }
      var quality = parseInt(btn.dataset.quality);
      if (!isNaN(quality)) setQualityPreset(quality);
    });

    // 主题切换
    els.themeToggle.addEventListener('click', toggleTheme);

    // 弹窗关闭
    els.compareModalClose.addEventListener('click', closeCompareModal);

    // 弹窗对比压缩（浮层）
    els.comparePopoverCompressBtn.addEventListener('click', runTrialCompress);
    els.compareConfirmBtn.addEventListener('click', confirmCompareVersion);

    // 浮层内预设按钮
    els.comparePopover.addEventListener('click', function (e) {
      var btn = e.target.closest('button');
      if (!btn || !btn.dataset.quality) return;
      var quality = parseInt(btn.dataset.quality);
      if (!isNaN(quality)) {
        els.comparePopoverQualityInput.value = quality;
        var btns = els.comparePopover.querySelectorAll('.preset-btn[data-quality]');
        btns.forEach(function (b) { b.classList.remove('active'); });
        btn.classList.add('active');
      }
    });

    // 点击弹窗其他区域关闭浮层
    els.compareModal.addEventListener('click', function (e) {
      if (!e.target.closest('#comparePopover') && !e.target.closest('.compare-tab--add')) {
        hideComparePopover();
      }
    });

    // 分割线拖拽
    els.compareDivider.addEventListener('mousedown', startDrag);
    document.addEventListener('mousemove', onDrag);
    document.addEventListener('mouseup', stopDrag);

    // 图片缩放与平移
    els.compareViewport.addEventListener('wheel', onCompareWheel, { passive: false });
    els.compareViewport.addEventListener('mousedown', onComparePanStart);
    document.addEventListener('mousemove', onComparePanMove);
    document.addEventListener('mouseup', onComparePanEnd);

    // 缩放百分比点击重置
    els.compareZoomLabel.addEventListener('click', resetCompareZoom);

    // 下载
    els.downloadSelectedBtn.addEventListener('click', downloadSelected);
  }

  // ==================== 初始化 ====================

  async function init() {
    cacheElements();

    // 读取保存的主题
    try {
      var savedTheme = localStorage.getItem('theme');
      if (savedTheme) app.theme = savedTheme;
    } catch (e) { /* ignore */ }
    setTheme(app.theme);

    // 绑定事件
    bindEvents();

    // 初始化压缩服务
    try {
      await window.MeeWoo.Services.ImageCompressionService.init();
      console.log('图像压缩服务初始化成功');
    } catch (error) {
      console.error('图像压缩服务初始化失败:', error);
      showToast('压缩服务初始化失败，部分功能可能不可用');
    }
  }

  document.addEventListener('DOMContentLoaded', init);
})();
