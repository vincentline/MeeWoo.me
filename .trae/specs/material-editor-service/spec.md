# 素材编辑器服务化重构 Spec

## Why
当前素材编辑功能与 SVGA 页面强耦合，无法被 YYEVA 或其他页面复用。需要将编辑能力抽象为独立服务，支持多种调用方式。

## What Changes
- 新增 `TextRenderer` 服务：文字渲染到 Canvas，支持复杂样式
- 新增 `ImageTransformer` 服务：图片加载、缩放、位移变换
- 新增 `MaterialComposer` 服务：底图与文字层合成
- 新增 `MaterialEditorService` 服务：统一入口，管理编辑状态
- 新增 `MaterialEditorUI` 组件：可复用的编辑器弹窗
- 重构 `material-editor.js`：改为调用服务层
- 重构 `material-operations.js`：样式处理函数移入 TextRenderer

## Impact
- Affected specs: 素材编辑功能
- Affected code: 
  - `src/assets/js/core/material-editor.js`
  - `src/assets/js/core/material-operations.js`
  - `src/assets/js/core/material-state.js`
  - `src/assets/js/core/app.js`

## ADDED Requirements

### Requirement: TextRenderer 文字渲染服务
系统应提供独立的文字渲染服务，支持将文字渲染到 Canvas。

#### Scenario: 渲染带样式的文字
- **WHEN** 调用 TextRenderer.render() 传入尺寸、文字内容、样式配置
- **THEN** 返回渲染后的 DataURL

#### Scenario: 支持复杂样式
- **WHEN** 样式包含渐变、阴影、描边
- **THEN** 正确渲染对应效果

### Requirement: ImageTransformer 图片变换服务
系统应提供独立的图片变换服务，支持图片加载和变换操作。

#### Scenario: 加载并变换图片
- **WHEN** 调用 ImageTransformer.transform() 传入图片源和变换参数
- **THEN** 返回变换后的 DataURL

#### Scenario: 支持多种图片源
- **WHEN** 图片源为 URL、Blob 或 Base64 字符串
- **THEN** 均能正确加载处理

### Requirement: MaterialComposer 素材合成服务
系统应提供素材合成服务，支持底图与文字层的叠加合成。

#### Scenario: 合成底图和文字
- **WHEN** 调用 MaterialComposer.compose() 传入底图和文字层
- **THEN** 返回合成后的 DataURL

### Requirement: MaterialEditorService 编辑器服务
系统应提供统一的编辑器服务入口，协调各子服务完成编辑流程。

#### Scenario: 创建编辑器实例
- **WHEN** 调用 MaterialEditorService.create() 传入容器和尺寸
- **THEN** 返回编辑器实例，可进行后续操作

#### Scenario: 导出编辑结果
- **WHEN** 调用 editor.export()
- **THEN** 返回编辑后的图片 DataURL

### Requirement: MaterialEditorUI 可复用组件
系统应提供可复用的编辑器 UI 组件，支持弹窗形式调用。

#### Scenario: 打开编辑器弹窗
- **WHEN** 调用 MaterialEditorUI.open() 传入配置
- **THEN** 显示编辑器弹窗，用户可进行编辑

#### Scenario: 保存编辑结果
- **WHEN** 用户点击保存
- **THEN** 调用 onSave 回调，传递编辑结果

## MODIFIED Requirements

### Requirement: 现有素材编辑功能兼容
现有的 SVGA 素材编辑功能应保持不变，用户无感知。

#### Scenario: SVGA 素材编辑流程
- **WHEN** 用户在 SVGA 页面点击素材编辑
- **THEN** 编辑器正常打开，功能与之前一致

#### Scenario: 保存编辑结果到 SVGA
- **WHEN** 用户保存编辑
- **THEN** 正确更新 SVGA 播放器中的素材

## REMOVED Requirements
无移除的功能。
