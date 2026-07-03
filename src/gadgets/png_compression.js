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
    compressedCount: 0,
    totalSizeBefore: 0,
    totalSizeAfter: 0,
    currentQuality: 70,
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
    els.qualityCustomPanel = document.getElementById('qualityCustomPanel');
    els.presetCustomBtn = document.getElementById('presetCustomBtn');
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
    els.compareCompressBtn = document.getElementById('compareCompressBtn');
    els.compareQualityInput = document.getElementById('compareQualityInput');
    els.compareTabs = document.getElementById('compareTabs');
    els.compareConfirm = document.getElementById('compareConfirm');
    els.compareConfirmBtn = document.getElementById('compareConfirmBtn');
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

  function addImage(file) {
    var image = {
      id: Date.now() + '_' + Math.random().toString(36).substr(2, 9),
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
      checkResolutionLarge(image);
    });

    readFileAsDataURL(file).then(function (dataUrl) {
      image.dataUrl = dataUrl;
      updateImageCardThumb(image);
    });

    renderImageCard(image);
  }

  function checkResolutionLarge(image) {
    if (image.width > 3000 || image.height > 3000) {
      showToast('"' + image.name + '" 分辨率较大（' + image.width + '×' + image.height + '），压缩可能较慢');
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
      confirmedEl.textContent = '已确认版本: ' + image.confirmedQuality + ' 质量';
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

    // 更新预设按钮激活状态
    var presetBtns = document.querySelectorAll('.toolbar-quality .preset-btn[data-quality]');
    presetBtns.forEach(function (btn) {
      btn.classList.toggle('active', parseInt(btn.dataset.quality) === quality);
    });

    // 收起自定义面板，取消自定义按钮高亮
    els.qualityCustomPanel.style.display = 'none';
    els.presetCustomBtn.classList.remove('active');

    // 同时更新弹窗内的预设按钮
    var modalPresetBtns = document.querySelectorAll('.compare-quality-picker .preset-btn[data-quality]');
    modalPresetBtns.forEach(function (btn) {
      btn.classList.toggle('active', parseInt(btn.dataset.quality) === quality);
    });
    els.compareQualityInput.value = quality;
  }

  function toggleCustomPanel() {
    var isVisible = els.qualityCustomPanel.style.display === 'flex';
    if (isVisible) return; // 已展开，不取消——点击其他预设才切换
    els.qualityCustomPanel.style.display = 'flex';
    els.presetCustomBtn.classList.add('active');
    // 取消其他预设高亮
    var presetBtns = document.querySelectorAll('.toolbar-quality .preset-btn[data-quality]');
    presetBtns.forEach(function (btn) { btn.classList.remove('active'); });
  }

  // ==================== 压缩流程 ====================

  function getQualityLabel(quality) {
    if (quality <= 40) return '极致压缩';
    if (quality <= 70) return '推荐';
    if (quality <= 90) return '高质量';
    return '自定义';
  }

  async function startCompression() {
    if (app.isCompressing) return;
    if (app.images.length === 0) {
      showToast('请先添加 PNG 图片');
      return;
    }

    app.isCompressing = true;
    app.cancelled = false;
    app.compressedCount = 0;
    app.totalSizeAfter = 0;

    // UI 状态
    els.compressBtn.style.display = 'none';
    els.cancelBtn.style.display = 'inline-flex';
    els.overallProgress.style.display = 'block';
    els.downloadSection.style.display = 'none';

    var quality = getCurrentQuality();

    // 有勾选图片时只压缩勾选的，否则压缩全部
    var selectedImages = app.images.filter(function (img) { return img.selected; });
    var targetImages = selectedImages.length > 0 ? selectedImages : app.images;
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
    els.comparePlaceholder.style.display = 'block';
    els.compareTabs.style.display = 'none';
    els.compareTabs.innerHTML = '';
    els.compareConfirm.style.display = 'none';

    // 重置分割线到中间
    els.compareDivider.style.left = '50%';
    els.compareImageLeft.style.clipPath = 'inset(0 calc(50% + 1px) 0 0)';

    // 加载左侧原图
    var leftImg = els.compareImageLeft.querySelector('img');
    if (!leftImg) {
      leftImg = document.createElement('img');
      els.compareImageLeft.appendChild(leftImg);
    }
    leftImg.src = image.dataUrl;

    // 清空右侧
    var rightImg = els.compareImageRight.querySelector('img');
    if (!rightImg) {
      rightImg = document.createElement('img');
      els.compareImageRight.appendChild(rightImg);
    }
    rightImg.src = '';

    // 同步弹窗内预设按钮
    var modalPresetBtns = document.querySelectorAll('.compare-quality-picker .preset-btn[data-quality]');
    modalPresetBtns.forEach(function (btn) {
      btn.classList.toggle('active', parseInt(btn.dataset.quality) === app.currentQuality);
    });
    els.compareQualityInput.value = app.currentQuality;

    // 构建已有试压结果的 tab
    buildCompareTabs(image);

    els.compareModalOverlay.style.display = 'flex';
    document.body.style.overflow = 'hidden';
  }

  function closeCompareModal() {
    els.compareModalOverlay.style.display = 'none';
    document.body.style.overflow = '';
    app.compareImageId = null;
  }

  function buildCompareTabs(image) {
    els.compareTabs.innerHTML = '';
    var qualities = Object.keys(image.trialResults).map(Number).sort(function (a, b) { return a - b; });
    if (qualities.length === 0) return;

    els.compareTabs.style.display = 'flex';

    qualities.forEach(function (q) {
      var tab = document.createElement('button');
      tab.className = 'compare-tab';
      tab.innerHTML =
        '<span>' + getQualityLabel(q) + '</span>' +
        '<span class="compare-tab-size">' + formatSize(image.trialResults[q].length) + '</span>';
      tab.addEventListener('click', function () {
        selectCompareTab(image, q);
      });
      els.compareTabs.appendChild(tab);
    });

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
    var tabs = els.compareTabs.querySelectorAll('.compare-tab');
    tabs.forEach(function (tab, idx) {
      var qualities = Object.keys(image.trialResults).map(Number).sort(function (a, b) { return a - b; });
      tab.classList.toggle('active', qualities[idx] === app.compareCurrentQuality);
    });
  }

  function showCompareResult(image, quality) {
    var data = image.trialResults[quality];
    if (!data) return;

    var blob = new Blob([data], { type: 'image/png' });
    var url = URL.createObjectURL(blob);

    var rightImg = els.compareImageRight.querySelector('img');
    if (rightImg) {
      rightImg.src = url;
    }

    els.comparePlaceholder.style.display = 'none';
    els.compareConfirm.style.display = 'flex';
  }

  async function runTrialCompress() {
    var image = getImageById(app.compareImageId);
    if (!image) return;

    // 获取弹窗内的压缩率
    var modalQuality = parseInt(els.compareQualityInput.value) || getCurrentQuality();

    // 边界检查
    modalQuality = Math.max(10, Math.min(100, modalQuality));

    // 避免重复压缩同一质量
    if (image.trialResults[modalQuality]) {
      app.compareCurrentQuality = modalQuality;
      buildCompareTabs(image);
      selectCompareTab(image, modalQuality);
      return;
    }

    // 达到缓存上限
    if (Object.keys(image.trialResults).length >= 4) {
      showToast('最多支持 4 个压缩率对比，请先确认或关闭弹窗');
      return;
    }

    els.compareCompressBtn.disabled = true;
    els.compareCompressBtn.textContent = '压缩中...';

    try {
      var arrayBuffer = await readFileAsArrayBuffer(image.file);
      var uint8Array = new Uint8Array(arrayBuffer);
      var compressedData = await window.MeeWoo.Services.ImageCompressionService.compressImage(uint8Array, modalQuality);

      image.trialResults[modalQuality] = compressedData;
      app.compareCurrentQuality = modalQuality;

      buildCompareTabs(image);
      showCompareResult(image, modalQuality);
    } catch (error) {
      console.error('试压失败:', error);
      showToast('试压失败');
    }

    els.compareCompressBtn.disabled = false;
    els.compareCompressBtn.textContent = '对比压缩';
  }

  function confirmCompareVersion() {
    var image = getImageById(app.compareImageId);
    if (!image || app.compareCurrentQuality === null) return;

    var quality = app.compareCurrentQuality;
    var data = image.trialResults[quality];
    if (!data) return;

    // 将试压结果写入图片数据
    image.compressedData = data;
    image.compressedSize = data.length;
    image.compressionRate = Math.round((1 - data.length / image.size) * 100);
    image.compressedQuality = quality;
    image.confirmedQuality = quality;
    image.status = 'completed';

    // 更新压缩后总大小
    app.totalSizeAfter += data.length;
    if (app.compressedCount < app.images.length) app.compressedCount++;

    updateImageCard(image);
    updateOverallProgress();
    showDownloadSection();
    closeCompareModal();

    showToast('已确认版本: ' + getQualityLabel(quality) + ' (' + formatSize(data.length) + ')');
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
      // 取消所有预设高亮
      var presetBtns = document.querySelectorAll('.toolbar-quality .preset-btn[data-quality]');
      presetBtns.forEach(function (btn) { btn.classList.remove('active'); });
    });

    // 预设档位点击
    document.querySelector('.toolbar-quality .quality-presets').addEventListener('click', function (e) {
      var btn = e.target.closest('button');
      if (!btn) return;
      if (btn.id === 'presetCustomBtn') {
        toggleCustomPanel();
        return;
      }
      var quality = parseInt(btn.dataset.quality);
      if (!isNaN(quality)) setQualityPreset(quality);
    });

    // 主题切换
    els.themeToggle.addEventListener('click', toggleTheme);

    // 弹窗关闭
    els.compareModalClose.addEventListener('click', closeCompareModal);

    // 弹窗对比压缩
    els.compareCompressBtn.addEventListener('click', runTrialCompress);
    els.compareConfirmBtn.addEventListener('click', confirmCompareVersion);

    // 弹窗内预设按钮
    document.querySelector('.compare-quality-picker').addEventListener('click', function (e) {
      var btn = e.target.closest('button');
      if (!btn) return;
      var quality = parseInt(btn.dataset.quality);
      if (!isNaN(quality)) {
        els.compareQualityInput.value = quality;
        // 高亮当前预设
        var btns = document.querySelectorAll('.compare-quality-picker .preset-btn[data-quality]');
        btns.forEach(function (b) { b.classList.remove('active'); });
        btn.classList.add('active');
      }
    });

    // 分割线拖拽
    els.compareDivider.addEventListener('mousedown', startDrag);
    document.addEventListener('mousemove', onDrag);
    document.addEventListener('mouseup', stopDrag);

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
