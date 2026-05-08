## Why

当前 Chrome 扩展的 localStorage 管理面板存在交互效率低的问题：用户只能通过点击"编辑图标"来修改 Value，且无法直接修改 Key 名称。这导致在管理大量 localStorage 数据时操作繁琐、效率低下。本变更旨在实现 Key 和 Value 的行内编辑功能，提升用户体验。

## What Changes

- 实现 Key 单元格的行内编辑：点击或双击 Key 单元格后，将其转换为输入框以支持直接修改 Key 名称。
- 实现 Value 单元格的行内编辑：点击 Value 区域时直接原地进入编辑状态，取消原有必须点击"编辑图标"的逻辑。
- 交互优化：失去焦点（Blur）或按下 Enter 键时自动保存修改。
- 保持现有 UI 深色风格不变。

## Capabilities

### New Capabilities

- `inline-key-editing`: Key 值行内编辑能力，支持点击或双击 Key 单元格后原地变为输入框，完成修改后自动保存。
- `inline-value-editing`: Value 行内编辑能力，支持点击 Value 区域直接进入编辑状态，失去焦点或按 Enter 时自动保存。

### Modified Capabilities

（无已有规范需要修改）

## Impact

- 受影响代码：localStorage 管理面板的核心渲染逻辑（表格行渲染、事件绑定）、数据持久化逻辑（重命名 Key 时需执行 delete + set 操作）。
- API 影响：需要使用 `window.localStorage` 的 `getItem`、`setItem`、`removeItem`、`key` 等 API，以及可能涉及的 `chrome.storage` API。
- 无新增外部依赖。
