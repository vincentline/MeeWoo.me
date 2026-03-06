# Python 开发指南 (Python Development Guide)

```typescript
/**
 * Python 开发规范与最佳实践
 * Python Development Standards and Best Practices
 */
export interface PythonDevGuide {
  /**
   * 编码规范
   * @description Python 代码风格与命名规范
   */
  codingStyle: {
    /** 遵循 PEP 8 规范 */
    pep8: boolean;
    /** 使用 Type Hints */
    typeHints: boolean;
    /** 蛇形命名法 */
    snakeCase: boolean;
  };

  /**
   * 项目结构
   * @description 标准化的 Python 项目目录结构
   */
  projectStructure: {
    /** 源代码目录 */
    src: string;
    /** 测试目录 */
    tests: string;
    /** 配置文件 */
    setup: string;
    /** 虚拟环境 */
    virtualEnv: string;
  };

  /**
   * 测试与调试
   * @description Python 测试策略与调试方法
   */
  testing: {
    /** 单元测试框架 */
    unitTest: "pytest";
    /** 依赖隔离 */
    mock: boolean;
    /** CI/CD 集成 */
    ciCd: boolean;
  };

  /**
   * 性能优化
   * @description Python 性能提升策略
   */
  performance: {
    /** 使用内置算法 */
    builtinAlgorithms: boolean;
    /** 使用生成器处理大数据 */
    generators: boolean;
    /** 性能分析工具 */
    profiler: "cProfile";
  };
}
```

## 1. 问题背景 (Context)

- **场景**: 项目初期或重构阶段，需要建立统一的 Python 开发标准。
- **现象**: 代码风格不统一、缺乏测试、依赖混乱。

## 2. 根本原因 (Root Cause)

- 缺乏明确的编码规范和项目管理流程。
- 未充分利用 Python 的工具链（如 pytest, mypy）。

## 3. 解决方案 (Solution)

### 3.1 编码规范
- **PEP 8 标准**: 遵循官方的 Python 代码风格指南。
- **Type Hints**: 使用类型注解提高代码可读性和可维护性。
- **命名规范**: 使用蛇形命名法（snake_case）命名变量和函数。

### 3.2 项目结构
- **标准化目录**: 采用 `src/`、`tests/`、`setup.py` 的目录结构。
- **虚拟环境**: 使用 `venv` 或 `conda` 创建隔离的开发环境。
- **依赖管理**: 使用 `requirements.txt` 或 `pyproject.toml` 管理依赖。

### 3.3 测试调试
- **单元测试**: 使用 `pytest` 编写和运行单元测试。
- **依赖隔离**: 使用 `mock` 库隔离外部依赖。
- **CI/CD 集成**: 将测试集成到持续集成流程中。

### 3.4 性能优化
- **内置算法**: 优先使用 Python 内置的高效算法。
- **生成器**: 使用生成器处理大数据集，减少内存占用。
- **性能分析**: 使用 `cProfile` 分析性能瓶颈。

## 4. 代码示例

```python
# 类型注解示例
from typing import List, Dict, Optional

def process_data(data: List[Dict[str, any]]) -> Optional[List[str]]:
    """处理数据并返回结果"""
    # ... implementation
    pass
```

## 5. 关联规则

- **技术栈**: [技术栈规范](../../core/tech-stack.ts.md) - 注意：项目主要使用 JavaScript，Python 仅作为辅助工具。
- **工作流**: [工作流规范](../../core/workflows.ts.md)

## 6. 参考价值

本指南主要作为项目中可能使用的 Python 脚本、工具或辅助功能的参考规范。由于项目核心技术栈为 JavaScript，Python 相关规范仅作为补充。