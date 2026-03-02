# 素材编辑器服务文档

## 概述

素材编辑器服务是一套模块化的图片处理工具集，提供文字渲染、图片变换、图层合成等功能。采用分层架构设计，支持独立使用各模块或通过统一入口服务进行完整编辑流程。

### 架构设计

```
┌─────────────────────────────────────────────────────┐
│              MaterialEditorUI (UI 组件)              │
│                    弹窗式编辑界面                      │
└─────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────┐
│           MaterialEditorService (入口服务)           │
│              统一的编辑器实例管理                      │
└─────────────────────────────────────────────────────┘
                          │
          ┌───────────────┼───────────────┐
          ▼               ▼               ▼
┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│ TextRenderer │ │ImageTransformer│ │MaterialComposer│
│   文字渲染    │ │    图片变换    │ │    图层合成    │
└──────────────┘ └──────────────┘ └──────────────┘
```

### 命名空间

所有服务挂载在 `MeeWoo.Services` 命名空间下：

- `MeeWoo.Services.TextRenderer` - 文字渲染服务
- `MeeWoo.Services.ImageTransformer` - 图片变换服务
- `MeeWoo.Services.MaterialComposer` - 素材合成服务
- `MeeWoo.Services.MaterialEditorService` - 编辑器入口服务

UI 组件挂载在 `MeeWoo.Components` 命名空间下：

- `MeeWoo.Components.MaterialEditorUI` - 编辑器 UI 组件

---

## 模块列表

| 模块 | 文件 | 功能描述 |
|------|------|----------|
| TextRenderer | text-renderer.js | 文字渲染到 Canvas，支持渐变、阴影、描边 |
| ImageTransformer | image-transformer.js | 图片加载、缩放、裁剪、填充 |
| MaterialComposer | material-composer.js | 图层合成，依赖 Konva.js |
| MaterialEditorService | material-editor-service.js | 统一入口，组合以上服务 |
| MaterialEditorUI | material-editor-ui.js | 弹窗式 UI 组件 |

---

## 各服务 API 文档

### TextRenderer - 文字渲染服务

独立的文字渲染服务，负责将文字渲染到 Canvas 并导出 DataURL。

#### 方法列表

| 方法 | 说明 | 返回值 |
|------|------|--------|
| `render(options)` | 渲染文字到 Canvas 并返回 DataURL | `Promise<string>` |
| `renderTextToCanvas(text, style, align)` | 将文字渲染到独立 Canvas | `HTMLCanvasElement` |
| `filterTextStyle(styleStr)` | 过滤 CSS 样式，只保留安全属性 | `Object` |
| `convertStylesToCssString(styles)` | 将样式对象转换为 CSS 字符串 | `string` |
| `parseStroke(strokeStr)` | 解析描边样式字符串 | `Object\|null` |
| `parseGradient(ctx, bgStr, ...)` | 解析渐变样式并创建 Canvas 渐变对象 | `CanvasGradient\|null` |

#### render(options)

渲染文字到 Canvas 并返回 DataURL。

**参数说明**

| 参数 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| `width` | `number` | 否 | `500` | 画布宽度（像素） |
| `height` | `number` | 否 | `500` | 画布高度（像素） |
| `text` | `string` | **是** | - | 文字内容，支持 `\n` 换行 |
| `style` | `string` | 否 | `''` | CSS 样式字符串 |
| `position` | `Object` | 否 | `{x:50, y:50}` | 百分比位置 |
| `scale` | `number` | 否 | `1.0` | 缩放比例 |
| `align` | `string` | 否 | `'left'` | 对齐方式：`'left'`/`'center'`/`'right'` |

**返回值**

`Promise<string>` - PNG 格式的 DataURL

**使用示例**

```javascript
MeeWoo.Services.TextRenderer.render({
  width: 800,
  height: 600,
  text: 'Hello World\n第二行文字',
  style: 'font-size: 48px; color: #ffffff; font-weight: bold;',
  position: { x: 50, y: 50 },
  scale: 1.0,
  align: 'center'
}).then(function(dataURL) {
  console.log('渲染完成:', dataURL);
}).catch(function(err) {
  console.error('渲染失败:', err);
});
```

#### filterTextStyle(styleStr)

过滤 CSS 样式，移除布局相关属性（如 position、width、margin 等），只保留文字样式属性。

**参数说明**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `styleStr` | `string` | 是 | 原始 CSS 样式字符串 |

**返回值**

`Object` - 过滤后的样式对象

