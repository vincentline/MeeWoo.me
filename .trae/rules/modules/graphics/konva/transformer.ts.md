---
module_name: KonvaTransformer
type: snippet
description: Konva Transformer 分层遮挡修复
version: 1.0.0
---

# Konva Transformer 分层遮挡修复

```typescript
/**
 * Konva Transformer 遮挡修复规则
 */
export interface KonvaTransformerFix {
  /** 解决方案 */
  solution: "Independent Top Layer";
  /** 实施步骤 */
  steps: {
    step1: "Create transformerLayer";
    step2: "Add to stage LAST (top z-index)";
    step3: "Add transformer to this layer";
  };
}
```

> 摘要: 将 Transformer 放入独立的顶层 Layer 防止被内容遮挡

## 1. 问题背景 (Context)
- **场景**: 编辑器中同时存在内容元素和 Transformer 控件
- **现象**: Transformer 放在与内容相同的 Layer 时，会被后添加的元素遮挡，导致手柄无法操作

## 2. 根本原因 (Root Cause)
- Konva 的渲染顺序取决于添加顺序（z-index），同一 Layer 内后添加的元素会覆盖前面的元素

## 3. 解决方案 (Solution)
- 为 Transformer 创建独立的顶层 Layer（UI 层）
```javascript
// 正确做法 - Transformer 在独立顶层
const contentLayer = new Konva.Layer();
const transformerLayer = new Konva.Layer();  // 最后添加，在最上层
stage.add(contentLayer);
stage.add(transformerLayer);
transformerLayer.add(transformer);
```
