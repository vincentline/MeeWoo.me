import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue2'
import wasm from "vite-plugin-wasm";
import topLevelAwait from "vite-plugin-top-level-await";
import { resolve } from 'path'
import { copyFileSync, existsSync, mkdirSync, cpSync, rmSync } from 'fs'
import { execSync } from 'child_process'
import * as fs from 'fs'

// 复制静态文件到构建目录
function copyStaticFiles() {
  console.log('=== Starting to copy static files ===')
  
  try {
    // 先创建必要的目录结构
    const docsDir = resolve(process.cwd(), 'docs')
    const assetsDir = resolve(docsDir, 'assets')
    const jsDir = resolve(assetsDir, 'js')
    const libDir = resolve(assetsDir, 'lib')
    const imgDir = resolve(assetsDir, 'img')
    const cssDir = resolve(assetsDir, 'css')
    const gadgetsDir = resolve(docsDir, 'gadgets')
    
    // 创建目录
    mkdirSync(docsDir, { recursive: true })
    mkdirSync(assetsDir, { recursive: true })
    mkdirSync(jsDir, { recursive: true })
    mkdirSync(libDir, { recursive: true })
    mkdirSync(imgDir, { recursive: true })
    mkdirSync(cssDir, { recursive: true })
    mkdirSync(gadgetsDir, { recursive: true })
    console.log('Created directory structure')
    
    // 生成雪碧图
    console.log('=== Generating sprite image ===')
    try {
      execSync('python generate-sprite.py', { stdio: 'inherit' })
      console.log('Sprite image generated successfully')
    } catch (error) {
      console.warn('Error generating sprite image:', error.message)
    }
    
    // 复制JavaScript文件
    const jsSource = resolve(__dirname, 'src/assets/js')
    if (existsSync(jsSource)) {
      cpSync(jsSource, jsDir, { recursive: true })
      console.log('Copied JavaScript files')
    }
    
    // 复制lib目录
    const libSource = resolve(__dirname, 'src/assets/lib')
    if (existsSync(libSource)) {
      cpSync(libSource, libDir, { recursive: true })
      console.log('Copied lib files')
    }
    
    // img目录的复制由copy-static.py脚本处理
    // 该脚本会智能过滤掉已包含在雪碧图中的图标
   
    // 复制gadgets目录
    const gadgetsSource = resolve(__dirname, 'src/gadgets')
    if (existsSync(gadgetsSource)) {
      cpSync(gadgetsSource, gadgetsDir, { recursive: true })
      console.log('Copied gadgets directory')
    }
    
    console.log('=== Static files copied successfully ===')
  } catch (error) {
    console.error('Error copying static files:', error.message)
  }
}

export default defineConfig({
  //豆包叫我加root属性
  root: resolve(__dirname, 'src'),

  // 基础路径
  base: '/',
  // 构建输出
  build: {
    outDir: '../docs',         // 输出到docs目录，与现有发布脚本匹配
    assetsDir: 'assets',     // 静态资源目录
    minify: 'terser',        // 代码压缩
    sourcemap: false,        // 生产环境关闭sourcemap
    emptyOutDir: true,       // 构建前清空输出目录
    // 多页应用配置
    rollupOptions: {
      input: {
        index: resolve(__dirname, 'src', 'index.html'),
        '404': resolve(__dirname, 'src', '404.html'),
        'gadgets/fix_garbled_text': resolve(__dirname, 'src', 'gadgets/fix_garbled_text.html'),
        'gadgets/png_compression': resolve(__dirname, 'src', 'gadgets/png_compression.html'),
        'gadgets/avatar-icon': resolve(__dirname, 'src', 'gadgets/avatar-icon/index.html')
      }
    }
  },
  // 开发服务器
  server: {
    port: 4000,
    open: true,
    host: true,
    // 添加CORS头，允许Worker脚本加载
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Cross-Origin-Embedder-Policy': 'require-corp',
      'Cross-Origin-Opener-Policy': 'same-origin',
      // 允许Worker脚本在COEP环境下加载
      'Cross-Origin-Resource-Policy': 'cross-origin'
    },
    // 允许访问的文件系统路径
    fs: {
      allow: ['.', '../docs']
    }
  },
  // 优化配置
  optimizeDeps: {
    include: ['vue'],
    exclude: ['tinypng-lib-wasm', 'tinypng-lib']
  },
  // 预览服务器配置
  preview: {
    port: 4000,
    open: true,
    host: true
  },
  // 插件
  plugins: [
    wasm(),
    topLevelAwait(),
    vue(),
    // 为所有资源添加CORP响应头（解决COEP策略下的加载问题）
    {
      name: 'cors-headers-middleware',
      configureServer(server) {
        // 使用 use() 注册中间件，确保在所有请求前执行
        server.middlewares.use((req, res, next) => {
          // 为所有 JS、WASM 文件添加 CORP 头，确保能在 COEP 环境下被加载
          // 特别是 Worker 脚本和动态加载的库文件
          const url = req.url || '';
          if (url.includes('.js') || url.includes('.wasm') || url.includes('.worker')) {
            res.setHeader('Cross-Origin-Resource-Policy', 'same-origin');
          }
          next();
        });
      }
    },
    // 处理雪碧图路径的中间件
    {
      name: 'sprite-image-middleware',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          const url = req.url || '';
          // 处理 /img/ 路径的请求，代理到 docs/assets/img/
          if (url.startsWith('/img/')) {
            const filePath = resolve(__dirname, 'docs', 'assets', 'img', url.substring('/img/'.length));
            if (fs.existsSync(filePath)) {
              // 使用 fs.readFile 读取文件并发送
              fs.readFile(filePath, (err, data) => {
                if (err) {
                  next();
                  return;
                }
                // 根据文件扩展名设置 Content-Type
                if (filePath.endsWith('.png')) {
                  res.setHeader('Content-Type', 'image/png');
                } else if (filePath.endsWith('.json')) {
                  res.setHeader('Content-Type', 'application/json');
                }
                res.end(data);
              });
              return;
            }
          }
          next();
        });
      }
    }
  ],
  // 别名配置
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      'tinypng-lib': resolve(__dirname, 'src/assets/js/libs/tinypng-lib/index.js'),
      'tinypng-lib-wasm': resolve(__dirname, 'src/assets/js/libs/tinypng-lib-wasm/tinypng_lib_wasm.js'),
      'compressorjs': resolve(__dirname, 'src/assets/js/libs/compressorjs/dist/compressor.esm.js')
    }
  }
})
