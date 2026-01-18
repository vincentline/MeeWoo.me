# WASM 图片压缩集成方案

## 1. 方案概述

本方案旨在为 SVGA 预览工具引入 `libimagequant` (pngquant) 的 WASM 版本，实现高质量的 PNG 图片压缩，从而优化 SVGA 导出文件大小和内存占用。

## 2. 可行性分析

### 2.1 技术可行性

- ✅ **成熟的 WASM 库**：libimagequant 提供了稳定的 WASM 版本 (`pngquant-wasm`)
- ✅ **现有 WASM 基础设施**：项目已集成 `ffmpeg.wasm`，具备 WASM 模块加载和管理经验
- ✅ **清晰的集成点**：SVGA 构建流程中存在明确的 PNG 处理环节
- ✅ **浏览器兼容性**：现代浏览器均支持 WebAssembly

### 2.2 项目适配性

- ✅ **当前 SVGA 构建流程**：
  - `svga-builder.js` 负责将帧数据转换为 SVGA 文件
  - 已实现基础的图片压缩（缩放 + transform）
  - 存在 `_canvasToPNG` 方法，可作为压缩入口
- ✅ **多场景支持**：
  - MP4 转 SVGA
  - Lottie 转 SVGA  
  - 双通道 MP4 转 SVGA
  - 序列帧转 SVGA

### 2.3 预期收益

| 指标 | 当前状态 | 预期优化 |
|------|----------|----------|
| PNG 压缩率 | 中等（仅缩放） | 高（服务器级压缩） |
| SVGA 文件大小 | 较大 | 减少 30%-70% |
| 内存占用 | 较高 | 减少 20%-50% |
| 压缩速度 | 快 | 略慢但可接受 |

## 3. 架构设计

### 3.1 整体架构

```
┌──────────────────┐     ┌──────────────────┐     ┌──────────────────┐
│  原始帧数据      │     │  WASM 压缩服务   │     │  SVGA 构建器     │
│  (Canvas/PNG)    │────▶│  (libimagequant) │────▶│  (svga-builder)  │
└──────────────────┘     └──────────────────┘     └──────────────────┘
          ▲                         │                         ▼
          │                         │                  ┌──────────────────┐
          │                         │                  │  最终 SVGA 文件  │
          │                         │                  └──────────────────┘
          │                         │
          └─────────────────────────┘
                质量控制反馈
```

### 3.2 模块设计

#### 3.2.1 核心模块：ImageCompressionService

```javascript
/**
 * 图片压缩服务 - 使用 libimagequant (pngquant) WASM 版本
 */
window.MeeWoo.Services.ImageCompressionService = {
  // 初始化 WASM 模块
  init: async function() {},
  
  // 压缩 PNG 数据
  compressPNG: async function(pngData, quality) {},
  
  // 从 Canvas 压缩为 PNG
  compressCanvas: async function(canvas, quality) {},
  
  // 检查服务状态
  isReady: function() {}
};
```

#### 3.2.2 集成点设计

| 集成位置 | 文件 | 方法 | 作用 |
|----------|------|------|------|
| Canvas 转 PNG | svga-builder.js | _canvasToPNG | 压缩 Canvas 生成的 PNG 数据 |
| 直接 PNG 处理 | svga-builder.js | buildFromPNG | 压缩已有的 PNG 帧数据 |
| 素材替换 | material-editor.js | 相关方法 | 压缩替换的素材图片 |

## 4. 实现方案

### 4.1 依赖引入

1. **添加 libimagequant WASM 库**：
   - 从 CDN 或本地引入 `pngquant.wasm` 和 `pngquant.js`
   - 或使用 npm 包：`npm install pngquant-wasm`

2. **更新依赖管理**：
   - 在 `library-loader.js` 中添加 libimagequant 加载逻辑
   - 与其他 WASM 模块（如 ffmpeg）共享加载机制

### 4.2 核心实现

#### 4.2.1 ImageCompressionService 实现

```javascript
// image-compression-service.js
(function(global) {
    'use strict';
    
    window.MeeWoo = window.MeeWoo || {};
    window.MeeWoo.Services = window.MeeWoo.Services || {};
    
    const ImageCompressionService = {
        wasmModule: null,
        initialized: false,
        
        // 初始化 WASM 模块
        init: async function() {
            if (this.initialized) return;
            
            try {
                // 加载 WASM 模块
                this.wasmModule = await import('https://cdn.jsdelivr.net/npm/pngquant-wasm@1.0.0/+esm');
                this.initialized = true;
                console.log('ImageCompressionService initialized');
            } catch (error) {
                console.error('Failed to initialize ImageCompressionService:', error);
                this.initialized = false;
            }
        },
        
        // 检查服务是否就绪
        isReady: function() {
            return this.initialized && this.wasmModule;
        },
        
        // 压缩 PNG 数据
        compressPNG: async function(pngData, quality = 80) {
            if (!this.isReady()) {
                await this.init();
            }
            
            if (!this.isReady()) {
                // 降级处理：返回原始数据
                return pngData;
            }
            
            try {
                // 使用 libimagequant 压缩 PNG
                const compressedData = await this.wasmModule.compress(pngData, {
                    quality: [quality / 100, quality / 100],
                    speed: 4, // 平衡速度和压缩质量
                    strip: true
                });
                
                return compressedData;
            } catch (error) {
                console.error('PNG compression failed:', error);
                // 降级处理：返回原始数据
                return pngData;
            }
        },
        
        // 从 Canvas 压缩为 PNG
        compressCanvas: async function(canvas, quality = 80) {
            // 先将 Canvas 转换为 PNG Blob
            const blob = await new Promise(resolve => {
                canvas.toBlob(resolve, 'image/png');
            });
            
            // 读取 Blob 为 ArrayBuffer
            const arrayBuffer = await blob.arrayBuffer();
            const uint8Array = new Uint8Array(arrayBuffer);
            
            // 压缩 PNG 数据
            return await this.compressPNG(uint8Array, quality);
        }
    };
    
    window.MeeWoo.Services.ImageCompressionService = ImageCompressionService;
    
})(window);
```