**使用示例**

```javascript
var styles = MeeWoo.Services.TextRenderer.filterTextStyle(
  'font-size: 24px; color: red; position: absolute; width: 100px;'
);
console.log(styles);
// 输出: { 'font-size': '24px', 'color': 'red' }
```

#### 支持的文字样式

- **字体**: `font-size`, `font-family`, `font-weight`, `font-style`
- **颜色**: `color`, `background` (渐变)
- **效果**: `text-shadow`, `-webkit-text-stroke` (描边)
- **渐变文字**: 配合 `background: linear-gradient(...)` 和 `-webkit-background-clip: text`

---

### ImageTransformer - 图片变换服务

独立的图片变换服务，提供图片加载、缩放、裁剪、填充等功能。

#### 方法列表

| 方法 | 说明 | 返回值 |
|------|------|--------|
| `loadImage(source)` | 加载图片，支持 URL/Blob/Base64 | `Promise<HTMLImageElement>` |
| `transform(options)` | 图片变换主方法 | `Promise<string>` |

#### loadImage(source)

加载图片，支持 URL、Blob、Base64 格式的图片源。

**参数说明**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `source` | `string\|Blob` | 是 | 图片源：URL、Blob 或 Base64 字符串 |

**返回值**

`Promise<HTMLImageElement>` - 加载完成的图片元素

**使用示例**

```javascript
// 加载 URL 图片
MeeWoo.Services.ImageTransformer.loadImage('https://example.com/image.png')
  .then(function(img) {
    console.log('图片尺寸:', img.width, 'x', img.height);
  });

// 加载 Blob
MeeWoo.Services.ImageTransformer.loadImage(blob)
  .then(function(img) {
    console.log('Blob 图片加载完成');
  });

// 加载 Base64
MeeWoo.Services.ImageTransformer.loadImage('data:image/png;base64,...')
  .then(function(img) {
    console.log('Base64 图片加载完成');
  });
```

#### transform(options)

图片变换主方法，根据目标尺寸和变换参数对图片进行处理。

**参数说明**

| 参数 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| `source` | `string\|Blob` | **是** | - | 图片源 |
| `targetWidth` | `number` | **是** | - | 目标宽度 |
| `targetHeight` | `number` | **是** | - | 目标高度 |
| `transform` | `Object` | 否 | `{offsetX:0, offsetY:0, scale:1}` | 变换参数 |
| `transform.offsetX` | `number` | 否 | `0` | X 轴偏移量 |
| `transform.offsetY` | `number` | 否 | `0` | Y 轴偏移量 |
| `transform.scale` | `number` | 否 | `1` | 缩放比例 |
| `fit` | `string` | 否 | `'cover'` | 填充模式 |

**填充模式说明**

| 模式 | 说明 |
|------|------|
| `'cover'` | 填充裁剪模式，保证填满目标区域，可能裁剪图片 |
| `'contain'` | 完整包含模式，保证图片完整显示，可能留白 |

**返回值**

`Promise<string>` - PNG 格式的 DataURL

**使用示例**

```javascript
// cover 模式（填充裁剪）
MeeWoo.Services.ImageTransformer.transform({
  source: 'image.png',
  targetWidth: 500,
  targetHeight: 500,
  fit: 'cover'
}).then(function(dataURL) {
  console.log('变换完成:', dataURL);
});

// contain 模式（完整包含）+ 变换参数
MeeWoo.Services.ImageTransformer.transform({
  source: blob,
  targetWidth: 500,
  targetHeight: 500,
  fit: 'contain',
  transform: { offsetX: 10, offsetY: 20, scale: 1.2 }
}).then(function(dataURL) {
  console.log('变换完成:', dataURL);
});
```

---

### MaterialComposer - 素材合成服务

提供素材图层合成功能，将底图和文字层合成为最终图片。依赖 Konva.js 渲染引擎。

#### 方法列表

| 方法 | 说明 | 返回值 |
|------|------|--------|
| `compose(options)` | 合成底图和文字层 | `Promise<string>` |
| `composeLayers(options)` | 合成多个图层（高级方法） | `Promise<string>` |

#### compose(options)

合成底图和文字层，按指定尺寸导出最终图片。

**参数说明**

