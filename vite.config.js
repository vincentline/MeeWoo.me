import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue2'
import { resolve } from 'path'

export default defineConfig({
  // 基础路径
  base: '/',
  // 构建输出
  build: {
    outDir: 'docs',         // 输出到docs目录，与现有发布脚本匹配
    assetsDir: 'assets',     // 静态资源目录
    minify: 'terser',        // 代码压缩
    sourcemap: false,        // 生产环境关闭sourcemap
    // 多页应用配置
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'src/index.html'),
        pngCompression: resolve(__dirname, 'gadgets/png_compression.html'),
        fixGarbledText: resolve(__dirname, 'gadgets/fix_garbled_text.html'),
        sthAuto: resolve(__dirname, 'src/sth_auto.html')
      }
    }
  },
  // 开发服务器
  server: {
    port: 3000,
    open: true
  },
  // 插件
  plugins: [
    vue()
  ],
  // 别名配置
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  }
})