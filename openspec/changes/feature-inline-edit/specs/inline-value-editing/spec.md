## ADDED Requirements

### Requirement: Value 单元格行内编辑

用户 SHALL 能够通过点击 Value 列单元格，直接原地进入编辑状态，无需点击编辑图标。

#### Scenario: 点击 Value 进入编辑模式
- **WHEN** 用户点击 Value 列的某个单元格
- **THEN** 该单元格 SHALL 直接转换为可编辑状态（短文本使用 `<input>`，含换行符的文本使用 `<textarea>`）
- **AND** 编辑器 SHALL 预填充当前 Value 的原始值
- **AND** 编辑器 SHALL 自动获得焦点

#### Scenario: 按 Enter 保存 Value 修改
- **WHEN** 用户在 Value 编辑输入框中按下 Enter 键（textarea 中为 Ctrl+Enter）
- **THEN** 系统 SHALL 调用 `localStorage.setItem(当前Key, 新Value)` 保存修改
- **AND** 编辑器 SHALL 被替换回文本节点，显示新 Value

#### Scenario: 失去焦点保存 Value 修改
- **WHEN** 用户在 Value 编辑输入框中点击其他区域（失去焦点）
- **THEN** 系统 SHALL 自动保存修改

#### Scenario: 按 Escape 取消编辑
- **WHEN** 用户在 Value 编辑输入框中按下 Escape 键
- **THEN** 编辑 SHALL 被取消，还原为原始 Value 的文本节点

#### Scenario: 多行文本使用 textarea
- **WHEN** 当前 Value 包含换行符
- **THEN** 行内编辑器 SHALL 使用 `<textarea>` 而非 `<input>`
- **AND** textarea 的高度 SHALL 自适应内容

### Requirement: 编辑状态互斥

同一时间 SHALL 只有一个单元格处于编辑状态。

#### Scenario: 编辑中点击另一个单元格
- **WHEN** 用户正在编辑某个单元格，点击了另一个可编辑单元格
- **THEN** 当前正在编辑的单元格 SHALL 自动保存并退出编辑状态
- **AND** 被点击的新单元格 SHALL 进入编辑状态
