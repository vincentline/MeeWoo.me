# Tasks

## Phase 1: 基础服务层

- [x] Task 1: 创建 TextRenderer 文字渲染服务
  - [x] Task 1.1: 创建 `src/assets/js/service/material-editor/text-renderer.js` 文件
  - [x] Task 1.2: 实现 `filterTextStyle()` 样式过滤方法（从 material-operations.js 迁移）
  - [x] Task 1.3: 实现 `convertStylesToCssString()` 样式转换方法
  - [x] Task 1.4: 实现 `render()` 文字渲染主方法
  - [x] Task 1.5: 支持渐变填充（background-clip: text）
  - [x] Task 1.6: 支持文字阴影（多阴影）
  - [x] Task 1.7: 支持文字描边
  - [x] Task 1.8: 添加完整的 JSDoc 注释和使用示例

- [x] Task 2: 创建 ImageTransformer 图片变换服务
  - [x] Task 2.1: 创建 `src/assets/js/service/material-editor/image-transformer.js` 文件
  - [x] Task 2.2: 实现 `loadImage()` 图片加载方法
  - [x] Task 2.3: 实现 `transform()` 图片变换主方法
  - [x] Task 2.4: 支持缩放、位移变换
  - [x] Task 2.5: 支持 cover/contain 填充模式
  - [x] Task 2.6: 添加完整的 JSDoc 注释和使用示例

- [x] Task 3: 创建 MaterialComposer 素材合成服务
  - [x] Task 3.1: 创建 `src/assets/js/service/material-editor/material-composer.js` 文件
  - [x] Task 3.2: 实现 `compose()` 合成主方法
  - [x] Task 3.3: 支持底图与文字层叠加
  - [x] Task 3.4: 支持 PNG/JPEG 导出格式
  - [x] Task 3.5: 添加完整的 JSDoc 注释和使用示例

- [x] Task 4: 创建 MaterialEditorService 统一入口
  - [x] Task 4.1: 创建 `src/assets/js/service/material-editor/material-editor-service.js` 文件
  - [x] Task 4.2: 实现 `create()` 创建编辑器实例方法
  - [x] Task 4.3: 实现实例方法：`loadImage()`、`setText()`、`export()`、`reset()`、`destroy()`
  - [x] Task 4.4: 实现编辑状态管理
  - [x] Task 4.5: 添加完整的 JSDoc 注释和使用示例

- [x] Task 5: 创建服务入口文件
  - [x] Task 5.1: 创建 `src/assets/js/service/material-editor/index.js` 文件
  - [x] Task 5.2: 导出所有服务和类型定义

## Phase 2: UI 组件层

- [x] Task 6: 创建 MaterialEditorUI 可复用组件
  - [x] Task 6.1: 创建 `src/assets/js/components/material-editor-ui.js` 文件
  - [x] Task 6.2: 实现弹窗模板（复用现有编辑器 UI 结构）
  - [x] Task 6.3: 实现 `open()` 打开弹窗方法
  - [x] Task 6.4: 实现 `close()` 关闭弹窗方法
  - [x] Task 6.5: 集成 MaterialEditorService
  - [x] Task 6.6: 添加完整的 JSDoc 注释和使用示例

## Phase 3: 重构现有代码

- [x] Task 7: 重构 material-editor.js
  - [x] Task 7.1: 修改为调用 MaterialEditorService
  - [x] Task 7.2: 保持 Mixin 接口不变
  - [x] Task 7.3: 保持现有方法签名兼容

- [x] Task 8: 重构 material-operations.js
  - [x] Task 8.1: 移除已迁移到 TextRenderer 的方法
  - [x] Task 8.2: 保留编辑器控制相关方法
  - [x] Task 8.3: 更新方法调用为服务层

- [x] Task 9: 更新 app.js
  - [x] Task 9.1: 引入 material-editor 服务模块
  - [x] Task 9.2: 确保 Mixin 正常工作

## Phase 4: 文档与测试

- [x] Task 10: 创建服务使用文档
  - [x] Task 10.1: 创建 `src/assets/js/service/material-editor/README.md`
  - [x] Task 10.2: 编写各服务的调用示例
  - [x] Task 10.3: 编写常见场景的代码示例

- [x] Task 11: 更新项目索引
  - [x] Task 11.1: 更新 `INDEX.md` 添加新模块索引

- [x] Task 12: 功能验证测试
  - [x] Task 12.1: 测试 SVGA 素材编辑功能正常
  - [x] Task 12.2: 测试 TextRenderer 独立调用
  - [x] Task 12.3: 测试 ImageTransformer 独立调用
  - [x] Task 12.4: 测试 MaterialComposer 独立调用
  - [x] Task 12.5: 测试 MaterialEditorUI 弹窗调用

# Task Dependencies
- [Task 2] depends on [Task 1] (ImageTransformer 可能依赖 TextRenderer 的样式处理)
- [Task 3] depends on [Task 1, Task 2] (MaterialComposer 需要合成底图和文字)
- [Task 4] depends on [Task 1, Task 2, Task 3] (MaterialEditorService 组合各服务)
- [Task 5] depends on [Task 1, Task 2, Task 3, Task 4]
- [Task 6] depends on [Task 4] (UI 组件依赖服务)
- [Task 7] depends on [Task 4] (重构依赖服务)
- [Task 8] depends on [Task 1] (迁移方法)
- [Task 9] depends on [Task 5, Task 7]
- [Task 10] depends on [Task 5]
- [Task 11] depends on [Task 5]
- [Task 12] depends on [Task 7, Task 8, Task 9]
