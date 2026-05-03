---
name: avatar-konva-plan
overview: 重构 `avatar-icon` 预览区为基于 Konva 的 750x750 画布编辑器，支持画布缩放/平移、上传图层选中编辑，以及新增 A/B 单层透明导出。保留现有身体图与底色选择、层级关系和合成导出能力，同时移除页面标题。
todos:
  - id: review-structure
    content: 确认 `avatar-icon` 页面入口、样式和现有原生 canvas 交互的替换边界
    status: pending
  - id: replace-preview-with-konva
    content: 将预览区重构为 750x750 Konva 舞台，并实现画布平移/缩放与重置
    status: pending
  - id: implement-layer-editing
    content: 实现 A/B 上传图层的中心放置、选中、拖动、缩放和层级管理
    status: pending
  - id: add-export-actions
    content: 补充完整成品导出与 A/B 单层透明导出逻辑
    status: pending
  - id: polish-and-verify
    content: 调整样式与按钮布局，并验证主要交互与导出结果
    status: pending
isProject: false
---

# Avatar Icon Konva 改造计划

## 目标
把当前基于原生 `canvas` 的预览器，改成基于 Konva 的 750x750 画布编辑器，并补上单层透明素材导出。

## 当前结论
- 页面入口是 [src/gadgets/avatar-icon/index.html](src/gadgets/avatar-icon/index.html)，当前直接引入 [src/gadgets/avatar-icon/js/preview.js](src/gadgets/avatar-icon/js/preview.js) 和 [src/gadgets/avatar-icon/css/style.css](src/gadgets/avatar-icon/css/style.css)。
- 现有实现是单个原生 `canvas` 合成三层：B 底层、身体中层、A 顶层。
- 当前拖动和滚轮缩放实际上是三层一起联动，不是单图层编辑。
- 仓库已经有 `konva` 依赖，适合在该工具页里直接接入 Konva，而不是继续扩展原生 `canvas` 逻辑。

## 实现范围
1. 重写预览区结构
- 移除页面中的“Avatar图标预览器”标题。
- 把原 `<canvas id="preview-canvas">` 替换为 Konva 舞台容器，逻辑尺寸固定为 `750x750`。
- 保持页面其他控制区块存在：身体选择、底色选择、A/B 上传、A/B 恢复、生成图标。
- 在 A/B 上传按钮右侧各新增一个“导出素材”按钮。

2. 重构为 Konva 场景模型
- 使用 Stage + Layer 管理场景。
- 场景层级固定为：背景色 -> B 图片 -> 身体图片 -> A 图片。
- 维护两类状态：
  - 画布状态：舞台缩放、舞台偏移。
  - 图层状态：A/B 图片各自的位置、缩放、选中状态。
- 身体图继续沿用 [src/gadgets/avatar-icon/img/nan.png](src/gadgets/avatar-icon/img/nan.png) 和 [src/gadgets/avatar-icon/img/nv.png](src/gadgets/avatar-icon/img/nv.png)。

3. 交互规则调整
- 鼠标滚轮：缩放整张画布，步进 `5%`。
- 鼠标左键拖动画布空白区域：移动整张画布位置。
- “恢复预览区”按钮：重置画布缩放和位置。
- 上传 A/B 图片后：默认放在画布中心，按原始尺寸显示。
- 点击 A/B 图片可选中，选中后显示 Konva Transformer，仅允许拖动和缩放。
- 空白区域点击取消图片选中，恢复为画布操作。
- A/B 各自“恢复”按钮仍表示移除该上传图层，不影响另一层和身体图。

4. 导出逻辑
- “生成图标”继续导出完整合成图，输出 `750x750` PNG，包含底色、身体层、B、A，文件名仍沿用 `btn_` + A 图素材名。
- 新增“导出素材”按钮：
  - A 导出时，仅导出 A 图层。
  - B 导出时，仅导出 B 图层。
  - 输出 `750x750` PNG。
  - 背景透明，不包含底色、身体层和另一上传层。
- 默认按“当前画面中的结果”导出，也就是保留当前画布平移/缩放视图和该图层当前变换结果。

## 文件改动计划
- [src/gadgets/avatar-icon/index.html](src/gadgets/avatar-icon/index.html)
  - 删除标题。
  - 替换原生 `canvas` 节点为 Konva 容器。
  - 在 A/B 上传区增加“导出素材”按钮。
  - 如该页面当前未加载 Konva，需要补上对应脚本接入方式。
- [src/gadgets/avatar-icon/js/preview.js](src/gadgets/avatar-icon/js/preview.js)
  - 基本重写为 Konva 版预览器。
  - 拆分画布状态与图层状态。
  - 实现图片选中、拖动、缩放、导出与重置。
- [src/gadgets/avatar-icon/css/style.css](src/gadgets/avatar-icon/css/style.css)
  - 适配新的舞台容器、按钮排布和选中/交互态。
  - 移除对 `#preview-canvas` 的特定样式依赖，改为容器样式。

## 默认假设
- “缩放和选择”理解为：支持选中后拖动与缩放，不包含旋转。
- “导出该按钮所上传的图片在画面中的图片”理解为：按当前预览画面状态导出该单层，而不是忽略当前画布视图。
- 身体图片不参与单层素材导出，但继续参与完整成品导出。

## 验证方式
- 上传 A/B 后，默认在中心显示且为原始尺寸。
- 画布空白区域可拖动，滚轮按 5% 缩放，恢复按钮可重置。
- 点击 A/B 可出现选中框并拖动/缩放，层级仍保持 B 在下、身体居中、A 在上。
- 切换身体图和底色后，完整导出结果正确。
- A/B 的“导出素材”分别输出 750x750 透明 PNG，且只包含对应单层。