---
module_name: KonvaCoordinates
type: concept
description: Konva 相对坐标数据模型
version: 1.0.0
---

# Konva 相对坐标数据模型

```typescript
/**
 * Konva 坐标模型
 */
export interface KonvaCoordinateModel {
  /** 存储格式 */
  storage: "Relative Percentage (Center-based)";
  /** 渲染计算 */
  calculation: "Absolute = Center + (Relative - 50%) * Size";
}
```

> 摘要: 存储相对于导出区域中心的百分比坐标，支持多分辨率适配

## 1. 核心要点 (Key Points)
- **存储数据**: 存相对值 (e.g., `textPosX: 50` 代表中心)。
- **渲染逻辑**: 运行时计算 `Absolute = Center + (Relative - 50%) * Size`。
- **优势**: 数据与具体 Canvas 尺寸解耦，切换显示/导出模式时坐标自动适配。

## 2. 适用场景 (Use Cases)
- 编辑器（显示模式）与生成器（导出模式）尺寸不一致。
- 响应式画布设计。

## 3. 代码/配置示例 (Examples)
```javascript
// 渲染计算公式
const textX = exportCenterX + ((textPosX - 50) / 100) * exportWidth;
const textY = exportCenterY + ((textPosY - 50) / 100) * exportHeight;
```
