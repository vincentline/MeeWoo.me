/**
 * 定时器服务 (TimerService)
 * 提供统一的定时器管理，支持创建、取消、分组、统计等功能。
 * 
 * 设计目标：
 * 1. 统一管理：集中管理所有定时器，避免内存泄漏
 * 2. 易于使用：提供简洁的 API，覆盖 setTimeout/setInterval 的所有场景
 * 3. 安全可靠：完善的错误处理，防止定时器异常中断
 * 4. 性能优化：自动清理已完成的定时器，减少内存占用
 * 
 * @namespace MeeWoo.Service.TimerService
 */
(function (global) {
  'use strict';

  // 确保命名空间存在
  global.MeeWoo = global.MeeWoo || {};
  global.MeeWoo.Service = global.MeeWoo.Service || {};

  /**
   * 定时器服务类
   */
  function TimerService() {
    // 存储所有定时器的 Map<timerId, timerInfo>
    this.timers = new Map();
    
    // 定时器计数器，用于生成唯一 ID
    this.timerCounter = 0;
    
    // 调试模式开关
    this.debugMode = false;
  }

  /**
   * 生成唯一的定时器 ID
   * @returns {string} 定时器 ID
   * @private
   */
  TimerService.prototype._generateId = function () {
    this.timerCounter++;
    return 'timer_' + Date.now() + '_' + this.timerCounter;
  };

  /**
   * 记录调试日志（仅在 debugMode 开启时输出）
   * @param {string} message - 日志内容
   * @param {...any} args - 额外参数
   * @private
   */
  TimerService.prototype._log = function (message, ...args) {
    if (this.debugMode) {
      console.log('[TimerService] ' + message, ...args);
    }
  };

  /**
   * 记录错误日志
   * @param {string} message - 错误内容
   * @param {Error} error - 错误对象
   * @private
   */
  TimerService.prototype._error = function (message, error) {
    console.error('[TimerService] ' + message, error || '');
  };

  /**
   * 创建延迟执行的定时器（对应 setTimeout）
   * @param {Function} callback - 回调函数
   * @param {number} delay - 延迟时间（毫秒）
   * @param {string} [groupId] - 可选的分组 ID，用于批量管理
   * @returns {string} 定时器 ID
   * 
   * @example
   * // 基础用法
   * const timerId = TimerService.createDelay(() => {
   *   console.log('500ms 后执行');
   * }, 500);
   * 
   * @example
   * // 带分组
   * const timerId = TimerService.createDelay(() => {
   *   console.log('webp 导出完成后清理资源');
   * }, 100, 'webp-export');
   */
  TimerService.prototype.createDelay = function (callback, delay, groupId) {
    if (typeof callback !== 'function') {
      this._error('createDelay: callback 必须是函数');
      return null;
    }

    if (typeof delay !== 'number' || delay < 0) {
      this._error('createDelay: delay 必须是非负数');
      return null;
    }

    const timerId = this._generateId();
    const startTime = Date.now();

    // 创建定时器包装函数，包含错误处理和自动清理
    const wrappedCallback = () => {
      try {
        // 执行用户回调
        callback();
      } catch (error) {
        this._error('延迟执行回调出错 (' + timerId + ')', error);
      } finally {
        // 无论成功失败，都从 Map 中移除
        this.timers.delete(timerId);
        this._log('延迟定时器完成:', timerId);
      }
    };

    // 创建原生的 setTimeout
    const nativeTimerId = setTimeout(wrappedCallback, delay);

    // 存储定时器信息
    const timerInfo = {
      id: timerId,
      type: 'delay',
      callback: callback,
      delay: delay,
      groupId: groupId || null,
      nativeId: nativeTimerId,
      startTime: startTime,
      status: 'pending' // pending, running, completed, cancelled
    };

    this.timers.set(timerId, timerInfo);
    this._log('创建延迟定时器:', timerId, '延迟:', delay + 'ms', '分组:', groupId || '无');

    return timerId;
  };

  /**
   * 创建周期性执行的定时器（对应 setInterval）
   * @param {Function} callback - 回调函数
   * @param {number} interval - 间隔时间（毫秒）
   * @param {string} [groupId] - 可选的分组 ID
   * @param {boolean} [immediate=false] - 是否立即执行一次
   * @returns {string} 定时器 ID
   * 
   * @example
   * // 基础用法
   * const timerId = TimerService.createInterval(() => {
   *   console.log('每 1000ms 执行一次');
   * }, 1000);
   * 
   * @example
   * // 立即执行一次
   * const timerId = TimerService.createInterval(() => {
   *   console.log('立即执行，然后每 500ms 执行');
   * }, 500, 'my-group', true);
   */
  TimerService.prototype.createInterval = function (callback, interval, groupId, immediate) {
    if (typeof callback !== 'function') {
      this._error('createInterval: callback 必须是函数');
      return null;
    }

    if (typeof interval !== 'number' || interval <= 0) {
      this._error('createInterval: interval 必须是正数');
      return null;
    }

    const timerId = this._generateId();
    const startTime = Date.now();
    let executionCount = 0;

    // 创建定时器包装函数
    const wrappedCallback = () => {
      executionCount++;
      try {
        callback();
      } catch (error) {
        this._error('周期执行回调出错 (' + timerId + ', 第' + executionCount + '次)', error);
      }
    };

    // 创建原生的 setInterval
    const nativeTimerId = setInterval(wrappedCallback, interval);

    // 存储定时器信息
    const timerInfo = {
      id: timerId,
      type: 'interval',
      callback: callback,
      interval: interval,
      groupId: groupId || null,
      nativeId: nativeTimerId,
      startTime: startTime,
      executionCount: executionCount,
      status: 'running',
      immediate: immediate || false
    };

    this.timers.set(timerId, timerInfo);
    this._log('创建周期定时器:', timerId, '间隔:', interval + 'ms', '分组:', groupId || '无');

    // 如果需要立即执行一次
    if (immediate) {
      wrappedCallback();
    }

    return timerId;
  };

  /**
   * 取消定时器
   * @param {string} timerId - 定时器 ID
   * @returns {boolean} 是否成功取消
   * 
   * @example
   * const timerId = TimerService.createDelay(() => {}, 1000);
   * TimerService.cancel(timerId);
   */
  TimerService.prototype.cancel = function (timerId) {
    if (!this.timers.has(timerId)) {
      this._log('取消失败：定时器不存在', timerId);
      return false;
    }

    const timerInfo = this.timers.get(timerId);
    
    try {
      // 根据类型清除原生定时器
      if (timerInfo.type === 'delay') {
        clearTimeout(timerInfo.nativeId);
      } else if (timerInfo.type === 'interval') {
        clearInterval(timerInfo.nativeId);
      }

      // 从 Map 中移除
      this.timers.delete(timerId);
      timerInfo.status = 'cancelled';

      this._log('取消定时器:', timerId, '类型:', timerInfo.type, '分组:', timerInfo.groupId);
      return true;
    } catch (error) {
      this._error('取消定时器失败 (' + timerId + ')', error);
      return false;
    }
  };

  /**
   * 取消指定分组的所有定时器
   * @param {string} groupId - 分组 ID
   * @returns {number} 取消的定时器数量
   * 
   * @example
   * // 取消所有 webp 导出相关的定时器
   * const count = TimerService.cancelByGroup('webp-export');
   * console.log('取消了', count, '个定时器');
   */
  TimerService.prototype.cancelByGroup = function (groupId) {
    if (!groupId) {
      this._error('cancelByGroup: groupId 不能为空');
      return 0;
    }

    let count = 0;
    const timersToCancel = [];

    // 先找出所有属于该分组的定时器
    this.timers.forEach((timerInfo, timerId) => {
      if (timerInfo.groupId === groupId) {
        timersToCancel.push(timerId);
      }
    });

    // 再逐个取消
    timersToCancel.forEach(timerId => {
      if (this.cancel(timerId)) {
        count++;
      }
    });

    this._log('按分组取消定时器:', groupId, '取消数量:', count);
    return count;
  };

  /**
   * 取消所有定时器
   * @returns {number} 取消的定时器数量
   * 
   * @example
   * // 页面卸载前清理所有定时器
   * window.addEventListener('unload', () => {
   *   TimerService.cancelAll();
   * });
   */
  TimerService.prototype.cancelAll = function () {
    let count = 0;
    const timerIds = Array.from(this.timers.keys());

    timerIds.forEach(timerId => {
      if (this.cancel(timerId)) {
        count++;
      }
    });

    this._log('取消所有定时器，总数量:', count);
    return count;
  };

  /**
   * 获取定时器信息
   * @param {string} timerId - 定时器 ID
   * @returns {Object|null} 定时器信息对象
   * 
   * @example
   * const info = TimerService.getInfo(timerId);
   * if (info) {
   *   console.log('类型:', info.type, '分组:', info.groupId);
   * }
   */
  TimerService.prototype.getInfo = function (timerId) {
    if (!this.timers.has(timerId)) {
      return null;
    }

    const info = this.timers.get(timerId);
    
    // 返回简化版的信息，隐藏内部引用
    return {
      id: info.id,
      type: info.type,
      groupId: info.groupId,
      status: info.status,
      startTime: info.startTime,
      delay: info.delay,
      interval: info.interval,
      executionCount: info.executionCount
    };
  };

  /**
   * 获取指定分组的定时器数量
   * @param {string} groupId - 分组 ID
   * @returns {number} 定时器数量
   */
  TimerService.prototype.getCountByGroup = function (groupId) {
    if (!groupId) return 0;

    let count = 0;
    this.timers.forEach((timerInfo) => {
      if (timerInfo.groupId === groupId) {
        count++;
      }
    });
    return count;
  };

  /**
   * 获取所有定时器统计信息
   * @returns {Object} 统计信息对象
   * 
   * @example
   * const stats = TimerService.getStats();
   * console.log('总定时器数:', stats.total);
   * console.log('分组统计:', stats.byGroup);
   */
  TimerService.prototype.getStats = function () {
    const stats = {
      total: this.timers.size,
      byType: {
        delay: 0,
        interval: 0
      },
      byStatus: {
        pending: 0,
        running: 0,
        completed: 0,
        cancelled: 0
      },
      byGroup: {}
    };

    this.timers.forEach((timerInfo) => {
      // 按类型统计
      if (stats.byType[timerInfo.type] !== undefined) {
        stats.byType[timerInfo.type]++;
      }

      // 按状态统计
      if (stats.byStatus[timerInfo.status] !== undefined) {
        stats.byStatus[timerInfo.status]++;
      }

      // 按分组统计
      const groupId = timerInfo.groupId || '(未分组)';
      if (!stats.byGroup[groupId]) {
        stats.byGroup[groupId] = 0;
      }
      stats.byGroup[groupId]++;
    });

    return stats;
  };

  /**
   * 创建轮询定时器（直到满足条件停止）
   * @param {Function} conditionFn - 条件函数（返回 true 停止）
   * @param {Function} callback - 每次轮询的回调
   * @param {number} interval - 轮询间隔（毫秒）
   * @param {number} [timeout=0] - 超时时间（0 表示不超时）
   * @param {string} [groupId] - 分组 ID
   * @returns {string} 定时器 ID
   * 
   * @example
   * // 轮询检测某个对象是否加载完成
   * TimerService.createPoll(
   *   () => window.SomeLib !== undefined,  // 条件
   *   () => console.log('还在等待...'),     // 每次轮询的回调
   *   100,                                  // 间隔
   *   5000,                                 // 5 秒超时
   *   'lib-wait'
   * );
   */
  TimerService.prototype.createPoll = function (conditionFn, callback, interval, timeout, groupId) {
    if (typeof conditionFn !== 'function') {
      this._error('createPoll: conditionFn 必须是函数');
      return null;
    }

    if (typeof callback !== 'function') {
      this._error('createPoll: callback 必须是函数');
      return null;
    }

    if (typeof interval !== 'number' || interval <= 0) {
      this._error('createPoll: interval 必须是正数');
      return null;
    }

    const timerId = this._generateId();
    const startTime = Date.now();
    let pollCount = 0;

    // 轮询执行函数
    const pollFn = () => {
      pollCount++;
      
      try {
        // 检查是否满足条件
        if (conditionFn()) {
          this._log('轮询条件满足，停止 (' + timerId + ', 次数:' + pollCount + ')');
          this.cancel(timerId);
          return;
        }

        // 执行回调
        callback(pollCount);

        // 检查是否超时
        if (timeout > 0 && (Date.now() - startTime) >= timeout) {
          this._log('轮询超时，停止 (' + timerId + ', 次数:' + pollCount + ')');
          this.cancel(timerId);
        }
      } catch (error) {
        this._error('轮询执行出错 (' + timerId + ')', error);
        this.cancel(timerId);
      }
    };

    // 创建周期定时器
    const nativeTimerId = setInterval(pollFn, interval);

    // 存储信息
    const timerInfo = {
      id: timerId,
      type: 'poll',
      callback: callback,
      conditionFn: conditionFn,
      interval: interval,
      timeout: timeout || 0,
      groupId: groupId || null,
      nativeId: nativeTimerId,
      startTime: startTime,
      pollCount: 0,
      status: 'running'
    };

    this.timers.set(timerId, timerInfo);
    this._log('创建轮询定时器:', timerId, '间隔:', interval + 'ms', '超时:', timeout + 'ms');

    // 立即执行一次
    pollFn();

    return timerId;
  };

  /**
   * 创建带重试机制的定时器（失败自动重试）
   * @param {Function} taskFn - 任务函数（返回 Promise 或同步执行）
   * @param {number} maxRetries - 最大重试次数
   * @param {number} retryDelay - 重试延迟（毫秒）
   * @param {string} [groupId] - 分组 ID
   * @returns {string} 定时器 ID
   * 
   * @example
   * // 异步任务重试
   * TimerService.createRetry(
   *   () => fetch('/api/data').then(r => r.json()),
   *   3,    // 最多重试 3 次
   *   1000, // 每次间隔 1 秒
   *   'api-retry'
   * );
   */
  TimerService.prototype.createRetry = function (taskFn, maxRetries, retryDelay, groupId) {
    if (typeof taskFn !== 'function') {
      this._error('createRetry: taskFn 必须是函数');
      return null;
    }

    if (typeof maxRetries !== 'number' || maxRetries <= 0) {
      this._error('createRetry: maxRetries 必须是正数');
      return null;
    }

    if (typeof retryDelay !== 'number' || retryDelay < 0) {
      this._error('createRetry: retryDelay 必须是非负数');
      return null;
    }

    const timerId = this._generateId();
    let attemptCount = 0;
    let isCompleted = false;

    // 执行任务的函数
    const executeTask = () => {
      if (isCompleted) return;

      attemptCount++;
      this._log('重试任务执行 (' + timerId + ', 第' + attemptCount + '次尝试)');

      try {
        const result = taskFn();

        // 如果是 Promise
        if (result && typeof result.then === 'function') {
          result
            .then(() => {
              isCompleted = true;
              this.cancel(timerId);
              this._log('重试任务成功 (' + timerId + ')');
            })
            .catch((error) => {
              this._error('重试任务失败 (' + timerId + ')', error);
              
              if (attemptCount < maxRetries) {
                // 还没到最大重试次数，延迟后重试
                this.createDelay(executeTask, retryDelay, groupId);
              } else {
                // 达到最大重试次数，放弃
                isCompleted = true;
                this.cancel(timerId);
                this._log('重试任务达到最大次数，放弃 (' + timerId + ')');
              }
            });
        } else {
          // 同步任务，直接认为成功
          isCompleted = true;
          this.cancel(timerId);
          this._log('重试任务成功 (' + timerId + ')');
        }
      } catch (error) {
        this._error('重试任务异常 (' + timerId + ')', error);
        
        if (attemptCount < maxRetries) {
          this.createDelay(executeTask, retryDelay, groupId);
        } else {
          isCompleted = true;
          this.cancel(timerId);
          this._log('重试任务达到最大次数，放弃 (' + timerId + ')');
        }
      }
    };

    // 存储信息（实际的原生定时器在第一次延迟执行时创建）
    const timerInfo = {
      id: timerId,
      type: 'retry',
      taskFn: taskFn,
      maxRetries: maxRetries,
      retryDelay: retryDelay,
      groupId: groupId || null,
      nativeId: null,
      startTime: Date.now(),
      attemptCount: 0,
      status: 'running'
    };

    this.timers.set(timerId, timerInfo);
    this._log('创建重试定时器:', timerId, '最大重试:', maxRetries, '延迟:', retryDelay + 'ms');

    // 立即执行第一次
    executeTask();

    return timerId;
  };

  // 创建全局单例
  global.MeeWoo.Service.TimerService = new TimerService();

  // 暴露构造函数（如果需要创建多个实例）
  global.MeeWoo.Service.TimerServiceConstructor = TimerService;

})(window);
