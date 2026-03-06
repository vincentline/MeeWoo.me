# Figma 插件架构与通信机制


/**
 * Figma插件架构与通信机制Rules
 * @description Generated from figma-plugin-architecture.md
 */
export interface Figma插件架构与通信机制Rules {
  /** 
   * 规则描述 
   */
  description: string;
}


# Figma 插件架构与通信机制
> 摘要: 插件运行机制与 UI-逻辑双向通信
> 类型: Reference

## 1. 核心要点 (Key Points)

### 插件运行架构
```
┌─────────────────────────────────────┐
│           Figma 主线程              │
│  ┌─────────────────────────────┐    │
│  │  code.js (插件逻辑)          │    │
│  │  - 访问 Figma API            │    │
│  │  - 操作文档节点              │    │
│  └─────────────────────────────┘    │
│              ↕ postMessage           │
│  ┌─────────────────────────────┐    │
│  │  ui.html (iframe)            │    │
│  │  - 用户界面                  │    │
│  │  - 访问浏览器 API            │    │
│  └─────────────────────────────┘    │
└─────────────────────────────────────┘
```

### 双向通信
| 方向 | 发送方法 | 接收方法 |
|------|----------|----------|
| UI → 逻辑 | `parent.postMessage({ pluginMessage: {...} }, '*')` | `figma.ui.onmessage = (msg) => {}` |
| 逻辑 → UI | `figma.ui.postMessage({...})` | `window.onmessage = (e) => e.data.pluginMessage` |

### 关键限制
- **无法后台运行**: 插件必须由用户启动，一次只能运行一个
- **沙箱隔离**: UI 在 iframe 中，无法直接访问 Figma API
- **动态加载**: 页面按需加载，需用异步 API 访问其他页面

### manifest.json 核心配置
```json
{
  "name": "My Plugin",
  "id": "1234567890",
  "api": "1.0.0",
  "main": "code.js",
  "ui": "ui.html",
  "permissions": ["currentuser"],
  "capabilities": ["textreview"]
}
```

## 2. 适用场景 (Use Cases)
- 创建 Figma/FigJam 插件
- 理解插件通信机制
- 排查消息传递问题

## 3. 代码/配置示例 (Examples)
```javascript
// code.js - 插件逻辑
figma.showUI(__html__, { width: 300, height: 200 });

figma.ui.onmessage = (msg) => {
  if (msg.type === 'create') {
    const rect = figma.createRectangle();
    figma.currentPage.appendChild(rect);
    figma.closePlugin('Created!');
  }
};

// ui.html - UI 端
parent.postMessage({ pluginMessage: { type: 'create' } }, '*');
```

## 4. 关联信息 (Meta)
- 来源: ai_protocol_hub/skill_specs/figma_plugin
- 建议归档位置: `modules/ui/figma-plugin.ts.md`


## Figma 节点类型与层次结构 (Merged)

# Figma 节点类型与层次结构
> 摘要: Figma 文档节点模型与常用属性
> 类型: Reference

## 1. 核心要点 (Key Points)

### 节点层次结构
```
DocumentNode (文档根)
└── PageNode (页面)
    └── SceneNode (场景节点)
        ├── FrameNode (框架)
        ├── ComponentNode (组件)
        ├── InstanceNode (实例)
        ├── TextNode (文本)
        ├── RectangleNode (矩形)
        ├── EllipseNode (椭圆)
        ├── VectorNode (矢量)
        ├── GroupNode (组)
        └── BooleanOperationNode (布尔运算)
```

### 通用节点属性
| 属性 | 说明 |
|------|------|
| `id` | 唯一标识符 |
| `name` | 节点名称 |
| `type` | 节点类型 |
| `visible` | 是否可见 |
| `locked` | 是否锁定 |
| `parent` | 父节点 |
| `children` | 子节点列表 |

### 场景节点属性
| 属性 | 说明 |
|------|------|
| `x`, `y` | 相对父节点坐标 |
| `width`, `height` | 尺寸 |
| `rotation` | 旋转角度 |
| `opacity` | 不透明度 (0-1) |
| `fills` | 填充 |
| `strokes` | 描边 |
| `effects` | 效果 |

### 类型判断方法
```javascript
node.isFrame()      // 是否框架
node.isText()       // 是否文本
node.isComponent()  // 是否组件
node.isInstance()   // 是否实例
```

## 2. 适用场景 (Use Cases)
- 遍历文档结构
- 查找特定节点
- 操作节点属性

## 3. 代码/配置示例 (Examples)
```javascript
// 查找所有文本节点
const textNodes = figma.currentPage.findAll(node => node.type === 'TEXT');

// 遍历节点树
figma.currentPage.traverse(node => {
  if (node.type === 'TEXT') {
    console.log(node.characters);
  }
});

// 创建矩形
const rect = figma.createRectangle();
rect.x = 100;
rect.y = 100;
rect.resize(200, 150);
rect.fills = [{ type: 'SOLID', color: { r: 1, g: 0, b: 0, a: 1 } }];
figma.currentPage.appendChild(rect);
```

## 4. 关联信息 (Meta)
- 来源: ai_protocol_hub/skill_specs/figma_plugin
- 建议归档位置: `modules/ui/figma-plugin.ts.md`



## Figma 插件常用 API 方法 (Merged)

# Figma 插件常用 API 方法
> 摘要: 节点创建、查找、样式操作等核心 API
> 类型: Reference

