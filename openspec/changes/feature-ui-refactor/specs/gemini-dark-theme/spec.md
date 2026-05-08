## ADDED Requirements

### Requirement: Material Design 3 深色主题

系统 SHALL 使用 Material Design 3 风格的深色配色方案，包含主背景、表面色、强调色和文本色的完整色板。

#### Scenario: 页面加载时显示深色主题
- **WHEN** 用户打开扩展弹出面板
- **THEN** 页面背景 SHALL 为 #1e1f20
- **AND** 表格表头和卡片区域 SHALL 使用 #282a2c
- **AND** 强调色（按钮、链接、高亮）SHALL 为 #8ab4f8

#### Scenario: 层次感通过阴影和边框区分
- **WHEN** 页面渲染完成
- **THEN** 表格容器 SHALL 有 1px solid rgba(255,255,255,0.1) 的微弱边框
- **AND** 表头 SHALL 有 0 2px 8px rgba(0,0,0,0.3) 的细腻阴影

#### Scenario: 全局过渡动画
- **WHEN** 任何可交互元素的状态发生变化（悬停、聚焦、编辑）
- **THEN** 变化 SHALL 以 transition: all 0.2s ease 的平滑过渡呈现
