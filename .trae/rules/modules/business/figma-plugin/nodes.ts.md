---
module_name: FigmaNodes
type: reference
description: Figma 节点类型与层次结构
version: 1.0.0
---

# Figma 节点类型与层次结构

```typescript
/**
 * Figma 节点模型
 */
export interface FigmaNodes {
  /** 节点类型 */
  types: "Document | Page | Frame | Component | Instance | Text | Rectangle | ...";
  /** 通用属性 */
  commonProps: "id, name, type, visible, locked, parent, children";
}
```

> 摘要: Figma 文档节点模型与常用属性

## 1. 核心要点 (Key Points)

### 节点层次结构
```
DocumentNode (文档根)
└── PageNode (页面)
    └── SceneNode (场景节点)
        ├── FrameNode (框架)
        ├── ComponentNode (组件)
        ├── InstanceNode (实例)
        └── ...
```

### 场景节点属性
| 属性 | 说明 |
|------|------|
| `x`, `y` | 相对父节点坐标 |
| `width`, `height` | 尺寸 |
| `rotation` | 旋转角度 |
| `fills` | 填充 |
| `strokes` | 描边 |

### 类型判断方法
```javascript
node.isFrame()      // 是否框架
node.isText()       // 是否文本
node.isComponent()  // 是否组件
```
