# 架构决策记录 (ADR)

## 格式
条目应遵循以下格式：

```markdown
### [YYYY-MM-DD] ADR-00X: 决策标题
- **状态**: [提议中 | 已接受 | 已废弃 | 已拒绝]
- **背景**: 面临什么问题？为什么需要决策？
- **决策**: 我们决定做什么？
- **后果**:
  - **正面**: 收益，改进。
  - **负面**: 权衡，成本，限制。
```

## 记录条目

<!-- 在下方添加新条目 -->

### [2026-03-05] ADR-001: SVGA 首次加载性能优化
- **状态**: 已接受
- **背景**: 第一次打开网页加载 SVGA 文件需要 10+ 秒，用户体验差。主要瓶颈：
  1. protobuf 和 pako 库通过 library-loader.js 动态加载，有 1-2 秒延迟
  2. 通过网络请求加载 svga.proto 文件，有 0.5-1 秒延迟
  3. 即使 SVGA 没有音频，也会执行完整的 protobuf 解析
- **决策**: 实施以下 4 项优化：
  1. 在 index.html 中同步引入 protobuf.min.js 和 pako.min.js
  2. 内联 svga.proto 定义到代码中，使用 protobuf.parse() 替代 protobuf.load()
  3. 先检查 videoItem.audios，无音频的 SVGA 直接跳过完整解析
  4. 确认 extractMaterialList 和 parseSvgaAudioData 本来就是并行的（图片加载在后台进行）
- **后果**:
  - **正面**: 
    - 预期节省 2-6 秒加载时间
    - 无音频 SVGA 加载速度提升最明显
    - 减少网络请求，提升稳定性
  - **负面**:
    - index.html 加载时间略微增加（两个库各约 100KB）
    - app.js 代码量增加（内联 svga.proto 定义）

