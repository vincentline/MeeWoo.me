# Python 编程最佳实践
> 摘要: 总结了 Python 编程的核心规范、项目结构、测试方法及性能优化策略。

## 1. 问题背景 (Context)
- **场景**: 项目初期或重构阶段，需要建立统一的 Python 开发标准。
- **现象**: 代码风格不统一、缺乏测试、依赖混乱。

## 2. 根本原因 (Root Cause)
- 缺乏明确的编码规范和项目管理流程。
- 未充分利用 Python 的工具链（如 pytest, mypy）。

## 3. 解决方案 (Solution)
- **编码规范**: 遵循 PEP 8，使用 Type Hints，蛇形命名。
- **项目结构**: 标准化目录结构 (`src/`, `tests/`, `setup.py`)，使用虚拟环境。
- **测试调试**: 编写单元测试 (`pytest`)，使用 mock 隔离依赖，集成 CI/CD。
- **性能优化**: 优先使用内置算法，利用生成器处理大数据，使用 `cProfile` 分析瓶颈。

```python
# 类型注解示例
from typing import List, Dict, Optional

def process_data(data: List[Dict[str, any]]) -> Optional[List[str]]:
    """处理数据并返回结果"""
    # ... implementation
    pass
```

## 4. 关联规则 (Related Rules)
- 建议新建模块: `modules/python-dev-guide.ts.md` (使用 guide_module 模板)
