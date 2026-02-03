# MeeWoo项目构建化改造方案

## 一、项目现状分析

### 1. 项目结构
- **主技术栈**：Vue 2
- **当前运行方式**：静态文件部署，通过CDN引入核心依赖
- **目录结构**：
  - `docs/`：项目根目录，包含所有静态文件
  - `docs/assets/`：静态资源目录
    - `js/`：JavaScript代码（已模块化拆分）
    - `css/`：样式文件
    - `img/`：图片资源
  - `docs/gadgets/`：工具页面

### 2. 核心依赖
- Vue 2
- SVGA Web Player
- gif.js
- ffmpeg.wasm
- lottie-web
- 其他工具库

### 3. 现有问题
- CDN依赖管理不规范
- 代码优化受限
- 开发体验一般
- 资源引用路径管理复杂

## 二、构建方案设计

### 1. 构建工具选择
**推荐使用 Vite**，理由：
- 对Vue 2支持良好（通过@vitejs/plugin-vue2插件）
- 开发服务器启动速度极快
- 热更新响应迅速
- 配置简洁
- 内置代码压缩、Tree Shaking等优化

### 2. 项目结构调整

#### 2.1 新建目录结构
```
├── src/                 # 源代码目录
│   ├── assets/          # 静态资源
│   │   ├── css/         # 样式文件
│   │   ├── img/         # 图片资源
│   │   └── js/          # JavaScript代码
│   ├── components/      # Vue组件
│   ├── controllers/     # 控制器
│   ├── service/         # 服务
│   ├── utils/           # 工具函数
│   ├── main.js          # 入口文件
│   └── index.html       # 主页面模板
├── gadgets/             # 工具页面
│   ├── png_compression.html
│   └── fix_garbled_text.html
├── docs/                # 构建输出目录（保持不变）
├── vite.config.js       # Vite配置文件
├── package.json         # 依赖管理
└── .gitignore           # Git忽略文件
```

#### 2.2 迁移策略
1. **核心代码迁移**：将`docs/assets/js`下的模块化代码迁移到`src/`对应目录
2. **样式文件迁移**：将`docs/assets/css`迁移到`src/assets/css`
3. **图片资源迁移**：将`docs/assets/img`迁移到`src/assets/img`
4. **HTML页面迁移**：
   - `docs/index.html` → `src/index.html`
   - `docs/gadgets/` → `gadgets/`（保持独立）

### 3. 构建配置

#### 3.1 Vite配置文件
```js
// vite.config.js
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
```

#### 3.2 依赖管理
**创建新的package.json**：
```json
{
  "name": "meewoo",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "vue": "^2.7.15",
    "svgaplayerweb": "^2.0.0",
    "gif.js": "^0.2.0",
    "@ffmpeg/ffmpeg": "^0.11.6",
    "lottie-web": "^5.12.2",
    "howler": "^2.2.3",
    "konva": "^9.3.6"
  },
  "devDependencies": {
    "@vitejs/plugin-vue2": "^2.3.1",
    "vite": "^5.0.10",
    "terser": "^5.19.2"
  }
}
```

### 4. 代码改造

#### 4.1 入口文件改造
**创建src/main.js**：
```js
// 引入Vue
import Vue from 'vue'
// 引入主应用
import App from './App.vue'
// 引入全局样式
import './assets/css/styles.css'
import './assets/css/sprite-generated.css'
import './assets/css/drawer.css'
import './assets/css/panel.css'

// 初始化应用
new Vue({
  el: '#app',
  render: h => h(App)
})
```

#### 4.2 主应用改造
**创建src/App.vue**：
- 将index.html中的Vue模板内容迁移到App.vue
- 保持原有组件结构和逻辑

#### 4.3 模块导入改造
- 将原有的`<script src="..."></script>`引用改为ES模块导入
- 例如：
  ```js
  // 改造前
  <script src="assets/js/service/library-loader.js"></script>
  
  // 改造后
  import libraryLoader from './service/library-loader.js'
  ```

#### 4.4 资源路径改造
- 使用相对路径或别名引用资源
- 例如：
  ```js
  // 改造前
  :src="./assets/img/home_more.png"
  
  // 改造后
  :src="@/assets/img/home_more.png"
  ```

### 5. 雪碧图处理
- 保持现有`sprite-generated.css`文件不变
- 确保构建过程中正确处理雪碧图引用路径
- 配置Vite的静态资源处理，确保图片路径正确

## 三、构建流程设计

### 1. 开发流程
1. **安装依赖**：`npm install`
2. **启动开发服务器**：`npm run dev`
3. **开发调试**：使用热更新进行开发

### 2. 构建流程
1. **执行构建**：`npm run build`
2. **构建输出**：构建结果输出到`docs`目录
3. **发布部署**：使用现有发布脚本`python publish-gh-pages-final.py`

### 3. 验证流程
1. **构建后检查**：
   - 检查所有HTML页面的资源引用是否正确
   - 检查JS/CSS文件是否被正确压缩
   - 检查图片等静态资源是否正确处理
2. **功能验证**：
   - 验证所有功能模块是否正常工作
   - 验证动画预览、格式转换等核心功能
   - 验证工具页面是否正常访问

## 四、预期效果

### 1. 性能提升
- **加载速度**：通过代码压缩、Tree Shaking等优化，减少文件体积
- **执行效率**：合并JS文件，减少HTTP请求
- **缓存优化**：生成带哈希的文件名，优化浏览器缓存

### 2. 开发体验改善
- **热更新**：开发过程中实时预览修改效果
- **模块化**：使用ES模块系统，代码组织更清晰
- **依赖管理**：通过package.json统一管理依赖版本

### 3. 维护性提升
- **代码结构**：更加规范的项目结构
- **依赖管理**：避免CDN依赖的不稳定性
- **构建配置**：集中管理构建配置，便于后续调整

## 五、注意事项

1. **雪碧图路径**：确保构建过程中不破坏现有雪碧图引用
2. **资源路径**：仔细检查所有资源引用路径，确保构建前后都能正确访问
3. **依赖兼容性**：确保所有依赖版本兼容Vue 2
4. **发布流程**：保持与现有发布脚本的兼容性
5. **浏览器兼容性**：配置Vite的构建选项，确保兼容目标浏览器

## 六、实施步骤

1. **准备工作**：创建Git分支，备份现有代码
2. **初始化Vite**：创建vite.config.js和package.json
3. **目录迁移**：将现有代码迁移到src目录
4. **代码改造**：修改模块导入和资源引用
5. **配置调整**：根据实际情况调整构建配置
6. **构建测试**：执行构建并验证结果
7. **功能验证**：测试所有核心功能
8. **发布部署**：使用现有脚本发布到gh-pages

通过以上方案，MeeWoo项目将完成从静态文件部署到构建化部署的转变，提升开发效率和运行性能，同时保持与现有发布流程的兼容性。