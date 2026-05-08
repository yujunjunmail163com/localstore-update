## ADDED Requirements

### Requirement: 编辑态无缝融合设计

编辑态的输入框 SHALL 与单元格背景无缝融合，消除双边框，仅保留底部强调色线条。

#### Scenario: 进入编辑模式
- **WHEN** 用户点击 Key 或 Value 单元格进入编辑状态
- **THEN** 输入框 SHALL 无边框，背景为 rgba(138,180,248,0.06)
- **AND** 输入框底部 SHALL 显示 2px solid #8ab4f8 的线条
- **AND** 光标颜色 SHALL 为 #8ab4f8

#### Scenario: 编辑态聚焦
- **WHEN** 输入框获得焦点
- **THEN** 不 SHALL 显示默认浏览器的 outline 或 box-shadow
- **AND** 底部线条颜色 SHALL 保持 #8ab4f8

#### Scenario: textarea 高度自适应
- **WHEN** Value 包含多行文本
- **THEN** textarea SHALL 自动调整高度以显示全部内容
