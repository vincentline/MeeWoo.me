# Konva Transformer 分层遮挡修复


/**
 * KonvaTransformer分层遮挡修复Rules
 * @description Generated from konva-transformer-layering.md
 */
export interface KonvaTransformer分层遮挡修复Rules {
  /** 
   * 规则描述 
   */
  description: string;
}


# Konva Transformer 分层遮挡修复
> 摘要: 将 Transformer 放入独立的顶层 Layer 防止被内容遮挡

## 1. 问题背景 (Context)
- **场景**: 编辑器中同时存在内容元素和 Transformer 控件
- **现象**: Transformer 放在与内容相同的 Layer 时，会被后添加的元素遮挡，导致手柄无法操作

## 2. 根本原因 (Root Cause)
- Konva 的渲染顺序取决于添加顺序（z-index），同一 Layer 内后添加的元素会覆盖前面的元素

## 3. 解决方案 (Solution)
- 为 Transformer 创建独立的顶层 Layer（UI 层）
```javascript
// 正确做法 - Transformer 在独立顶层
const contentLayer = new Konva.Layer();
const transformerLayer = new Konva.Layer();  // 最后添加，在最上层
stage.add(contentLayer);
stage.add(transformerLayer);
transformerLayer.add(transformer);
```

## 4. 关联规则 (Related Rules)
- 建议更新模块: `modules/graphics/canvas.ts.md` (Layering Strategy)


## Konva 导出架构设计 (显示/导出分离) (Merged)

# Konva 导出架构设计 (显示/导出分离)
> 摘要: 采用双 Stage 策略，显示 Stage 适配容器，导出 Stage 适配原始尺寸
> 类型: Guide

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

## 4. 关联信息 (Meta)
- 来源: 项目实战经验
- 建议归档位置: `modules/graphics/canvas.ts.md` (Architecture)



## Konva 中心锚点模式 (Merged)

# Konva 中心锚点模式
> 摘要: 使用 offset 实现以中心为基准的旋转和缩放
> 类型: Concept

## 1. 核心要点 (Key Points)
- Konva 默认锚点在左上角 (0,0)。
- 设置 `offsetX = width/2` 和 `offsetY = height/2` 可将锚点移至中心。
- 此时设置 `x, y` 坐标即为元素中心的坐标。

## 2. 适用场景 (Use Cases)
- 元素需要围绕自身中心旋转 (Rotation)。
- 元素需要以中心为原点进行缩放 (Scale)。

## 3. 代码/配置示例 (Examples)
```javascript
const image = new Konva.Image({
  width: 100,
  height: 100,
  offsetX: 50,   // 宽的一半
  offsetY: 50,   // 高的一半
  x: centerX,    // 中心坐标
  y: centerY
});
```

## 4. 关联信息 (Meta)
- 来源: 项目实战经验
- 建议归档位置: `modules/graphics/canvas.ts.md` (Interaction)



## Konva 与 Vue 响应式配合问题 (Merged)

# Konva 与 Vue 响应式配合问题
> 摘要: 解决 Vue watch 监听相同值不触发导致 Konva 不刷新的问题

## 1. 问题背景 (Context)
- **场景**: 重新打开编辑器加载相同的图片 URL
- **现象**: Vue 的 watch 监听器未触发，导致 Konva 画布未更新/未渲染

## 2. 根本原因 (Root Cause)
- Vue 的响应式机制优化：当新值与旧值全等 (`===`) 时，不会触发 watcher 回调

## 3. 解决方案 (Solution)
- 在赋值前先强制重置为 null，制造状态变更
```javascript
// 先重置再赋值，确保触发 watch
this.editor.baseImage = null;
this.$nextTick(() => {
    this.editor.baseImage = imgUrl; 
});
```

## 4. 关联规则 (Related Rules)
- 建议更新模块: `modules/ui/ui.ts.md` (Vue Integration)



## Konva 动态文字 Canvas 渲染 (Merged)

# Konva 动态文字 Canvas 渲染
> 摘要: 使用临时 Canvas 测量并绘制动态尺寸文字，解决内容截断问题
> 类型: Snippet

## 1. 核心要点 (Key Points)
- 使用离屏 Canvas Context (`measureText`) 预先计算多行文字的宽度。
- 根据总行高和宽度动态设置 Canvas 尺寸，并预留 Padding。
- 将生成的 Canvas 作为 `Konva.Image` 的 `image` 源。

## 2. 适用场景 (Use Cases)
- 需要自定义复杂文字渲染（如特殊字体、阴影、背景）且 Konva.Text 无法满足时。
- 避免固定尺寸 Canvas 导致的文字截断或留白过多。

## 3. 代码/配置示例 (Examples)
```javascript
const canvas = document.createElement('canvas');
canvas.width = Math.ceil(maxWidth + padding * 2);
canvas.height = Math.ceil(totalHeight + padding * 2);
// ... context.fillText() ...
return canvas;
```

## 4. 关联信息 (Meta)
- 来源: 项目实战经验
- 建议归档位置: `modules/graphics/canvas.ts.md` (Performance/Rendering)



## Konva 相对坐标数据模型 (Merged)

# Konva 相对坐标数据模型
> 摘要: 存储相对于导出区域中心的百分比坐标，支持多分辨率适配
> 类型: Concept

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

## 4. 关联信息 (Meta)
- 来源: 项目实战经验
- 建议归档位置: `modules/graphics/canvas.ts.md` (Architecture/Data)



## Konva 舞台拖拽无感激活 (Merged)

# Konva 舞台拖拽无感激活
> 摘要: 通过 mouseenter 事件自动激活 draggable，解决首次拖拽无效问题

## 1. 问题背景 (Context)
- **场景**: 用户首次尝试拖动整个画布（平移舞台）
- **现象**: 第一次拖动无响应，必须先点击一次舞台获取焦点后才能拖动

## 2. 根本原因 (Root Cause)
- 浏览器的事件焦点或 Konva 的内部状态初始化时机问题

## 3. 解决方案 (Solution)
- 双重保障：初始化时设置 `draggable(true)` + 监听 `mouseenter` 再次激活
```javascript
this.stageInstance.draggable(true);
this.stageInstance.on('mouseenter', function () {
    if (editor.activeElement === 'none') {
        stage.draggable(true);
    }
});
```

## 4. 关联规则 (Related Rules)
- 建议更新模块: `modules/graphics/canvas.ts.md` (Interaction)



## Konva 居中缩放 (getClientRect 修正) (Merged)

# Konva 居中缩放 (getClientRect 修正)
> 摘要: 调用 getClientRect 前重置舞台位置，确保获取绝对坐标以计算正确的缩放中心
> 类型: Guide

## 1. 核心要点 (Key Points)
- `getClientRect()` 返回的矩形受舞台当前的 `position` 和 `scale` 影响。
- **技巧**: 在计算居中前，先将 Stage 位置设为 `(0,0)`，缩放设为目标值。
- **公式**: `CenterPos = (StageSize - RectSize) / 2 - RectPos`。

## 2. 适用场景 (Use Cases)
- "适应画布" (Fit to Screen) 功能。
- "1:1 还原" 功能。
- 选中物体居中显示。

## 3. 代码/配置示例 (Examples)
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

## 4. 关联信息 (Meta)
- 来源: 项目实战经验
- 建议归档位置: `modules/graphics/canvas.ts.md` (Interaction/Transform)