#### 4.2.2 与 SVGA Builder 集成

```javascript
// 修改 svga-builder.js 中的 _canvasToPNG 方法
_canvasToPNG: async function (canvas, quality) {
    // 获取 Canvas 上下文
    var ctx = canvas.getContext('2d');
    // 获取图像数据
    var imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    
    // 创建临时 Canvas 用于 PNG 生成
    var tempCanvas = document.createElement('canvas');
    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height;
    var tempCtx = tempCanvas.getContext('2d');
    tempCtx.putImageData(imageData, 0, 0);
    
    // 转换为 PNG Blob
    var blob = await new Promise(function (resolve) {
        tempCanvas.toBlob(resolve, 'image/png');
    });
    
    // 读取 Blob 数据
    var arrayBuffer = await blob.arrayBuffer();
    var pngData = new Uint8Array(arrayBuffer);
    
    // 使用 WASM 压缩服务进行压缩
    if (window.MeeWoo && window.MeeWoo.Services && window.MeeWoo.Services.ImageCompressionService) {
        try {
            pngData = await window.MeeWoo.Services.ImageCompressionService.compressPNG(pngData, quality);
        } catch (e) {
            console.warn('PNG compression failed, using original:', e);
        }
    }
    
    return pngData;
}
```

### 4.3 配置与优化

#### 4.3.1 配置选项

在 `svga-builder.js` 中添加压缩配置：

```javascript
defaults: {
    protoPath: './svga.proto',
    quality: 80,
    fps: 30,
    pngCompression: {
        enabled: true,
        quality: 80,
        speed: 4
    }
}
```

#### 4.3.2 性能优化

- **异步加载**：WASM 模块按需加载，不阻塞主线程
- **降级机制**：压缩失败时自动返回原始数据
- **进度反馈**：在压缩过程中提供进度回调
- **缓存机制**：对相同输入的图片进行缓存，避免重复压缩

## 5. 测试与验证

### 5.1 测试场景

| 测试项 | 测试内容 | 预期结果 |
|--------|----------|----------|
| 基本功能 | 压缩单张 PNG 图片 | 图片质量保持，文件大小减少 |
| SVGA 导出 | MP4 转 SVGA | SVGA 文件大小明显减少 |
| 性能测试 | 压缩 100 张 PNG 图片 | 压缩速度可接受（< 2s） |
| 兼容性 | 主流浏览器测试 | 无兼容性问题 |
| 降级机制 | 模拟 WASM 加载失败 | 正常使用原始压缩方式 |

### 5.2 验证指标

- ✅ **文件大小减少**：SVGA 文件大小减少 30%-70%
- ✅ **质量保持**：压缩后图片质量无明显下降
- ✅ **内存占用优化**：减少 SVGA 播放时的内存占用
- ✅ **压缩速度**：单张图片压缩时间 < 50ms

## 6. 风险评估与应对

| 风险 | 概率 | 影响 | 应对措施 |
|------|------|------|----------|
| WASM 加载失败 | 低 | 功能降级 | 实现自动降级机制，使用原始压缩方式 |
| 压缩速度慢 | 中 | 用户体验 | 优化压缩参数，提供进度反馈 |
| 浏览器兼容性 | 低 | 功能不可用 | 针对旧浏览器提供降级方案 |
| 质量损失 | 低 | 视觉效果 | 提供压缩质量调节选项 |

## 7. 部署计划

### 7.1 开发阶段

1. **第一阶段**：集成 ImageCompressionService 基础框架
2. **第二阶段**：实现与 SVGA Builder 的集成
3. **第三阶段**：添加配置选项和进度反馈
4. **第四阶段**：进行全面测试和优化

### 7.2 发布阶段

1. **灰度发布**：先在部分环境测试
2. **全面发布**：验证稳定后全量发布
3. **监控**：收集用户反馈和性能数据

## 8. 结论

引入 `libimagequant` WASM 图片压缩方案是可行且有益的，能够显著优化 SVGA 导出文件大小和内存占用，提升用户体验。该方案与现有项目架构兼容性良好，实现风险可控，建议尽快实施。

## 9. 后续优化方向

1. **支持更多图片格式**：如 WebP 压缩
2. **智能压缩参数**：根据图片内容自动调整压缩质量
3. **批量压缩优化**：优化多张图片的批量压缩性能
4. **用户可调节选项**：在 UI 中提供压缩质量调节
5. **服务端压缩对比**：与服务端压缩方案进行对比，选择最优方案

---

**方案作者**：AI 助手  
**方案日期**：2026-01-19  
**适用版本**：SVGA 预览工具 v1.0+
