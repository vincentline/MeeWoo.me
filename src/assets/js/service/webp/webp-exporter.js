/**
 * WebP导出器模块
 * 使用 FFmpeg WASM 编码动画 WebP
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

    var WebPExporter = {
        /**
         * 导出动画WebP（使用FFmpeg编码）
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
            var quality = config.quality || 80; // WebP质量 1-100

            // 回调函数
            var onProgress = config.onProgress || function () { };
            var onError = config.onError || function () { };
            var shouldCancel = config.shouldCancel || function () { return false; };

            // 获取FFmpeg服务
            var FFmpegService = window.MeeWoo.Services.FFmpegService;
            if (!FFmpegService) {
                throw new Error('FFmpegService 未加载');
            }

            try {
                onProgress(0, 'init', '初始化编码器...');

                // 1. 确保FFmpeg已初始化
                if (!FFmpegService.getInstance().isLoaded) {
                    await FFmpegService.init();
                }

                if (shouldCancel()) throw new Error('导出已取消');

                // 2. 逐帧捕获并转为JPEG数据
                onProgress(0.05, 'capturing', '捕获帧数据...');
                var frameDataArray = [];

                // 创建临时canvas用于缩放
                var tempCanvas = document.createElement('canvas');
                tempCanvas.width = width;
                tempCanvas.height = height;
                var tempCtx = tempCanvas.getContext('2d', {
                    willReadFrequently: true,
                    alpha: true
                });

                for (var i = 0; i < totalFrames; i++) {
                    if (shouldCancel()) throw new Error('导出已取消');

                    // 获取当前帧的canvas
                    var frameCanvas = await config.getFrame(i);
                    if (!frameCanvas) {
                        console.warn('[WebP导出] 帧 ' + i + ' 获取失败，跳过');
                        continue;
                    }

                    // 绘制到临时canvas（缩放）
                    tempCtx.clearRect(0, 0, width, height);
                    tempCtx.drawImage(frameCanvas, 0, 0, width, height);

                    // 转换为JPEG数据（WebP编码输入）
                    var dataUrl = tempCanvas.toDataURL('image/jpeg', 0.92);
                    var base64Data = dataUrl.split(',')[1];
                    var binaryString = atob(base64Data);
                    var bytes = new Uint8Array(binaryString.length);
                    for (var j = 0; j < binaryString.length; j++) {
                        bytes[j] = binaryString.charCodeAt(j);
                    }
                    frameDataArray.push(bytes);

                    // 更新进度：捕获阶段 5%-50%
                    var captureProgress = 0.05 + (i / totalFrames) * 0.45;
                    onProgress(captureProgress, 'capturing', '捕获帧 ' + (i + 1) + '/' + totalFrames);
                }

                if (frameDataArray.length === 0) {
                    throw new Error('没有捕获到任何帧');
                }

                console.log('[WebP导出] 捕获完成，共 ' + frameDataArray.length + ' 帧');

                // 3. 使用FFmpeg编码动画WebP
                onProgress(0.5, 'encoding', '编码WebP动画...');

                // 准备输入文件
                var inputFiles = [];
                for (var i = 0; i < frameDataArray.length; i++) {
                    var frameName = 'frame_' + String(i).padStart(6, '0') + '.jpg';
                    inputFiles.push({
                        name: frameName,
                        data: frameDataArray[i]
                    });
                }

                // FFmpeg命令参数
                // -framerate: 输入帧率
                // -i: 输入序列
                // -c:v libwebp: 使用WebP编码器
                // -lossless 0: 有损压缩（文件更小）
                // -loop 0: 无限循环
                // -q:v: 质量 (0-100)
                // -preset default: 编码预设
                var ffmpegArgs = [
                    '-framerate', String(fps),
                    '-i', 'frame_%06d.jpg',
                    '-c:v', 'libwebp',
                    '-lossless', '0',
                    '-loop', '0',
                    '-q:v', String(quality),
                    '-preset', 'default',
                    '-y',
                    'output.webp'
                ];

                // 执行FFmpeg命令
                var result = await FFmpegService.runCommand({
                    args: ffmpegArgs,
                    inputFiles: inputFiles,
                    outputFiles: ['output.webp'],
                    onProgress: function (p) {
                        // 编码阶段 50%-90%
                        var encodeProgress = 0.5 + p * 0.4;
                        onProgress(encodeProgress, 'encoding', '编码中...');
                    }
                });

                if (shouldCancel()) throw new Error('导出已取消');

                // 4. 获取输出文件并下载
                onProgress(0.9, 'downloading', '生成下载文件...');

                var outputData = result['output.webp'];
                if (!outputData || outputData.length === 0) {
                    throw new Error('FFmpeg编码失败，未生成输出文件');
                }

                var blob = new Blob([outputData], { type: 'image/webp' });
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
            setTimeout(function () { URL.revokeObjectURL(url); }, 100);
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
