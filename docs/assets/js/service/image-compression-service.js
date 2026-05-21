/**
 * 图片压缩服务 - 使用 TinyPNG (tinypng-lib)
 * 
 * 功能：
 * - PNG: 使用 TinyPNG (tinypng-lib-wasm) 进行有损压缩
 * - JPG: 不压缩
 * 
 * 压缩策略：
 * - 首选：TinyPNG 有损压缩（支持质量参数）
 * - 降级：直接返回原始数据（因为图片可能已经缩小，体积已减小）
 * 
 * 注意：
 * - 已移除 Pako 降级方案，因为 Pako 只是无损重编码，不会减小体积
 * - 压缩前应先缩小图片尺寸，这是减小体积的主要手段
 */
(function (global) {
    'use strict';

    window.MeeWoo = window.MeeWoo || {};
    window.MeeWoo.Services = window.MeeWoo.Services || {};

    const ImageCompressionService = {
        tinypngModule: null,
        initialized: false,
        compressionFailed: false,
        tinypngReady: false,
        compressionStats: {
            total: 0,
            tinypngSuccess: 0,
            tinypngFailed: 0,
            originalBytes: 0,
            compressedBytes: 0
        },

        /**
         * 初始化 TinyPNG 模块
         */
        init: async function () {
            try {
                const { default: TinyPNGService } = await import('./tinypng/index.js');

                this.tinypngModule = TinyPNGService;
                this.initialized = true;
                this.tinypngReady = true;
                console.log('[ImageCompression] TinyPNG 模块初始化成功');
            } catch (error) {
                console.error('[ImageCompression] TinyPNG 模块加载失败:', error);
                this.initialized = true;
                this.tinypngReady = false;
                console.log('[ImageCompression] 将使用无压缩模式');
            }
        },

        /**
         * 检查 TinyPNG 服务状态
         */
        isTinyPNGReady: function () {
            return this.tinypngReady;
        },

        /**
         * 识别文件类型
         * @param {Uint8Array} data - 文件数据
         * @returns {string} - 文件类型（'png'或其他）
         */
        detectFileType: function (data) {
            if (data.length >= 8) {
                const pngSignature = [0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A];
                let isPNG = true;
                for (let i = 0; i < 8; i++) {
                    if (data[i] !== pngSignature[i]) {
                        isPNG = false;
                        break;
                    }
                }
                if (isPNG) return 'png';
            }
            return 'unknown';
        },

        /**
         * 使用 TinyPNG 压缩 PNG
         * @param {Uint8Array} pngData - PNG 数据
         * @param {number} quality - 压缩质量（0-100）
         * @returns {Promise<Uint8Array>} - 压缩后的 PNG 数据
         */
        compressWithTinyPNG: async function (pngData, quality) {
            if (!this.initialized) {
                await this.init();
            }

            if (!this.isTinyPNGReady()) {
                throw new Error('TinyPNG not available');
            }

            const startTime = performance.now();
            const originalSize = pngData.length;

            try {
                const compressedBuffer = await this.tinypngModule.compress(pngData, {
                    quality: quality,
                    minimumQuality: 30
                });
                const compressedData = new Uint8Array(compressedBuffer);
                const elapsed = (performance.now() - startTime).toFixed(1);
                const ratio = (compressedData.length / originalSize * 100).toFixed(1);

                console.log('[ImageCompression] TinyPNG 压缩成功: ' +
                    originalSize + ' → ' + compressedData.length + ' bytes (' +
                    ratio + '%), 耗时 ' + elapsed + 'ms');

                return compressedData;
            } catch (error) {
                const elapsed = (performance.now() - startTime).toFixed(1);
                console.error('[ImageCompression] TinyPNG 压缩失败 (' + elapsed + 'ms):', error);
                throw error;
            }
        },

        /**
         * 压缩 PNG 数据
         * @param {Uint8Array} pngData - PNG 数据
         * @param {number} quality - 压缩质量（0-100）
         * @returns {Promise<Uint8Array>} - 压缩后的 PNG 数据
         */
        compressPNG: async function (pngData, quality = 80) {
            this.compressionStats.total++;
            this.compressionStats.originalBytes += pngData.length;

            if (!this.initialized) {
                await this.init();
            }

            if (this.isTinyPNGReady()) {
                try {
                    const compressedData = await this.compressWithTinyPNG(pngData, quality);
                    this.compressionStats.tinypngSuccess++;
                    this.compressionStats.compressedBytes += compressedData.length;
                    return compressedData;
                } catch (error) {
                    this.compressionStats.tinypngFailed++;
                    console.warn('[ImageCompression] TinyPNG 压缩失败，返回原始数据');
                }
            } else {
                console.warn('[ImageCompression] TinyPNG 不可用，跳过压缩');
            }

            this.compressionStats.compressedBytes += pngData.length;
            return pngData;
        },

        /**
         * 从 Canvas 压缩为 PNG
         * @param {HTMLCanvasElement} canvas - Canvas 元素
         * @param {number} quality - 压缩质量（0-100）
         * @returns {Promise<Uint8Array>} - 压缩后的 PNG 数据
         */
        compressCanvas: async function (canvas, quality = 80) {
            const blob = await new Promise(resolve => {
                canvas.toBlob(resolve, 'image/png');
            });

            const arrayBuffer = await blob.arrayBuffer();
            const uint8Array = new Uint8Array(arrayBuffer);

            return await this.compressPNG(uint8Array, quality);
        },

        /**
         * 压缩图片数据（主入口）
         * @param {Uint8Array} data - 图片数据
         * @param {number} quality - 压缩质量（0-100）
         * @returns {Promise<Uint8Array>} - 压缩后的图片数据
         */
        compressImage: async function (data, quality = 80) {
            const fileType = this.detectFileType(data);

            if (fileType === 'png') {
                return await this.compressPNG(data, quality);
            }

            return data;
        },

        /**
         * 检查是否有压缩失败
         */
        hasCompressionFailed: function () {
            return this.compressionFailed;
        },

        /**
         * 重置压缩失败标记
         */
        resetCompressionFailed: function () {
            this.compressionFailed = false;
        },

        /**
         * 获取压缩统计信息
         * @returns {Object} 压缩统计
         */
        getStats: function () {
            const stats = Object.assign({}, this.compressionStats);
            if (stats.originalBytes > 0) {
                stats.compressionRatio = (stats.compressedBytes / stats.originalBytes * 100).toFixed(1) + '%';
                stats.savedBytes = stats.originalBytes - stats.compressedBytes;
            }
            return stats;
        },

        /**
         * 重置压缩统计
         */
        resetStats: function () {
            this.compressionStats = {
                total: 0,
                tinypngSuccess: 0,
                tinypngFailed: 0,
                originalBytes: 0,
                compressedBytes: 0
            };
        },

        /**
         * 打印压缩统计摘要
         */
        printStatsSummary: function () {
            const stats = this.getStats();
            console.log('[ImageCompression] 压缩统计摘要:');
            console.log('  - 总处理图片: ' + stats.total);
            console.log('  - TinyPNG 成功: ' + stats.tinypngSuccess);
            console.log('  - TinyPNG 失败: ' + stats.tinypngFailed);
            console.log('  - 原始大小: ' + (stats.originalBytes / 1024).toFixed(1) + ' KB');
            console.log('  - 压缩后大小: ' + (stats.compressedBytes / 1024).toFixed(1) + ' KB');
            if (stats.compressionRatio) {
                console.log('  - 压缩率: ' + stats.compressionRatio);
            }
            if (stats.savedBytes && stats.savedBytes > 0) {
                console.log('  - 节省空间: ' + (stats.savedBytes / 1024).toFixed(1) + ' KB');
            }
        }
    };

    window.MeeWoo.Services.ImageCompressionService = ImageCompressionService;

})(typeof window !== 'undefined' ? window : this);
