(function () {
  var ASSET_BASE_URL = "https://blog-1258489735.cos.ap-chengdu.myqcloud.com/other/game-huodong/";
  var STORAGE_KEY = "meewoo.gameHuodong.state.v1";
  var PLACEMENT_STORAGE_KEY = "meewoo.gameHuodong.placements.v2";
  var DB_NAME = "meewoo-game-huodong";
  var DB_STORE = "files";
  var AVATAR_KEY = "avatar";
  var MIN_FONT_SIZE = 18;
  var MAX_FONT_SIZE = 56;

  var GROUPS = [
    { id: "60m", label: "60m", banners: ["gala", "litchat", "Rostar"] },
    { id: "100m", label: "100m", banners: ["gala", "litchat", "Rostar"] },
    { id: "200m", label: "200m", banners: ["gala", "litchat", "Rostar"] },
    { id: "one", label: "one", banners: [] }
  ];

  var state = {
    group: "60m",
    language: "en",
    nickname: "",
    message: "",
    messageFontSize: 32
  };

  var imageCache = {};
  var avatarImage = null;
  var avatarBlob = null;
  var renderItems = [];
  var dbPromise = null;
  var customPlacements = loadCustomPlacements();
  var editState = {
    enabled: false,
    target: "largeAvatar",
    drag: null
  };

  var elements = {};

  document.addEventListener("DOMContentLoaded", init);

  function init() {
    elements.canvasGrid = document.getElementById("canvas-grid");
    elements.avatarInput = document.getElementById("avatar-input");
    elements.avatarUploadBtn = document.getElementById("avatar-upload-btn");
    elements.avatarClearBtn = document.getElementById("avatar-clear-btn");
    elements.nicknameInput = document.getElementById("nickname-input");
    elements.messageInput = document.getElementById("message-input");
    elements.fontDecreaseBtn = document.getElementById("font-decrease-btn");
    elements.fontIncreaseBtn = document.getElementById("font-increase-btn");
    elements.fontSizeValue = document.getElementById("font-size-value");
    elements.placementEditor = document.getElementById("placement-editor");
    elements.placementEditorToggle = document.getElementById("placement-editor-toggle");
    elements.editModeToggle = document.getElementById("edit-mode-toggle");
    elements.placementTarget = document.getElementById("placement-target");
    elements.placementSizeLabel = document.getElementById("placement-size-label");
    elements.placementSizeDecreaseBtn = document.getElementById("placement-size-decrease-btn");
    elements.placementSizeIncreaseBtn = document.getElementById("placement-size-increase-btn");
    elements.placementSizeValue = document.getElementById("placement-size-value");
    elements.placementResetBtn = document.getElementById("placement-reset-btn");
    elements.placementCopyBtn = document.getElementById("placement-copy-btn");
    elements.placementOutput = document.getElementById("placement-output");
    elements.downloadBtn = document.getElementById("download-btn");
    elements.statusMessage = document.getElementById("status-message");

    loadSavedState();
    bindEvents();
    applyStateToForm();

    loadAvatarFromDb()
      .catch(function (error) {
        console.warn("头像恢复失败:", error);
      })
      .finally(function () {
        renderCurrentGroup();
      });
  }

  function bindEvents() {
    document.querySelectorAll("[data-group]").forEach(function (button) {
      button.addEventListener("click", function () {
        state.group = button.getAttribute("data-group");
        saveState();
        syncTabs();
        renderCurrentGroup();
      });
    });

    document.querySelectorAll("[data-language]").forEach(function (button) {
      button.addEventListener("click", function () {
        state.language = button.getAttribute("data-language");
        saveState();
        syncTabs();
        renderCurrentGroup();
      });
    });

    elements.avatarUploadBtn.addEventListener("click", function () {
      elements.avatarInput.click();
    });

    elements.avatarInput.addEventListener("change", function (event) {
      var file = event.target.files && event.target.files[0];
      if (!file) return;
      if (!file.type || file.type.indexOf("image/") !== 0) {
        showStatus("请选择图片文件。", true);
        return;
      }
      setAvatarBlob(file);
      elements.avatarInput.value = "";
    });

    elements.avatarClearBtn.addEventListener("click", function () {
      avatarBlob = null;
      avatarImage = null;
      deleteAvatarFromDb()
        .catch(function (error) {
          console.warn("清空头像失败:", error);
        })
        .finally(function () {
          showStatus("头像已清空。");
          renderAll();
        });
    });

    elements.nicknameInput.addEventListener("input", function () {
      state.nickname = elements.nicknameInput.value;
      saveState();
      renderAll();
    });

    elements.messageInput.addEventListener("input", function () {
      state.message = elements.messageInput.value;
      saveState();
      renderAll();
    });

    elements.fontDecreaseBtn.addEventListener("click", function () {
      updateMessageFontSize(state.messageFontSize - 2);
    });

    elements.fontIncreaseBtn.addEventListener("click", function () {
      updateMessageFontSize(state.messageFontSize + 2);
    });

    elements.placementEditorToggle.addEventListener("click", togglePlacementEditor);

    elements.editModeToggle.addEventListener("change", function () {
      editState.enabled = elements.editModeToggle.checked;
      showStatus(editState.enabled ? "位置编辑已开启，拖动预览图中的选中对象。" : "位置编辑已关闭。");
      renderAll();
    });

    elements.placementTarget.addEventListener("change", function () {
      editState.target = elements.placementTarget.value;
      updatePlacementOutput();
      updatePlacementSizeControl();
      renderAll();
    });

    elements.placementSizeDecreaseBtn.addEventListener("click", function () {
      updatePlacementSize(-2);
    });

    elements.placementSizeIncreaseBtn.addEventListener("click", function () {
      updatePlacementSize(2);
    });

    elements.placementResetBtn.addEventListener("click", resetCurrentPlacement);
    elements.placementCopyBtn.addEventListener("click", copyPlacementOutput);

    window.addEventListener("mousemove", handlePlacementDragMove);
    window.addEventListener("mouseup", stopPlacementDrag);

    elements.downloadBtn.addEventListener("click", downloadCurrentZip);
  }

  function loadSavedState() {
    try {
      var saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
      state.group = isValidGroup(saved.group) ? saved.group : state.group;
      state.language = saved.language === "ar" ? "ar" : "en";
      state.nickname = typeof saved.nickname === "string" ? saved.nickname : "";
      state.message = typeof saved.message === "string" ? saved.message : "";
      state.messageFontSize = clampFontSize(Number(saved.messageFontSize) || state.messageFontSize);
    } catch (error) {
      console.warn("读取状态失败:", error);
    }
  }

  function saveState() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }

  function applyStateToForm() {
    elements.nicknameInput.value = state.nickname;
    elements.messageInput.value = state.message;
    elements.fontSizeValue.textContent = state.messageFontSize + "px";
    syncTabs();
  }

  function syncTabs() {
    document.querySelectorAll("[data-group]").forEach(function (button) {
      button.classList.toggle("is-active", button.getAttribute("data-group") === state.group);
    });
    document.querySelectorAll("[data-language]").forEach(function (button) {
      button.classList.toggle("is-active", button.getAttribute("data-language") === state.language);
    });
  }

  function updateMessageFontSize(value) {
    state.messageFontSize = clampFontSize(value);
    elements.fontSizeValue.textContent = state.messageFontSize + "px";
    saveState();
    renderAll();
  }

  function togglePlacementEditor() {
    var isCollapsed = elements.placementEditor.classList.toggle("is-collapsed");
    elements.placementEditorToggle.setAttribute("aria-expanded", String(!isCollapsed));
    elements.placementEditorToggle.querySelector(".editor-toggle-icon").textContent = isCollapsed ? "展开" : "收起";

    if (isCollapsed && editState.enabled) {
      editState.enabled = false;
      elements.editModeToggle.checked = false;
      renderAll();
    }
  }

  function clampFontSize(value) {
    return Math.max(MIN_FONT_SIZE, Math.min(MAX_FONT_SIZE, value));
  }

  function isValidGroup(groupId) {
    return GROUPS.some(function (group) {
      return group.id === groupId;
    });
  }

  function getCurrentGroup() {
    return GROUPS.find(function (group) {
      return group.id === state.group;
    }) || GROUPS[0];
  }

  function renderCurrentGroup() {
    var group = getCurrentGroup();
    renderItems = buildRenderItems(group);
    elements.canvasGrid.innerHTML = "";

    renderItems.forEach(function (item) {
      var card = document.createElement("article");
      card.className = "canvas-card" + (item.kind === "large" ? " canvas-card--large" : "");

      var title = document.createElement("div");
      title.className = "canvas-card__title";
      title.innerHTML = "<span>" + item.label + "</span><span class=\"canvas-card__size\">" + item.width + " x " + item.height + "</span>";

      var frame = document.createElement("div");
      frame.className = "canvas-frame";

      var canvas = document.createElement("canvas");
      canvas.width = item.width;
      canvas.height = item.height;
      item.canvas = canvas;
      item.context = canvas.getContext("2d");
      canvas.addEventListener("mousedown", function (event) {
        startPlacementDrag(event, item);
      });

      frame.appendChild(canvas);
      card.appendChild(title);
      card.appendChild(frame);
      elements.canvasGrid.appendChild(card);
    });
    updatePlacementOutput();
    updatePlacementSizeControl();

    Promise.all(renderItems.map(function (item) {
      return loadImage(item.src).then(function (image) {
        item.baseImage = image;
      });
    }))
      .then(function () {
        renderAll();
        showStatus("已加载 " + group.label + " / " + (state.language === "ar" ? "阿语" : "英语") + " 素材。");
      })
      .catch(function (error) {
        console.error(error);
        showStatus("素材加载失败，请检查图片路径或网络。", true);
      });
  }

  function buildRenderItems(group) {
    var suffix = state.language === "ar" ? "_ar" : "";
    var items = [
      {
        key: group.id + "-main",
        kind: "large",
        label: group.label + " 大图",
        filename: group.id + suffix + "_generated.png",
        src: ASSET_BASE_URL + group.id + suffix + "_compressed.png",
        width: 750,
        height: 1624,
        placement: getLargePlacement(group.id)
      }
    ];

    group.banners.forEach(function (banner) {
      items.push({
        key: group.id + "-" + banner,
        kind: "banner",
        label: group.label + " " + banner,
        filename: group.id + "_" + banner + suffix + "_generated.png",
        src: ASSET_BASE_URL + group.id + "_" + banner + suffix + "_compressed.png",
        width: banner === "gala" ? 686 : 690,
        height: banner === "gala" ? 160 : 200,
        placement: getBannerPlacement(banner)
      });
    });

    return items;
  }

  function getLargePlacement(groupId) {
    var key = getLargePlacementKey(groupId);
    return mergePlacement(getDefaultLargePlacement(groupId), customPlacements.large[key]);
  }

  function getDefaultLargePlacement(groupId) {
    if (groupId === "one") {
      return {
        avatar: { x: 380, y: 655, radius: 134 },
        nickname: { x: 375, y: 930, maxWidth: 320, fontSize: 30, color: "#ffffff" },
        message: { x: 104, y: 1158, width: 542, height: 244, color: "#ffffff" }
      };
    }

    return {
      avatar: { x: 374, y: 649, radius: 130 },
      nickname: { x: 373, y: 911, maxWidth: 350, fontSize: 34, color: "#ffffff" },
      message: { x: 88, y: 1131, width: 578, height: 208, color: "#6B3D0F" }
    };
  }

  function getBannerPlacement(banner) {
    return mergePlacement(getDefaultBannerPlacement(banner), customPlacements.banner[banner]);
  }

  function getDefaultBannerPlacement(banner) {
    if (banner === "gala") {
      return {
        avatar: { x: 213, y: 74, radius: 46 }
      };
    }

    if (banner === "litchat") {
      return {
        avatar: { x: 201, y: 97, radius: 50 }
      };
    }

    return {
      avatar: { x: 202, y: 97, radius: 48 }
    };
  }

  function getLargePlacementKey(groupId) {
    return groupId === "one" ? "one" : "common";
  }

  function mergePlacement(base, override) {
    var result = clonePlacement(base);
    if (!override) return result;

    ["avatar", "nickname", "message"].forEach(function (section) {
      if (override[section]) {
        result[section] = Object.assign({}, result[section] || {}, override[section]);
      }
    });
    return result;
  }

  function clonePlacement(placement) {
    return JSON.parse(JSON.stringify(placement));
  }

  function loadCustomPlacements() {
    try {
      var saved = JSON.parse(localStorage.getItem(PLACEMENT_STORAGE_KEY) || "{}");
      return {
        large: saved.large || {},
        banner: saved.banner || {}
      };
    } catch (error) {
      console.warn("读取坐标配置失败:", error);
      return { large: {}, banner: {} };
    }
  }

  function saveCustomPlacements() {
    localStorage.setItem(PLACEMENT_STORAGE_KEY, JSON.stringify(customPlacements));
  }

  function renderAll(showGuides) {
    var shouldShowGuides = typeof showGuides === "boolean" ? showGuides : editState.enabled;
    renderItems.forEach(function (item) {
      renderItem(item, shouldShowGuides);
    });
  }

  function renderItem(item, showGuides) {
    if (!item.context || !item.baseImage) return;

    var ctx = item.context;
    ctx.clearRect(0, 0, item.width, item.height);
    ctx.drawImage(item.baseImage, 0, 0, item.width, item.height);

    if (avatarImage && item.placement.avatar) {
      drawCircularCoverImage(ctx, avatarImage, item.placement.avatar);
    }

    if (item.kind === "large") {
      drawNickname(ctx, item.placement.nickname);
      drawMessage(ctx, item.placement.message);
    }

    if (showGuides) {
      drawPlacementGuide(ctx, item);
    }
  }

  function drawPlacementGuide(ctx, item) {
    var target = getEditablePlacement(item);
    if (!target) return;

    ctx.save();
    ctx.setLineDash([10, 6]);
    ctx.lineWidth = 4;
    ctx.strokeStyle = "#409eff";
    ctx.fillStyle = "rgba(64, 158, 255, 0.12)";

    if (target.type === "circle") {
      ctx.beginPath();
      ctx.arc(target.placement.x, target.placement.y, target.placement.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.beginPath();
      ctx.arc(target.placement.x, target.placement.y, 8, 0, Math.PI * 2);
      ctx.fillStyle = "#409eff";
      ctx.fill();
    } else if (target.type === "point") {
      ctx.beginPath();
      ctx.arc(target.placement.x, target.placement.y, 12, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    } else if (target.type === "rect") {
      ctx.fillRect(target.placement.x, target.placement.y, target.placement.width, target.placement.height);
      ctx.strokeRect(target.placement.x, target.placement.y, target.placement.width, target.placement.height);
    }

    ctx.restore();
  }

  function startPlacementDrag(event, item) {
    if (!editState.enabled) return;

    var target = getEditablePlacement(item);
    if (!target) return;

    event.preventDefault();
    var point = getCanvasPoint(event, item.canvas);
    editState.drag = {
      item: item,
      target: target,
      startX: point.x,
      startY: point.y,
      originalX: target.placement.x,
      originalY: target.placement.y
    };
  }

  function handlePlacementDragMove(event) {
    if (!editState.drag) return;

    var drag = editState.drag;
    var point = getCanvasPoint(event, drag.item.canvas);
    drag.target.placement.x = Math.round(drag.originalX + point.x - drag.startX);
    drag.target.placement.y = Math.round(drag.originalY + point.y - drag.startY);

    persistItemPlacement(drag.item);
    renderAll();
    updatePlacementOutput();
    updatePlacementSizeControl();
  }

  function stopPlacementDrag() {
    editState.drag = null;
  }

  function getCanvasPoint(event, canvas) {
    var rect = canvas.getBoundingClientRect();
    return {
      x: (event.clientX - rect.left) * (canvas.width / rect.width),
      y: (event.clientY - rect.top) * (canvas.height / rect.height)
    };
  }

  function getEditablePlacement(item) {
    if (editState.target === "largeAvatar" && item.kind === "large") {
      return { type: "circle", placement: item.placement.avatar };
    }
    if (editState.target === "largeNickname" && item.kind === "large") {
      return { type: "point", placement: item.placement.nickname };
    }
    if (editState.target === "largeMessage" && item.kind === "large") {
      return { type: "rect", placement: item.placement.message };
    }
    var bannerTarget = getBannerTargetName();
    if (bannerTarget && item.kind === "banner" && getBannerNameFromItem(item) === bannerTarget) {
      return { type: "circle", placement: item.placement.avatar };
    }
    return null;
  }

  function persistItemPlacement(item) {
    if (item.kind === "large") {
      customPlacements.large[getLargePlacementKey(state.group)] = clonePlacement(item.placement);
    } else if (item.kind === "banner") {
      var bannerName = getBannerNameFromItem(item);
      customPlacements.banner[bannerName] = clonePlacement(item.placement);
    }
    saveCustomPlacements();
  }

  function updatePlacementSize(delta) {
    var sizeConfig = getPlacementSizeConfig();
    if (!sizeConfig) return;

    var changed = false;
    getEditableItemsForCurrentTarget().forEach(function (item) {
      var target = getEditablePlacement(item);
      if (!target || typeof target.placement[sizeConfig.property] !== "number") return;

      target.placement[sizeConfig.property] = clampNumber(
        target.placement[sizeConfig.property] + delta,
        sizeConfig.min,
        sizeConfig.max
      );
      persistItemPlacement(item);
      changed = true;
    });

    if (changed) {
      renderAll();
      updatePlacementOutput();
      updatePlacementSizeControl();
    }
  }

  function getEditableItemsForCurrentTarget() {
    return renderItems.filter(function (item) {
      return Boolean(getEditablePlacement(item));
    });
  }

  function getPlacementSizeConfig() {
    if (editState.target === "largeAvatar" || getBannerTargetName()) {
      return { label: "半径", property: "radius", unit: "px", min: 20, max: 260 };
    }
    if (editState.target === "largeNickname") {
      return { label: "字号", property: "fontSize", unit: "px", min: 12, max: 72 };
    }
    return null;
  }

  function updatePlacementSizeControl() {
    var sizeConfig = getPlacementSizeConfig();
    var editableItems = getEditableItemsForCurrentTarget();
    var firstTarget = editableItems.length ? getEditablePlacement(editableItems[0]) : null;
    var hasSize = Boolean(sizeConfig && firstTarget && typeof firstTarget.placement[sizeConfig.property] === "number");

    elements.placementSizeLabel.textContent = sizeConfig ? sizeConfig.label : "尺寸";
    elements.placementSizeValue.textContent = hasSize ? firstTarget.placement[sizeConfig.property] + sizeConfig.unit : "--";
    elements.placementSizeDecreaseBtn.disabled = !hasSize;
    elements.placementSizeIncreaseBtn.disabled = !hasSize;
  }

  function clampNumber(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function resetCurrentPlacement() {
    if (editState.target.indexOf("large") === 0) {
      delete customPlacements.large[getLargePlacementKey(state.group)];
    } else {
      var bannerTarget = getBannerTargetName();
      if (bannerTarget) {
        delete customPlacements.banner[bannerTarget];
      }
    }

    saveCustomPlacements();
    renderCurrentGroup();
    showStatus("当前坐标已恢复默认。");
  }

  function updatePlacementOutput() {
    if (!elements.placementOutput) return;

    var payload = {
      group: state.group,
      language: state.language,
      editing: editState.target,
      largeKey: getLargePlacementKey(state.group),
      large: getLargePlacement(state.group),
      banners: {}
    };

    getCurrentGroup().banners.forEach(function (banner) {
      payload.banners[banner] = getBannerPlacement(banner);
    });

    elements.placementOutput.value = JSON.stringify(payload, null, 2);
  }

  function getBannerTargetName() {
    var prefix = "bannerAvatar:";
    return editState.target.indexOf(prefix) === 0 ? editState.target.slice(prefix.length) : "";
  }

  function getBannerNameFromItem(item) {
    return item.key.split("-").slice(1).join("-");
  }

  function copyPlacementOutput() {
    var value = elements.placementOutput.value;
    if (!value) return;

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(value)
        .then(function () {
          showStatus("坐标已复制。");
        })
        .catch(function () {
          fallbackCopyPlacementOutput(value);
        });
    } else {
      fallbackCopyPlacementOutput(value);
    }
  }

  function fallbackCopyPlacementOutput(value) {
    elements.placementOutput.focus();
    elements.placementOutput.select();
    document.execCommand("copy");
    showStatus("坐标已复制。");
  }

  function drawCircularCoverImage(ctx, image, avatar) {
    var size = avatar.radius * 2;
    var scale = Math.max(size / image.naturalWidth, size / image.naturalHeight);
    var drawWidth = image.naturalWidth * scale;
    var drawHeight = image.naturalHeight * scale;
    var dx = avatar.x - drawWidth / 2;
    var dy = avatar.y - drawHeight / 2;

    ctx.save();
    ctx.beginPath();
    ctx.arc(avatar.x, avatar.y, avatar.radius, 0, Math.PI * 2);
    ctx.clip();
    ctx.drawImage(image, dx, dy, drawWidth, drawHeight);
    ctx.restore();
  }

  function drawNickname(ctx, placement) {
    var text = state.nickname.trim();
    if (!text) return;

    ctx.save();
    ctx.direction = state.language === "ar" ? "rtl" : "ltr";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = placement.color;
    ctx.font = "700 " + placement.fontSize + "px 'Segoe UI', 'Noto Sans Arabic', sans-serif";
    ctx.shadowColor = "rgba(0, 0, 0, 0.28)";
    ctx.shadowBlur = 4;
    ctx.shadowOffsetY = 2;
    ctx.fillText(text, placement.x, placement.y, placement.maxWidth);
    ctx.restore();
  }

  function drawMessage(ctx, placement) {
    var text = state.message.trim();
    if (!text) return;

    var fontSize = state.messageFontSize;
    var lineHeight = Math.round(fontSize * 1.28);
    var lines = wrapText(ctx, text, placement.width, fontSize);
    var maxLines = Math.max(1, Math.floor(placement.height / lineHeight));
    var visibleLines = lines.slice(0, maxLines);
    var totalHeight = visibleLines.length * lineHeight;
    var startY = placement.y + (placement.height - totalHeight) / 2 + lineHeight / 2;

    ctx.save();
    ctx.beginPath();
    ctx.rect(placement.x, placement.y, placement.width, placement.height);
    ctx.clip();
    ctx.direction = state.language === "ar" ? "rtl" : "ltr";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = placement.color;
    ctx.font = "700 " + fontSize + "px 'Segoe UI', 'Noto Sans Arabic', sans-serif";
    ctx.shadowColor = placement.color === "#ffffff" ? "rgba(0, 0, 0, 0.32)" : "rgba(255, 255, 255, 0.45)";
    ctx.shadowBlur = 2;
    visibleLines.forEach(function (line, index) {
      ctx.fillText(line, placement.x + placement.width / 2, startY + index * lineHeight, placement.width);
    });
    ctx.restore();
  }

  function wrapText(ctx, text, maxWidth, fontSize) {
    ctx.save();
    ctx.font = "700 " + fontSize + "px 'Segoe UI', 'Noto Sans Arabic', sans-serif";

    var result = [];
    text.split(/\r?\n/).forEach(function (paragraph) {
      var line = "";
      Array.from(paragraph).forEach(function (char) {
        var testLine = line + char;
        if (line && ctx.measureText(testLine).width > maxWidth) {
          result.push(line.trim());
          line = char.trimStart();
        } else {
          line = testLine;
        }
      });
      if (line.trim()) {
        result.push(line.trim());
      }
    });

    ctx.restore();
    return result.length ? result : [""];
  }

  function loadImage(src) {
    if (imageCache[src]) return imageCache[src];

    imageCache[src] = new Promise(function (resolve, reject) {
      var image = new Image();
      image.crossOrigin = "anonymous";
      image.onload = function () {
        resolve(image);
      };
      image.onerror = function () {
        reject(new Error("图片加载失败: " + src));
      };
      image.src = src;
    });

    return imageCache[src];
  }

  function loadImageFromBlob(blob) {
    return new Promise(function (resolve, reject) {
      var url = URL.createObjectURL(blob);
      var image = new Image();
      image.onload = function () {
        URL.revokeObjectURL(url);
        resolve(image);
      };
      image.onerror = function () {
        URL.revokeObjectURL(url);
        reject(new Error("头像读取失败"));
      };
      image.src = url;
    });
  }

  function setAvatarBlob(blob) {
    avatarBlob = blob;
    loadImageFromBlob(blob)
      .then(function (image) {
        avatarImage = image;
        return saveAvatarToDb(blob);
      })
      .then(function () {
        showStatus("头像已保存并应用。");
        renderAll();
      })
      .catch(function (error) {
        console.error(error);
        showStatus("头像保存失败。", true);
      });
  }

  function openDb() {
    if (dbPromise) return dbPromise;

    dbPromise = new Promise(function (resolve, reject) {
      var request = indexedDB.open(DB_NAME, 1);
      request.onupgradeneeded = function () {
        request.result.createObjectStore(DB_STORE);
      };
      request.onsuccess = function () {
        resolve(request.result);
      };
      request.onerror = function () {
        reject(request.error);
      };
    });

    return dbPromise;
  }

  function runStore(mode, callback) {
    return openDb().then(function (db) {
      return new Promise(function (resolve, reject) {
        var transaction = db.transaction(DB_STORE, mode);
        var store = transaction.objectStore(DB_STORE);
        var request = callback(store);

        request.onsuccess = function () {
          resolve(request.result);
        };
        request.onerror = function () {
          reject(request.error);
        };
      });
    });
  }

  function saveAvatarToDb(blob) {
    return runStore("readwrite", function (store) {
      return store.put(blob, AVATAR_KEY);
    });
  }

  function loadAvatarFromDb() {
    return runStore("readonly", function (store) {
      return store.get(AVATAR_KEY);
    }).then(function (blob) {
      if (!blob) return null;
      avatarBlob = blob;
      return loadImageFromBlob(blob).then(function (image) {
        avatarImage = image;
      });
    });
  }

  function deleteAvatarFromDb() {
    return runStore("readwrite", function (store) {
      return store.delete(AVATAR_KEY);
    });
  }

  function canvasToBlob(canvas) {
    return new Promise(function (resolve, reject) {
      canvas.toBlob(function (blob) {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error("Canvas 导出失败"));
        }
      }, "image/png");
    });
  }

  function downloadCurrentZip() {
    if (!window.JSZip) {
      showStatus("JSZip 加载失败，暂时无法打包下载。", true);
      return;
    }

    elements.downloadBtn.disabled = true;
    showStatus("正在打包图片...");
    renderAll(false);

    var zip = new JSZip();
    Promise.all(renderItems.map(function (item) {
      return canvasToBlob(item.canvas).then(function (blob) {
        zip.file(item.filename, blob);
      });
    }))
      .then(function () {
        return zip.generateAsync({ type: "blob" });
      })
      .then(function (blob) {
        var link = document.createElement("a");
        var suffix = state.language === "ar" ? "ar" : "en";
        var url = URL.createObjectURL(blob);
        link.href = url;
        link.download = "game_huodong_" + state.group + "_" + suffix + ".zip";
        document.body.appendChild(link);
        link.click();
        link.remove();
        URL.revokeObjectURL(url);
        showStatus("图片包已生成。");
      })
      .catch(function (error) {
        console.error(error);
        showStatus("打包失败，请稍后重试。", true);
      })
      .finally(function () {
        elements.downloadBtn.disabled = false;
        renderAll();
      });
  }

  function showStatus(message, isError) {
    elements.statusMessage.textContent = message || "";
    elements.statusMessage.classList.toggle("is-error", Boolean(isError));
  }
})();
