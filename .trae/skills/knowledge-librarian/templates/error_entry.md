# 错误日志 (Error Log Entry)

```typescript
/**
 * 错误记录规范
 * @description 记录开发过程中遇到的复杂错误、解决方案和预防措施
 */
export interface ErrorLogEntry {
  /**
   * 错误标题
   * @format [YYYY-MM-DD] 简短描述
   */
  title: string;

  /**
   * 错误上下文
   * @description 发生场景、涉及模块、复现步骤
   */
  context: string;

  /**
   * 错误信息
   * @description 关键报错堆栈或日志
   */
  errorMessage: string;

  /**
   * 根本原因 (Root Cause)
   * @description 深入分析后的真实原因
   */
  rootCause: string;

  /**
   * 解决方案
   * @description 修复步骤或代码片段
   */
  solution: string;

  /**
   * 预防措施
   * @description 如何避免再次发生 (e.g. 更新文档, 增加检查)
   */
  prevention: string;
}
```

## [YYYY-MM-DD] [Error Title]

- **Context**: ...
- **Error Message**:
  ```
  ...
  ```
- **Root Cause**: ...
- **Solution**: ...
- **Prevention**: ...
