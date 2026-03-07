#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Skill Creator - 技能初始化工具
==============================

功能说明:
    从模板创建新的 Skill 目录结构。
    自动生成 SKILL.md、示例脚本、参考文档和资源目录。

使用方式:
    # 在指定路径创建新技能
    python init_skill.py <skill-name> --path <path>

示例:
    # 在 skills/public 目录下创建新技能
    python init_skill.py my-new-skill --path skills/public

    # 在 skills/private 目录下创建私有技能
    python init_skill.py my-api-helper --path skills/private

    # 在自定义位置创建技能
    python init_skill.py custom-skill --path /custom/location

命名规范:
    - 使用 kebab-case (小写字母、数字、连字符)
    - 最大长度 40 字符
    - 目录名必须与技能名完全匹配

生成的目录结构:
    <skill-name>/
    ├── SKILL.md              # 技能定义文件
    ├── scripts/              # 可执行脚本
    │   └── example.py
    ├── references/           # 参考文档
    │   └── api_reference.md
    └── assets/               # 资源文件
        └── example_asset.txt



"""

import sys
from pathlib import Path


# ============================================================================
# 模板定义
# ============================================================================

SKILL_TEMPLATE = """---
name: {skill_name}
description: [TODO: 完整描述此技能的功能和使用场景。包括何时使用此技能 - 特定的场景、文件类型或触发任务。]
---

# {skill_title}

## 概述

[TODO: 1-2 句话说明此技能的作用]

## 技能结构

[TODO: 选择最适合此技能用途的结构。常见模式:

**1. 工作流模式** (适合顺序流程)
- 适用于有明确步骤的程序
- 示例: DOCX 技能的 "工作流决策树" → "读取" → "创建" → "编辑"
- 结构: ## 概述 → ## 工作流决策树 → ## 步骤1 → ## 步骤2...

**2. 任务模式** (适合工具集合)
- 适用于提供多种操作/能力的技能
- 示例: PDF 技能的 "快速开始" → "合并 PDF" → "拆分 PDF" → "提取文本"
- 结构: ## 概述 → ## 快速开始 → ## 任务类别1 → ## 任务类别2...

**3. 参考/指南模式** (适合标准或规范)
- 适用于品牌指南、编码标准或需求文档
- 示例: 品牌样式的 "品牌指南" → "颜色" → "排版" → "特性"
- 结构: ## 概述 → ## 指南 → ## 规范 → ## 使用...

**4. 能力模式** (适合集成系统)
- 适用于提供多个相互关联功能的技能
- 示例: 产品管理的 "核心能力" → 编号能力列表
- 结构: ## 概述 → ## 核心能力 → ### 1. 功能 → ### 2. 功能...

模式可以混合使用。大多数技能结合多种模式 (如以任务模式开始，为复杂操作添加工作流)。

完成后删除此整个 "技能结构" 部分 - 这只是指导。]

## [TODO: 根据选择的结构替换为第一个主要章节]

[TODO: 在此添加内容。参考现有技能示例:
- 技术技能的代码示例
- 复杂工作流的决策树
- 真实用户请求的具体示例
- 根据需要引用 scripts/templates/references]

## 资源

此技能包含示例资源目录，演示如何组织不同类型的捆绑资源:

### scripts/
可直接执行以执行特定操作的代码 (Python/Bash 等)。

**其他技能示例:**
- PDF 技能: `fill_fillable_fields.py`, `extract_form_field_info.py` - PDF 操作工具
- DOCX 技能: `document.py`, `utilities.py` - 文档处理 Python 模块

**适用于:** Python 脚本、Shell 脚本，或任何执行自动化、数据处理或特定操作的可执行代码。

**注意:** 脚本可能在不加载到上下文的情况下执行，但仍可被 Claude 读取以进行修补或环境调整。

### references/
旨在加载到上下文中以指导 Claude 流程和思考的文档和参考资料。

