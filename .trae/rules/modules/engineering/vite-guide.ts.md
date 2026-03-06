# Vite 开发指南 (Vite Development Guide)

```typescript
/**
 * Vite 项目配置与开发规范
 * Vite Project Configuration and Development Standards
 */
export interface ViteGuide {
  /**
   * 项目配置
   * @description 基于项目实际配置的Vite设置
   */
  projectConfig: {
    /** 根目录: src */
    root: "src";
    /** 基础路径: / */
    base: "/";
    /** 别名配置 */
    alias: {
      "@": "src";
      "tinypng-lib": "src/assets/js/libs/tinypng-lib/index.js";
      "tinypng-lib-wasm": "src/assets/js/libs/tinypng-lib-wasm/tinypng_lib_wasm.js";
    };
  };

  /**
   * 构建配置
   * @description 生产环境构建策略
   */
  build: {
    /** 输出目录: ../docs */
    outDir: "../docs";
    /** 静态资源目录: assets */
    assetsDir: "assets";
    /** 代码压缩: terser */
    minify: "terser";
    /** 关闭 sourcemap */
    sourcemap: false;
    /** 多页应用入口 */
    input: {
      index: "src/index.html";
      notFound: "src/404.html";
      gadgets: ["fix_garbled_text", "png_compression"];
    };
  };

  /**
   * 开发服务器
   * @description 本地开发环境配置
   */
  devServer: {
    port: 4000;
    /** 跨域隔离策略 (COOP/COEP) 以支持 WASM/Worker */
    headers: {
      "Cross-Origin-Embedder-Policy": "require-corp";
      "Cross-Origin-Opener-Policy": "same-origin";
    };
  };

  /**
   * 静态资源
   * @description 资源处理策略
   */
  assets: {
    /** 雪碧图生成: generate-sprite.py */
    spriteGeneration: boolean;
    /** 静态文件复制: copyStaticFiles() */
    staticCopy: boolean;
  };
}
```

## 1. 核心配置 (Core Configuration)

### 1.1 项目结构
- **Root**: `src/` (所有源码位于 src 目录下)
- **Output**: `docs/` (构建产物输出到 docs 目录，适配 GitHub Pages)
- **Public**: 静态资源通过 `copyStaticFiles()` 函数在构建时从 `src/assets` 复制到 `docs/assets`。

### 1.2 多页应用 (MPA)
项目配置了多页应用模式，主要入口包括：
- `index.html`: 主应用入口
- `404.html`: 404 页面
- `gadgets/*.html`: 独立小工具页面 (如 PNG 压缩、乱码修复)

## 2. 关键特性 (Key Features)

### 2.1 WASM 与 Worker 支持
为了支持 `FFmpeg.wasm` 和 `TinyPNG` 等高性能计算库，开发服务器配置了严格的跨域隔离策略：
- **COEP**: `Cross-Origin-Embedder-Policy: require-corp`
- **COOP**: `Cross-Origin-Opener-Policy: same-origin`
- **CORP Middleware**: 自定义插件为所有 JS/WASM 资源添加 `Cross-Origin-Resource-Policy: same-origin` 响应头。

### 2.2 静态资源处理
- **雪碧图**: 构建时自动调用 `generate-sprite.py` 生成雪碧图。
- **资源复制**: 自定义 `copyStaticFiles` 函数负责将 `src/assets` 下的 lib, js, css 等资源精确复制到构建目录。

## 3. 常见问题 (Troubleshooting)

### 3.1 Worker 加载失败
- **现象**: 报错 `SharedArrayBuffer is not defined` 或 Worker 脚本加载被拦截。
- **解法**: 检查 `vite.config.js` 中的 `headers` 配置，确保 COEP/COOP 策略已启用。

### 3.2 依赖构建错误
- **现象**: `tinypng-lib-wasm` 构建报错。
- **解法**: 在 `optimizeDeps.exclude` 中排除 WASM 相关依赖，防止 Vite 尝试对其进行预构建。

## 4. 关联规则
- **工程化**: [knowledge-engine.ts.md](knowledge-engine.ts.md)
