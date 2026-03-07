---
module_name: UiArchitecture
type: core
description: UI 组件架构 (Vue 2 Mixin Pattern)
version: 1.0.0
---

# UI 组件规则

```typescript
/**
 * UiRules
 */
export interface UiRules {
  /**
   * 组件架构
   * @pattern Mixin 模式 (Vue 2)
   * @description 使用 Mixin 复用面板状态逻辑
   */
  architecture: {
    mixin: "PanelMixin";
    store: "Shared Object (MeeWoo.PanelState)";
    communication: "Event Bus ($emit/$on)";
  };

  /**
   * 面板交互规范
   */
  interaction: {
    /** 打开面板 */
    open: "Set isActive=true, Emit 'panel:open'";
    /** 关闭面板 */
    close: "Set isActive=false, Emit 'panel:close'";
    /** 切换面板 (互斥) */
    toggle: "Close others, Open target";
  };

  /**
   * 命名空间规范
   */
  namespace: {
    components: "MeeWoo.Components.*";
    mixins: "MeeWoo.Mixins.*";
    events: "kebab-case (e.g., 'export-start')";
  };
}
```

## 概述
UI 组件基于 **Vue 2** 构建，并遵循基于 Mixin 的架构来处理共享逻辑（特别是侧边面板）。
组件注册在 `MeeWoo.Components` 下，Mixin 注册在 `MeeWoo.Mixins` 下。

## 核心接口

### PanelMixin
右侧面板（素材、导出、设置）的共享逻辑。

```typescript
// namespace MeeWoo.Mixins
interface PanelMixin {
  data: {
    /**
     * 控制当前可见的面板
     * 取值: 'to-svga', 'dual-channel', 'gif', 'material', 'frames', 'webp', 等
     */
    activeRightPanel: string | null;

    // 统一转换器配置
    dualChannelConfig: ConverterConfig;
    toSvgaConfig: ConverterConfig;
    
    // 状态标志
    isConvertingToSvga: boolean;
    isConvertingToDualChannel: boolean;
    // ...
  };

  methods: {
    /**
     * 打开面板的统一入口
     * 关闭其他面板并处理切换逻辑
     */
    openRightPanel(panelName: string): void;

    /**
     * 关闭当前面板 (如果忙碌则提示确认)
     */
    closeRightPanel(): void;

    // 特定面板打开器 (包装 openRightPanel 或设置逻辑)
    openToSvgaPanel(): void;
    openDualChannelPanel(): void;
  };
}

interface ConverterConfig {
  width: number;
  height: number;
  fps: number;
  quality: number;
  muted: boolean;
  aspectRatio: number;
  // ...
}
```

### MaterialPanel (示例组件)
显示可编辑素材列表。

```typescript
// namespace MeeWoo.Components
interface MaterialPanelProps {
  visible: boolean;
  list: MaterialItem[];
  replacedImages: Record<string, string>; // 映射 imageKey -> url
  isCompressing: boolean;
  compressProgress: number;
}

interface MaterialPanelEvents {
  /**
   * 点击关闭按钮时触发
   */
  (e: 'close'): void;

  /**
   * 请求替换素材时触发
   * @param index 列表中的原始索引
   */
  (e: 'replace', index: number): void;

  /**
   * 恢复原始素材时触发
   */
  (e: 'restore', index: number): void;

  /**
   * 打开素材编辑器时触发
   */
  (e: 'edit', item: MaterialItem): void;
}
```
