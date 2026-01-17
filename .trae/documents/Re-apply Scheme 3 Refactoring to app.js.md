# 重构方案：基于配置映射表的模式切换优化 (修正版)

## 目标
消除 `app.js` 中 `switchMode` 方法里冗长的 `if-else` 判断逻辑，使用配置驱动的方式管理不同模式（SVGA, MP4, Lottie 等）的加载和清理行为。

## 风险修正点
1.  **移除错误的 init 调用**：`Core.libraryLoader.init(this)` 是导致之前崩溃的原因，新方案中必须**移除**该调用。
2.  **正确的初始化位置**：`modeStrategies` 的定义必须合并到**现有的 `created` 生命周期钩子**中，而不是创建新的 `created` 属性，也不能插入到 `mounted` 之间。
3.  **URL 参数加载逻辑**：确保从 URL 参数加载文件的逻辑在 `modeStrategies` 初始化之后执行，且不被错误删除或覆盖。

## 实施步骤

### 1. 扩展现有的 `created` 生命周期
定位到 `app.js` 底部现有的 `created` 方法（约 9350 行左右），在 `this.configManager` 初始化之后，添加 `modeStrategies` 的定义。

```javascript
// 在 app.js 现有的 created 钩子内部
created: function () {
  // ... (保留原有的非响应式属性初始化代码) ...

  // 初始化配置管理器 (保留)
  if (Core.ConfigManager) {
    this.configManager = new Core.ConfigManager();
    this.loadUserConfig();
  }

  // --- 新增内容开始 ---
  
  /**
   * [模式策略配置表]
   * 用于定义不同模式下的清理逻辑。
   * 当 switchMode 发生时，会根据当前的 currentModule 查找对应的策略并执行 cleanup。
   * 
   * [开发指南]
   * 1. 新增模式：如果增加了新的文件类型支持（如 gif），请在此处添加对应的 key 和 cleanup 方法。
   * 2. 方法对应：确保 cleanup 指向的是 methods 中实际定义的清理函数。
   * 3. 上下文：执行时会自动绑定 this 到 Vue 实例，无需手动 bind。
   */
  this.modeStrategies = {
    'svga': { cleanup: this.cleanupSvga },
    'yyeva': { cleanup: this.cleanupYyeva },
    'mp4': { cleanup: this.cleanupMp4 },
    'lottie': { cleanup: this.cleanupLottie },
    'frames': { cleanup: this.cleanupFrames }
  };

  // --- 新增内容结束 ---

  // ... (保留后续的 URL 参数加载逻辑和属性初始化) ...
},
```

### 2. 重构 `switchMode` 方法
利用映射表替代 `if-else`，并添加详细注释。

```javascript
/**
 * 统一的模式切换函数
 * @param {string} targetMode - 目标模式（'svga' | 'yyeva' | 'lottie' | 'mp4' | 'frames'）
 * @param {Object} options - 选项 { skipCleanup: boolean }
 */
switchMode: function (targetMode, options) {
  options = options || {};
  var fromMode = this.currentModule;

  // 如果已经是目标模式，且不需要清理，则直接返回
  if (fromMode === targetMode && options.skipCleanup) {
    return;
  }

  // 1. 取消正在进行的任务（静默取消）
  this.cancelOngoingTasks(true);

  // 2. 动态清理资源
  // 逻辑说明：无论是切换到新模式，还是重置当前模式，都需要清理"上一个状态"（fromMode）的资源
  if (!options.skipCleanup && fromMode) {
    var strategy = this.modeStrategies[fromMode];

    if (strategy && typeof strategy.cleanup === 'function') {
      // 使用 call(this) 确保方法内部的 this 指向 Vue 实例
      strategy.cleanup.call(this);
    } else {
      // 防御性编程：如果未找到策略，仅在控制台警告，不阻断流程
      console.warn('[switchMode] 未找到模式的清理策略:', fromMode);
    }
  }

  // 3. 关闭所有弹窗
  this.closeAllPanels();

  // 4. 切换模式
  this.currentModule = targetMode;

  // 5. 重置视图状态
  if (this.viewportController) {
    this.viewportController.setScale(1, true);
    this.viewportController.setOffset(0, 0, true);
  }
},
```

## 验证计划
1.  **静态检查**：确认文件中没有两个 `created` 钩子，确认没有调用不存在的 `init` 方法。
2.  **功能验证**：在浏览器中打开，拖拽 SVGA 文件，确保能正常播放（无报错），并测试切换到其他格式是否正常清理。
