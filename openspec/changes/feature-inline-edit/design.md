## Context

当前 Chrome 扩展的 localStorage 管理面板使用表格展示 Key-Value 数据。现有交互模式为：
- Key 列为纯文本展示，不可编辑
- Value 列需要点击特定的"编辑图标"才能进入编辑状态

项目为纯前端项目，使用原生 JavaScript (ES6+)、HTML5、CSS3，无框架依赖。

## Goals / Non-Goals

**Goals:**
- 实现 Key 和 Value 的行内编辑（inline editing），提升操作效率
- 保持深色 UI 风格一致
- 交互流畅，失去焦点或按 Enter 自动保存

**Non-Goals:**
- 不改变数据存储结构或存储 API
- 不新增批量编辑功能
- 不改变整体页面布局

## Decisions

### 1. 行内编辑实现方式：直接 DOM 替换

**选择**：点击单元格时，将 `<td>` 内的文本节点替换为 `<input>` 元素，编辑完成后替换回文本节点。

**理由**：原生 JS 项目无框架，DOM 替换是最轻量、最直接的方式，无需引入额外库。

**替代方案**：contenteditable 属性 —— 但对 Key 编辑场景不够精确（无法方便地控制输入行为和样式）。

### 2. Key 重命名策略：delete + set

**选择**：修改 Key 名称时，先读取原 Value，再 `removeItem(旧Key)` + `setItem(新Key, 原Value)`。

**理由**：`window.localStorage` 不提供原生的 rename API，这是标准做法。

**风险**：非原子操作，极端情况下（如页面崩溃）可能丢失数据。但 localStorage 本身为本地单用户场景，风险可接受。

### 3. 事件绑定策略：事件委托

**选择**：在表格容器上使用事件委托（event delegation），通过 `event.target` 判断点击的是 Key 还是 Value 列。

**理由**：避免为每个单元格单独绑定事件，减少内存开销，且动态添加的行也能自动获得事件处理。

### 4. 编辑状态管理

**选择**：使用一个模块级变量 `currentEditCell` 追踪当前正在编辑的单元格，确保同一时间只有一个单元格处于编辑状态。

**理由**：避免多个输入框同时存在导致的混乱和数据冲突。

## Risks / Trade-offs

- **[Key 重命名竞态]** 在 removeItem 和 setItem 之间如果用户刷新页面，可能丢失数据 → 缓解：操作间隔极短（同步 API），实际风险极低。
- **[特殊字符 Key]** 某些 Key 可能包含特殊字符，需确保输入框能正确处理 → 缓解：使用 `textContent` 赋值，浏览器自动转义。
- **[Value 含换行符]** 多行 Value 在行内 input 中展示不佳 → 缓解：对于含换行符的 Value，使用 `<textarea>` 替代 `<input>`。
