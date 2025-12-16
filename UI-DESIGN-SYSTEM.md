# UI 设计系统规范

> 本文档基于项目现有代码梳理而成，定义了统一的设计令牌（Design Tokens）和组件规范，确保各页面视觉风格一致。

---

## 1. 设计令牌（Design Tokens）

### 1.1 颜色系统

#### 主色调
```css
--primary-blue: #409eff;      /* 主要操作按钮 */
--primary-gray: #5b5b5b;      /* 次要按钮 */
--primary-red: #ff4444;       /* 危险操作（清空、删除） */
```

#### 文字颜色
```css
/* 浅色模式 */
--text-primary: #333333;      /* 主要文字 */
--text-secondary: #818181;    /* 次要文字 */
--text-tertiary: #999999;     /* 辅助文字 */
--text-disabled: #cccccc;     /* 禁用状态 */

/* 暗黑模式 */
--text-primary-dark: #e0e0e0;
--text-secondary-dark: #a0a0a0;
--text-tertiary-dark: #808080;
```

#### 背景颜色
```css
/* 浅色模式 */
--bg-base: #fcfcfc;           /* 页面基础背景 */
--bg-elevated: #ffffff;       /* 卡片/弹窗背景 */
--bg-hover: #f5f5f5;          /* Hover状态背景 */
--bg-active: #eeeeee;         /* Active状态背景 */

/* 暗黑模式 */
--bg-base-dark: #1a1a1a;
--bg-elevated-dark: #2a2a2a;
--bg-hover-dark: #333333;
--bg-active-dark: #404040;
```

#### 边框颜色
```css
/* 浅色模式 */
--border-light: #F3F3F3;      /* 浅边框 */
--border-base: #e3e3e3;       /* 基础边框 */
--border-medium: #d0d0d0;     /* 中等边框 */
--border-strong: #b0b0b0;     /* 强调边框 */

/* 暗黑模式 */
--border-base-dark: #404040;
--border-strong-dark: #505050;
```

#### 功能性颜色
```css
--success: #67c23a;           /* 成功状态 */
--warning: #e6a23c;           /* 警告状态 */
--danger: #f56c6c;            /* 危险状态 */
--info: #909399;              /* 信息提示 */
```

### 1.2 字体系统

#### 字体家族
```css
--font-family-base: 'Segoe UI', 'Noto Sans SC', -apple-system, 
                    BlinkMacSystemFont, 'Helvetica Neue', 
                    'PingFang SC', 'Microsoft YaHei', sans-serif;
```

#### 字号规范
```css
--font-size-xs: 11px;         /* 辅助说明文字 */
--font-size-sm: 12px;         /* 次要文字 */
--font-size-base: 13px;       /* 基础文字 */
--font-size-md: 14px;         /* 中等文字 */
--font-size-lg: 16px;         /* 大标题 */
--font-size-xl: 20px;         /* 特大标题 */
```

#### 字重规范
```css
--font-weight-normal: 400;    /* 正常字重 */
--font-weight-medium: 500;    /* 中等字重 */
--font-weight-semibold: 600;  /* 半粗体 */
--font-weight-bold: 700;      /* 粗体 */
```

#### 行高规范
```css
--line-height-tight: 1.2;     /* 紧凑行高 */
--line-height-base: 1.5;      /* 基础行高 */
--line-height-loose: 1.8;     /* 宽松行高 */
```

### 1.3 间距系统

基于 **4px 基准单位**（4px Grid System）：

```css
--space-1: 4px;               /* 0.25rem */
--space-2: 8px;               /* 0.5rem */
--space-3: 12px;              /* 0.75rem */
--space-4: 16px;              /* 1rem */
--space-5: 20px;              /* 1.25rem */
--space-6: 24px;              /* 1.5rem */
--space-8: 32px;              /* 2rem */
--space-10: 40px;             /* 2.5rem */
--space-12: 48px;             /* 3rem */
```

