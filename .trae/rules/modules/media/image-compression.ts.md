# 图片压缩模块规范

/**
 * ImageCompressionRules
 * Auto-generated interface for legacy rule file.
 */
export interface ImageCompressionRules {
  description: string;
}

## 概述
处理客户端图片压缩的模块，使用 TinyPNG (tinypng-lib-wasm) 进行有损压缩。

## 核心接口

### ImageCompressionService (单例)
负责图片压缩的统一入口。

```typescript
interface ImageCompressionService {
  init(): Promise<void>;
  compressImage(data: Uint8Array, quality?: number): Promise<Uint8Array>;
  compressPNG(pngData: Uint8Array, quality?: number): Promise<Uint8Array>;
  compressCanvas(canvas: HTMLCanvasElement, quality?: number): Promise<Uint8Array>;
  isTinyPNGReady(): boolean;
  hasCompressionFailed(): boolean;
  getStats(): CompressionStats;
  resetStats(): void;
  printStatsSummary(): void;
}

interface CompressionStats {
  total: number;
  tinypngSuccess: number;
  tinypngFailed: number;
  originalBytes: number;
  compressedBytes: number;
  compressionRatio?: string;
  savedBytes?: number;
}
```

## 压缩策略

### 当前策略（简化版）
1. **首选**: TinyPNG 有损压缩（支持质量参数 0-100）
2. **降级**: 直接返回原始数据（图片已缩小，体积已减小）

### 已废弃的降级方案
- ~~Pako 压缩~~: 已移除，因为 Pako 只是无损重编码，不会减小体积
- ~~浏览器默认编码~~: 已移除，同上

## TinyPNG 集成规范

### 1. 依赖管理
- **库**: `tinypng-lib` (基于 `tinypng-lib-wasm`)
- **文件位置**: `src/assets/js/libs/tinypng-lib/` 和 `src/assets/js/libs/tinypng-lib-wasm/`
- **加载方式**: 动态 `import()` 导入适配器

### 2. Vite 配置
```javascript
import wasm from "vite-plugin-wasm";
import topLevelAwait from "vite-plugin-top-level-await";

export default defineConfig({
  plugins: [wasm(), topLevelAwait()],
  optimizeDeps: {
    exclude: ['tinypng-lib-wasm', 'tinypng-lib']
  }
});
```

### 3. 参数校验
```typescript
interface TinyPNGOptions {
  quality: number;        // 0-100
  minimumQuality: number; // 0-100, 且必须 <= quality
}

let quality = Math.max(0, Math.min(100, options.quality || 80));
let minimumQuality = Math.max(0, Math.min(100, options.minimumQuality || 30));

if (minimumQuality > quality) {
    minimumQuality = Math.floor(quality / 2);
}
```

## 日志输出

压缩服务会输出详细日志，便于排查问题：

```
[ImageCompression] TinyPNG 模块初始化成功
[ImageCompression] TinyPNG 压缩成功: 12345 → 6789 bytes (55.0%), 耗时 12.3ms
[ImageCompression] 压缩统计摘要:
  - 总处理图片: 10
  - TinyPNG 成功: 10
  - TinyPNG 失败: 0
  - 原始大小: 123.4 KB
  - 压缩后大小: 67.8 KB
  - 压缩率: 54.9%
  - 节省空间: 55.6 KB
```

## 故障排查

| 错误信息 | 原因 | 解决方案 |
|---------|------|---------|
| `ESM integration proposal for Wasm is not supported` | Vite 未配置 WASM 插件 | 安装 `vite-plugin-wasm` 并配置 `optimizeDeps.exclude` |
| `VALUE_OUT_OF_RANGE` | TinyPNG 参数越界 | 检查 `quality` 和 `minimumQuality`，确保 `min <= max` |
| `TypeError: Failed to fetch dynamically imported module` | 依赖文件缺失或路径错误 | 检查 `vite.config.js` 的 `alias` 配置和文件路径 |
| `[ImageCompression] TinyPNG 不可用，跳过压缩` | WASM 加载失败 | 检查控制台错误日志，确认 WASM 文件路径正确 |
