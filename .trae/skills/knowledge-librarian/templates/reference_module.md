---
module_name: [ModuleName]
type: reference
description: [Short Description]
version: 1.0.0
---

# [ModuleName] API 速查表 (Reference)

> **适用版本**: [e.g., v1.0.0+]

## 1. 核心接口 (Core Interfaces)

```typescript
interface [InterfaceName] {
  /**
   * [Description]
   * @default [Value]
   */
  property: string;
}
```

## 2. 配置项说明 (Configuration)

| 参数名 | 类型 | 必填 | 默认值 | 说明 |
| :--- | :--- | :--- | :--- | :--- |
| `option` | string | 是 | - | [Description] |

## 3. 常用代码片段 (Snippets)

### [Scenario A]
```typescript
// Copyable snippet
const instance = new [ClassName]({
  // ...
});
```

### [Scenario B]
```bash
# Command line snippet
cli run --option value
```

## 4. 兼容性 (Compatibility)
- [Browser/Environment A]: ✅
- [Browser/Environment B]: ❌ (Reason)