**常用场景**：
- 组件内部间距：8px、12px
- 组件之间间距：16px、20px
- 区块间距：24px、32px
- 页面边距：40px、48px

### 1.4 圆角系统

```css
--radius-sm: 8px;             /* 小组件：按钮、输入框、标签 */
--radius-md: 12px;            /* 中等组件：卡片、面板 */
--radius-lg: 16px;            /* 大组件：弹窗、大按钮 */
--radius-full: 9999px;        /* 圆形：头像、徽章 */
```

### 1.5 阴影系统

```css
--shadow-sm: 0 2px 4px rgba(0, 0, 0, 0.08);          /* 轻微浮起 */
--shadow-base: 0 4px 12px rgba(0, 0, 0, 0.12);       /* 基础阴影 */
--shadow-lg: 0 8px 24px rgba(0, 0, 0, 0.15);         /* 强调阴影 */
--shadow-xl: 0 12px 40px rgba(0, 0, 0, 0.2);         /* 大型弹窗 */

/* 暗黑模式 */
--shadow-base-dark: 0 4px 12px rgba(0, 0, 0, 0.5);
--shadow-lg-dark: 0 8px 24px rgba(0, 0, 0, 0.6);
```

### 1.6 过渡动画

```css
--transition-fast: 0.15s ease;       /* 快速响应：按钮hover */
--transition-base: 0.2s ease;        /* 基础过渡：表单元素 */
--transition-slow: 0.3s ease;        /* 缓慢过渡：弹窗展开 */
--transition-bezier: cubic-bezier(0.4, 0, 0.2, 1);  /* 自定义缓动 */
```

---

## 2. 组件规范

### 2.1 按钮组件（Button）

#### 主要按钮（Primary Button）
```html
<button class="btn-primary">主要操作</button>
```

```css
.btn-primary {
  height: 28px;
  padding: 0 16px;
  background: #ffffff;
  border: 1px solid #e3e3e3;
  border-radius: 8px;
  color: #333333;
  font-size: 13px;
  font-weight: 400;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-primary:hover {
  background: #f5f5f5;
  border-color: #d0d0d0;
}

.btn-primary:active {
  background: #eeeeee;
}

/* 暗黑模式 */
body.dark-mode .btn-primary {
  background: #2a2a2a;
  border-color: #404040;
  color: #e0e0e0;
}

body.dark-mode .btn-primary:hover {
  background: #333333;
  border-color: #505050;
}
```

#### 次要按钮（Secondary Button）
```html
<button class="btn-secondary">次要操作</button>
```

```css
.btn-secondary {
  height: 28px;
  padding: 0 16px;
  background: #5b5b5b;
  border: 1px solid transparent;
  border-radius: 8px;
  color: #ffffff;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-secondary:hover {
  background: #6b6b6b;
}

.btn-secondary:active {
  background: #4b4b4b;
}
```

#### Tab 按钮
```html
<button class="tab-btn active">选项一</button>
<button class="tab-btn">选项二</button>
```

```css
.tab-btn {
  height: 28px;
  padding: 0 12px;
  background: transparent;
  border: 1px solid transparent;
  border-radius: 8px;
  color: #818181;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.tab-btn:hover {
  background: #f5f5f5;
  color: #333333;
}

.tab-btn.active {
  background: #ffffff;
  border-color: #e3e3e3;
  color: #333333;
}

/* 暗黑模式 */
body.dark-mode .tab-btn {
  color: #a0a0a0;
}

body.dark-mode .tab-btn:hover {
  background: #333333;
  color: #e0e0e0;
}

body.dark-mode .tab-btn.active {
  background: #2a2a2a;
  border-color: #404040;
  color: #e0e0e0;
}
```

#### 清空画布按钮（特殊样式）
```html
<button class="clear-canvas-btn" title="清空画布">
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M17 7L7 17" stroke="#333333" stroke-width="1.5" stroke-linecap="round"/>
    <path d="M7 7L17 17" stroke="#333333" stroke-width="1.5" stroke-linecap="round"/>
  </svg>
</button>
```