**其他技能示例:**
- 产品管理: `communication.md`, `context_building.md` - 详细工作流指南
- BigQuery: API 参考文档和查询示例
- 财务: Schema 文档、公司政策

**适用于:** 深度文档、API 参考、数据库 Schema、综合指南，或 Claude 工作时应参考的任何详细信息。

### assets/
不打算加载到上下文中，而是在 Claude 产生的输出中使用的文件。

**其他技能示例:**
- 品牌样式: PowerPoint 模板文件 (.pptx)、Logo 文件
- 前端构建器: HTML/React 样板项目目录
- 排版: 字体文件 (.ttf, .woff2)

**适用于:** 模板、样板代码、文档模板、图片、图标、字体，或任何旨在复制或用于最终输出的文件。

---

**可以删除任何不需要的目录。** 并非每个技能都需要所有三种类型的资源。
"""

EXAMPLE_SCRIPT = '''#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
{skill_name} 示例辅助脚本

这是一个可直接执行的占位脚本。
请替换为实际实现或删除 (如果不需要)。

其他技能的真实脚本示例:
- pdf/scripts/fill_fillable_fields.py - 填充 PDF 表单字段
- pdf/scripts/convert_pdf_to_images.py - 将 PDF 页面转换为图片
"""

def main():
    """主函数入口。"""
    print("这是 {skill_name} 的示例脚本")
    # TODO: 在此添加实际脚本逻辑
    # 可以是数据处理、文件转换、API 调用等

if __name__ == "__main__":
    main()
