## ADDED Requirements

### Requirement: 扁平化按钮系统

系统 SHALL 使用扁平化按钮设计，无厚重边框，通过微妙的背景色变化和交互动效提供操作反馈。

#### Scenario: 悬停效果
- **WHEN** 用户将鼠标悬停在任何按钮上
- **THEN** 按钮背景 SHALL 微亮（增加 8% 亮度）
- **AND** 变化 SHALL 以 0.2s 过渡平滑呈现

#### Scenario: 点击质感
- **WHEN** 用户按下按钮
- **THEN** 按钮 SHALL 执行 transform: scale(0.96) 的缩放效果
- **AND** 释放时 SHALL 恢复原始尺寸

#### Scenario: 删除按钮样式
- **WHEN** 删除按钮处于默认状态
- **THEN** 文本颜色 SHALL 为柔和的 #f28b82
- **AND** 背景 SHALL 为透明
- **WHEN** 用户悬停在删除按钮上
- **THEN** 背景 SHALL 变为 rgba(242,139,130,0.12)
