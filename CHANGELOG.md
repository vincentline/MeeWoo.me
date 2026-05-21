# Changelog

## [1.2.0](https://github.com/vincentline/MeeWoo.me/compare/v1.1.0...v1.2.0) (2026-05-21)


### Features

* **avatar-icon:** 重构预览器为基于Konva的画布编辑器 ([2662d6b](https://github.com/vincentline/MeeWoo.me/commit/2662d6b65cd97799ab304cfb47115137d873ce34))
* **ui:** 添加Avatar小图标生成工具入口 ([62135b6](https://github.com/vincentline/MeeWoo.me/commit/62135b68dce4486b86d1e0b0b3eb0f85823c63e6))
* 支持英/阿双语图片生成与下载 ([9acebd8](https://github.com/vincentline/MeeWoo.me/commit/9acebd8110b0ac8a41c773fb4f1ba7e20eae9fdf))
* 新增头像框素材与CSS转换增强，升级预览器功能 ([84f71ea](https://github.com/vincentline/MeeWoo.me/commit/84f71ea9a4d2bc63fcb3b75bef55002f06bb5d7b))
* 活动图片生成器使用腾讯云素材 ([26e08e0](https://github.com/vincentline/MeeWoo.me/commit/26e08e033b0cc4e85589157e1b7c11a9d40690da))
* 添加知识引擎模块和文档索引结构 ([31ead18](https://github.com/vincentline/MeeWoo.me/commit/31ead1873fb8b549b1cde901cf36a4d0b01d6119))


### Bug Fixes

* **avatar-icon:** 修复生成图标按钮输出 750×750 而非 198×198 的问题 ([a6c1f1d](https://github.com/vincentline/MeeWoo.me/commit/a6c1f1dabc6b6dafb15b0df290d9f9ed3f1f46d2))
* **build:** 修复 copy-static.py 覆盖 Vite 构建产物导致 avatar-icon 线上报错 ([2181549](https://github.com/vincentline/MeeWoo.me/commit/2181549ef3fb87eac3e6983c54fc3323d209a41c))
* **ui:** Avatar图标预览器肤色改为#fff0e5 ([d13c91e](https://github.com/vincentline/MeeWoo.me/commit/d13c91ebe1cfe74bc9c78a55dd99fd1ed99e5b6f))

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