```css
.clear-canvas-btn {
  width: 32px;
  height: 28px;
  background: #ffffff;
  border: 1px solid #F3F3F3;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.clear-canvas-btn:hover {
  background: #fff5f5;
  border-color: #ffe3e3;
}

.clear-canvas-btn:hover svg path {
  stroke: #ff4444;
}

.clear-canvas-btn:active {
  background: #ffebeb;
}

/* 暗黑模式 */
body.dark-mode .clear-canvas-btn {
  background: #2a2a2a;
  border-color: #404040;
}

body.dark-mode .clear-canvas-btn svg path {
  stroke: #e0e0e0;
}

body.dark-mode .clear-canvas-btn:hover {
  background: #3a2020;
  border-color: #503030;
}

body.dark-mode .clear-canvas-btn:hover svg path {
  stroke: #ff6666;
}
```

#### 图标按钮（Icon Button）
```html
<button class="icon-btn" title="帮助">
  <svg>...</svg>
</button>
```

```css
.icon-btn {
  width: 28px;
  height: 28px;
  background: transparent;
  border: 1px solid transparent;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.icon-btn:hover {
  background: #f5f5f5;
}

.icon-btn:active {
  background: #eeeeee;
}

/* 暗黑模式 */
body.dark-mode .icon-btn:hover {
  background: #333333;
}
```

### 2.2 输入框组件（Input）

#### 基础输入框
```html
<input type="text" class="input-base" placeholder="请输入内容">
```

```css
.input-base {
  height: 28px;
  padding: 0 12px;
  background: #ffffff;
  border: 1px solid #e3e3e3;
  border-radius: 8px;
  color: #333333;
  font-size: 13px;
  font-family: var(--font-family-base);
  transition: all 0.2s ease;
}

.input-base::placeholder {
  color: #999999;
}

.input-base:focus {
  outline: none;
  border-color: #409eff;
  box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.1);
}

.input-base:disabled {
  background: #f5f5f5;
  color: #cccccc;
  cursor: not-allowed;
}

/* 暗黑模式 */
body.dark-mode .input-base {
  background: #2a2a2a;
  border-color: #404040;
  color: #e0e0e0;
}

body.dark-mode .input-base::placeholder {
  color: #666666;
}

body.dark-mode .input-base:focus {
  border-color: #409eff;
}
```

#### 数字输入框
```html
<input type="number" class="input-number" min="1" max="100" step="1">
```

```css
.input-number {
  width: 80px;
  height: 28px;
  padding: 0 8px;
  background: #ffffff;
  border: 1px solid #e3e3e3;
  border-radius: 8px;
  color: #333333;
  font-size: 13px;
  text-align: center;
  transition: all 0.2s ease;
}

.input-number:focus {
  outline: none;
  border-color: #409eff;
}

/* 移除默认的数字输入框箭头 */
.input-number::-webkit-outer-spin-button,
.input-number::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

/* 暗黑模式 */
body.dark-mode .input-number {
  background: #2a2a2a;
  border-color: #404040;
  color: #e0e0e0;
}
```

#### 搜索输入框
```html
<div class="search-wrapper">
  <input type="text" class="search-input" placeholder="搜索素材...">
  <svg class="search-icon">...</svg>
</div>
```

```css
.search-wrapper {
  position: relative;
  width: 100%;
}

.search-input {
  width: 100%;
  height: 32px;
  padding: 0 12px 0 36px;
  background: #ffffff;
  border: 1px solid #e3e3e3;
  border-radius: 8px;
  color: #333333;
  font-size: 13px;
}

.search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  width: 16px;
  height: 16px;
  opacity: 0.5;
}

.search-input:focus {
  outline: none;
  border-color: #409eff;
}

.search-input:focus + .search-icon {
  opacity: 0.8;
}

/* 暗黑模式 */
body.dark-mode .search-input {
  background: #2a2a2a;
  border-color: #404040;
  color: #e0e0e0;
}
```

