# 修复 PlayerController 适配器实例缓存问题

**问题分析**：
当前 `PlayerController.prototype.getAdapter` 方法在每次调用时都会创建一个新的适配器实例。
由于 `syncAudio` 方法是在 `onFrame` 回调中每秒执行 30-60 次的，这意味着：
1.  每帧都创建一个新的 `SvgaPlayerAdapter` 实例。
2.  新实例的 `audioCache` 初始化为空。
3.  `getHowlInstance` 每次都发现缓存为空，从而创建一个新的 `Howl` 音频实例。
4.  新创建的音频实例还未就绪就被丢弃（因为 Adapter 实例随函数作用域结束而被回收）。

这导致了成千上万个 Howl 实例被创建但从未被重用，音频自然无法播放。

**修复计划**：

1.  **修改 `PlayerAdapter` 基类**：
    *   增加 `updateState(state)` 方法，允许更新适配器内部的状态引用，而不是每次都通过构造函数新建。

2.  **重构 `PlayerController`**：
    *   在构造函数中初始化 `this.currentAdapter = null` 和 `this.currentMode = null`。
    *   重写 `getAdapter` 方法：
        *   检查当前缓存的适配器是否与请求的模式匹配。
        *   如果匹配，调用 `updateState(state)` 更新状态并返回缓存实例。
        *   如果不匹配（模式切换），先销毁旧适配器（调用 `destroy`），再创建新适配器并缓存。
    *   在 `destroy` 方法中确保销毁缓存的适配器。

**验证**：
修复后，`SvgaPlayerAdapter` 实例将在整个播放会话中保持单例，`audioCache` 将正常工作，`Howl` 实例将被复用，音频应该能正常播放。