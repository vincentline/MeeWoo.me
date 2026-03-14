# 双通道MP4弹窗静音默认开启
> Tags: dual-channel,ui,default
> Created: 2026-03-14

SVGA转双通道MP4弹窗，静音开关默认打开（muted默认值改为true）。

**修改点：**
1. 子组件 `dual-channel-panel.js`：data中config.muted默认值改为true；initParams中使用三元表达式处理undefined情况
2. 父组件 `panel-mixin.js`：dualChannelConfig.muted 默认值改为 true（关键！父组件的值会通过 props 传入子组件，覆盖子组件默认值）