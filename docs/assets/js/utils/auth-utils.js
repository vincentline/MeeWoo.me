/**
 * ==================== 登录状态管理工具 (Auth Utils) ====================
 * 
 * 模块索引：
 * 1. 【状态检查】 - isLoggedIn
 * 2. 【数据存取】 - getToken, saveToken, getUserInfo, saveUserInfo
 * 3. 【登录流程】 - redirectToLogin, handleLoginCallback
 * 4. 【清理操作】 - clearAuth
 * 
 * 功能说明：
 * 封装用户登录状态管理，提供：
 * 1. Token 和用户信息的存储与读取
 * 2. 登录状态检查
 * 3. 登录重定向与回调处理
 * 4. 登录信息清理
 * 
 * 使用方式：
 * window.authUtils.isLoggedIn() // 检查登录状态
 * window.authUtils.getToken()   // 获取 Token
 * window.authUtils.redirectToLogin() // 跳转登录
 */

/**
 * 登录状态管理类
 * 提供用户认证相关的状态管理和操作方法
 */
class AuthUtils {
  /**
   * 构造函数
   * 初始化存储键名和登录页面地址
   */
  constructor() {
    /**
     * Token 存储键名
     * @type {string}
     */
    this.tokenKey = 'imghelptoken';
    /**
     * 用户信息存储键名
     * @type {string}
     */
    this.userKey = 'imghelpuser';
    /**
     * 登录页面地址
     * @type {string}
     */
    this.loginUrl = 'https://www.imghlp.com/auth/login.html';
  }

  /**
   * 检查用户是否已登录
   * 通过检查 localStorage 中是否存在 Token 判断
   * 
   * @returns {boolean} 已登录返回 true，未登录返回 false
   */
  isLoggedIn() {
    try {
      return !!localStorage.getItem(this.tokenKey);
    } catch (e) {
      console.error('检查登录状态失败:', e);
      return false;
    }
  }

  /**
   * 获取存储的 Token
   * 
   * @returns {string|null} Token 字符串，未登录或读取失败返回 null
   */
  getToken() {
    try {
      return localStorage.getItem(this.tokenKey);
    } catch (e) {
      console.error('获取Token失败:', e);
      return null;
    }
  }

  /**
   * 获取存储的用户信息
   * 
   * @returns {Object|null} 用户信息对象 { username, id }，未登录或读取失败返回 null
   */
  getUserInfo() {
    try {
      const userInfo = localStorage.getItem(this.userKey);
      return userInfo ? JSON.parse(userInfo) : null;
    } catch (e) {
      console.error('获取用户信息失败:', e);
      return null;
    }
  }

  /**
   * 存储 Token 到 localStorage
   * 
   * @param {string} token - 用户 Token
   * @returns {boolean} 存储成功返回 true，失败返回 false
   */
  saveToken(token) {
    try {
      localStorage.setItem(this.tokenKey, token);
      return true;
    } catch (e) {
      console.error('存储Token失败:', e);
      return false;
    }
  }

  /**
   * 存储用户信息到 localStorage
   * 仅存储必要字段（username, id），避免存储过多数据
   * 
   * @param {Object} userInfo - 用户信息对象
   * @param {string} [userInfo.username] - 用户名
   * @param {string} [userInfo.id] - 用户ID
   * @returns {boolean} 存储成功返回 true，失败返回 false
   */
  saveUserInfo(userInfo) {
    try {
      const limitedUserInfo = {
        username: userInfo.username || '',
        id: userInfo.id || ''
      };
      localStorage.setItem(this.userKey, JSON.stringify(limitedUserInfo));
      return true;
    } catch (e) {
      console.error('存储用户信息失败:', e);
      return false;
    }
  }

  /**
   * 清除所有登录信息
   * 删除 localStorage 中的 Token 和用户信息
   * 
   * @returns {boolean} 清除成功返回 true，失败返回 false
   */
  clearAuth() {
    try {
      localStorage.removeItem(this.tokenKey);
      localStorage.removeItem(this.userKey);
      return true;
    } catch (e) {
      console.error('清除登录信息失败:', e);
      return false;
    }
  }

  /**
   * 重定向到登录页面
   * 携带当前页面地址作为回调参数
   * 
   * @param {string} [returnUrl] - 登录后返回的地址，默认为当前页面
   */
  redirectToLogin(returnUrl) {
    const encodedReturnUrl = encodeURIComponent(returnUrl || window.location.href);
    window.location.href = `${this.loginUrl}?returnUrl=${encodedReturnUrl}`;
  }

  /**
   * 处理登录回调
   * 从 URL 参数中提取 Token 和用户信息并存储，然后清理 URL
   * 
   * @returns {boolean} 处理成功返回 true，无回调参数或处理失败返回 false
   * 
   * @example
   * // 登录页面回调时会携带参数：
   * // ?authToken=xxx&userInfo={"username":"test","id":"123"}
   * // 或 ?token=xxx&user={"username":"test","id":"123"}
   */
  handleLoginCallback() {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('authToken') || urlParams.get('token');
    const userInfoParam = urlParams.get('userInfo') || urlParams.get('user');
    
    if (token && userInfoParam) {
      try {
        this.saveToken(token);
        this.saveUserInfo(JSON.parse(userInfoParam));
        
        const cleanUrl = new URL(window.location.href);
        cleanUrl.searchParams.delete('authToken');
        cleanUrl.searchParams.delete('token');
        cleanUrl.searchParams.delete('userInfo');
        cleanUrl.searchParams.delete('user');
        window.history.replaceState({}, '', cleanUrl.toString());
        
        return true;
      } catch (e) {
        console.error('处理登录回调失败:', e);
        return false;
      }
    }
    return false;
  }
}

/**
 * 导出单例实例
 * 通过 window.authUtils 全局访问
 * @type {AuthUtils}
 */
const authUtils = new AuthUtils();
window.authUtils = authUtils;
