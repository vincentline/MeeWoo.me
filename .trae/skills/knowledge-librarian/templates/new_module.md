---
module_name: [ModuleName]
type: new
domain: [graphics|media|ui|engineering|core|data|business]
tags: [keywords]
version: 1.0.0
---

# [ModuleName] 模块规则

```typescript
/**
 * [ModuleName] 核心规则定义
 * @description [简述模块功能和定位]
 */
export interface [ModuleName]Rules {
  /**
   * 核心配置项
   * @description 模块的关键配置参数
   */
  config: {
    /** 
     * [配置项名称]
     * @default [DefaultValue]
     */
    [key: string]: any;
  };

  /**
   * 行为约束
   * @description 必须遵守的实现规则
   */
  constraints: string[];

  /**
   * 最佳实践
   * @description 推荐的编码模式
   */
  bestPractices: string[];
}
```

## 1. 概述 (Overview)
[详细描述模块的功能、背景和设计目标]

## 2. 核心配置 (Configuration)
- **Config A**: ...
- **Config B**: ...

## 3. 实现规则 (Implementation Rules)
1. **Rule 1**: ...
2. **Rule 2**: ...

## 4. 示例代码 (Examples)
```typescript
// Example usage
```
