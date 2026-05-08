## Why

当前扩展的 UI 风格偏向朴素的原生 HTML 外观，缺乏现代感和品牌质感。采用 Google Gemini / Material Design 3 的视觉语言进行重构，可以大幅提升产品的专业度和用户体验。

## What Changes

- 配色方案全面切换为 Material Design 3 深色模式，背景使用 #1e1f20，卡片使用 #282a2c，强调色使用 Gemini 标志性浅蓝色。
- 所有容器、按钮、输入框统一使用大圆角（12px-16px），增加内边距，视觉更透气。
- 按钮扁平化设计，去除厚重边框，添加悬停微亮效果和点击缩放质感。
- 删除按钮改为柔和浅红色文字 + 悬停浅红色背景，替换刺眼的纯红色。
- 编辑态 UI 重构：消除双边框，输入框与背景无缝融合，仅保留底部细亮线。
- 添加平滑过渡动画（transition: all 0.2s ease）。
- 搜索框改为药丸形圆角并添加搜索图标。
- 整体添加细腻阴影或微弱边框区分层次。

## Capabilities

### New Capabilities

- `gemini-dark-theme`: Material Design 3 深色主题视觉系统，包含配色、圆角、阴影、过渡动画等完整规范。
- `modern-button-style`: 扁平化按钮交互系统，包含悬停、点击、禁用等状态的视觉规范。
- `inline-edit-visual`: 编辑态视觉重构规范，消除双边框，实现与背景融合的行内编辑体验。
- `pill-search-input`: 药丸形搜索输入框规范，带搜索图标和深色主题适配。

### Modified Capabilities

（无已有规范需要修改）

## Impact

- 受影响文件：`src/styles.css`（全面重写）、`src/popup.html`（结构调整）、`src/inline-editor.js`（编辑态类名更新）。
- 无新增外部依赖，所有图标使用 SVG 内联或 Unicode 字符。
- 不影响功能逻辑，纯视觉层变更。