### 2.3 开关组件（Toggle Switch）

```html
<label class="toggle-switch">
  <input type="checkbox" class="toggle-input">
  <span class="toggle-slider"></span>
</label>
```

```css
.toggle-switch {
  position: relative;
  display: inline-block;
  width: 40px;
  height: 20px;
  cursor: pointer;
}

.toggle-input {
  opacity: 0;
  width: 0;
  height: 0;
}

.toggle-slider {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: #e3e3e3;
  border-radius: 20px;
  transition: all 0.2s ease;
}

.toggle-slider::before {
  content: '';
  position: absolute;
  height: 16px;
  width: 16px;
  left: 2px;
  bottom: 2px;
  background: #ffffff;
  border-radius: 50%;
  transition: all 0.2s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.toggle-input:checked + .toggle-slider {
  background: #409eff;
}

.toggle-input:checked + .toggle-slider::before {
  transform: translateX(20px);
}

.toggle-input:disabled + .toggle-slider {
  opacity: 0.5;
  cursor: not-allowed;
}

/* 暗黑模式 */
body.dark-mode .toggle-slider {
  background: #404040;
}

body.dark-mode .toggle-slider::before {
  background: #666666;
}

body.dark-mode .toggle-input:checked + .toggle-slider {
  background: #409eff;
}

body.dark-mode .toggle-input:checked + .toggle-slider::before {
  background: #ffffff;
}
```

### 2.4 文件名容器（File Name Box）

```html
<div class="file-name-box">
  <span class="file-name-label">示例文件.svga</span>
</div>
```

```css
.file-name-box {
  display: flex;
  align-items: center;
  height: 28px;
  padding: 0 12px;
  background: #ffffff;
  border: 1px solid #F3F3F3;
  border-radius: 8px;
}

.file-name-label {
  font-size: 13px;
  color: #333333;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 200px;
}

/* 暗黑模式 */
body.dark-mode .file-name-box {
  background: #2a2a2a;
  border-color: #404040;
}

body.dark-mode .file-name-label {
  color: #e0e0e0;
}
```

### 2.5 进度条组件（Progress Bar）

```html
<div class="progress-wrapper">
  <div class="progress-bar" style="width: 60%;"></div>
</div>
```

```css
.progress-wrapper {
  width: 100%;
  height: 4px;
  background: #e3e3e3;
  border-radius: 2px;
  overflow: hidden;
}

.progress-bar {
  height: 100%;
  background: #409eff;
  border-radius: 2px;
  transition: width 0.3s ease;
}

/* 暗黑模式 */
body.dark-mode .progress-wrapper {
  background: #404040;
}

body.dark-mode .progress-bar {
  background: #409eff;
}
```

### 2.6 Tooltip 提示框

```html
<div class="tooltip-wrapper">
  <button class="icon-btn">?</button>
  <div class="tooltip-content">这是提示内容</div>
</div>
```

```css
.tooltip-wrapper {
  position: relative;
  display: inline-block;
}

.tooltip-content {
  position: absolute;
  bottom: calc(100% + 8px);
  left: 50%;
  transform: translateX(-50%);
  padding: 8px 12px;
  background: #333333;
  color: #ffffff;
  font-size: 12px;
  border-radius: 8px;
  white-space: nowrap;
  opacity: 0;
  visibility: hidden;
  transition: all 0.2s ease;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 1000;
}

.tooltip-content::after {
  content: '';
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  border: 4px solid transparent;
  border-top-color: #333333;
}

.tooltip-wrapper:hover .tooltip-content {
  opacity: 1;
  visibility: visible;
}

/* 暗黑模式 */
body.dark-mode .tooltip-content {
  background: #f5f5f5;
  color: #333333;
}

body.dark-mode .tooltip-content::after {
  border-top-color: #f5f5f5;
}
```

