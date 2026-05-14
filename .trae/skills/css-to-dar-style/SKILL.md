---
name: css-to-dar-style
display_name: CSS→D头像框样式转换
description: 当用户提供CSS文字样式要为MeeWoo素材自助页添加/更新大R头像框（dar）条目时使用。触发场景：用户提到"添加头像框"、"导入CSS样式"、"file-list.json"、"dar_svga"、"文字样式转换"、给了CSS属性要录入JSON配置。自动过滤不支持的CSS属性，换算为Canvas 2D兼容的JSON格式。
version: 1.1.0
---

# CSS → D头像框样式转换

将设计师给定的 CSS 文字样式转换为 `src/assets/dar_svga/file-list.json` 中 `textStyle` 的 JSON 格式。

> ⚠️ **只修改 `src/` 下的源文件**。`docs/` 是构建产物，由 `npm run build`（含 `copy-static.py`）自动生成，**禁止直接编辑**。

## 适用场景

- 新增头像框：有 CSS 样式 + SVGA 链接 + 图标 PNG → 插入到 file-list.json
- 修改样式：更新已有条目的 textStyle
- 只换算样式：仅将 CSS 转为 JSON 片段预览

## 核心规则

### 支持的 CSS 属性（6 项）

| CSS 属性 | JSON 字段 | 说明 |
|----------|-----------|------|
| `font-weight` | `fontWeight` | 如 `"700"` |
| `color` | `fillColor` | 文字填充色 |
| `-webkit-text-stroke-color` | `strokeColor` | 描边颜色 |
| `-webkit-text-stroke-width` | `strokeWidth` | 描边宽度（数字） |
| `text-shadow` | `textShadow` 或 `multiShadow` | 单条→textShadow，逗号分隔多条→multiShadow |
| `background: linear-gradient(...)` | `gradient` | 自动拆为 `colors` + `positions` |

### 自动忽略的属性

`font-size`、`font-family`、`text-align`、`line-height`、`letter-spacing`、`opacity`、`position`、`width`、`height`、`display`、`align-items`、`-webkit-background-clip`、`-webkit-text-fill-color`、`background-clip`、`text-fill-color` 等在 Canvas 2D 中无对应或由 baseStyle 统一控制，转换时自动丢弃。

### 渐变换算规则

CSS `linear-gradient` 角度参数（如 `180deg`）忽略，Canvas 固定垂直从上到下。百分比位置除以 100。

```
CSS: background: linear-gradient(180deg, #AAA 0%, #BBB 50%, #CCC 100%)
JSON: "gradient": { "colors": ["#AAA","#BBB","#CCC"], "positions": [0.0,0.5,1.0] }
```

## 工作流

### 模式一：纯换算预览

只把 CSS 转成 textStyle JSON，不写文件：

```bash
python .trae/skills/css-to-dar-style/scripts/css_to_json.py --css-text "font-weight: 700; color: #FFF;"
```

### 模式二：生成完整条目（推荐）

一行命令，CSS 直传 + 名称 + 链接，输出可直接插入 file-list.json 的 JSON 对象：

```bash
python .trae/skills/css-to-dar-style/scripts/css_to_json.py \
  --name Dnew --svga-url "https://..." \
  --css-text "font-weight: 700; color: #FFF;"
```

### 模式三：一键写入 src 源文件（最常用）

加上 `--file-list` 自动去重并追加到 `src/assets/dar_svga/file-list.json`：

```bash
python .trae/skills/css-to-dar-style/scripts/css_to_json.py \
  --name Dnew --svga-url "https://..." \
  --css-text "font-weight: 700; background: linear-gradient(...); text-shadow: ...;" \
  --file-list src/assets/dar_svga/file-list.json
```

### 模式四：多素材 key

有些头像框有多个可替换文字区域（如 `name01` + `Username01`），分别换算后手动合并：

```bash
# 第一套 → 紧凑输出
python .trae/skills/css-to-dar-style/scripts/css_to_json.py --key name01 --compact --css-text "..."

# 第二套 → 紧凑输出
python .trae/skills/css-to-dar-style/scripts/css_to_json.py --key Username01 --compact --css-text "..."
```

然后由 AI 拼装成完整条目写入 file-list.json。

### 模式五：AI 直算（简易 CSS）

如果 CSS 简单（无 `linear-gradient`、单条 `text-shadow`），AI 可跳过脚本直接手工换算编辑，更快。仅在包含渐变或多层阴影时调用脚本确保精度。

## file-list.json 条目完整结构

```json
{
  "name": "dtop2",
  "svga": "https://blog-1258489735.cos.ap-chengdu.myqcloud.com/other/avatar_frame_dar/dtop2.svga",
  "textStyle": {
    "name01": {
      "fontWeight": "700",
      "gradient": { "colors": [...], "positions": [...] },
      "multiShadow": ["0px 1px 0px #EF9A4B", ...]
    }
  }
}
```

**关键约定**：
- `name` 即为图标文件名（无需 `.png` 后缀，代码自动补全）
- 图标需放入 `src/assets/dar_svga/<name>.png`
- SVGA 素材需要可公网访问
- **只修改 `src/`**，`docs/` 由 `npm run build` 自动生成

## 操作后检查清单

- [ ] `src/assets/dar_svga/file-list.json` JSON 合法
- [ ] 图标 PNG 文件已存在于 `src/assets/dar_svga/`
- [ ] 刷新浏览器验证头像框列表中出现新条目
- [ ] 点击弹窗确认文字样式渲染正确

## 脚本参数速查

| 参数 | 简写 | 用途 |
|------|------|------|
| `--css-text` | `-t` | 命令行直传 CSS（推荐） |
| `--input` | `-i` | 从文件读取 CSS |
| `--key` | `-k` | 素材 key 名（默认 `name01`） |
| `--name` | `-n` | 头像框名称 |
| `--svga-url` | `-u` | SVGA 素材链接 |
| `--file-list` | `-f` | 目标 file-list.json 路径（写入模式） |
| `--compact` | `-c` | 紧凑 JSON 输出 |
