---
module_name: KonvaInteraction
type: guide
description: Konva 交互模式 (锚点/拖拽/缩放)
version: 1.0.0
---

# Konva 交互模式

```typescript
/**
 * Konva 交互规则
 */
export interface KonvaInteraction {
  /** 锚点模式 */
  anchor: "Center Offset";
  /** 拖拽激活 */
  dragActivation: "MouseEnter Hook";
  /** 缩放计算 */
  centering: "GetClientRect Correction";
}
```

> 摘要: 中心锚点、舞台拖拽无感激活、居中缩放修正

## 1. 中心锚点模式
- Konva 默认锚点在左上角 (0,0)。
- 设置 `offsetX = width/2` 和 `offsetY = height/2` 可将锚点移至中心。
- 此时设置 `x, y` 坐标即为元素中心的坐标。

## 2. 舞台拖拽无感激活
- **问题**: 第一次拖动无响应，必须先点击一次舞台获取焦点后才能拖动。
- **解法**: 初始化时设置 `draggable(true)` + 监听 `mouseenter` 再次激活。
```javascript
this.stageInstance.draggable(true);
this.stageInstance.on('mouseenter', function () {
    if (editor.activeElement === 'none') {
        stage.draggable(true);
    }
});
```

## 3. 居中缩放 (getClientRect 修正)
- `getClientRect()` 返回的矩形受舞台当前的 `position` 和 `scale` 影响。
- **技巧**: 在计算居中前，先将 Stage 位置设为 `(0,0)`，缩放设为目标值。
```javascript
// 1. 归零
stage.position({ x: 0, y: 0 });
stage.scale({ x: newScale, y: newScale });
// 2. 获取绝对边界
var rect = group.getClientRect();
// 3. 计算并应用居中
var centerX = (stageWidth - rect.width) / 2 - rect.x;
stage.position({ x: centerX, y: ... });
```
