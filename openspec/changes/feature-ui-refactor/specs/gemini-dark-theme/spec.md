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
- **AND** 弹窗 SHALL 无全局 padding，各区域独立控制内边距

#### Scenario: 弹窗头部（Header）
- **WHEN** 弹窗渲染完成
- **THEN** 头部高度 SHALL 为 55px
- **AND** 头部 SHALL 贴顶显示（padding: 0 24px）
- **AND** 标题文本 SHALL 为"提示"
- **AND** 标题字体 SHALL 为 font-family: PingFangSC, PingFang SC; font-weight: 400; font-size: 14px; color: #282F3C; line-height: 22px
- **AND** 标题右侧 SHALL 有 SVG X 图标关闭按钮，尺寸 18x18px
- **AND** 头部底部 SHALL 有贯穿整个弹窗的 1px solid #E7EBF3 分割线（通过 border-bottom 实现）

#### Scenario: 弹窗主体（Body）
- **WHEN** 弹窗渲染完成
- **THEN** 主体内边距 SHALL 为 padding: 24px
- **AND** 提示内容 SHALL 为"确定要删除：【Key 名称】吗？"
- **AND** 文字样式 SHALL 为 font-family: PingFangSC, PingFang SC; font-weight: 400; font-size: 14px; color: #282F3C; line-height: 22px

#### Scenario: 弹窗底部（Footer）
- **WHEN** 弹窗渲染完成
- **THEN** 底部内边距 SHALL 为 padding: 0 24px 24px
- **AND** 操作按钮 SHALL 右对齐（justify-content: flex-end）
- **AND** 所有按钮 SHALL 为 width: 74px; height: 32px; border-radius: 4px; font-size: 14px
- **AND** 主要操作按钮 SHALL 为底色 #003AA8，文字 #fff，无边框
- **AND** 取消按钮 SHALL 为背景透明，边框 1px solid #C7D5EB
- **AND** 关闭按钮（X 图标）点击 SHALL 触发与"取消"按钮一致的关闭逻辑