| 参数 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| `background` | `string` | 否 | - | 底图 DataURL |
| `textLayer` | `string` | 否 | - | 文字层 DataURL |
| `width` | `number` | **是** | - | 导出宽度（像素） |
| `height` | `number` | **是** | - | 导出高度（像素） |
| `format` | `string` | 否 | `'png'` | 导出格式：`'png'`/`'jpeg'` |
| `quality` | `number` | 否 | `0.92` | JPEG 质量（0-1），仅 format='jpeg' 时有效 |

**注意**: `background` 和 `textLayer` 至少需要提供一个。

**返回值**

`Promise<string>` - 合成后的 DataURL

**使用示例**

```javascript
// 合成底图和文字层
MeeWoo.Services.MaterialComposer.compose({
  background: 'data:image/png;base64,...',
  textLayer: 'data:image/png;base64,...',
  width: 800,
  height: 600
}).then(function(dataURL) {
  console.log('合成完成:', dataURL);
});

// 仅导出文字层（无底图）
MeeWoo.Services.MaterialComposer.compose({
  textLayer: 'data:image/png;base64,...',
  width: 500,
  height: 500,
  format: 'jpeg',
  quality: 0.9
}).then(function(dataURL) {
  console.log('导出完成:', dataURL);
});
```

#### composeLayers(options)

合成多个图层，支持更灵活的图层配置。

**参数说明**

| 参数 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| `width` | `number` | **是** | - | 导出宽度 |
| `height` | `number` | **是** | - | 导出高度 |
| `layers` | `Array<Object>` | **是** | - | 图层数组，按顺序从底到顶叠加 |
| `format` | `string` | 否 | `'png'` | 导出格式 |
| `quality` | `number` | 否 | `0.92` | JPEG 质量 |

**图层配置 (layers[])**

| 参数 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| `src` | `string` | **是** | - | 图层图片源（DataURL） |
| `x` | `number` | 否 | `0` | 图层 X 坐标 |
| `y` | `number` | 否 | `0` | 图层 Y 坐标 |
| `width` | `number` | 否 | 图片原始宽度 | 图层宽度 |
| `height` | `number` | 否 | 图片原始高度 | 图层高度 |
| `opacity` | `number` | 否 | `1` | 图层透明度（0-1） |

**使用示例**

```javascript
MeeWoo.Services.MaterialComposer.composeLayers({
  width: 800,
  height: 600,
  layers: [
    { src: 'data:image/png;base64,...' },                    // 底层
    { src: 'data:image/png;base64,...', x: 100, y: 50 },    // 中间层
    { src: 'data:image/png;base64,...', opacity: 0.8 }      // 顶层（半透明）
  ],
  format: 'png'
}).then(function(dataURL) {
  console.log('多图层合成完成:', dataURL);
});
```

---

### MaterialEditorService - 编辑器入口服务

素材编辑器的统一入口服务，组合 TextRenderer、ImageTransformer、MaterialComposer 三个服务。

#### 静态方法

| 方法 | 说明 | 返回值 |
|------|------|--------|
| `create(config)` | 创建编辑器实例 | `MaterialEditorInstance` |

#### create(config)

创建编辑器实例。

**参数说明**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `width` | `number` | **是** | 画布宽度 |
| `height` | `number` | **是** | 画布高度 |
| `container` | `HTMLElement` | 否 | DOM 容器元素（用于 Konva 渲染，可选） |

**返回值**

`MaterialEditorInstance` - 编辑器实例

**使用示例**

```javascript
var editor = MeeWoo.Services.MaterialEditorService.create({
  width: 800,
  height: 600
});
```

---

#### 实例方法

| 方法 | 说明 | 返回值 |
|------|------|--------|
| `loadImage(source)` | 加载底图 | `Promise<void>` |
| `setText(options)` | 设置文字 | `void` |
| `getImageTransform()` | 获取图片变换参数 | `Object` |
| `setImageTransform(options)` | 设置图片变换参数 | `void` |
| `export()` | 导出编辑结果 | `Promise<string>` |
| `reset()` | 重置编辑状态 | `void` |
| `destroy()` | 销毁实例 | `void` |

#### loadImage(source)

加载底图，支持 URL、Blob、Base64 格式。

**参数说明**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `source` | `string\|Blob` | **是** | 图片源 |

**返回值**

`Promise<void>` - 加载完成的 Promise

**使用示例**

```javascript
editor.loadImage('https://example.com/image.png')
  .then(function() {
    console.log('图片加载完成');
  });
```

#### setText(options)

设置文字内容、样式、位置等。

**参数说明**

