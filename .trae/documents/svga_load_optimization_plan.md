# SVGA 加载性能优化 - 实现计划

## 目标
优化 SVGA 第一次打开的加载时间，从 10+ 秒降低到 2-5 秒

---

## [x] 任务 1：protobuf、pako 本地直接同步引入 ✅
- **Priority**: P0
- **Depends On**: None
- **Description**: 
  - 在 `index.html` 中直接用 `<script>` 标签引入本地的 `protobuf.min.js` 和 `pako.min.js`
  - 位置放在 `library-loader.js` 之后，核心库加载之前
- **Success Criteria**:
  - 页面加载后，`window.protobuf` 和 `window.pako` 立即可用
  - 不再通过 `library-loader.js` 动态加载这两个库
- **Test Requirements**:
  - `programmatic` TR-1.1: 打开浏览器控制台，输入 `typeof protobuf` 返回 "object"
  - `programmatic` TR-1.2: 打开浏览器控制台，输入 `typeof pako` 返回 "object"
  - `human-judgement` TR-1.3: 检查 `index.html` 中有这两个 `<script>` 标签
- **Notes**: 
  - 引入后，`parseSvgaAudioData` 中可以移除 `loadLibrary(['protobuf', 'pako'], true)` 的调用

---

## [x] 任务 2：并行处理 - 素材列表提取和音频解析同时进行 ✅
- **Priority**: P0
- **Depends On**: None
- **Description**: 
  - 当前流程：`extractMaterialList(videoItem)` 完成 → `parseSvgaAudioData()` 开始
  - 优化后：两个任务同时启动，用 `Promise.all()` 等待两者都完成
- **Success Criteria**:
  - `extractMaterialList()` 和 `parseSvgaAudioData()` 并行执行
  - 总耗时不超过两者中较长的那个任务的耗时
- **Test Requirements**:
  - `programmatic` TR-2.1: 在两个函数中添加 console.time 日志，验证开始时间接近
  - `human-judgement` TR-2.2: 代码逻辑清晰，没有串行等待
- **Notes**: 
  - 注意 `extractMaterialList()` 是同步的还是异步的
  - **实际发现**：`extractMaterialList()` 本身立即返回，图片加载在后台进行，所以本来就是并行的！

---

## [x] 任务 3：内联 svga.proto 避免网络请求 ✅
- **Priority**: P1
- **Depends On**: None
- **Description**: 
  - 将 `svga.proto` 的内容作为字符串常量嵌入代码
  - 使用 `protobuf.parse()` 替代 `protobuf.load('./svga.proto')`
- **Success Criteria**:
  - 不再有对 `./svga.proto` 的网络请求
  - protobuf 定义正常加载，能正确解析 SVGA 数据
- **Test Requirements**:
  - `programmatic` TR-3.1: 打开 Network 面板，确认没有 svga.proto 请求
  - `programmatic` TR-3.2: 能正常解析带音频的 SVGA 文件
- **Notes**: 
  - 使用 `protobuf.parse(protoContent).root` 直接解析字符串形式的 proto 定义

---

## [x] 任务 4：智能跳过 - 无音频时跳过解析 ✅
- **Priority**: P1
- **Depends On**: None
- **Description**: 
  - 在开始解析前，先从 `videoItem` 检查 `videoItem.audios` 是否存在和为空
  - 如果没有音频，直接返回 null，不进行完整的 protobuf 解析
- **Success Criteria**:
  - 无音频的 SVGA 文件跳过音频解析步骤
  - 有音频的 SVGA 文件正常解析
- **Test Requirements**:
  - `programmatic` TR-4.1: 加载无音频的 SVGA，确认跳过了解析
  - `programmatic` TR-4.2: 加载有音频的 SVGA，确认正常解析音频
- **Notes**: 
  - 从 `validatedData.videoItem` 中可以直接访问 `audios` 字段

---

## 总体验证标准
1. **功能完整性**：所有 SVGA 功能（播放、素材替换、导出等）正常工作
2. **性能提升**：第一次打开 SVGA 的加载时间明显减少
3. **音频功能**：带音频的 SVGA 音频播放正常
4. **内存显示**：内存占用计算正确显示
