# MeeWoo 雪碧图优化实施方案

## 任务分解和优先级

### [x] 任务 1: 修改 generate-sprite.py 脚本配置
- **Priority**: P0
- **Depends On**: None
- **Description**:
  - 修改图标源目录配置，将 `IMG_DIR` 从 `docs/assets/img` 改为 `src/assets/png`
  - 保持输出目录不变，确保雪碧图和CSS文件输出到正确位置
- **Success Criteria**:
  - 脚本能够从正确的目录读取原始图标文件
  - 生成的雪碧图和CSS文件输出到指定位置
- **Test Requirements**:
  - `programmatic` TR-1.1: 执行脚本后，检查 `docs/assets/img/controls-sprite.png` 文件是否生成
  - `programmatic` TR-1.2: 检查 `docs/assets/css/sprite-generated.css` 文件是否生成
- **Notes**: 确保原始图标文件确实位于 `src/assets/png` 目录

### [x] 任务 2: 在 vite.config.js 中集成雪碧图生成
- **Priority**: P0
- **Depends On**: Task 1
- **Description**:
  - 在 `copyStaticFiles` 函数中添加执行 `generate-sprite.py` 的步骤
  - 确保在复制其他文件之前生成雪碧图
- **Success Criteria**:
  - 构建时自动执行雪碧图生成脚本
  - 雪碧图生成在文件复制之前完成
- **Test Requirements**:
  - `programmatic` TR-2.1: 运行 `npm run build` 后，检查控制台输出是否包含雪碧图生成信息
  - `programmatic` TR-2.2: 检查构建产物中是否包含 `controls-sprite.png` 文件
- **Notes**: 确保Python环境可用，且PIL库已安装

### [x] 任务 3: 实现智能图标复制逻辑
- **Priority**: P0
- **Depends On**: Task 1, Task 2
- **Description**:
  - 从 `generate-sprite.py` 中提取需要包含在雪碧图中的图标列表
  - 修改 `vite.config.js` 中的图标复制逻辑，只复制未包含在雪碧图中的图标
- **Success Criteria**:
  - 雪碧图中包含的图标不会被单独复制到 `docs/assets/img`
  - 未包含在雪碧图中的图标会被正确复制到 `docs/assets/img`
- **Test Requirements**:
  - `programmatic` TR-3.1: 检查 `docs/assets/img` 目录中是否包含未在雪碧图中的图标（如 `logo.png`、`icon.png` 等）
  - `programmatic` TR-3.2: 检查 `docs/assets/img` 目录中是否不包含已在雪碧图中的图标（如 `play_Default.png`、`stop_Default.png` 等）
- **Notes**: 需要确保图标文件的命名一致性

### [x] 任务 4: 测试构建流程
- **Priority**: P1
- **Depends On**: Task 1, Task 2, Task 3
- **Description**:
  - 运行完整的构建流程
  - 验证所有文件是否正确生成和复制
  - 检查构建产物是否符合预期
- **Success Criteria**:
  - 构建过程无错误
  - 构建产物包含所有必要的文件
  - 雪碧图和CSS文件正确生成
- **Test Requirements**:
  - `programmatic` TR-4.1: 运行 `npm run build` 后检查是否有错误信息
  - `programmatic` TR-4.2: 检查 `docs/assets/img` 目录结构是否正确
  - `programmatic` TR-4.3: 检查 `docs/assets/css` 目录是否包含 `sprite-generated.css` 文件
- **Notes**: 测试时应清空 `docs` 目录，确保从头开始构建

### [x] 任务 5: 验证CSS样式集成
- **Priority**: P1
- **Depends On**: Task 4
- **Description**:
  - 验证生成的CSS样式是否正确
  - 确保CSS中引用的雪碧图路径正确
  - 检查样式类名是否符合预期
- **Success Criteria**:
  - CSS文件中的样式规则正确
  - 雪碧图路径引用正确
  - 样式类名生成正确
- **Test Requirements**:
  - `programmatic` TR-5.1: 检查 `sprite-generated.css` 文件内容是否正确
  - `human-judgement` TR-5.2: 检查CSS类名是否符合命名规范
- **Notes**: 可以手动查看生成的CSS文件内容

## 实施步骤

1. 首先修改 `generate-sprite.py` 脚本，更新图标源目录
2. 然后修改 `vite.config.js`，添加雪碧图生成步骤
3. 实现智能图标复制逻辑
4. 运行构建测试，验证所有功能
5. 检查CSS样式集成情况

## 预期结果

- 构建产物中只包含雪碧图文件，不包含原始图标文件
- 未包含在雪碧图中的图标会被正确复制
- 生成的CSS样式能够正确引用雪碧图
- 构建流程无错误