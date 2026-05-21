/**
 * ==================== 图片处理API调用工具 (Image API Utils) ====================
 * 
 * 模块索引：
 * 1. 【登录验证】 - checkLogin
 * 2. 【请求方法】 - request
 * 3. 【图片操作】 - mergeImages, splitImage
 * 4. 【格式转换】 - fileToBase64, base64ToBlob
 * 
 * 功能说明：
 * 封装图片处理相关的 API 调用，提供：
 * 1. 统一的请求封装（自动携带 Token）
 * 2. 图片合并/切割接口
 * 3. 文件与 Base64 互转工具
 * 
 * 依赖：
 * - auth-utils.js（window.authUtils）
 * 
 * 使用方式：
 * window.imageApi.mergeImages(images).then(result => { ... })
 * window.imageApi.fileToBase64(file).then(base64 => { ... })
 */

/**
 * 图片处理 API 类
 * 提供图片合并、切割等功能的 API 调用封装
 */
class ImageApi {
  /**
   * 构造函数
   * 初始化 API 基础地址
   */
  constructor() {
    /**
     * API 基础地址
     * @type {string}
     */
    this.baseUrl = 'https://api.imghlp.com';
  }

  /**
   * 检查用户登录状态并获取 Token
   * @returns {string} 用户 Token
   * @throws {Error} 未登录时抛出错误
   */
  checkLogin() {
    if (!window.authUtils.isLoggedIn()) {
      throw new Error('未登录，请先登录');
    }
    return window.authUtils.getToken();
  }

  /**
   * 通用请求方法
   * 封装 fetch 请求，自动携带 Token 和处理错误
   * 
   * @param {string} endpoint - API 端点路径（如 '/merge'）
   * @param {Object} data - 请求体数据
   * @returns {Promise<Object>} API 返回的数据
   * @throws {Error} 请求失败或登录过期时抛出错误
   */
  async request(endpoint, data) {
    const token = this.checkLogin();

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        if (response.status === 401) {
          window.authUtils.redirectToLogin(window.location.href);
          throw new Error('登录已过期，请重新登录');
        }
        throw new Error(`API调用失败: ${response.status}`);
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.message || 'API调用失败');
      }

      return result.data;
    } catch (error) {
      console.error('API请求失败:', error);
      throw error;
    }
  }

  /**
   * 合并多张图片
   * 将多张图片合并为一张长图
   * 
   * @param {Array<string>} images - 图片 Base64 数组
   * @returns {Promise<Object>} 合并结果，包含合并后的图片数据
   */
  async mergeImages(images) {
    return this.request('/merge', { images });
  }

  /**
   * 切割图片
   * 将合并的图片按位置数据切割为多张
   * 
   * @param {string} mergedImage - 合并图片的 Base64
   * @param {Array<Object>} positionData - 切割位置数据数组
   * @returns {Promise<Object>} 切割结果，包含切割后的图片数组
   */
  async splitImage(mergedImage, positionData) {
    return this.request('/split', { mergedImage, positionData });
  }

  /**
   * 文件转 Base64
   * 将 File 或 Blob 对象转换为 Base64 字符串
   * 
   * @param {File|Blob} file - 文件对象
   * @returns {Promise<string>} Base64 编码的 DataURL
   */
  fileToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  /**
   * Base64 转 Blob
   * 将 Base64 DataURL 转换为 Blob 对象
   * 
   * @param {string} base64 - Base64 编码的 DataURL（格式：data:image/xxx;base64,...）
   * @returns {Blob} 转换后的 Blob 对象
   * @throws {Error} Base64 格式无效时抛出错误
   */
  base64ToBlob(base64) {
    const matches = base64.match(/^data:image\/(\w+);base64,(.+)$/);
    if (!matches) {
      throw new Error('无效的Base64格式');
    }
    const type = matches[1];
    const buffer = Uint8Array.from(atob(matches[2]), c => c.charCodeAt(0));
    return new Blob([buffer], { type: `image/${type}` });
  }
}

/**
 * 导出单例实例
 * 通过 window.imageApi 全局访问
 * @type {ImageApi}
 */
const imageApi = new ImageApi();
window.imageApi = imageApi;
