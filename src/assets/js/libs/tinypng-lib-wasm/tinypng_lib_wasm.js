
import { __wbg_set_wasm, __wbindgen_error_new, __wbindgen_throw } from "./tinypng_lib_wasm_bg.js";

let wasmExports = null;
let wasmPromise = null;

async function loadWasm() {
    if (wasmExports) return wasmExports;
    
    const wasmPath = new URL('./tinypng_lib_wasm_bg.wasm', import.meta.url).href;
    const response = await fetch(wasmPath);
    
    if (!response.ok) {
        throw new Error(`Failed to load WASM: ${response.status}`);
    }
    
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

export async function init() {
    await wasmPromise;
}

export { wasmPromise };

export * from "./tinypng_lib_wasm_bg.js";
