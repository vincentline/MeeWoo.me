/**
 * WebP导出器模块
 * 使用 webpxmux.js 编码动画 WebP（支持透明背景，序列帧动画）
 * 
 * 使用方式：
 * WebPExporter.export({
 *   width: 300,
 *   height: 300,
 *   fps: 30,
 *   totalFrames: 60,
 *   getFrame: async (frameIndex) => canvas,  // 返回指定帧的canvas
 *   onProgress: (progress, stage, message) => {},
 *   onError: (error) => {},
 *   shouldCancel: () => false  // 返回true时取消导出
 * });
 */
(function(global) {
    'use strict';

    // Ensure namespace
    window.MeeWoo = window.MeeWoo || {};
    window.MeeWoo.Exporters = window.MeeWoo.Exporters || {};

    // webpxmux 实例缓存
    var xMuxInstance = null;
    var xMuxReady = false;

    var WebPExporter = {
        /**
         * 初始化 webpxmux
         * @returns {Promise} webpxmux实例
         */
        initWebPXMux: async function () {
            // 如果已初始化，直接返回
            if (xMuxInstance && xMuxReady) {
                return xMuxInstance;
            }

            // 检查webpxmux是否已加载
            if (typeof WebPXMux === 'undefined') {
                // 使用library-loader加载
                var libraryLoader = window.MeeWoo.Core.libraryLoader;
                if (libraryLoader) {
                    await libraryLoader.load(['webpxmux'], true);
                }
                
                // 再次检查
                if (typeof WebPXMux === 'undefined') {
                    throw new Error('WebPXMux 库加载失败');
                }
            }

            // 初始化webpxmux，传入wasm文件路径
            xMuxInstance = WebPXMux('assets/js/lib/webpxmux/webpxmux.wasm');
            
            // 等待运行时就绪
            await xMuxInstance.waitRuntime();
            xMuxReady = true;
            
            console.log('[WebP导出] webpxmux 初始化完成');
            return xMuxInstance;
        },

        /**
         * 将Canvas ImageData转换为Uint32Array (0xRRGGBBAA格式)
         * @param {ImageData} imageData Canvas ImageData
         * @returns {Uint32Array} RGBA数据
         */
        imageDataToRGBA: function (imageData) {
            var data = imageData.data;
            var pixelCount = imageData.width * imageData.height;
            var rgba = new Uint32Array(pixelCount);
            
            for (var i = 0; i < pixelCount; i++) {
                var r = data[i * 4];
                var g = data[i * 4 + 1];
                var b = data[i * 4 + 2];
                var a = data[i * 4 + 3];
                // webpxmux使用0xRRGGBBAA格式
                rgba[i] = (r << 24) | (g << 16) | (b << 8) | a;
            }
            
            return rgba;
        },

        /**
         * 导出动画WebP（使用webpxmux编码）
         * @param {Object} config 配置对象
         * @param {Number} config.width 宽度
         * @param {Number} config.height 高度
         * @param {Number} config.fps 帧率
         * @param {Number} config.totalFrames 总帧数
         * @param {Function} config.getFrame 获取帧的回调函数 (frameIndex) => canvas
         * @param {Function} config.onProgress 进度回调 (progress, stage, message)
         * @param {Function} config.onError 错误回调
         * @param {Function} config.shouldCancel 取消检查回调
         * @returns {Promise<Blob>} WebP文件Blob
         */
        export: async function (config) {
            var _this = this;

            // 参数校验
            if (!config.getFrame) throw new Error('缺少 getFrame 回调');
            if (!config.totalFrames || config.totalFrames <= 0) throw new Error('帧数无效');

            // 使用配置的参数
            var width = config.width || 300;
            var height = config.height || 300;
            var fps = config.fps || 30;
            var totalFrames = config.totalFrames;

            // 回调函数
            var onProgress = config.onProgress || function () { };
            var onError = config.onError || function () { };
            var shouldCancel = config.shouldCancel || function () { return false; };

            try {
                // 1. 初始化webpxmux
                onProgress(0, 'init', '初始化编码器...');
                var xMux = await this.initWebPXMux();

                if (shouldCancel()) throw new Error('导出已取消');

                // 2. 创建临时canvas用于缩放
                var tempCanvas = document.createElement('canvas');
                tempCanvas.width = width;
                tempCanvas.height = height;
                var tempCtx = tempCanvas.getContext('2d', {
                    willReadFrequently: true,
                    alpha: true
                });

                // 3. 逐帧捕获并转换为RGBA数据
                onProgress(0.05, 'capturing', '捕获帧数据...');
                var framesArray = [];
                var frameDuration = Math.round(1000 / fps); // 每帧时长（毫秒）

                for (var i = 0; i < totalFrames; i++) {
                    if (shouldCancel()) throw new Error('导出已取消');

                    // 获取当前帧的canvas
                    var frameCanvas = await config.getFrame(i);
                    if (!frameCanvas) {
                        console.warn('[WebP导出] 帧 ' + i + ' 获取失败，跳过');
                        continue;
                    }

                    // 清空canvas（透明背景）
                    tempCtx.clearRect(0, 0, width, height);
                    // 绘制到临时canvas（缩放，保留透明通道）
                    tempCtx.drawImage(frameCanvas, 0, 0, width, height);

                    // 获取ImageData并转换为RGBA
                    var imageData = tempCtx.getImageData(0, 0, width, height);
                    var rgba = _this.imageDataToRGBA(imageData);

                    // 添加帧数据
                    framesArray.push({
                        duration: frameDuration,
                        isKeyframe: i === 0, // 第一帧为关键帧
                        rgba: rgba
                    });

                    // 更新进度：捕获阶段 5%-60%
                    var captureProgress = 0.05 + (i / totalFrames) * 0.55;
                    onProgress(captureProgress, 'capturing', '捕获帧 ' + (i + 1) + '/' + totalFrames);
                }

                if (framesArray.length === 0) {
                    throw new Error('没有捕获到任何帧');
                }

                console.log('[WebP导出] 捕获完成，共 ' + framesArray.length + ' 帧');

                // 4. 构建Frames对象
                onProgress(0.6, 'encoding', '编码WebP动画...');
                var frames = {
                    frameCount: framesArray.length,
                    width: width,
                    height: height,
                    loopCount: 0,           // 0 = 无限循环
                    bgColor: 0x00000000,    // 透明背景 (0xRRGGBBAA)
                    frames: framesArray
                };

                if (shouldCancel()) throw new Error('导出已取消');

                // 5. 使用webpxmux编码动画WebP
                onProgress(0.7, 'encoding', '正在编码...');
                var webpData = await xMux.encodeFrames(frames);

                if (!webpData || webpData.length === 0) {
                    throw new Error('webpxmux编码失败，未生成输出数据');
                }

                // 6. 创建Blob并下载
                onProgress(0.9, 'downloading', '生成下载文件...');
                var blob = new Blob([webpData], { type: 'image/webp' });
                console.log('[WebP导出] 输出文件大小:', _this.formatBytes(blob.size));

                // 下载文件
                _this.download(blob, 'animation.webp');

                onProgress(1, 'completed', '导出完成');

                return blob;

            } catch (error) {
                console.error('[WebP导出] 导出失败:', error);
                onError(error);
                throw error;
            }
        },

        /**
         * 下载WebP文件
         * @param {Blob} blob WebP blob
         * @param {string} fileName 文件名
         */
        download: function (blob, fileName) {
            var url = URL.createObjectURL(blob);
            var a = document.createElement('a');
            a.href = url;
            a.download = fileName || 'animation.webp';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            
            // 使用定时器服务延迟释放 URL 对象
            if (window.MeeWoo && window.MeeWoo.Service && window.MeeWoo.Service.TimerService) {
                window.MeeWoo.Service.TimerService.createDelay(function () {
                    URL.revokeObjectURL(url);
                }, 100, 'webp-export');
            } else {
                // 降级方案：使用原生 setTimeout
                setTimeout(function () { URL.revokeObjectURL(url); }, 100);
            }
        },

        /**
         * 预估WebP文件大小
         * @param {Object} config 配置对象
         * @param {Number} config.width 宽度
         * @param {Number} config.height 高度
         * @param {Number} config.fps 帧率
         * @param {Number} config.duration 时长（秒）
         * @returns {Object} { totalFrames, totalBytes, fileSizeText }
         */
        estimate: function (config) {
            var width = config.width || 300;
            var height = config.height || 300;
            var fps = config.fps || 30;
            var duration = config.duration || 0;

            var totalFrames = Math.ceil(duration * fps);

            // WebP 压缩系数约 0.05（比 GIF 的 0.13 更小）
            // 实际大小取决于图像复杂度，这里是粗略估算
            var compressionFactor = 0.05;
            var bytesPerFrame = width * height * compressionFactor;
            var totalBytes = bytesPerFrame * totalFrames;

            return {
                totalFrames: totalFrames,
                totalBytes: totalBytes,
                fileSizeText: this.formatBytes(totalBytes)
            };
        },

        /**
         * 格式化字节数
         * @param {Number} bytes 字节数
         * @returns {String} 格式化后的字符串
         */
        formatBytes: function (bytes) {
            if (bytes === 0) return '0 B';
            var k = 1024;
            var sizes = ['B', 'KB', 'MB', 'GB'];
            var i = Math.floor(Math.log(bytes) / Math.log(k));
            return (bytes / Math.pow(k, i)).toFixed(2) + ' ' + sizes[i];
        }
    };

    // Export
    window.MeeWoo.Exporters.WebPExporter = WebPExporter;

})(window);
