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


## TinyPNG-WASM-静态服务器加载问题 (Merged)

# TinyPNG-WASM-静态服务器加载问题
> Tags: wasm,esm,tinypng
> Created: 2026-03-07

# TinyPNG WASM 在静态服务器上的加载问题

## 问题描述
TinyPNG 压缩功能在 Vite 开发服务器（4000端口）正常工作，但在静态文件服务器（8085端口）上失败。

## 根本原因

### 1. ESM 模块路径问题
Vite 配置的别名路径（如 `tinypng-lib`、`tinypng-lib-wasm`）只在开发服务器有效，静态服务器无法解析。

```javascript
// 错误：Vite 别名路径
import TinyPNG from 'tinypng-lib';
import { ImagequantImage, Imagequant } from 'tinypng-lib-wasm';

// 正确：相对路径
import TinyPNG from '../../libs/tinypng-lib/index.js';
import { ImagequantImage, Imagequant } from '../tinypng-lib-wasm/tinypng_lib_wasm.js';
```

### 2. WASM 导入对象缺失
wasm-bindgen 生成的 WASM 模块需要特定的导入对象：

```javascript
// 错误：空导入对象
const wasmResult = await WebAssembly.instantiate(wasmBuffer, {});

// 正确：包含必需的导入函数
const importObject = {
    './tinypng_lib_wasm_bg.js': {
        __wbindgen_error_new: __wbindgen_error_new,
        __wbindgen_throw: __wbindgen_throw
    }
};
const wasmResult = await WebAssembly.instantiate(wasmBuffer, importObject);
```

### 3. 导出名称不匹配
`tinypng-lib` 期望导入 `wasmPromise`，但 `tinypng_lib_wasm.js` 导出的是 `initPromise`。

## 解决方案

修改 `tinypng_lib_wasm.js`：

```javascript
import { __wbg_set_wasm, __wbindgen_error_new, __wbindgen_throw } from "./tinypng_lib_wasm_bg.js";

let wasmExports = null;
let wasmPromise = null;

async function loadWasm() {
    if (wasmExports) return wasmExports;
    
    const wasmPath = new URL('./tinypng_lib_wasm_bg.wasm', import.meta.url).href;
    const response = await fetch(wasmPath);
    const wasmBuffer = await response.arrayBuffer();
    
    const importObject = {
        './tinypng_lib_wasm_bg.js': {
            __wbindgen_error_new: __wbindgen_error_new,
            __wbindgen_throw: __wbindgen_throw
        }
    };
    
    const wasmResult = await WebAssembly.instantiate(wasmBuffer, importObject);
    wasmExports = wasmResult.instance.exports;
    __wbg_set_wasm(wasmExports);
    
    return wasmExports;
}

wasmPromise = loadWasm();

export async function init() { await wasmPromise; }
export { wasmPromise };
export * from "./tinypng_lib_wasm_bg.js";
```

## 关键发现

1. **wasm-bindgen 生成的 WASM 需要导入 JS 函数**：检查 `*_bg.js` 文件中的导出函数，这些函数需要作为导入对象传递给 WASM。

2. **静态服务器无法解析 Vite 别名**：所有 ESM 导入必须使用相对路径。

3. **`import.meta.url` 可用于动态定位 WASM 文件**：`new URL('./xxx.wasm', import.meta.url).href`

## 相关文件
- `src/assets/js/libs/tinypng-lib-wasm/tinypng_lib_wasm.js`
- `src/assets/js/libs/tinypng-lib/index.js`
- `src/assets/js/service/tinypng/index.js`