### 2.7 弹窗组件（Modal/Panel）

```html
<div class="modal-overlay">
  <div class="modal-panel">
    <div class="modal-header">
      <h3 class="modal-title">弹窗标题</h3>
      <button class="modal-close">&times;</button>
    </div>
    <div class="modal-body">
      弹窗内容
    </div>
    <div class="modal-footer">
      <button class="btn-primary">取消</button>
      <button class="btn-secondary">确定</button>
    </div>
  </div>
</div>
```

```css
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-panel {
  width: 90%;
  max-width: 600px;
  max-height: 80vh;
  background: #ffffff;
  border-radius: 16px;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.2);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  border-bottom: 1px solid #e3e3e3;
}

.modal-title {
  font-size: 16px;
  font-weight: 600;
  color: #333333;
  margin: 0;
}

.modal-close {
  width: 28px;
  height: 28px;
  background: transparent;
  border: none;
  font-size: 24px;
  color: #999999;
  cursor: pointer;
  transition: all 0.2s ease;
}

.modal-close:hover {
  color: #333333;
}

.modal-body {
  flex: 1;
  padding: 24px;
  overflow-y: auto;
}

.modal-footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 12px;
  padding: 20px 24px;
  border-top: 1px solid #e3e3e3;
}

/* 暗黑模式 */
body.dark-mode .modal-overlay {
  background: rgba(0, 0, 0, 0.7);
}

body.dark-mode .modal-panel {
  background: #2a2a2a;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.6);
}

body.dark-mode .modal-header,
body.dark-mode .modal-footer {
  border-color: #404040;
}

body.dark-mode .modal-title {
  color: #e0e0e0;
}

body.dark-mode .modal-close {
  color: #808080;
}

body.dark-mode .modal-close:hover {
  color: #e0e0e0;
}
```

---

## 3. 布局规范

### 3.1 Flex 布局使用规范

#### 水平居中
```css
.flex-center-horizontal {
  display: flex;
  justify-content: center;
}
```

#### 垂直居中
```css
.flex-center-vertical {
  display: flex;
  align-items: center;
}

```

#### 完全居中
```css
.flex-center {
  display: flex;
  align-items: center;
  justify-content: center;
}
```

#### 水平分布（两端对齐）
```css
.flex-between {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
```

#### 水平分布（等间距）
```css
.flex-around {
  display: flex;
  align-items: center;
  gap: 12px; /* 推荐使用 gap 代替 justify-content: space-around */
}
```

### 3.2 间距使用规范

#### 组件内部间距（Padding）
```css
/* 紧凑型组件 */
.component-compact {
  padding: 8px 12px;
}

/* 标准组件 */
.component-standard {
  padding: 12px 16px;
}

/* 宽松组件 */
.component-loose {
  padding: 16px 24px;
}

/* 大型容器 */
.container-large {
  padding: 24px 32px;
}
```

#### 组件间距（Gap/Margin）
```css
/* 小间距 */
.gap-sm {
  gap: 8px;
}

/* 标准间距 */
.gap-base {
  gap: 12px;
}

/* 中等间距 */
.gap-md {
  gap: 16px;
}

/* 大间距 */
.gap-lg {
  gap: 24px;
}
```

### 3.3 栅格系统

基于 12 列栅格系统：

```css
.container {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
}

.row {
  display: flex;
  flex-wrap: wrap;
  margin: 0 -12px;
}

.col {
  padding: 0 12px;
}

.col-6 {
  width: 50%;
}

.col-4 {
  width: 33.333%;
}

.col-3 {
  width: 25%;
}
```

---

## 4. 交互规范

### 4.1 状态变化

#### Hover 状态
- **视觉反馈**：背景色变化、边框色变化、透明度变化
- **过渡时间**：0.2s ease
- **适用场景**：按钮、链接、可点击元素

```css
.interactive-element:hover {
  background: #f5f5f5;
  transition: all 0.2s ease;
}
```

