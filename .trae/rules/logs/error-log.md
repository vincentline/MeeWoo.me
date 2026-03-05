### [2026-03-06] Vite WASM 集成错误

- **上下文**: 在开发环境引入 `tinypng-lib-wasm` 时，页面加载报错
- **错误信息**:
  ```
  [vite] Internal server error: "ESM integration proposal for Wasm" is not supported currently. 
  Use vite-plugin-wasm or other community plugins to handle this.
  ```
- **根本原因**: Vite 默认不支持 ESM 方式直接导入 WASM 模块。
- **解决方案**:
  1. 安装插件: `npm i -D vite-plugin-wasm vite-plugin-top-level-await`
  2. 配置 `vite.config.js`:
     ```javascript
     import wasm from "vite-plugin-wasm";
     import topLevelAwait from "vite-plugin-top-level-await";
     
     export default defineConfig({
       plugins: [wasm(), topLevelAwait()],
       optimizeDeps: {
         exclude: ['tinypng-lib-wasm', 'tinypng-lib'] // 关键：排除依赖优化
       }
     });
     ```
- **预防措施**: 引入任何 WASM 库时，优先检查 Vite 插件配置，并将其排除在 `optimizeDeps` 之外。

### [2026-03-06] TinyPNG WASM 参数越界错误

- **上下文**: 调用 `ImageCompressionService` 压缩图片时，控制台报错
- **错误信息**:
  ```
  TinyPNG compression error: Error: VALUE_OUT_OF_RANGE
  at __wbindgen_error_new (tinypng_lib_wasm_bg.js:282:17)
  ```
- **根本原因**: 传入的 `minimumQuality` 大于 `quality`，或者参数未做边界检查（例如传入了负数或大于100的值）。TinyPNG 的 WASM 模块对此非常敏感。
- **解决方案**: 在 JS 层添加严格的参数校验和自动修正逻辑：
  ```javascript
  let quality = Math.max(0, Math.min(100, options.quality || 80));
  let minimumQuality = Math.max(0, Math.min(100, options.minimumQuality || 30));
  if (minimumQuality > quality) minimumQuality = Math.floor(quality / 2);
  ```
- **预防措施**: 对于所有 WASM 模块的调用，必须在 JS 层进行严格的输入参数校验，避免直接将未验证的数据传给 WASM。
