## ADDED Requirements

### Requirement: 药丸形搜索输入框

搜索框 SHALL 使用药丸形（pill-shaped）圆角设计，并包含搜索图标。

#### Scenario: 搜索框外观
- **WHEN** 页面渲染完成
- **THEN** 搜索框 SHALL 为全圆角（border-radius: 999px）
- **AND** 搜索框左侧 SHALL 显示放大镜 SVG 图标
- **AND** 搜索框背景 SHALL 为 #282a2c
- **AND** 搜索框边框 SHALL 为 1px solid rgba(255,255,255,0.1)

#### Scenario: 搜索框聚焦
- **WHEN** 用户点击搜索框
- **THEN** 边框 SHALL 变为 #8ab4f8
- **AND** 变化 SHALL 以 0.2s 过渡平滑呈现