## 1. 核心要点 (Key Points)

### 节点创建
| 方法 | 说明 |
|------|------|
| `figma.createRectangle()` | 创建矩形 |
| `figma.createText()` | 创建文本 |
| `figma.createFrame()` | 创建框架 |
| `figma.createComponent()` | 创建组件 |
| `figma.createNodeFromSvg(svg)` | 从 SVG 创建 |

### 节点查找
| 方法 | 说明 |
|------|------|
| `figma.getNodeByIdAsync(id)` | 通过 ID 查找 |
| `node.findAll(callback)` | 查找所有匹配节点 |
| `node.findOne(callback)` | 查找第一个匹配节点 |

### 节点操作
| 方法 | 说明 |
|------|------|
| `parent.appendChild(child)` | 添加子节点 |
| `parent.insertChild(index, child)` | 插入子节点 |
| `node.clone()` | 克隆节点 |
| `node.resize(w, h)` | 调整尺寸 |
| `node.remove()` | 删除节点 |

### 样式创建
| 方法 | 说明 |
|------|------|
| `figma.createPaintStyle()` | 创建颜色样式 |
| `figma.createTextStyle()` | 创建文本样式 |
| `figma.createEffectStyle()` | 创建效果样式 |

### UI 与通知
| 方法 | 说明 |
|------|------|
| `figma.showUI(html, options)` | 显示 UI |
| `figma.notify(message)` | 显示通知 |
| `figma.closePlugin(message)` | 关闭插件 |

### 字体处理（关键！）
```javascript
// 修改文本前必须加载字体
await figma.loadFontAsync({ family: "Inter", style: "Regular" });
textNode.fontName = { family: "Inter", style: "Regular" };
textNode.characters = "Hello";
```

## 2. 适用场景 (Use Cases)
- 创建/修改设计元素
- 批量处理节点
- 样式管理

## 3. 代码/配置示例 (Examples)
```javascript
// 创建带文本的框架
const frame = figma.createFrame();
frame.resize(300, 200);
frame.fills = [{ type: 'SOLID', color: { r: 0.9, g: 0.9, b: 0.9, a: 1 } }];

await figma.loadFontAsync({ family: "Inter", style: "Regular" });
const text = figma.createText();
text.characters = "Hello Figma";
text.fontSize = 24;
frame.appendChild(text);

figma.currentPage.appendChild(frame);
figma.currentPage.selection = [frame];
figma.viewport.scrollAndZoomIntoView([frame]);
```

## 4. 关联信息 (Meta)
- 来源: ai_protocol_hub/skill_specs/figma_plugin
- 建议归档位置: `modules/ui/figma-plugin.ts.md`



## Figma 插件常见问题与最佳实践 (Merged)

# Figma 插件常见问题与最佳实践
> 摘要: 字体加载、消息传递、性能优化等高频问题
> 类型: Reference

## 1. 核心要点 (Key Points)

### 高频问题

#### 1. 字体加载失败
```javascript
// ❌ 错误：未加载字体就修改文本
textNode.characters = "Hello";

// ✅ 正确：先加载字体
await figma.loadFontAsync({ family: "Inter", style: "Regular" });
textNode.fontName = { family: "Inter", style: "Regular" };
textNode.characters = "Hello";
```

#### 2. UI 不显示
- 确保 `figma.showUI(__html__)` 被调用
- 检查 manifest.json 中 `ui` 路径正确

#### 3. 消息传递失败
```javascript
// UI 端发送
parent.postMessage({ pluginMessage: { type: 'action' } }, '*');

// 逻辑端接收
figma.ui.onmessage = (msg) => {
  if (msg.type === 'action') { /* ... */ }
};
```

#### 4. API 权限问题
- 在 manifest.json 的 `permissions` 中添加必要权限
- 使用 try-catch 处理可能的错误

### 性能优化
| 策略 | 说明 |
|------|------|
| 使用异步 API | `getNodeByIdAsync()` 替代 `getNodeById()` |
| 合并操作 | 多个操作合并为一个事务 |
| commitUndo() | 分组操作，提高撤销性能 |
| 分批处理 | 大型操作分页/分批 |

### 最佳实践
- **用户体验**: 使用 `figma.notify()` 提供反馈
- **错误处理**: 捕获异常，显示友好错误
- **代码质量**: 使用 TypeScript + ESLint
- **安全**: 验证用户输入，限制权限

## 2. 适用场景 (Use Cases)
- 排查插件问题
- 优化插件性能
- 提高代码质量

## 3. 代码/配置示例 (Examples)
```javascript
// 完整的插件示例
figma.showUI(__html__, { width: 300, height: 200 });

figma.ui.onmessage = async (msg) => {
  try {
    if (msg.type === 'create-text') {
      await figma.loadFontAsync({ family: "Inter", style: "Regular" });
      
      const text = figma.createText();
      text.characters = msg.content;
      text.fontSize = 24;
      
      figma.currentPage.appendChild(text);
      figma.currentPage.selection = [text];
      figma.viewport.scrollAndZoomIntoView([text]);
      
      figma.notify('Text created!');
      figma.closePlugin();
    }
  } catch (error) {
    figma.notify('Error: ' + error.message, { error: true });
  }
};
```

## 4. 关联信息 (Meta)
- 来源: ai_protocol_hub/skill_specs/figma_plugin
- 建议归档位置: `modules/ui/figma-plugin.ts.md`

