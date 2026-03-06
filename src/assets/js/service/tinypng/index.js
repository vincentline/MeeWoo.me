/**
 * Tinypng 服务适配器
 * 封装 tinypng-lib 库，提供统一的压缩接口
 * 
 * 注意：使用相对路径导入，确保在静态服务器上也能正常工作
 */
import TinyPNG from '../../libs/tinypng-lib/index.js';

/**
 * 压缩 PNG 数据
 * @param {Uint8Array} data - 原始 PNG 数据
 * @param {Object} options - 压缩选项
 * @param {number} options.quality - 期望压缩质量 (0-100)
 * @param {number} options.minimumQuality - 最小质量
 * @returns {Promise<Uint8Array>} - 压缩后的 PNG 数据
 */
export async function compress(data, options = {}) {
    try {
        // 转换 Uint8Array 为 File 对象
        // 注意：tinypng-lib 需要 File 对象作为输入
        const blob = new Blob([data], { type: 'image/png' });
        const file = new File([blob], "image.png", { type: "image/png" });

        // 映射选项
        // 确保 quality 和 minimumQuality 都在 0-100 范围内，且 minimumQuality <= quality
        let quality = Math.max(0, Math.min(100, options.quality || 80));
        let minimumQuality = Math.max(0, Math.min(100, options.minimumQuality || 30));

        // 如果 minimumQuality 大于 quality，将其调整为 quality 的一半或相等
        if (minimumQuality > quality) {
            minimumQuality = Math.floor(quality / 2);
        }

        const compressOptions = {
            quality: quality,
            minimumQuality: minimumQuality,
            fileName: 'compressed.png'
        };

        console.log('Starting TinyPNG compression with options:', compressOptions);

        // 调用 TinyPNG 压缩
        const result = await TinyPNG.compress(file, compressOptions);

        if (!result.success) {
            throw new Error('TinyPNG compression returned failure status');
        }

        console.log('TinyPNG compression result:', {
            originalSize: result.originalSize,
            compressedSize: result.compressedSize,
            rate: result.rateString
        });

        // 获取压缩后的数据
        let compressedData;
        if (result.output) {
            // 如果有 output (ArrayBuffer)
            compressedData = new Uint8Array(result.output);
        } else if (result.blob) {
            // 如果只有 blob
            const buffer = await result.blob.arrayBuffer();
            compressedData = new Uint8Array(buffer);
        } else if (result.file) {
             // 如果只有 file
             const buffer = await result.file.arrayBuffer();
             compressedData = new Uint8Array(buffer);
        } else {
            throw new Error('TinyPNG returned no usable output data');
        }

        return compressedData;

    } catch (error) {
        console.error('TinyPNG compression error:', error);
        throw error;
    }
}

export default {
    compress
};
