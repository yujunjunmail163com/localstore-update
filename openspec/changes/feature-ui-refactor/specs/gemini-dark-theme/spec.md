## ADDED Requirements

### Requirement: 白色商务风格主题

系统 SHALL 使用白色商务风格配色方案，替代之前的 Material Design 3 深色主题。

#### Scenario: 页面加载时显示白色主题
- **WHEN** 用户打开扩展弹出面板
- **THEN** 页面背景 SHALL 为 #ffffff
- **AND** 表头背景 SHALL 为 #e7ebf3
- **AND** 表头文字颜色 SHALL 为 #637598

#### Scenario: 按钮样式
- **WHEN** 页面渲染完成
- **THEN** 所有顶部按钮 SHALL 为 width: 74px; height: 32px; border-radius: 4px; font-size: 14px
- **AND** 新增按钮 SHALL 为底色 #003AA8，文字 #fff，无边框
- **AND** 刷新按钮 SHALL 为背景透明，边框 1px solid #C7D5EB

#### Scenario: 搜索框样式
- **WHEN** 页面渲染完成
- **THEN** 搜索框 SHALL 为 border-radius: 4px
- **AND** 搜索框 SHALL 有清晰的浅色边框

#### Scenario: 表格样式
- **WHEN** 表格渲染完成
- **THEN** 表格外围 SHALL 为 border-radius: 4px
- **AND** 内部分隔线 SHALL 为 1px solid #ebeef5
- **AND** 删除按钮 SHALL 为 border-radius: 4px; font-size: 14px; color: #637598
