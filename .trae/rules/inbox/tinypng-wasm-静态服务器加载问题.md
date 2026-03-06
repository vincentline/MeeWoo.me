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
