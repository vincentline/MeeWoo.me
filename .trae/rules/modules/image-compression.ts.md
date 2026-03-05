# 图片压缩模块规范

## 概述
处理客户端图片压缩的模块，支持多种压缩策略和降级机制。
核心服务为 `ImageCompressionService`，目前主要集成 `TinyPNG` (WASM) 和 `Pako`。

## 核心接口

### ImageCompressionService (单例)
负责图片压缩的统一入口，自动选择最佳压缩策略。

```typescript
// namespace MeeWoo.Services
interface ImageCompressionService {
  /**
   * 初始化压缩服务
   * 动态加载 TinyPNG WASM 模块
   */
  init(): Promise<void>;

  /**
   * 压缩图片数据（主入口）
   * 自动识别文件类型并选择压缩策略
   * @param data 原始图片数据
   * @param quality 压缩质量 (0-100)
   */
  compressImage(data: Uint8Array, quality?: number): Promise<Uint8Array>;

  /**
   * 压缩 PNG 数据
   * 策略：TinyPNG (首选) -> Pako (降级) -> 浏览器默认 (兜底)
   */
  compressPNG(pngData: Uint8Array, quality?: number): Promise<Uint8Array>;

  /**
   * 从 Canvas 压缩
   */
  compressCanvas(canvas: HTMLCanvasElement, quality?: number): Promise<Uint8Array>;

  /**
   * 检查是否发生过降级
   */
  hasCompressionFailed(): boolean;
}
```

## TinyPNG 集成规范

### 1. 依赖管理
- **库**: `tinypng-lib` (基于 `tinypng-lib-wasm`)
- **文件位置**: `src/assets/js/libs/tinypng-lib/` 和 `src/assets/js/libs/tinypng-lib-wasm/`
- **加载方式**: 动态 `import()` 导入适配器，适配器内部调用库。

### 2. Vite 配置 (关键)
由于 `tinypng-lib` 使用了 WASM，Vite 开发环境需要特殊配置：

```javascript
// vite.config.js
import wasm from "vite-plugin-wasm";
import topLevelAwait from "vite-plugin-top-level-await";

export default defineConfig({
  plugins: [
    wasm(),
    topLevelAwait()
  ],
  optimizeDeps: {
    // 必须排除，否则 Vite 会尝试转换 WASM 导致报错
    exclude: ['tinypng-lib-wasm', 'tinypng-lib']
  }
});
```

### 3. 参数校验
TinyPNG 的 WASM 模块对参数非常敏感，必须在 JS 层进行严格校验：

```typescript
interface TinyPNGOptions {
  quality: number;        // 0-100
  minimumQuality: number; // 0-100, 且必须 <= quality
}

// 校验逻辑示例
let quality = Math.max(0, Math.min(100, options.quality || 80));
let minimumQuality = Math.max(0, Math.min(100, options.minimumQuality || 30));

if (minimumQuality > quality) {
    minimumQuality = Math.floor(quality / 2); // 自动修正
}
```

## 故障排查

| 错误信息 | 原因 | 解决方案 |
|---------|------|---------|
| `ESM integration proposal for Wasm is not supported` | Vite 未配置 WASM 插件 | 安装 `vite-plugin-wasm` 并配置 `optimizeDeps.exclude` |
| `VALUE_OUT_OF_RANGE` | TinyPNG 参数越界 | 检查 `quality` 和 `minimumQuality`，确保 `min <= max` |
| `TypeError: Failed to fetch dynamically imported module` | 依赖文件缺失或路径错误 | 检查 `vite.config.js` 的 `alias` 配置和文件路径 |
