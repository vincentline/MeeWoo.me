# Canvas 交互规则

## 概述
Canvas 交互由 **Konva.js** 驱动，并封装在 `MeeWoo.Core` 模块中。
架构遵循 **命令模式 (Command Pattern)** 来支持撤销/重做，并分离了舞台管理、编辑器逻辑和命令执行。

## 核心接口

### KonvaEditorCore
编辑器的主要入口点。

```typescript
// namespace MeeWoo.Core
interface KonvaEditorCore {
  /**
   * 架构模式
   * @pattern 命令模式 (Command Pattern)
   * @description 使用命令对象封装所有画布操作，以支持撤销/重做
   */
  architecture: {
    pattern: "Command Pattern";
    components: {
      invoker: "CommandManager";
      command: "BaseCommand";
      receiver: "Stage/Layer";
    };
  };

  /**
   * 图层管理策略
   * @description 画布分层以优化渲染性能
   */
  layering: {
    /** 背景层 (静态) */
    backgroundLayer: "Static (Grid, Background Color)";
    /** 主内容层 (动态, 可交互) */
    contentLayer: "Dynamic (User Elements)";
    /** 辅助层 (选中框, 参考线) */
    auxiliaryLayer: "Overlay (Selection Box, Guides)";
    /** UI 层 (浮动控件) */
    uiLayer: "Top Level (Controls)";
  };

  /**
   * 交互规范
   */
  interaction: {
    /** 拖拽操作 */
    dragging: "Use Konva built-in drag events";
    /** 缩放操作 */
    zooming: "Wheel event + Scale transformation (centered)";
    /** 选中操作 */
    selection: "Click (Single) / Drag (Area) / Shift+Click (Multi)";
  };

  /**
   * 性能优化规则
   */
  performance: {
    /** 避免在拖拽时重绘复杂图形 */
    dragOptimization: "Cache or simplify rendering during drag";
    /** 使用 requestAnimationFrame 节流高频事件 */
    eventThrottling: "Required for resize/scroll";
    /** 离屏渲染 (对于复杂静态内容) */
    offscreenCanvas: "Recommended for complex static groups";
  };
}
```

## 实现规则
1.  **图层分离**: 始终将对象放置在指定的图层中 (例如 `editLayer` 用于内容, `helperLayer` 用于控件)。
2.  **批量渲染**: 对于性能关键的更新 (如拖拽期间)，优先使用 `redrawLayers` 且 `immediate: false`。
3.  **状态同步**: 画布对象的更新必须通过 `integrateWithState` 或事件监听器反映到外部状态中。
4.  **清理**: 卸载时必须调用 `destroy()` 以移除事件监听器并释放内存。
