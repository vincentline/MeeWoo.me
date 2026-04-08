/**
 * WebP服务索引文件
 * 统一导出所有WebP相关服务模块
 * 
 * 文件列表：
 * 1. webp-exporter.js - WebP动画导出器
 *    - 使用webpxmux.js编码动画WebP
 *    - 支持透明背景
 *    - 序列帧动画（每帧完整替换，无叠加）
 * 
 * 依赖库：
 * - webpxmux.js (852KB) + webpxmux.wasm (1.63MB)
 * - 位于 /src/assets/js/lib/webpxmux/
 */

// 确保命名空间存在
window.MeeWoo = window.MeeWoo || {};
window.MeeWoo.Exporters = window.MeeWoo.Exporters || {};

// WebP导出器会自动注册到 window.MeeWoo.Exporters.WebPExporter
