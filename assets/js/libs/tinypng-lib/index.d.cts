/**
 *  压缩配置
 */
interface CompressOptions {
    minimumQuality?: number;
    quality?: number;
    fileName?: string;
}
/**
 * 压缩图片结果
 */
interface CompressResult {
    success: boolean;
    file: File;
    originalSize: number;
    compressedSize: number;
    rate: number;
    output?: ArrayBuffer;
    blob?: Blob;
    rateString: string;
}
interface ImageData {
    width: number;
    height: number;
    size: number;
    buffer: ArrayBuffer;
    type: string;
    name?: string;
}
declare function fileToBlob(file: File): Promise<Blob>;
declare const compressJpeg: (file: File, options?: CompressOptions) => Promise<{
    blob: Blob;
}>;
declare class TinyPNG {
    /**
     *  压缩图片(jpeg、jpg)
     * @param file 文件
     * @param { {quality: number}} options
     * @returns
     */
    _compressJpegImage(file: File, options: CompressOptions): Promise<{
        file: File;
        blob: Blob;
    }>;
    /**
     *
     * @param file 图片文件
     * @param options
     * @returns
     */
    compressJpegImage(file: File, options?: CompressOptions): Promise<{
        success: boolean;
        file: File;
        originalSize: number;
        compressedSize: number;
        rate: number;
        rateString: string;
        blob: Blob;
        options: CompressOptions;
    }>;
    /**
     *  压缩图片
     * @param file 文件
     * @param {{
     *   minimumQuality: number,
     *   quality: number
     * }} options
     * @returns
     */
    compress(file: File, options?: CompressOptions): Promise<CompressResult | {
        success: boolean;
        error: Error;
    }>;
    compressPngImage(imageData: ImageData, options: CompressOptions): Promise<{
        success: boolean;
        file: File;
        originalSize: number;
        compressedSize: number;
        rate: number;
        blob: Blob;
        rateString: string;
        options: CompressOptions;
    }>;
    /**
     *  压缩png图片
     * @param image 图片对象
     * @param options
     * @returns
     */
    compressWorkerImage(image: ImageData, options: CompressOptions): Promise<{
        success: boolean;
        file: File;
        originalSize: number;
        compressedSize: number;
        rate: number;
        blob: Blob;
        rateString: string;
        options: CompressOptions;
    }>;
    /**
     * 获取图片信息
     */
    getImage: (file: File) => Promise<ImageData>;
    fileToBlob: typeof fileToBlob;
}
declare const _default: TinyPNG;

export { type CompressOptions, type CompressResult, type ImageData, compressJpeg, _default as default };