| 参数 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| `content` | `string` | 否 | `''` | 文字内容 |
| `style` | `string` | 否 | `''` | CSS 样式字符串 |
| `position` | `Object` | 否 | `{x:50, y:50}` | 百分比位置 |
| `scale` | `number` | 否 | `1` | 缩放比例 |
| `align` | `string` | 否 | `'center'` | 对齐方式 |

**使用示例**

```javascript
editor.setText({
  content: 'Hello World',
  style: 'font-size: 32px; color: #ffffff;',
  position: { x: 50, y: 80 },
  scale: 1.2,
  align: 'center'
});
```

#### getImageTransform()

获取当前图片变换参数。

**返回值**

`Object` - `{offsetX, offsetY, scale}`

**使用示例**

```javascript
var transform = editor.getImageTransform();
console.log(transform); // {offsetX: 0, offsetY: 0, scale: 1}
```

#### setImageTransform(options)

设置图片变换参数。

**参数说明**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `offsetX` | `number` | 否 | X 轴偏移量 |
| `offsetY` | `number` | 否 | Y 轴偏移量 |
| `scale` | `number` | 否 | 缩放比例 |

**使用示例**

```javascript
editor.setImageTransform({
  offsetX: 10,
  offsetY: -20,
  scale: 1.5
});
```

#### export()

导出编辑结果，合成底图和文字层。

**返回值**

`Promise<string>` - PNG 格式的 DataURL

**使用示例**

```javascript
editor.export()
  .then(function(dataURL) {
    console.log('导出完成:', dataURL);
    // 可用于下载或显示
    var img = new Image();
    img.src = dataURL;
    document.body.appendChild(img);
  });
```

#### reset()

重置编辑状态，清空所有设置。

```javascript
editor.reset();
```

#### destroy()

销毁实例，释放资源。销毁后无法再使用任何方法。

```javascript
editor.destroy();
```

---

### MaterialEditorUI - 编辑器 UI 组件

弹窗式的素材编辑器 UI 组件，提供可视化的编辑界面。

#### 方法列表

| 方法 | 说明 | 返回值 |
|------|------|--------|
| `open(options)` | 打开编辑器弹窗 | `void` |
| `close()` | 关闭编辑器弹窗 | `void` |

#### open(options)

打开编辑器弹窗。

**参数说明**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `image` | `string\|Blob` | 否 | 初始底图 |
| `width` | `number` | **是** | 画布宽度 |
| `height` | `number` | **是** | 画布高度 |
| `text` | `Object` | 否 | 初始文字配置 |
| `text.content` | `string` | 否 | 文字内容 |
| `text.style` | `string` | 否 | CSS 样式字符串 |
| `text.position` | `Object` | 否 | 百分比位置 `{x, y}` |
| `text.scale` | `number` | 否 | 缩放比例 |
| `text.align` | `string` | 否 | 对齐方式 |
| `onSave` | `Function` | 否 | 保存回调，参数为 DataURL |
| `onCancel` | `Function` | 否 | 取消回调 |

**使用示例**

```javascript
MeeWoo.Components.MaterialEditorUI.open({
  image: 'https://example.com/image.png',
  width: 800,
  height: 600,
  text: {
    content: 'Hello World',
    style: 'font-size: 24px; color: #fff;'
  },
  onSave: function(dataURL) {
    console.log('保存成功:', dataURL);
  },
  onCancel: function() {
    console.log('取消编辑');
  }
});
```

#### close()

关闭编辑器弹窗。

```javascript
MeeWoo.Components.MaterialEditorUI.close();
```

---

## 常见场景代码示例

### 场景一：只渲染文字

仅渲染文字到透明背景 Canvas。

```javascript
MeeWoo.Services.TextRenderer.render({
  width: 500,
  height: 200,
  text: 'Hello World\n这是第二行',
  style: 'font-size: 36px; color: #ff6600; font-weight: bold; text-shadow: 2px 2px 4px rgba(0,0,0,0.5);',
  position: { x: 50, y: 50 },
  align: 'center'
}).then(function(dataURL) {
  var img = new Image();
  img.src = dataURL;
  document.body.appendChild(img);
});
```

### 场景二：只变换图片

对图片进行缩放、裁剪处理。

```javascript
// 加载并变换图片
MeeWoo.Services.ImageTransformer.transform({
  source: 'https://example.com/photo.jpg',
  targetWidth: 400,
  targetHeight: 400,
  fit: 'cover',
  transform: {
    offsetX: 0,
    offsetY: 0,
    scale: 1.2
  }
}).then(function(dataURL) {
  var img = new Image();
  img.src = dataURL;
  document.body.appendChild(img);
});
```

