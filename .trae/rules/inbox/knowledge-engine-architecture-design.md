# 类脑知识引擎架构 (Brain-Inspired Knowledge Engine)

## 背景
原有的知识管理机制（即时归档）存在写入门槛高、文件膨胀快、检索效率低的问题。

## 解决方案
模仿人脑记忆机制，构建三级存储架构：

1.  **Inbox (海马体)**: 
    - 作用：短期记忆缓冲区，存放碎片化经验。
    - 形式：`.trae/rules/inbox/*.md` + `index.md` 索引。
    - 优势：写入极快，不干扰心流。

2.  **Rules (皮层)**: 
    - 作用：长期记忆存储，存放结构化规范。
    - 形式：`.trae/rules/modules/*.ts.md`。
    - 优势：结构严谨，读取高效。

3.  **Librarian (睡眠整理)**: 
    - 作用：定期将 Inbox 归档进 Rules。
    - 机制：包含分类、抽象、查重、裂变（超过 300 行拆分）等自动化流程。

## 最佳实践
- **Gardener**: 只管往 Inbox 扔碎片，不负责整理。
- **Auto-Coder**: 干活前同时查 Rules 和 Inbox Index。
- **Integrity-Check**: 提交代码前检查 Inbox 是否有对应碎片，而非检查 Rules。