#### Active 状态
- **视觉反馈**：背景色进一步加深
- **过渡时间**：无（立即响应）
- **适用场景**：按钮按下、拖拽操作

```css
.interactive-element:active {
  background: #eeeeee;
}
```

#### Focus 状态
- **视觉反馈**：蓝色外发光边框
- **颜色**：#409eff，透明度 0.1
- **适用场景**：输入框、可聚焦元素

```css
.interactive-element:focus {
  outline: none;
  border-color: #409eff;
  box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.1);
}
```

#### Disabled 状态
- **视觉反馈**：降低透明度、禁用鼠标指针
- **透明度**：0.5
- **适用场景**：禁用的按钮、输入框

```css
.interactive-element:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
```

### 4.2 过渡动画时长

| 动画类型 | 时长 | 适用场景 |
|---------|------|---------|
| 快速 | 0.15s | 按钮 hover、小元素状态变化 |
| 标准 | 0.2s | 输入框 focus、颜色变化 |
| 缓慢 | 0.3s | 弹窗展开、页面切换 |

### 4.3 暗黑模式切换

**切换方式**：通过在 `<body>` 标签上添加/移除 `.dark-mode` 类

```javascript
// 切换暗黑模式
document.body.classList.toggle('dark-mode');

// 保存用户偏好
localStorage.setItem('theme', document.body.classList.contains('dark-mode') ? 'dark' : 'light');
```

**样式定义原则**：
1. 所有组件都必须提供暗黑模式样式
2. 使用 `body.dark-mode` 选择器覆盖样式
3. 保持视觉层次关系不变
4. 确保文字对比度符合无障碍标准（WCAG AA 标准，对比度 ≥ 4.5:1）

```css
/* 浅色模式 */
.component {
  background: #ffffff;
  color: #333333;
}

/* 暗黑模式 */
body.dark-mode .component {
  background: #2a2a2a;
  color: #e0e0e0;
}
```

---

## 5. 无障碍规范（Accessibility）

### 5.1 颜色对比度

- **大文字**（≥18px 或 ≥14px 加粗）：对比度 ≥ 3:1
- **小文字**（<18px）：对比度 ≥ 4.5:1
- **图标和图形**：对比度 ≥ 3:1

### 5.2 键盘导航

- 所有可交互元素必须支持键盘访问（Tab 键切换）
- 使用 `:focus` 伪类提供明显的焦点指示
- 避免使用 `outline: none;` 除非提供替代的焦点样式

### 5.3 语义化 HTML

```html
<!-- ✅ 推荐 -->
<button class="btn-primary">提交</button>
<a href="#" class="link">链接</a>

<!-- ❌ 不推荐 -->
<div class="btn-primary" onclick="submit()">提交</div>
<span class="link" onclick="navigate()">链接</span>
```

### 5.4 ARIA 标签

```html
<!-- 为图标按钮添加 aria-label -->
<button class="icon-btn" aria-label="关闭">
  <svg>...</svg>
</button>

<!-- 为 Tooltip 添加 aria-describedby -->
<button aria-describedby="tooltip-1">帮助</button>
<div id="tooltip-1" role="tooltip">这是帮助信息</div>
```

---

## 6. 代码示例

### 6.1 完整的表单组件

```html
<div class="form-group">
  <label class="form-label" for="input-example">输入框标签</label>
  <input type="text" id="input-example" class="input-base" placeholder="请输入内容">
  <span class="form-hint">这是提示文字</span>
</div>
```

```css
.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 20px;
}

.form-label {
  font-size: 13px;
  font-weight: 500;
  color: #333333;
}

.form-hint {
  font-size: 12px;
  color: #999999;
}

/* 暗黑模式 */
body.dark-mode .form-label {
  color: #e0e0e0;
}

body.dark-mode .form-hint {
  color: #808080;
}
```

### 6.2 完整的卡片组件

