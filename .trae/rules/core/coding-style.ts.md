# 代码规范 (Coding Style)

```typescript
/**
 * 代码风格与命名规范
 * Code Style & Naming Conventions
 * @reference f:\my_tools\MeeWoo\MeeWoo\CODE_STYLE.md
 */
export interface CodingStyle {
  /**
   * 缩进与格式化
   * @rule 缩进: 2 空格 (禁止使用 Tab)
   * @rule 换行: LF
   */
  formatting: {
    indent: "2 spaces";
    semicolon: "required";
    quotes: "single";
  };

  /**
   * 命名规范
   * @rule 变量/方法使用小驼峰 (camelCase)
   * @rule 类/组件使用大驼峰 (PascalCase)
   * @rule 常量使用全大写 (UPPER_CASE)
   */
  naming: {
    /** @example const userName = 'Alice' */
    variables: "camelCase";
    
    /** @example function calculateTotal() {} */
    functions: "camelCase (Verb-first)";
    
    /** @example class UserManager {} */
    classes: "PascalCase";
    
    /** @example const MAX_RETRY = 3 */
    constants: "UPPER_CASE";
    
    /** @example isVisible, hasPermission */
    booleans: "is/has/should prefix";
    
    /** @example user-profile.vue */
    files: "kebab-case";
  };

  /**
   * 代码组织原则
   * @rule 保持模块聚焦和单一职责
   * @rule 避免向 app.js 添加逻辑
   */
  structure: {
    /** 模块化开发，避免巨型文件 */
    modularity: "High Cohesion, Low Coupling";
    /** 优先提取独立功能到单独文件 */
    refactoring: "Extract Function/Class";
    /** 目录结构清晰，按功能分层 */
    directories: "Feature-based";
  };

  /**
   * 注释规范
   * @language 中文 (简体)
   * @format JSDoc
   */
  comments: {
    /** 文件头必须包含功能说明 */
    fileHeader: "Required";
    /** 复杂逻辑必须有行内注释 */
    inline: "As needed for complexity";
    /** 公共方法必须有 JSDoc 注释 (参数, 返回值) */
    publicAPI: "JSDoc Required";
  };
}
```

## 1. 缩进规范 (Indentation)
- 使用 **2 个空格**缩进（禁止 Tab）
- 多行延续缩进 2 个空格

## 2. 命名规范 (Naming Conventions)

| 类型 | 规范 | 示例 |
|------|------|------|
| 变量 | 驼峰命名法 | `userName`, `isLoading` |
| 布尔值 | `is/has/can/should` 前缀 | `isValid`, `hasPermission` |
| 函数 | 动词开头 | `openFile()`, `handleClick()` |
| 常量 | 全大写 + 下划线 | `MAX_SIZE`, `API_URL` |
| 组件/模块 | 名词形式 | `UserManager`, `DataParser` |

## 3. 代码组织 (Code Organization)
- 新功能独立模块化，避免全部写在 `app.js`
- 保持模块代码行数适中
- 每个文件必须有功能描述注释

## 4. 注释规范 (Comments)
- **必须使用中文注释**
- 注释与代码同步更新
- 空行不超过 1 行
- 文件头部包含：职责简介、功能、模块索引
- 每个函数/类必须有注释

## 5. 代码生成原则 (Code Generation Principles)
- 修改代码前先阅读注释了解原有逻辑
- 新功能考虑可维护性和扩展性
- 优先复用现有技术和方案
- 使用新技术后总结文档
