---
module_name: Vite
type: guide
description: Vite 构建工具配置与优化指南
version: 1.0.0
---

# Vite 操作指南 (How-to Guide)

> **目标**: 提供 Vite 构建工具的完整配置指南，包括项目配置、多页应用、开发服务器、静态资源管理、构建优化、性能优化、插件使用和常见问题排查

## 1. 前置条件 (Prerequisites)
- **环境**: Node.js >= 16
- **权限**: 网络访问权限（用于安装依赖）
- **知识**: 基础前端开发知识，了解 npm/yarn 包管理

## 2. 操作步骤 (Step-by-Step)

### Step 1: 项目配置
Vite 项目配置是前端构建的基础，通过合理配置可以提高开发效率和构建性能。

```javascript
// vite.config.js 示例
import { defineConfig } from 'vite'

export default defineConfig({
  root: './src',
  base: '/app/',
  resolve: {
    alias: {
      '@': '/src'
    }
  },
  build: {
    outDir: '../dist'
  }
})
```

### Step 2: 多页应用配置
Vite 支持多页应用配置，通过配置 build.rollupOptions.input 可以指定多个入口页面。

```javascript
// vite.config.js 多页应用配置示例
import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: './index.html',
        tool: './tool.html'
      }
    }
  }
})
```

### Step 3: 开发服务器配置
配置 Vite 的开发服务器，包括端口、CORS 头、Worker 脚本支持等。

```javascript
// vite.config.js 开发服务器配置示例
import { defineConfig } from 'vite'

export default defineConfig({
  server: {
    port: 3000,
    headers: {
      'Cross-Origin-Embedder-Policy': 'require-corp',
      'Cross-Origin-Opener-Policy': 'same-origin'
    }
  }
})
```

### Step 4: 静态资源管理
管理 Vite 项目的静态资源，包括复制静态文件、资源压缩等。

```javascript
// vite.config.js 静态资源配置示例
import { defineConfig } from 'vite'

export default defineConfig({
  publicDir: 'public',
  build: {
    assetsDir: 'assets',
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true
      }
    }
  }
})
```

### Step 5: 构建优化
优化 Vite 的构建过程，包括代码压缩、sourcemap 配置等。

```javascript
// vite.config.js 构建优化配置示例
import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    sourcemap: true,
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    },
    chunkSizeWarningLimit: 1000
  }
})
```

### Step 6: 性能优化
优化 Vite 项目的运行性能，包括代码分割、预构建等。

```javascript
// vite.config.js 性能优化配置示例
import { defineConfig } from 'vite'

export default defineConfig({
  optimizeDeps: {
    include: ['vue', 'vue-router'],
    exclude: ['some-large-library']
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['vue', 'vue-router'],
          common: ['lodash']
        }
      }
    }
  }
})
```

### Step 7: 插件使用
使用和配置 Vite 插件，包括 Vue 插件和自定义插件。

```javascript
// vite.config.js 插件配置示例
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [
    vue(),
    // 自定义插件示例
    {
      name: 'my-plugin',
      transform(code, id) {
        if (id.endsWith('.vue')) {
          return code.replace(/\/\/ TODO/g, '// FIXME')
        }
      }
    }
  ]
})
```

## 3. 验证方法 (Verification)
- 运行 `npm run dev` 启动开发服务器，确认服务正常运行
- 运行 `npm run build` 执行构建，确认构建成功且无错误
- 检查构建产物目录，确认文件结构正确
- 测试应用功能，确认所有功能正常

## 4. 常见问题 (Troubleshooting)

### Q1: Vite 启动失败
- **原因**: 端口被占用或配置错误
- **解法**: 检查端口占用情况，修改配置文件中的端口设置

### Q2: Worker 脚本加载失败
- **原因**: CORS 策略限制
- **解法**: 在开发服务器配置中添加正确的 CORS 头

### Q3: 构建错误
- **原因**: 代码语法错误或依赖问题
- **解法**: 检查错误信息，修复代码问题或更新依赖

### Q4: 热更新不生效
- **原因**: 文件路径配置错误或缓存问题
- **解法**: 检查文件路径配置，清除浏览器缓存

## 5. 参考链接 (References)
- [Vite 官方文档](https://vitejs.cn/vite3-cn/guide/)
- [Vite 配置选项](https://vitejs.cn/vite3-cn/config/)
- [Vite 插件系统](https://vitejs.cn/vite3-cn/plugins/)
- [Vite 性能优化](https://vitejs.cn/vite3-cn/guide/performance.html)
- [Vite GitHub 仓库](https://github.com/vitejs/vite)