### 场景三：合成底图和文字

将底图和文字层合成为最终图片。

```javascript
var width = 800;
var height = 600;

// 1. 变换底图
var bgPromise = MeeWoo.Services.ImageTransformer.transform({
  source: 'background.jpg',
  targetWidth: width,
  targetHeight: height,
  fit: 'cover'
});

// 2. 渲染文字
var textPromise = MeeWoo.Services.TextRenderer.render({
  width: width,
  height: height,
  text: '精美文案',
  style: 'font-size: 48px; color: #ffffff; font-weight: bold;',
  position: { x: 50, y: 80 },
  align: 'center'
});

// 3. 合成
Promise.all([bgPromise, textPromise])
  .then(function(results) {
    return MeeWoo.Services.MaterialComposer.compose({
      background: results[0],
      textLayer: results[1],
      width: width,
      height: height,
      format: 'png'
    });
  })
  .then(function(dataURL) {
    console.log('合成完成:', dataURL);
  });
```

### 场景四：使用完整编辑器服务

使用 MaterialEditorService 进行完整的编辑流程。

```javascript
// 1. 创建编辑器实例
var editor = MeeWoo.Services.MaterialEditorService.create({
  width: 800,
  height: 600
});

// 2. 加载底图
editor.loadImage('background.jpg')
  .then(function() {
    console.log('底图加载完成');
    
    // 3. 设置文字
    editor.setText({
      content: '标题文字\n副标题',
      style: 'font-size: 32px; color: #ffffff; font-weight: bold;',
      position: { x: 50, y: 30 },
      align: 'center'
    });
    
    // 4. 设置图片变换（可选）
    editor.setImageTransform({
      scale: 1.1,
      offsetY: 20
    });
    
    // 5. 导出结果
    return editor.export();
  })
  .then(function(dataURL) {
    console.log('导出成功:', dataURL);
    
    // 6. 销毁实例
    editor.destroy();
  })
  .catch(function(err) {
    console.error('操作失败:', err);
    editor.destroy();
  });
```

### 场景五：使用 UI 弹窗组件

使用 MaterialEditorUI 提供可视化编辑界面。

```javascript
// 打开编辑器弹窗
MeeWoo.Components.MaterialEditorUI.open({
  image: 'https://example.com/background.jpg',
  width: 800,
  height: 600,
  text: {
    content: '初始文案',
    style: 'font-size: 24px; color: #ffffff;',
    position: { x: 50, y: 50 },
    align: 'center'
  },
  onSave: function(dataURL) {
    // 用户点击保存后的处理
    console.log('用户保存了编辑结果');
    
    // 可以上传到服务器
    // uploadToServer(dataURL);
    
    // 或者下载到本地
    var link = document.createElement('a');
    link.download = 'edited-image.png';
    link.href = dataURL;
    link.click();
  },
  onCancel: function() {
    console.log('用户取消了编辑');
  }
});

// 如果需要手动关闭
// MeeWoo.Components.MaterialEditorUI.close();
```

---

## 依赖说明

| 服务 | 依赖 | 说明 |
|------|------|------|
| TextRenderer | 无 | 纯 Canvas API |
| ImageTransformer | 无 | 纯 Canvas API |
| MaterialComposer | Konva.js | 需要全局变量 `Konva` |
| MaterialEditorService | TextRenderer, ImageTransformer, MaterialComposer | 组合以上服务 |
| MaterialEditorUI | MaterialEditorService | 可选依赖，无服务时降级为简化模式 |

---

## 错误处理

所有 Promise 方法都会在失败时 reject 并返回 Error 对象：

```javascript
MeeWoo.Services.TextRenderer.render(options)
  .then(function(dataURL) {
    // 成功处理
  })
  .catch(function(err) {
    console.error('错误:', err.message);
  });
```

常见错误信息：

| 错误信息 | 原因 |
|----------|------|
| `文字内容不能为空` | render() 未提供 text 参数 |
| `图片加载失败` | 图片 URL 无效或跨域限制 |
| `缺少图片源参数` | transform() 未提供 source |
| `缺少目标尺寸参数` | transform() 未提供 targetWidth/targetHeight |
| `Konva library not loaded` | MaterialComposer 依赖未加载 |
| `没有可导出的内容` | export() 时无底图且无文字 |
| `实例已销毁，无法执行操作` | 在 destroy() 后调用方法 |
