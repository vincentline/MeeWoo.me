---
module_name: KonvaExport
type: guide
description: Konva 导出架构设计 (显示/导出分离)
version: 1.0.0
---

# Konva 导出架构设计 (显示/导出分离)

```typescript
/**
 * Konva 导出架构
 */
export interface KonvaExportArchitecture {
  /** 核心策略 */
  strategy: "Dual Stage";
  /** 组件 */
  stages: {
    displayStage: "Fit Container (Edit Mode)";
    exportStage: "Original Size (Export Mode)";
  };
}
```

> 摘要: 采用双 Stage 策略，显示 Stage 适配容器，导出 Stage 适配原始尺寸

## 1. 核心要点 (Key Points)
- **显示 Stage**: 尺寸等于容器尺寸 (`containerWidth/Height`)，提供更大的编辑操作空间。
- **导出 Stage**: 尺寸等于原始素材尺寸 (`originalWidth/Height`)，保证输出分辨率正确。
- **临时创建**: 导出时创建离屏 Stage，复制内容后销毁，避免内存泄漏。

## 2. 适用场景 (Use Cases)
- 编辑器 UI 需要响应式缩放，但输出图片必须是固定高分辨率。
- 需要在画布外显示辅助线或操作手柄，但不希望导出到最终图片中。

## 3. 代码/配置示例 (Examples)
```javascript
// 导出时创建临时 Stage
function exportImage() {
  const exportStage = new Konva.Stage({
    container: document.createElement('div'),
    width: originalWidth,
    height: originalHeight
  });
  // ... 复制内容逻辑 ...
  const dataURL = exportStage.toDataURL();
  exportStage.destroy(); // 必须销毁
  return dataURL;
}
```
