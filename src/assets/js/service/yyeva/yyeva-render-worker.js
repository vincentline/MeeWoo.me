/**
 * YYEVA 渲染 Worker
 * 负责在后台线程中处理双通道 MP4 的像素合成
 * 
 * 功能：
 * 1. 接收视频帧数据
 * 2. 提取左右通道像素
 * 3. 合成最终带 Alpha 的图像
 * 4. 返回处理结果给主线程
 */

// 缓存查找表，避免重复计算
let inverseAlphaTable = null;

// 初始化查找表
function initLookupTables() {
  if (!inverseAlphaTable) {
    inverseAlphaTable = new Float32Array(256);
    for (let i = 1; i <= 255; i++) {
      inverseAlphaTable[i] = 255 / i;
    }
  }
}

// 处理单帧像素合成
function processFrame(data) {
  const { 
    frameData,        // 视频帧像素数据 (Uint8ClampedArray)
    displayWidth,     // 显示宽度
    displayHeight,    // 显示高度
    isAlphaRight,     // Alpha通道是否在右侧
    videoWidth        // 视频总宽度
  } = data;
  
  // 初始化查找表
  initLookupTables();
  
  // 计算通道位置
  const halfWidth = Math.floor(videoWidth / 2);
  const colorX = isAlphaRight ? 0 : halfWidth;
  const alphaX = isAlphaRight ? halfWidth : 0;
  
  // 创建输出缓冲区
  const outputSize = displayWidth * displayHeight * 4;
  const outputData = new Uint8ClampedArray(outputSize);
  
  // 像素合成处理
  for (let y = 0; y < displayHeight; y++) {
    for (let x = 0; x < displayWidth; x++) {
      // 计算在完整帧中的索引
      const colorIdx = ((y * videoWidth) + (colorX + x)) * 4;
      const alphaIdx = ((y * videoWidth) + (alphaX + x)) * 4;
      
      // 边界检查
      if (colorIdx + 3 >= frameData.length || alphaIdx + 3 >= frameData.length) {
        continue;
      }
      
      // 获取像素数据
      const r = frameData[colorIdx];
      const g = frameData[colorIdx + 1];
      const b = frameData[colorIdx + 2];
      const alpha = frameData[alphaIdx]; // 使用Alpha通道的R值
      
      // 计算输出位置
      const outputIdx = (y * displayWidth + x) * 4;
      
      // 反预乘Alpha处理
      if (alpha > 0) {
        if (alpha < 255) {
          const invAlpha = inverseAlphaTable[alpha];
          outputData[outputIdx] = Math.min(255, Math.round(r * invAlpha));
          outputData[outputIdx + 1] = Math.min(255, Math.round(g * invAlpha));
          outputData[outputIdx + 2] = Math.min(255, Math.round(b * invAlpha));
        } else {
          // alpha == 255，直接复制
          outputData[outputIdx] = r;
          outputData[outputIdx + 1] = g;
          outputData[outputIdx + 2] = b;
        }
      } else {
        // alpha == 0，设为黑色
        outputData[outputIdx] = 0;
        outputData[outputIdx + 1] = 0;
        outputData[outputIdx + 2] = 0;
      }
      
      // 设置Alpha通道
      outputData[outputIdx + 3] = alpha;
    }
  }
  
  return outputData;
}

// Worker 消息处理
self.onmessage = function(e) {
  const { type, data, taskId } = e.data;
  
  try {
    let result;
    
    switch (type) {
      case 'processFrame':
        // 处理单帧
        const startTime = performance.now();
        result = processFrame(data);
        const endTime = performance.now();
        
        const processTime = endTime - startTime;
        
        // 返回结果（使用 Transferable Object 零拷贝传输）
        self.postMessage({
          type: 'frameProcessed',
          taskId,
          result,
          time: processTime,
          dataSize: result.length
        }, [result.buffer]); // Transfer ownership of ArrayBuffer
        break;
        
      case 'init':
        // 初始化（预热查找表）
        initLookupTables();
        self.postMessage({
          type: 'initialized',
          taskId
        });
        break;
        
      case 'cleanup':
        // 清理资源
        inverseAlphaTable = null;
        self.postMessage({
          type: 'cleanedUp',
          taskId
        });
        break;
        
      default:
        throw new Error(`Unknown message type: ${type}`);
    }
  } catch (error) {
    console.error('[YYEVA Worker] Error:', error);
    self.postMessage({
      type: 'error',
      taskId,
      error: error.message
    });
  }
};
