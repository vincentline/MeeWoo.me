import argparse
import os
import datetime
import sys
import json

"""
项目更新日志自动记录脚本 (Auto-Logger for Coder Skill)

功能：
    该脚本用于自动化记录项目中的文件变更到统一的日志文件 (.trae/logs/UPDATE_LOG.md)。
    它是 Coder Skill (v3.0) 工作流中的核心组件，确保所有代码变更都有迹可循。

使用方法：
    1. 命令行模式:
       python log_change.py --action <操作类型> --file <文件路径> --desc <变更描述>
    2. 模板文件模式 (推荐, 支持长文本):
       python log_change.py --from-file <JSON文件路径>

参数：
    --action:    变更类型 (如: 修改文件, 新增文件, 删除文件 等)
    --file:      发生变更的文件相对路径
    --desc:      变更的简短描述 (中文)
    --from-file: 读取 JSON 格式的参数文件 (包含 action, file, desc 字段)

依赖：
    - Python 3.x
    - 标准库 (argparse, os, datetime, sys, json)
    - 无需 pip 安装额外依赖 (已移除 pytz)

 
"""

# ==========================================
# 工具函数
# ==========================================

def find_project_root():
    """
    查找项目根目录（包含 .trae 目录的目录）
    
    Returns:
        str: 项目根目录的绝对路径，如果未找到则返回 None
    """
    current_dir = os.path.dirname(os.path.abspath(__file__))
    while current_dir != os.path.dirname(current_dir):  # 到达文件系统根目录时停止
        if os.path.exists(os.path.join(current_dir, '.trae')):
            return current_dir
        current_dir = os.path.dirname(current_dir)
    return None

# ==========================================
# 常量定义
# ==========================================

# 项目根目录
PROJECT_ROOT = find_project_root()
if not PROJECT_ROOT:
    print("❌ 错误：未找到项目根目录（.trae 目录）")
    sys.exit(1)

# 日志文件存储路径 (基于项目根目录)
LOG_FILE = os.path.join(PROJECT_ROOT, ".trae", "logs", "UPDATE_LOG.md")

# 允许的操作类型列表
# 注意：这些类型将显示在日志的【】中，必须保持统一
ACTION_TYPES = [
    "新增文件", "新增文件夹", 
    "删除文件", "删除文件夹", 
    "修改文件", 
    "重命名文件", "重命名文件夹", 
    "移动文件", "移动文件夹"
]

# ==========================================
# 核心功能函数
# ==========================================

def get_beijing_time():
    """
    获取当前北京时间 (UTC+8)。
    
    为了避免引入第三方依赖 (如 pytz)，这里使用 datetime 标准库手动计算时区偏移。
    使用 timezone-aware 对象以避免 Python 3.12+ 的 DeprecationWarning。
    
    Returns:
        str: 格式化后的时间字符串，格式为 "YYYY-MM-DD HH:MM:SS"
    """
    # 获取当前的 UTC 时间 (timezone-aware)
    # Python 3.11+ 推荐使用 datetime.UTC
    if hasattr(datetime, 'UTC'):
        utc_now = datetime.datetime.now(datetime.UTC)
    else:
        # 兼容旧版本 Python
        utc_now = datetime.datetime.utcnow().replace(tzinfo=datetime.timezone.utc)
    
    # 手动增加 8 小时偏移量得到北京时间
    # 注意：直接加 timedelta 会保持时区信息为 UTC，但时间值增加了 8 小时
    # 为了显示为无时区信息的本地时间字符串（符合日志格式要求），我们先转换再去掉 tzinfo
    beijing_tz = datetime.timezone(datetime.timedelta(hours=8))
    beijing_time = utc_now.astimezone(beijing_tz)
    
    # 返回格式化字符串 (strftime 会忽略时区信息，只输出时间部分，符合预期)
    return beijing_time.strftime("%Y-%m-%d %H:%M:%S")

def ensure_log_file():
    """
    确保日志文件及其目录存在。
    
    如果文件不存在，会创建文件并写入标准的文件头（Header）。
    如果目录不存在，会递归创建目录。
    """
    # 1. 检查并创建目录
    if not os.path.exists(LOG_FILE):
        log_dir = os.path.dirname(LOG_FILE)
        if not os.path.exists(log_dir):
            os.makedirs(log_dir)
            
        # 2. 创建文件并写入头部信息
        with open(LOG_FILE, 'w', encoding='utf-8') as f:
            f.write("# 项目更新日志 (UPDATE_LOG)\n\n")
            f.write("> 本日志由 Coder 技能自动维护，禁止手动编辑。\n\n")

