// SVGA像素处理Worker
// 用于并行处理双通道MP4转SVGA过程中的像素级操作

// 内存池管理（Worker内部）
class MemoryPool {
  constructor() {
    this.pools = new Map();
    this.maxPoolSize = 50;
    this.minBufferSize = 1024;
    this.maxBufferSize = 1024 * 1024 * 50; // 50MB
  }

  getBuffer(size) {
    if (size <= 0 || size > this.maxBufferSize) {
      return new Uint8ClampedArray(size);
    }

    const roundedSize = this._roundUpToPowerOfTwo(size);
    const key = `Uint8ClampedArray_${roundedSize}`;

    if (this.pools.has(key) && this.pools.get(key).length > 0) {
      const pool = this.pools.get(key);
      return pool.pop();
    }

    return new Uint8ClampedArray(roundedSize);
  }

  recycleBuffer(buffer) {
    if (!buffer || !buffer.buffer) {
      return;
    }

    const size = buffer.length;
    if (size <= 0 || size > this.maxBufferSize) {
      return;
    }

    const roundedSize = this._roundUpToPowerOfTwo(size);
    const key = `Uint8ClampedArray_${roundedSize}`;

    if (!this.pools.has(key)) {
      this.pools.set(key, []);
    }

    const pool = this.pools.get(key);
    if (pool.length < this.maxPoolSize) {
      // 重置缓冲区
      buffer.fill(0);
      pool.push(buffer);
    }
  }

  clear() {
    this.pools.forEach(pool => {
      pool.length = 0;
    });
    this.pools.clear();
  }

  _roundUpToPowerOfTwo(size) {
    if (size <= this.minBufferSize) {
      return this.minBufferSize;
    }
    size--;
    size |= size >> 1;
    size |= size >> 2;
    size |= size >> 4;
    size |= size >> 8;
    size |= size >> 16;
    size++;
    return size;
  }
}

// 全局内存池实例
const memoryPool = new MemoryPool();

// 分块大小配置
const BLOCK_SIZE = 128; // 128x128像素的块

// 处理消息
self.onmessage = function(e) {
  var task = e.data;
  
  try {
    switch(task.type) {
      case 'processFrame':
        handleProcessFrame(task).catch(function(error) {
          console.error('Error in handleProcessFrame:', error);
          self.postMessage({ id: task.id, type: 'error', error: error.message });
        });
        break;
      case 'processFrames':
        handleProcessFrames(task).catch(function(error) {
          console.error('Error in handleProcessFrames:', error);
          self.postMessage({ id: task.id, type: 'error', error: error.message });
        });
        break;
      case 'clearMemory':
        memoryPool.clear();
        self.postMessage({ id: task.id, type: 'success' });
        break;
      default:
        throw new Error('Unknown task type: ' + task.type);
    }
  } catch(error) {
    console.error('Error in message handler:', error);
    self.postMessage({ id: task.id, type: 'error', error: error.message });
  }
};

/**
 * 处理单个帧的像素数据
 */
async function handleProcessFrame(task) {
  const frameData = task.frameData;
  const alphaPosition = task.alphaPosition;
  const width = task.width;
  const height = task.height;
  const scaledWidth = task.scaledWidth;
  const scaledHeight = task.scaledHeight;
  
  // 计算半宽
  const halfWidth = Math.floor(width / 2);
  
  // 内存优化：使用内存池分配缓冲区
  const colorDataSize = halfWidth * height * 4;
  const colorData = memoryPool.getBuffer(colorDataSize);
  const alphaData = memoryPool.getBuffer(colorDataSize);
  const processedDataSize = scaledWidth * scaledHeight * 4;
  const processedData = memoryPool.getBuffer(processedDataSize);
  
  // 分块处理优化：将图像分成多个块并行处理
  const blocks = [];
  for (let y = 0; y < height; y += BLOCK_SIZE) {
    for (let x = 0; x < halfWidth; x += BLOCK_SIZE) {
      blocks.push({
        x: x,
        y: y,
        width: Math.min(BLOCK_SIZE, halfWidth - x),
        height: Math.min(BLOCK_SIZE, height - y)
      });
    }
  }
  
  // 并行处理所有块
  let processedBlocks = 0;
  const totalBlocks = blocks.length;
  
  await Promise.all(blocks.map(async block => {
    await processFrameBlock(
      block, frameData, width, height, halfWidth, alphaPosition, 
      colorData, alphaData, processedData, scaledWidth, scaledHeight
    );
    
    // 报告进度
    processedBlocks++;
    const progress = Math.round((processedBlocks / totalBlocks) * 100);
    
    // 每10%的进度报告一次，避免过多的消息传递
    if (progress % 10 === 0) {
      self.postMessage({ id: task.id, type: 'progress', progress: progress });
    }
  }));
  
  // 使用transferable objects传递数据，减少内存复制
  self.postMessage({
    id: task.id,
    type: 'result',
    result: {
      processedData: processedData,
      width: scaledWidth,
      height: scaledHeight
    }
  }, [processedData.buffer, colorData.buffer, alphaData.buffer]);
}

/**
 * 处理多个帧的像素数据
 */
