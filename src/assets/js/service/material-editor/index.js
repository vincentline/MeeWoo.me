/**
 * 素材编辑器服务模块入口
 * 
 * 功能：
 * - 统一导出所有素材编辑相关服务
 * - 确保命名空间正确初始化
 * 
 * 导出服务：
 * - TextRenderer: 文字渲染服务
 * - ImageTransformer: 图片变换服务
 * - MaterialComposer: 素材合成服务
 * - MaterialEditorService: 编辑器服务主类
 */

(function (global) {
  'use strict';

  // 确保命名空间存在
  global.MeeWoo = global.MeeWoo || {};
  global.MeeWoo.Services = global.MeeWoo.Services || {};

  // 服务模块对象
  var MaterialEditorModule = {
    TextRenderer: global.MeeWoo.Services.TextRenderer,
    ImageTransformer: global.MeeWoo.Services.ImageTransformer,
    MaterialComposer: global.MeeWoo.Services.MaterialComposer,
    MaterialEditorService: global.MeeWoo.Services.MaterialEditorService
  };

  // 导出到命名空间
  global.MeeWoo.Services.MaterialEditor = MaterialEditorModule;

  // 支持 CommonJS
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = MaterialEditorModule;
  }

})(typeof window !== 'undefined' ? window : this);