def append_log(action, file_path, description):
    """
    向日志文件插入一条更新记录（插入到记录列表最上方）。
    
    Args:
        action (str): 操作类型，必须在 ACTION_TYPES 列表中。
        file_path (str): 变更文件的路径。
        description (str): 变更的详细描述。
        
    Side Effects:
        - 如果写入成功，会在控制台打印 ✅ Logged...
        - 如果写入失败，会在控制台打印 ❌ Failed... 并以非零状态码退出。
    """
    # 验证 action
    if action not in ACTION_TYPES:
        print(f"❌ Invalid action: {action}. Must be one of: {', '.join(ACTION_TYPES)}")
        sys.exit(1)

    # 确保文件就绪
    ensure_log_file()
    
    # 获取当前时间戳
    timestamp = get_beijing_time()
    
    # 构造日志条目格式: [时间] 【类型】 : 路径 - 描述
    clean_desc = description.replace('\n', ' ').strip()
    entry = f"[{timestamp}] 【{action}】 : {file_path} - {clean_desc}\n"
    
    try:
        # 读取现有文件内容
        with open(LOG_FILE, 'r', encoding='utf-8') as f:
            lines = f.readlines()
        
        # 查找插入位置：在 "## 记录列表" 之后找到第一个非空行或记录行
        insert_index = len(lines)  # 默认插入到末尾
        for i, line in enumerate(lines):
            if '## 记录列表' in line:
                # 找到 "## 记录列表" 后，跳过空行和说明行，找到第一条记录的位置
                insert_index = i + 1
                while insert_index < len(lines):
                    # 跳过空行和以 > 开头的说明行
                    if lines[insert_index].strip() and not lines[insert_index].strip().startswith('>'):
                        break
                    insert_index += 1
                break
        
        # 插入新记录
        lines.insert(insert_index, entry)
        
        # 写回文件
        with open(LOG_FILE, 'w', encoding='utf-8') as f:
            f.writelines(lines)
            
        print(f"✅ Logged: {entry.strip()}")
        
    except Exception as e:
        print(f"❌ Failed to write log: {e}")
        sys.exit(1)

# ==========================================
# 主入口
# ==========================================

def main():
    """
    脚本主入口。
    解析命令行参数并调用 append_log 执行记录。
    """
    parser = argparse.ArgumentParser(description="Auto-logger for Coder skill (项目自动日志记录器)")
    
    # 定义互斥参数组：要么使用命令行参数，要么使用文件
    group = parser.add_mutually_exclusive_group(required=True)
    
    # 方式1：命令行参数
    group.add_argument("--action", choices=ACTION_TYPES, help="变更操作类型")
    
    # 方式2：从文件读取
    group.add_argument("--from-file", help="从JSON文件读取参数 (包含 action, file, desc)")

    # 其他参数 (配合命令行方式使用)
    parser.add_argument("--file", help="变更文件的相对路径")
    parser.add_argument("--desc", help="变更内容的简短描述")
    
    # 解析参数
    args = parser.parse_args()
    
    if args.from_file:
        # 模式：从文件读取
        try:
            with open(args.from_file, 'r', encoding='utf-8') as f:
                data = json.load(f)
                
            action = data.get('action')
            file_path = data.get('file')
            desc = data.get('desc')
            
            if not all([action, file_path, desc]):
                print("❌ JSON file must contain 'action', 'file', and 'desc' fields.")
                sys.exit(1)
                
            append_log(action, file_path, desc)
            
            # 自清理逻辑: 读取完文件后立即尝试删除
            try:
                # 确保文件路径是绝对路径或正确的相对路径
                abs_path = os.path.abspath(args.from_file)
                if os.path.exists(abs_path):
                    os.remove(abs_path)
                    # print(f"Deleted temp file: {abs_path}") # Debug
            except OSError as e:
                # 打印错误以便调试 (后续稳定后可移除)
                print(f"⚠️ Failed to delete temp file: {e}")
            
        except Exception as e:
            print(f"❌ Failed to read from file {args.from_file}: {e}")
            sys.exit(1)
    else:
        # 模式：命令行参数
        if not args.file or not args.desc:
            parser.error("When using --action, --file and --desc are required.")
            
        append_log(args.action, args.file, args.desc)

if __name__ == "__main__":
    main()
