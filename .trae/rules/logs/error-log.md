# 错误日志

> 记录开发过程中遇到的复杂错误、解决方案和预防措施，避免重复踩坑。

## 格式模板

```markdown
### [YYYY-MM-DD] 错误标题

- **上下文**: [在哪种场景下发生？涉及哪些模块？]
- **错误信息**:
  ```
  (粘贴关键报错信息)
  ```
- **根本原因**: [分析后的真实原因]
- **解决方案**: [修复步骤或代码片段]
- **预防措施**: [如何避免再次发生？需要更新哪些规则文档？]
```

## 日志列表

<!-- 在下方添加新条目 -->

### [2026-03-05] FFmpeg CDN 加载 CORS 跨域错误

- **上下文**: 将 FFmpeg Core 文件部署到腾讯云 COS 后，从本地开发服务器访问时出现跨域错误
- **错误信息**:
  ```
  Access to fetch at 'https://xxx.cos.ap-chengdu.myqcloud.com/ffmpeg-core.js' 
  from origin 'http://localhost:4000' has been blocked by CORS policy: 
  No 'Access-Control-Allow-Origin' header is present on the requested resource.
  
  createFFmpegCore is not defined. ffmpeg.wasm is unable to find createFFmpegCore 
  after loading ffmpeg-core.js
  ```
- **根本原因**: 腾讯云 COS 存储桶未配置 CORS 跨域访问规则，导致浏览器拒绝加载跨域资源
- **解决方案**: 
  1. 登录腾讯云 COS 控制台
  2. 选择存储桶 → 安全管理 → 跨域访问 CORS 设置
  3. 添加规则：Origin=`*` 或指定域名，Methods=`GET,HEAD`，Headers=`*`
- **预防措施**: 
  - 部署静态资源到 CDN 时，必须同步配置 CORS 规则
  - WASM 等大文件走 CDN 加速时，需确保 CORS 配置正确
  - 相关文档已更新至 `modules/media.ts.md` 的 CDN 加速配置章节
