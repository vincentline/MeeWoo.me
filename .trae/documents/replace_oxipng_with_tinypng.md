# 替换 Oxipng 为 Tinypng-lib 方案计划

## 1. 准备工作 (Preparation)

由于要求本地引用且不使用 CDN，我们需要手动下载 `tinypng-lib` 及其依赖项。

* [ ] **下载依赖**: 在临时目录中使用 npm 下载以下包：

  * `tinypng-lib` (主库)

  * `tinypng-lib-wasm` (核心 WASM 依赖)

  * `compressorjs` (依赖的 JS 库)

* [ ] **提取文件**: 将上述包的 `dist` 或源码文件提取到项目的本地库目录 `src/assets/js/libs/` 下：

  * `src/assets/js/libs/tinypng-lib/`

  * `src/assets/js/libs/tinypng-lib-wasm/`

  * `src/assets/js/libs/compressorjs/`

* [ ] **清理**: 删除临时下载目录。

## 2. 配置 Vite 别名 (Configuration)

为了确保库内部的引用（如 `import ... from "tinypng-lib-wasm"`）能正确解析到本地文件，我们需要配置 Vite 别名。

* [ ] **修改** **`vite.config.js`**:

  * 添加 `resolve.alias` 配置，将包名映射到本地路径：

    * `'tinypng-lib'`: path.resolve(\_\_dirname, 'src/assets/js/libs/tinypng-lib/index.js')

    * `'tinypng-lib-wasm'`: path.resolve(\_\_dirname, 'src/assets/js/libs/tinypng-lib-wasm/tinypng\_lib\_wasm.js')

    * `'compressorjs'`: path.resolve(\_\_dirname, 'src/assets/js/libs/compressorjs/dist/compressor.esm.js') (需要确认具体路径)

## 3. 服务集成 (Service Integration)

创建新的 Tinypng 服务适配器，并替换原有的 Oxipng 逻辑。

* [ ] **创建适配器**: 新建 `src/assets/js/service/tinypng/index.js`

  * 引入 `tinypng-lib`。

  * 实现 `compress(data, options)` 方法：

    * 输入：`Uint8Array` (原始数据)

    * 处理：将 `Uint8Array` 转换为 `File` 对象，调用 `TinyPNG.compress`。

    * 输出：将返回的 `Blob/ArrayBuffer` 转回 `Uint8Array`。

  * 确保处理好异步逻辑和错误捕获。

* [ ] **替换服务**: 修改 `src/assets/js/service/image-compression-service.js`

  * 移除 `oxipng` 相关的导入和初始化代码。

  * 引入新的 `tinypng` 适配器。

  * 将 `compressWithOxipng` 逻辑替换为 `compressWithTinyPNG`。

  * 保持原有的降级逻辑（Pako -> Browser Default），但根据要求，应优先解决 Tinypng 的问题而不是直接降级。

  * 调整 `init` 方法以适配 Tinypng 的加载（如果需要）。

## 4. 验证与优化 (Verification)

* [ ] **验证 WASM 加载**: 确保 `tinypng-lib-wasm` 的 `.wasm` 文件能被 Vite 正确服务和加载。

* [ ] **功能测试**: 编写或运行测试脚本，验证压缩功能是否正常，输出文件是否有效且变小。

* [ ] **错误处理**: 确保在不同异常情况下（如 WASM 加载失败）有明确的报错或恢复机制。

## 5. 风险与对策

* **WASM 加载问题**: 如果 Vite 无法直接处理 `tinypng-lib-wasm` 的导入，可能需要使用 `vite-plugin-wasm` 或手动调整加载逻辑。

* **依赖解析**: 确保 `compressorjs` 能被正确解析，避免 `tinypng-lib` 内部引用报错。