```html
<div class="card">
  <div class="card-header">
    <h3 class="card-title">卡片标题</h3>
    <button class="icon-btn">···</button>
  </div>
  <div class="card-body">
    <p>卡片内容</p>
  </div>
  <div class="card-footer">
    <button class="btn-primary">取消</button>
    <button class="btn-secondary">确定</button>
  </div>
</div>
```

```css
.card {
  background: #ffffff;
  border: 1px solid #e3e3e3;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.08);
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid #e3e3e3;
}

.card-title {
  font-size: 14px;
  font-weight: 600;
  color: #333333;
  margin: 0;
}

.card-body {
  padding: 20px;
}

.card-footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 12px;
  padding: 16px 20px;
  border-top: 1px solid #e3e3e3;
  background: #fcfcfc;
}

/* 暗黑模式 */
body.dark-mode .card {
  background: #2a2a2a;
  border-color: #404040;
}

body.dark-mode .card-header,
body.dark-mode .card-footer {
  border-color: #404040;
}

body.dark-mode .card-title {
  color: #e0e0e0;
}

body.dark-mode .card-footer {
  background: #1a1a1a;
}
```

---

## 7. 最佳实践

### 7.1 CSS 命名规范

采用 **BEM（Block Element Modifier）** 命名规范：

```css
/* Block（块） */
.button { }

/* Element（元素） */
.button__icon { }
.button__text { }

/* Modifier（修饰符） */
.button--primary { }
.button--disabled { }

/* 组合使用 */
.button.button--primary { }
.button__icon.button__icon--large { }
```

**项目当前命名风格**：混合使用 BEM 和语义化类名

```css
/* 推荐的命名方式 */
.btn-primary { }          /* 主要按钮 */
.modal-overlay { }        /* 弹窗遮罩 */
.file-name-box { }        /* 文件名容器 */
.toggle-switch { }        /* 开关组件 */
```

### 7.2 CSS 书写顺序

```css
.component {
  /* 1. 定位 */
  position: relative;
  top: 0;
  left: 0;
  z-index: 10;
  
  /* 2. 盒模型 */
  display: flex;
  width: 100%;
  height: 28px;
  padding: 0 12px;
  margin: 0;
  
  /* 3. 边框 */
  border: 1px solid #e3e3e3;
  border-radius: 8px;
  
  /* 4. 背景 */
  background: #ffffff;
  
  /* 5. 文字 */
  color: #333333;
  font-size: 13px;
  font-weight: 400;
  line-height: 1.5;
  text-align: center;
  
  /* 6. 其他 */
  cursor: pointer;
  opacity: 1;
  
  /* 7. 过渡动画 */
  transition: all 0.2s ease;
}
```

### 7.3 避免魔法数字

```css
/* ❌ 不推荐 */
.button {
  padding: 0 16px;
  font-size: 13px;
  border-radius: 8px;
}

/* ✅ 推荐 */
:root {
  --space-4: 16px;
  --font-size-base: 13px;
  --radius-sm: 8px;
}

.button {
  padding: 0 var(--space-4);
  font-size: var(--font-size-base);
  border-radius: var(--radius-sm);
}
```

### 7.4 移动端适配

```css
/* 响应式断点 */
@media (max-width: 768px) {
  .container {
    padding: 0 16px;
  }
  
  .modal-panel {
    width: 95%;
    max-height: 90vh;
  }
  
  .btn-primary {
    height: 32px; /* 移动端增加高度以便点击 */
  }
}
```

---

## 8. 版本历史

| 版本 | 日期 | 描述 |
|-----|------|------|
| 1.0 | 2025-12-16 | 初始版本，基于现有代码梳理 |

---

## 9. 参考资源

- [Material Design](https://material.io/design)
- [Ant Design](https://ant.design/)
- [Element Plus](https://element-plus.org/)
- [Figma 设计规范](https://www.figma.com/)
- [WCAG 无障碍标准](https://www.w3.org/WAI/WCAG21/quickref/)