'''

EXAMPLE_REFERENCE = """# {skill_title} 参考文档

这是详细参考文档的占位符。
请替换为实际参考内容或删除 (如果不需要)。

其他技能的真实参考文档示例:
- product-management/references/communication.md - 状态更新综合指南
- product-management/references/context_building.md - 收集上下文深度指南
- bigquery/references/ - API 参考和查询示例

## 参考文档何时有用

参考文档适用于:
- 全面的 API 文档
- 详细的工作流指南
- 复杂的多步骤流程
- 对 SKILL.md 来说太长的信息
- 仅特定用例需要的内容

## 结构建议

### API 参考示例
- 概述
- 认证
- 带示例的端点
- 错误代码
- 速率限制

### 工作流指南示例
- 前置条件
- 分步说明
- 常见模式
- 故障排除
- 最佳实践
"""

EXAMPLE_ASSET = """# 示例资源文件

此占位符表示资源文件的存储位置。
请替换为实际资源文件 (模板、图片、字体等) 或删除 (如果不需要)。

资源文件不打算加载到上下文中，而是在 Claude 产生的输出中使用。

其他技能的资源文件示例:
- 品牌指南: logo.png, slides_template.pptx
- 前端构建器: hello-world/ 目录，包含 HTML/React 样板
- 排版: custom-font.ttf, font-family.woff2
- 数据: sample_data.csv, test_dataset.json

## 常见资源类型

- 模板: .pptx, .docx, 样板目录
- 图片: .png, .jpg, .svg, .gif
- 字体: .ttf, .otf, .woff, .woff2
- 样板代码: 项目目录、启动文件
- 图标: .ico, .svg
- 数据文件: .csv, .json, .xml, .yaml

注意: 这是文本占位符。实际资源可以是任何文件类型。
"""


def title_case_skill_name(skill_name):
    """
    将 kebab-case 技能名转换为 Title Case 显示格式。

    Args:
        skill_name (str): kebab-case 格式的技能名

    Returns:
        str: Title Case 格式的技能名

    Example:
        >>> title_case_skill_name("my-new-skill")
        'My New Skill'
    """
    return ' '.join(word.capitalize() for word in skill_name.split('-'))


def init_skill(skill_name, path):
    """
    初始化新的技能目录及模板 SKILL.md。

    工作流程:
        1. 创建技能目录
        2. 从模板创建 SKILL.md
        3. 创建 scripts/ 目录及示例脚本
        4. 创建 references/ 目录及示例文档
        5. 创建 assets/ 目录及示例资源

    Args:
        skill_name (str): 技能名称 (kebab-case)
        path (str): 技能目录的创建路径

    Returns:
        Path | None: 创建的技能目录路径，失败时返回 None
    """
    # 确定技能目录路径
    skill_dir = Path(path).resolve() / skill_name

    # 检查目录是否已存在
    if skill_dir.exists():
        print(f"❌ 错误: 技能目录已存在: {skill_dir}")
        return None

    # 创建技能目录
    try:
        skill_dir.mkdir(parents=True, exist_ok=False)
        print(f"✅ 已创建技能目录: {skill_dir}")
    except Exception as e:
        print(f"❌ 创建目录失败: {e}")
        return None

    # 创建 SKILL.md
    skill_title = title_case_skill_name(skill_name)
    skill_content = SKILL_TEMPLATE.format(
        skill_name=skill_name,
        skill_title=skill_title
    )

    skill_md_path = skill_dir / 'SKILL.md'
    try:
        skill_md_path.write_text(skill_content, encoding='utf-8')
        print("✅ 已创建 SKILL.md")
    except Exception as e:
        print(f"❌ 创建 SKILL.md 失败: {e}")
        return None

    # 创建资源目录及示例文件
    try:
        # 创建 scripts/ 目录及示例脚本
        scripts_dir = skill_dir / 'scripts'
        scripts_dir.mkdir(exist_ok=True)
        example_script = scripts_dir / 'example.py'
        example_script.write_text(EXAMPLE_SCRIPT.format(skill_name=skill_name), encoding='utf-8')
        example_script.chmod(0o755)
        print("✅ 已创建 scripts/example.py")

        # 创建 references/ 目录及示例参考文档
        references_dir = skill_dir / 'references'
        references_dir.mkdir(exist_ok=True)
        example_reference = references_dir / 'api_reference.md'
        example_reference.write_text(EXAMPLE_REFERENCE.format(skill_title=skill_title), encoding='utf-8')
        print("✅ 已创建 references/api_reference.md")

        # 创建 assets/ 目录及示例资源占位符
        assets_dir = skill_dir / 'assets'
        assets_dir.mkdir(exist_ok=True)
        example_asset = assets_dir / 'example_asset.txt'
        example_asset.write_text(EXAMPLE_ASSET, encoding='utf-8')
        print("✅ 已创建 assets/example_asset.txt")
    except Exception as e:
        print(f"❌ 创建资源目录失败: {e}")
        return None

    # 打印后续步骤
    print(f"\n✅ 技能 '{skill_name}' 初始化成功，位置: {skill_dir}")
    print("\n后续步骤:")
    print("1. 编辑 SKILL.md 完成 TODO 项并更新描述")
    print("2. 自定义或删除 scripts/、references/ 和 assets/ 中的示例文件")
    print("3. 准备好后运行验证器检查技能结构")

    return skill_dir


def main():
    """
    主函数入口 - CLI 命令解析和执行。
    """
    if len(sys.argv) < 4 or sys.argv[2] != '--path':
        print("用法: init_skill.py <skill-name> --path <path>")
        print("\n技能名称要求:")
        print("  - kebab-case 标识符 (如 'data-analyzer')")
        print("  - 仅限小写字母、数字和连字符")
        print("  - 最大 40 字符")
        print("  - 必须与目录名完全匹配")
        print("\n示例:")
        print("  init_skill.py my-new-skill --path skills/public")
        print("  init_skill.py my-api-helper --path skills/private")
        print("  init_skill.py custom-skill --path /custom/location")
        sys.exit(1)

    skill_name = sys.argv[1]
    path = sys.argv[3]

    print(f"🚀 初始化技能: {skill_name}")
    print(f"   位置: {path}")
    print()

    result = init_skill(skill_name, path)

    if result:
        sys.exit(0)
    else:
        sys.exit(1)


if __name__ == "__main__":
    main()
