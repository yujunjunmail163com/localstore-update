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

### Requirement: 结构化确认弹窗组件

系统 SHALL 使用结构化的 Header/Body/Footer 三段式弹窗，替代原有的简单提示框。

#### Scenario: 弹窗容器
- **WHEN** 弹窗打开
- **THEN** 弹窗圆角 SHALL 为 border-radius: 4px
- **AND** 弹窗内边距 SHALL 为 padding: 24px

#### Scenario: 弹窗头部（Header）
- **WHEN** 弹窗渲染完成
- **THEN** 头部高度 SHALL 为 55px
- **AND** 标题字体 SHALL 为 font-family: PingFangSC, PingFang SC; font-weight: 600; font-size: 16px; color: #282F3C; line-height: 22px
- **AND** 标题右侧 SHALL 有 X 关闭按钮，点击触发关闭弹窗逻辑
- **AND** 头部与主体之间 SHALL 有 #E7EBF3 颜色的水平分割线

#### Scenario: 弹窗底部（Footer）按钮
- **WHEN** 弹窗渲染完成
- **THEN** 操作按钮 SHALL 右下角对齐
- **AND** 所有按钮 SHALL 为 width: 74px; height: 32px; border-radius: 4px; font-size: 14px
- **AND** 主要操作按钮 SHALL 为底色 #003AA8，文字 #fff，无边框
- **AND** 取消按钮 SHALL 为背景透明，边框 1px solid #C7D5EB
