# SVGA素材压缩导出流程简化
> Tags: svga,compress,transform
> Created: 2026-03-07

# SVGA素材压缩导出流程简化

## 背景
原方案通过"缩小图片+放大transform矩阵"的方式压缩SVGA素材，但存在两个问题：
1. iOS播放器对transform矩阵处理不一致，导致异常放大
2. 压缩后SVGA文件反而变大（降级方案无效）

## 解决方案

### 1. 移除transform矩阵修改
不再通过修改 `transform.a/b/c/d` 放大显示，而是让SVGA播放器自动拉伸小图到layout尺寸。

```javascript
// 旧方案（已废弃）
// frame.transform.a = origA * scaleUp;
// frame.transform.b = origB * scaleUp;
// ...

// 新方案：不做任何transform处理
// SVGA播放器会自动将小图拉伸到layout指定的尺寸
```

### 2. 移除图片缩小比例配置
删除了 `compressConfig.scalePercent` 配置项，简化压缩流程：

```javascript
// 旧配置
compressConfig: {
  scalePercent: 70,      // 已移除
  pngQuality: 80,
  exportMuted: false
}

// 新配置
compressConfig: {
  pngQuality: 80,
  exportMuted: false
}
```

### 3. 简化压缩流程
```javascript
// 旧流程：缩小 → 压缩 → 放大预览 → 导出时替换小图+修改transform
// 新流程：压缩 → 导出时直接替换

// 新流程代码
startCompressMaterials: async function () {
  // 1. 加载原始图片
  // 2. 使用TinyPNG压缩
  // 3. 更新预览图
  // 导出时直接使用压缩后的图片
}
```

## 相关文件
- `src/assets/js/core/app.js` - 压缩和导出逻辑
- `src/index.html` - 移除缩小比例配置UI
- `src/assets/js/service/image-compression-service.js` - 压缩服务
