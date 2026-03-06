import os

INBOX_DIR = r".trae/rules/inbox"

# 测试1: 传入完整路径
file_name_full = ".trae/rules/inbox/konva-transformer-layering.md"
result1 = os.path.join(INBOX_DIR, file_name_full)
print(f"测试1 - 传入完整路径:")
print(f"  拼接结果: {result1}")
print(f"  文件存在: {os.path.exists(result1)}")

# 测试2: 仅传入文件名
file_name_only = "konva-transformer-layering.md"
result2 = os.path.join(INBOX_DIR, file_name_only)
print(f"\n测试2 - 仅传入文件名:")
print(f"  拼接结果: {result2}")
print(f"  文件存在: {os.path.exists(result2)}")
