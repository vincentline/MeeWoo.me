/**
 * MP4 Converter
 * 使用 FFmpeg.wasm 将图像序列合成 MP4 视频
 */
(function (window) {
    'use strict';

    var Mp4Converter = {
        ffmpeg: null,
        isLoaded: false,

        /**
         * 初始化 FFmpeg（使用统一的FFmpegService）
         */
        init: async function () {
            if (this.isLoaded) return;

            // 使用FFmpegService的统一实例
            if (typeof FFmpegService === 'undefined') {
                throw new Error('FFmpegService 未加载');
            }

            // 确保FFmpegService已初始化
            await FFmpegService.init();

            // 使用FFmpegService提供的实例
            this.ffmpeg = FFmpegService.ffmpeg;
            this.isLoaded = FFmpegService.isLoaded;
        },

        // 旧代码 - 已迁移至FFmpegService
        // init: async function () { ... }
        // 原实现：自己创建ffmpeg实例，独立加载
        // 新实现：使用FFmpegService的统一实例，避免重复加载
        // 迁移日期：2026-01-10

        /**
         * 转换图像序列为 MP4
         * @param {Object} options
         * @param {Array<Uint8Array>} options.frames - JPEG/PNG 图像数据数组
         * @param {number} options.fps - 帧率
         * @param {Uint8Array} options.audioData - 音频数据 (MP3/AAC)
         * @param {File} options.audioFile - 音频源文件 (MP4/MP3等)
         * @param {number} options.quality - 质量 0-100 (越高越好)
         * @param {boolean} options.muted - 是否静音
         * @param {Function} options.onProgress - 进度回调 (0-1)
         * @param {Function} options.checkCancelled - 检查是否取消
         * @returns {Promise<Blob>} MP4 Blob
         */
        convert: async function (options) {
            if (!this.isLoaded) await this.init();

            var frames = options.frames;
            var fps = options.fps || 30;
            var quality = options.quality || 80;
            var audioData = options.audioData;
            var audioFile = options.audioFile;
            var muted = options.muted || false;
            var onProgress = options.onProgress || function () { };
            var checkCancelled = options.checkCancelled || function () { return false; };

            var ffmpeg = this.ffmpeg;
            var fetchFile = FFmpeg.fetchFile;

            // 1. 写入帧文件
            var frameNames = [];
            for (var i = 0; i < frames.length; i++) {
                if (checkCancelled()) throw new Error('User Cancelled');

                // 假设输入是 JPEG 格式的 Uint8Array
                var fileName = 'frame_' + ('00000' + i).slice(-5) + '.jpg';
                try {
                    ffmpeg.FS('writeFile', fileName, frames[i]);
                    frameNames.push(fileName);
                } catch (e) {
                    console.error('写入帧文件失败:', fileName, e);
                    // 尝试清理并重试一次
                    try {
                        ffmpeg.FS('unlink', fileName);
                        ffmpeg.FS('writeFile', fileName, frames[i]);
                        frameNames.push(fileName);
                    } catch (retryError) {
                        throw new Error('写入文件失败: ' + retryError.message);
                    }
                }

                // 进度 0-30%
                onProgress(0.3 * (i + 1) / frames.length);
            }

            // 2. 处理音频
            var hasAudio = false;
            if (!muted) {
                if (audioData) {
                    ffmpeg.FS('writeFile', 'audio.mp3', audioData);
                    hasAudio = true;
                } else if (audioFile) {
                    try {
                        ffmpeg.FS('writeFile', 'source_video.mp4', await fetchFile(audioFile));
                        // 提取音频
                        await ffmpeg.run('-i', 'source_video.mp4', '-vn', '-acodec', 'copy', 'audio.aac');
                        hasAudio = true;
                    } catch (e) {
                        console.warn('音频提取失败:', e);
                    }
                }
            }

            // 3. 执行转换
            var args = [
                '-r', fps.toString(),
                '-f', 'image2',
                '-i', 'frame_%05d.jpg'
            ];

            if (hasAudio) {
                if (audioData) {
                    args.push('-i', 'audio.mp3');
                } else {
                    args.push('-i', 'audio.aac');
                }
                // 视频流:0, 音频流:1
                // -shortest: 以最短流为准
                args.push('-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-shortest');
            } else {
                args.push('-c:v', 'libx264', '-pix_fmt', 'yuv420p');
            }

            // 计算 CRF (Constant Rate Factor)
            // Quality 100 -> CRF 18
            // Quality 0 -> CRF 51
            var crf = Math.round(51 - (quality / 100) * 33);
            args.push('-crf', crf.toString());

            args.push('-preset', 'ultrafast');
            args.push('output.mp4');

            // 进度监控
            ffmpeg.setProgress(function (p) {
                // 进度 30-90%
                var ratio = p.ratio;
                if (ratio > 0 && ratio <= 1) {
                    onProgress(0.3 + ratio * 0.6);
                }
            });

            await ffmpeg.run.apply(ffmpeg, args);

            onProgress(0.95);

            // 4. 读取结果
            var data = ffmpeg.FS('readFile', 'output.mp4');
            var blob = new Blob([data.buffer], { type: 'video/mp4' });

            // 5. 清理文件
            frameNames.forEach(function (f) { try { ffmpeg.FS('unlink', f); } catch (e) { } });
            if (hasAudio) {
                if (audioData) try { ffmpeg.FS('unlink', 'audio.mp3'); } catch (e) { }
                else {
                    try { ffmpeg.FS('unlink', 'source_video.mp4'); } catch (e) { }
                    try { ffmpeg.FS('unlink', 'audio.aac'); } catch (e) { }
                }
            }
            try { ffmpeg.FS('unlink', 'output.mp4'); } catch (e) { }

            onProgress(1.0);
            return blob;
        }
    };

    window.MP4Converter = Mp4Converter;

})(window);