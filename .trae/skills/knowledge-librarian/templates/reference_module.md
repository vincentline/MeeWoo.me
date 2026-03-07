---
module_name: [ModuleName]
type: reference
domain: [graphics|media|ui|engineering|core|data|business]
tags: [keywords]
version: 1.0.0
---

# [ModuleName] API 速查表 (Reference)

```typescript
/**
 * [ModuleName] API 规范
 * @description [ModuleName] 的接口定义与参数说明
 * @version [Applicable Version]
 */
export interface [ModuleName]API {
  /**
   * 核心接口定义
   */
  interfaces: {
    [InterfaceName]: {
      /** 属性说明 */
      [Property]: string;
    };
  };

  /**
   * 配置参数详解
   */
  configuration: {
    /** 
     * 参数名
     * @required [true/false]
     * @default [Value]
     */
    [ParamName]: string;
  };

  /**
   * 兼容性矩阵
   */
  compatibility: {
    [Environment]: boolean | "Partial";
  };
}
```

## 1. 核心接口 (Core Interfaces)
```typescript
interface [InterfaceName] {
  // ...
}
```

## 2. 配置项说明 (Configuration)
| 参数名 | 类型 | 必填 | 默认值 | 说明 |
| :--- | :--- | :--- | :--- | :--- |
| `option` | string | 是 | - | ... |

## 3. 常用代码片段 (Snippets)
```typescript
// Snippet
```