async function handleProcessFrames(task) {
  const frames = task.frames;
  const alphaPosition = task.alphaPosition;
  const width = task.width;
  const height = task.height;
  const scaledWidth = task.scaledWidth;
  const scaledHeight = task.scaledHeight;
  
  if (frames.length === 0) {
    throw new Error('帧数组不能为空');
  }
  
  const results = [];
  const frameCount = frames.length;
  
  // 分批处理配置
  const BATCH_SIZE = 10; // 每批处理10帧
  
  // 分批处理帧
  for (let batchStart = 0; batchStart < frameCount; batchStart += BATCH_SIZE) {
    const batchEnd = Math.min(batchStart + BATCH_SIZE, frameCount);
    const batchFrames = frames.slice(batchStart, batchEnd);
    
    // 并行处理当前批次
    const framePromises = batchFrames.map(async function(frameData, index) {
      const frameIndex = batchStart + index;
      
      // 处理单个帧
      const result = await processSingleFrame(
        frameData, alphaPosition, width, height, scaledWidth, scaledHeight
      );
      
      return result;
    });
    
    // 等待当前批次处理完成
    const batchResults = await Promise.all(framePromises);
    results.push(...batchResults);
    
    // 报告批次进度
    const processedFrames = Math.min(batchEnd, frameCount);
    const progress = Math.round((processedFrames / frameCount) * 100);
    
    // 每20%的进度报告一次
    if (progress % 20 === 0) {
      self.postMessage({ id: task.id, type: 'progress', progress: progress });
    }
  }
  
  // 提取transferable objects
  const transferables = [];
  results.forEach(result => {
    transferables.push(result.processedData.buffer);
  });
  
  // 使用transferable objects传递数据，减少内存复制
  self.postMessage({
    id: task.id,
    type: 'result',
    result: results
  }, transferables);
}

/**
 * 处理单个帧
 */
async function processSingleFrame(frameData, alphaPosition, width, height, scaledWidth, scaledHeight) {
  // 计算半宽
  const halfWidth = Math.floor(width / 2);
  
  // 内存优化：使用内存池分配缓冲区
  const colorDataSize = halfWidth * height * 4;
  const colorData = memoryPool.getBuffer(colorDataSize);
  const alphaData = memoryPool.getBuffer(colorDataSize);
  const processedDataSize = scaledWidth * scaledHeight * 4;
  const processedData = memoryPool.getBuffer(processedDataSize);
  
  // 分块处理
  const blocks = [];
  for (let y = 0; y < height; y += BLOCK_SIZE) {
    for (let x = 0; x < halfWidth; x += BLOCK_SIZE) {
      blocks.push({
        x: x,
        y: y,
        width: Math.min(BLOCK_SIZE, halfWidth - x),
        height: Math.min(BLOCK_SIZE, height - y)
      });
    }
  }
  
  // 并行处理所有块
  await Promise.all(blocks.map(block => processFrameBlock(
    block, frameData, width, height, halfWidth, alphaPosition, 
    colorData, alphaData, processedData, scaledWidth, scaledHeight
  )));
  
  return {
    processedData: processedData,
    width: scaledWidth,
    height: scaledHeight
  };
}

/**
 * 处理帧的单个图像块
 */
function processFrameBlock(block, frameData, width, height, halfWidth, alphaPosition, colorData, alphaData, processedData, scaledWidth, scaledHeight) {
  return new Promise(function(resolve) {
    const startX = block.x;
    const startY = block.y;
    const blockWidth = block.width;
    const blockHeight = block.height;
    
    // 算法优化：减少循环内的计算
    const inv255 = 1 / 255;
    
    // 提取左右通道数据
    const colorX = alphaPosition === 'right' ? 0 : halfWidth;
    const alphaX = alphaPosition === 'right' ? halfWidth : 0;
    
    // 处理块内的每个像素
    for (let y = startY; y < startY + blockHeight; y++) {
      for (let x = startX; x < startX + blockWidth; x++) {
        try {
          // 计算原始图像中的索引
          const colorIdx = ((y * width) + (colorX + x)) * 4;
          const alphaIdx = ((y * width) + (alphaX + x)) * 4;
          
          // 检查索引是否有效
          if (colorIdx + 3 >= frameData.length || alphaIdx + 3 >= frameData.length) {
            continue;
          }
          
          // 获取彩色和Alpha数据
          const r = frameData[colorIdx];
          const g = frameData[colorIdx + 1];
          const b = frameData[colorIdx + 2];
          const alpha = frameData[alphaIdx]; // 使用Alpha通道的R值作为透明度
          
          // 合成带透明度的图像（处理预乘Alpha）
          let finalR = r;
          let finalG = g;
          let finalB = b;
          
          if (alpha > 0) {
            // 反预乘：将预乘的RGB值还原
            finalR = Math.min(255, Math.round((r * 255) / alpha));
            finalG = Math.min(255, Math.round((g * 255) / alpha));
            finalB = Math.min(255, Math.round((b * 255) / alpha));
          }
          
          // 计算目标图像中的索引
          const targetX = Math.round((x / halfWidth) * scaledWidth);
          const targetY = Math.round((y / height) * scaledHeight);
          
          if (targetX < 0 || targetX >= scaledWidth || targetY < 0 || targetY >= scaledHeight) {
            continue;
          }
          
          const targetIdx = (targetY * scaledWidth + targetX) * 4;
          
          // 设置处理后的数据
          processedData[targetIdx] = finalR;
          processedData[targetIdx + 1] = finalG;
          processedData[targetIdx + 2] = finalB;
          processedData[targetIdx + 3] = alpha;
          
        } catch (error) {
          console.error('Error processing pixel at', x, ',', y, ':', error);
        }
      }
    }
    
    resolve();
  });
}
