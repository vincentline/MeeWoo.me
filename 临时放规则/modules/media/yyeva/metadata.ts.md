---
module_name: YyevaMetadata
type: guide
description: YYEVA Metadata 解析流程
version: 1.0.0
---

# YYEVA Metadata 解析流程

```typescript
/**
 * YYEVA Metadata 解析流程
 */
export interface YyevaMetadataParsing {
  /** 解析步骤 */
  steps: {
    step1: "Find Marker";
    step2: "Extract Base64";
    step3: "Decode Base64";
    step4: "Inflate (zlib)";
    step5: "Parse JSON";
  };
  /** 依赖 */
  dependencies: {
    pako: boolean;
  };
}
```

> 摘要: YYEVA 数据的提取、解码、解压完整流程

## 1. 核心要点 (Key Points)

### 解析流程
```
1. 搜索标记 "yyeffectmp4json"
   ↓
2. 提取 Base64 数据 [[...]]
   ↓
3. Base64 解码
   ↓
4. zlib 解压（需要 pako 库）
   ↓
5. JSON 解析
```

### 依赖库
- **pako**: zlib 解压必需，需确保加载
- Web SDK 未开源，需自行实现

### 解析代码
```javascript
function parseYyevaMetadata(buffer) {
  var YYEVA_MARKER = 'yyeffectmp4json';
  
  // 1. 搜索标记位置
  var markerIndex = findMarker(buffer, markerBytes);
  if (markerIndex === -1) return null;
  
  // 2. 提取 Base64 数据
  var dataStart = markerIndex + YYEVA_MARKER.length;
  var str = bufferToString(buffer, dataStart, 50000);
  var base64Match = str.match(/\[\[([A-Za-z0-9+/=]+)\]\]/);
  
  // 3. Base64 解码
  var compressed = base64Decode(base64Match[1]);
  
  // 4. zlib 解压
  var decompressed = pako.inflate(compressed);
  
  // 5. JSON 解析
  return JSON.parse(new TextDecoder('utf-8').decode(decompressed));
}
```

## 2. 适用场景 (Use Cases)
- 检测文件是否为 YYEVA 格式
- 提取动态元素配置
- 排查解析失败问题

## 3. 代码/配置示例 (Examples)
```javascript
// 确保 pako 已加载
if (typeof pako === 'undefined') {
  await window.MeeWoo.Core.libraryLoader.load('pako', true);
}

// 检查 zlib header（调试用）
// zlib 格式: 0x78 0x9C (默认压缩) 或 0x78 0x01 (最快压缩)
console.log('zlib header:', compressed[0].toString(16), compressed[1].toString(16));
```
