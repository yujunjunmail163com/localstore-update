## ADDED Requirements

### Requirement: Key 单元格行内编辑

用户 SHALL 能够通过点击 Key 列单元格，将其转换为可编辑的输入框，直接修改 Key 名称。

#### Scenario: 点击 Key 进入编辑模式
- **WHEN** 用户点击 Key 列的某个单元格
- **THEN** 该单元格内的文本 SHALL 被替换为一个 `<input>` 输入框
- **AND** 输入框 SHALL 预填充当前 Key 的原始值
- **AND** 输入框 SHALL 自动获得焦点并选中文本

#### Scenario: 按 Enter 保存 Key 修改
- **WHEN** 用户在 Key 编辑输入框中按下 Enter 键
- **THEN** 系统 SHALL 使用新 Key 名称保存数据（removeItem 旧 Key + setItem 新 Key，保留原 Value）
- **AND** 输入框 SHALL 被替换回文本节点，显示新 Key 名称
- **AND** localStorage 中旧 Key SHALL 被移除，新 Key SHALL 存在

#### Scenario: 失去焦点保存 Key 修改
- **WHEN** 用户在 Key 编辑输入框中点击其他区域（失去焦点）
- **THEN** 系统 SHALL 与按 Enter 相同的逻辑保存修改

#### Scenario: 按 Escape 取消编辑
- **WHEN** 用户在 Key 编辑输入框中按下 Escape 键
- **THEN** 编辑 SHALL 被取消，输入框还原为原始 Key 名称的文本节点

#### Scenario: Key 为空时不保存
- **WHEN** 用户清空输入框内容后尝试保存（Enter 或 Blur）
- **THEN** 系统 SHALL 拒绝保存并恢复原始 Key 名称

#### Scenario: 新 Key 与已有 Key 重名
- **WHEN** 用户输入的 Key 名称与 localStorage 中已存在的另一个 Key 相同
- **THEN** 系统 SHALL 拒绝保存并提示用户 Key 已存在
- **AND** 输入框 SHALL 保持编辑状态
