# Changelog

## [1.2.0](https://github.com/vincentline/MeeWoo.me/compare/v1.1.0...v1.2.0) (2026-07-10)


### Features

* **avatar-icon:** 添加新的头像图标nv02.png ([2d63847](https://github.com/vincentline/MeeWoo.me/commit/2d63847ce4cffc831df40ff7fbe6b9904933190f))
* **avatar-icon:** 重构预览器为基于Konva的画布编辑器 ([2662d6b](https://github.com/vincentline/MeeWoo.me/commit/2662d6b65cd97799ab304cfb47115137d873ce34))
* **png-compression:** 下载按钮智能文字——无勾选下载全部已压/有勾选下载选中已压/无已压禁用 ([781a43a](https://github.com/vincentline/MeeWoo.me/commit/781a43ac6aeb679ef2bb916fa35f982a6e0394d5))
* **png-compression:** 交互全面重构——文件选择/卡片列表/预设档位/对比弹窗/取消机制/多选下载 ([f6c84eb](https://github.com/vincentline/MeeWoo.me/commit/f6c84eb73867bf9edfcdada9f2d2b13e716f9410))
* **png-compression:** 图片卡片 meta 行显示压缩级别标签（推荐/极致/高质量） ([548867f](https://github.com/vincentline/MeeWoo.me/commit/548867f5be641518995959a91f1f8971cc3f9f68))
* **png-compression:** 对比弹窗tab重构——方形卡片/居中/浮层气泡选质量/确认按钮限宽 ([66958de](https://github.com/vincentline/MeeWoo.me/commit/66958deb6b24829c4dab809b5e433b8878606341))
* **png-compression:** 对比弹窗右侧标签动态显示压缩质量 ([1605cff](https://github.com/vincentline/MeeWoo.me/commit/1605cffcb8438a5fe88394f8c8ce177419ea68cc))
* **png-compression:** 对比弹窗图片缩放/平移——滚轮以鼠标为中心缩放1%步进，拖拽平移，点击百分比重置 ([49fbb18](https://github.com/vincentline/MeeWoo.me/commit/49fbb18f2ff2bc3580fd2ce907f9911eb4ab7935))
* **png-compression:** 工具栏重构——滑块常显+按钮重排+样式统一 ([770a673](https://github.com/vincentline/MeeWoo.me/commit/770a67300add9484368568914a0a76ab2ac11914))
* **png-compression:** 开始压缩时仅压缩勾选的图片，无勾选则压缩全部 ([e8f9fe8](https://github.com/vincentline/MeeWoo.me/commit/e8f9fe8e50caed4091236230d41764a44f96ff2f))
* **png-compression:** 弹窗右侧默认显示批量压缩结果，非预设档位显示具体数值 ([9e63bfe](https://github.com/vincentline/MeeWoo.me/commit/9e63bfec003fa2273de71c7d4776a3a698350964))
* **png-compression:** 新增尺寸限制、批量跳过逻辑与样式优化 ([02da224](https://github.com/vincentline/MeeWoo.me/commit/02da2244830d0f2635a54b472d7f00b83bf0c370))
* **png-compression:** 标签文案格式优化 + tab质量值小字后缀 ([f4b0ece](https://github.com/vincentline/MeeWoo.me/commit/f4b0eced5f8fe8d74896a06da0f396aa301246ba))
* **png-compression:** 覆盖确认弹窗 + 蓝按钮改深色 + tab 4 行结构 ([c9ebb4c](https://github.com/vincentline/MeeWoo.me/commit/c9ebb4c8871edd649237e1ca4e86996074bf693c))
* **png-compression:** 覆盖确认弹窗傻瓜化重构 ([fd46e7b](https://github.com/vincentline/MeeWoo.me/commit/fd46e7bdfe3ffaf5f3635fe2a2ec84f6646ca9f5))
* **png-compression:** 页面"开始压缩"按钮改为"批量压缩" ([09f64b3](https://github.com/vincentline/MeeWoo.me/commit/09f64b383e233c3d2de8f4e2f0537adeb2ca6271))
* **ui:** 添加Avatar小图标生成工具入口 ([62135b6](https://github.com/vincentline/MeeWoo.me/commit/62135b68dce4486b86d1e0b0b3eb0f85823c63e6))
* **webapp-testing:** add 4096图片压缩诊断脚本 ([f375fbd](https://github.com/vincentline/MeeWoo.me/commit/f375fbdf5a39fc21cdfa52705b8f086111e9ce49))
* 支持英/阿双语图片生成与下载 ([9acebd8](https://github.com/vincentline/MeeWoo.me/commit/9acebd8110b0ac8a41c773fb4f1ba7e20eae9fdf))
* 新增头像框素材与CSS转换增强，升级预览器功能 ([84f71ea](https://github.com/vincentline/MeeWoo.me/commit/84f71ea9a4d2bc63fcb3b75bef55002f06bb5d7b))
* 活动图片生成器使用腾讯云素材 ([26e08e0](https://github.com/vincentline/MeeWoo.me/commit/26e08e033b0cc4e85589157e1b7c11a9d40690da))
* 添加知识引擎模块和文档索引结构 ([31ead18](https://github.com/vincentline/MeeWoo.me/commit/31ead1873fb8b549b1cde901cf36a4d0b01d6119))


### Bug Fixes

* **avatar-icon:** 修复生成图标按钮输出 750×750 而非 198×198 的问题 ([a6c1f1d](https://github.com/vincentline/MeeWoo.me/commit/a6c1f1dabc6b6dafb15b0df290d9f9ed3f1f46d2))
* **build:** 修复 copy-static.py 覆盖 Vite 构建产物导致 avatar-icon 线上报错 ([2181549](https://github.com/vincentline/MeeWoo.me/commit/2181549ef3fb87eac3e6983c54fc3323d209a41c))
* **png-compression:** buildCompareTabs改用querySelectorAll+.remove替代innerHTML=''避免销毁浮层DOM ([ba5987f](https://github.com/vincentline/MeeWoo.me/commit/ba5987f7e01f8a473d475b0045f9ab044562dfac))
* **png-compression:** getQualityLabel 改为精确匹配预设值，自定义值直接显示数字 ([71c0ade](https://github.com/vincentline/MeeWoo.me/commit/71c0ade3514534d9e952cb80c3bfb2ab47515983))
* **png-compression:** 下载按钮文字去掉「打包」两字 ([f6a0e4a](https://github.com/vincentline/MeeWoo.me/commit/f6a0e4a9caef429e5b4363c4b8740896ab6ef624))
* **png-compression:** 修复Vite构建重排link导致全局样式反向覆盖工具样式的问题 ([c45bce0](https://github.com/vincentline/MeeWoo.me/commit/c45bce0e5642893e5acd2e3a168eb5119bf6dac2))
* **png-compression:** 最大支持尺寸 9000→4095（Canvas 上限 4096，留 1px 安全余量） ([7a6cf3e](https://github.com/vincentline/MeeWoo.me/commit/7a6cf3ec1da5eab4e321fc07595b799e5010b339))
* **png-compression:** 压缩中锁定UI交互 + 超大图Canvas保护 ([b500d65](https://github.com/vincentline/MeeWoo.me/commit/b500d6514309926ce3d3ce8f7b681537a3b60037))
* **png-compression:** 去掉 compare-tabs 的 overflow-x:auto——CSS规范强制overflow-y也变auto裁切浮层 ([2818541](https://github.com/vincentline/MeeWoo.me/commit/2818541dccf1209136229d8372eb2b373b0fe426))
* **png-compression:** 图片列表滚动/字号放大+原生tooltip/弹窗80vh居中 ([dc514bc](https://github.com/vincentline/MeeWoo.me/commit/dc514bc96058930dd851f134417cc1abd0ef0d66))
* **png-compression:** 审查修复——totalSizeAfter双重累加/关闭按钮定位/blob泄漏/body overflow恢复/ID碰撞/grab光标 ([63ee311](https://github.com/vincentline/MeeWoo.me/commit/63ee311976117aaa268a218b268f17a6cbabfdb7))
* **png-compression:** 审查者反馈修复——暗黑模式对比度 + 文案统一 ([715bfd3](https://github.com/vincentline/MeeWoo.me/commit/715bfd32fb58419e7e78769a595676182f3f1c41))
* **png-compression:** 审查者反馈修复（3 P1 + 2 P2 + 1 Nit） ([a87a05d](https://github.com/vincentline/MeeWoo.me/commit/a87a05d49ca5adcbe9ba95903da2f83782f8e85d))
* **png-compression:** 弹窗点击遮罩区域不再关闭，仅关闭按钮/确认版本可关闭 ([2707bd7](https://github.com/vincentline/MeeWoo.me/commit/2707bd784aa1e8789cc49f1593ae80f522a9cc74))
* **png-compression:** 恢复自定义按钮+记忆值 + 9000×9000硬限制替代缩放 ([a886139](https://github.com/vincentline/MeeWoo.me/commit/a886139fcb710e7d2b2a67ec48db809a7bffea25))
* **png-compression:** 浮层改为tab下方弹出，去掉modal overflow:hidden避免裁切 ([0c983b5](https://github.com/vincentline/MeeWoo.me/commit/0c983b514919aec0a8187e5b89dd68b7cae12936))
* **png-compression:** 浮层移入 compare-tabs 内部修复定位，清理旧 compare-actions DOM残留 ([8bb5e6d](https://github.com/vincentline/MeeWoo.me/commit/8bb5e6deafdfd4463c08e5dec6f87e6e486b10de))
* **png-compression:** 清空列表按钮保留描边风格，仅内间距圆角对齐批量压缩 ([546b53b](https://github.com/vincentline/MeeWoo.me/commit/546b53bc40488e70f6a8a7f8e5f16910be82b879))
* **png-compression:** 清空列表移到开始压缩左边，所有按钮加inline-flex文字居中 ([a499b15](https://github.com/vincentline/MeeWoo.me/commit/a499b15135ff4c754d225b01c7db24bafd05fa88))
* **png-compression:** 移除图片列表区域内部滚动，恢复整页自然滚动 ([0c4f1d4](https://github.com/vincentline/MeeWoo.me/commit/0c4f1d40d7acd7348a3adebe430609ea19aafdd8))
* **png-compression:** 自定义按钮不可取消选中，点其他预设自动收起并切换 ([0fd89b6](https://github.com/vincentline/MeeWoo.me/commit/0fd89b678141d50534d0511ba670b05f52b38c7c))
* **png-compression:** 覆盖全局 styles.css 的 overflow:hidden，恢复整页滚动 ([d81eafe](https://github.com/vincentline/MeeWoo.me/commit/d81eafe31c2f46ae3688ac942303259b83fd0009))
* **ui:** Avatar图标预览器肤色改为#fff0e5 ([d13c91e](https://github.com/vincentline/MeeWoo.me/commit/d13c91ebe1cfe74bc9c78a55dd99fd1ed99e5b6f))
* 修复FFmpeg编码和双通道合成的宽高适配问题 ([adb247f](https://github.com/vincentline/MeeWoo.me/commit/adb247f43296884357a67869b8cc7ca0fb1cbcc0))

## [1.1.0](https://github.com/vincentline/MeeWoo.me/compare/v1.0.0...v1.1.0) (2026-03-30)


### Features

* **knowledge:** introduce Knowledge Doctor and upgrade Librarian to v6.0 ([a3b8c42](https://github.com/vincentline/MeeWoo.me/commit/a3b8c427877a10814f1173960c5f71811633daf0))
* **media:** 大R导出新SVGA支持ZIP打包 ([0690e3a](https://github.com/vincentline/MeeWoo.me/commit/0690e3a3a47444a588c6087fd4bb560218c370d0))
* **ui:** 双通道MP4弹窗静音开关默认开启 ([baab2a6](https://github.com/vincentline/MeeWoo.me/commit/baab2a6dcdf793e0152523c4999484c3af126219))


### Bug Fixes

* **ci:** 修复 pages 构建与 release-please 配置 ([e48379c](https://github.com/vincentline/MeeWoo.me/commit/e48379cf901bca733d6736565138dc73baffb5e7))
* **integrity-check:** 脚本自动暂存所有变更 ([99e89e6](https://github.com/vincentline/MeeWoo.me/commit/99e89e6a1ee0f9873f295836f16807fbd351696a))
* **ui:** 修复双通道MP4弹窗静音默认值未生效问题 ([bbd70c4](https://github.com/vincentline/MeeWoo.me/commit/bbd70c46d9cf227d4ef8dc133ee7885251f79222))
* **ui:** 修复双通道MP4弹窗静音默认值未生效问题 ([f82b2be](https://github.com/vincentline/MeeWoo.me/commit/f82b2be69713aefef79f05a6b50f551aa050a98b))
* 修复 SVGA 播放时 Howl 未定义导致的报错 ([8bc0b7c](https://github.com/vincentline/MeeWoo.me/commit/8bc0b7c7c1f398fdb6753dd2f1addcf2e49b2e22))
* 修复拖入新SVGA文件时压缩记录未清空的问题 ([77d294c](https://github.com/vincentline/MeeWoo.me/commit/77d294cae2d5463c61326e13c2a24526d838a731))
* 添加缺失的 compressorjs 库文件修复 TinyPNG 加载失败问题 ([88dc7a9](https://github.com/vincentline/MeeWoo.me/commit/88dc7a9de1e36bd39653805655832de9b82857f7))
