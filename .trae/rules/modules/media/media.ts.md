# 媒体处理规则

/**
 * MediaRules
 * Auto-generated interface for legacy rule file.
 */
export interface MediaRules {
  /** 
   * 规则描述 
   * @description 请将下方的 Markdown 内容逐步迁移到此结构化字段中
   */
  description: string;
}



## 概述
处理客户端媒体操作 (转码、合成) 的模块，利用 **FFmpeg.wasm** 和 Web Workers。
服务位于 `MeeWoo.Service` 下，设计为单例模式。

## 核心接口

### FFmpegService (单例)
负责加载 WASM 核心和调度转码任务。

```typescript
// namespace MeeWoo.Service
interface FFmpegService {
  /**
   * 初始化 FFmpeg 核心
   * 加载脚本和 WASM 文件，支持 CDN 回退。
   */
  init(options?: FFmpegInitOptions): Promise<void>;

  /**
   * 从视频提取音频，可选应用变速
   * @returns SVGA 兼容的音频数据列表
   */
  extractAudio(options: {
    videoFile: File;
    totalFrames: number;
    fps: number;
    speedRatio?: number;
    onProgress?: (p: number) => void;
  }): Promise<AudioData[] | null>;

  /**
   * 提取音频并应用多段速度重映射
   */
  extractAudioWithSpeedRemap(options: {
    videoFile: File;
    keyframes: Array<{ originalFrame: number; position: number }>;
    // ...
  }): Promise<AudioData[] | null>;

  /**
   * 将图片序列转换为 MP4
   */
  convertFramesToMp4(options: {
    frames: Uint8Array[];
    fps: number;
    quality?: number;
    audioData?: Uint8Array;
    // ...
  }): Promise<Blob>;

  /**
   * 低级命令执行
   */
  runCommand(options: {
    args: string[];
    inputFiles: Array<{ name: string; data: ArrayBuffer }>;
    outputFiles: string[];
  }): Promise<Record<string, Uint8Array>>;
}

interface FFmpegInitOptions {
  corePath?: string;
  log?: boolean;
  highPriority?: boolean; // 用于队列
}
```

### MaterialEditorService
处理图片/视频的合成与渲染。

```typescript
// namespace MeeWoo.Service
interface MaterialEditorService {
  /**
   * 创建新的编辑器实例
   */
  create(config: { width: number; height: number; container?: HTMLElement }): MaterialEditorInstance;
}

interface MaterialEditorInstance {
  /**
   * 加载背景图片
   */
  loadImage(source: string | Blob): Promise<void>;

  /**
   * 配置文本覆盖
   */
  setText(options: {
    content: string;
    style?: string; // CSS 样式字符串
    position?: { x: number; y: number }; // 百分比
    scale?: number;
    align?: 'left' | 'center' | 'right';
  }): void;

  /**
   * 应用变换到背景图片
   */
  setImageTransform(options: { offsetX?: number; offsetY?: number; scale?: number }): void;

  /**
   * 导出合成结果为 DataURL (PNG)
   */
  export(): Promise<string>;

  /**
   * 重置所有状态
   */
  reset(): void;

  /**
   * 销毁实例
   */
  destroy(): void;
}
```

## 实现规则
1.  **FFmpeg Loading**: Always check `isLoaded` before calling operations. Use `init()` which handles singleton/loading state.
2.  **Memory Management**: FFmpeg operations use a virtual filesystem (`MEMFS`). Always clean up files (`unlink`) after processing, or use helper methods that handle cleanup.
3.  **Progress Tracking**: All long-running operations must accept an `onProgress` callback.
4.  **Cancellation**: Operations should accept a `checkCancelled` callback or check a cancellation token to abort early.
5.  **Data Types**: Prefer `Uint8Array` for binary data passing between WASM and JS.

## CDN 加速配置

### FFmpeg 文件结构

```typescript
interface FFmpegFiles {
  ffmpegMinJs: string;      // ~50KB, JS 封装层，提供 API
  ffmpegCoreJs: string;     // ~1.5MB, Core 主入口
  ffmpegCoreWorker: string; // ~2KB, Worker 入口
  ffmpegCoreWasm: string;   // ~25MB, WASM 编解码器（加载慢的元凶）
}

interface FFmpegLoadFlow {
  step1: "library-loader 加载 ffmpeg.min.js（小文件，本地加载）";
  step2: "ffmpeg-service 初始化时加载 ffmpeg-core.js";
  step3: "ffmpeg-core.js 自动加载同目录的 .worker.js 和 .wasm";
}
```

### CDN 配置要点

```typescript
interface FFmpegCDNConfig {
  corePath: string;
  workerPath?: string;
  wasmPath?: string;
}

const configExample: FFmpegCDNConfig = {
  corePath: "https://your-cdn.com/ffmpeg/ffmpeg-core.js",
  workerPath: undefined,
  wasmPath: undefined,
};

// 注意：只需指定 corePath，worker 和 wasm 会自动从同目录加载
// 确保 CDN 上三个文件在同一目录且文件名正确
```

### CORS 配置（腾讯云 COS）

```typescript
interface COSCorsConfig {
  allowedOrigins: string[];  // ["*"] 或指定域名
  allowedMethods: string[];  // ["GET", "HEAD"]
  allowedHeaders: string[];  // ["*"]
  maxAgeSeconds: number;     // 600
}

const tencentCOSExample: COSCorsConfig = {
  allowedOrigins: ["http://localhost:4000", "https://your-domain.com"],
  allowedMethods: ["GET", "HEAD"],
  allowedHeaders: ["*"],
  maxAgeSeconds: 600,
};

// 配置路径：腾讯云控制台 → 存储桶 → 安全管理 → 跨域访问 CORS 设置
```

### 故障排查

| 错误信息 | 原因 | 解决方案 |
|---------|------|---------|
| `CORS policy: No 'Access-Control-Allow-Origin' header` | CDN 未配置 CORS | 在 COS 控制台添加 CORS 规则 |
| `createFFmpegCore is not defined` | ffmpeg-core.js 加载失败 | 检查 CDN 文件是否存在、CORS 是否配置 |
| `500 Internal Server Error` | 文件不存在或无权限访问 | 检查 CDN 文件路径和访问权限 |