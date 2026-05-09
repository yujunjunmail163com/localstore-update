/**
 * InlineEditor - 行内编辑模块
 *
 * 负责 Key 和 Value 的点击编辑功能。
 * 点击单元格 → 替换为 input/textarea → Enter 或失焦保存 → Escape 取消。
 * 同一时间只允许一个单元格处于编辑状态（互斥）。
 */
const InlineEditor = (() => {

  // 当前正在编辑的 <td> 元素，null 表示没有在编辑
  let currentEditCell = null;
  // 当前编辑类型：'key' 或 'value'
  let currentEditType = null;
  // 当前保存回调函数，由 startEditKey / startEditValue 设置
  let currentSaveHandler = null;
  // 保存后的刷新回调（通常是 Popup.render）
  let onRefresh = null;

  /**
   * 初始化编辑器
   * @param {HTMLElement} container - 表格容器，用于事件委托
   * @param {Function} refreshCallback - 保存成功后的刷新回调
   */
  function init(container, refreshCallback) {
    onRefresh = refreshCallback;
    container.addEventListener('click', handleClick);
    container.addEventListener('dblclick', handleDblClick);
  }

  /**
   * 单击事件处理
   * 判断点击的是 Key 列还是 Value 列，进入对应编辑模式
   */
  function handleClick(e) {
    const td = e.target.closest('td');
    // 忽略操作列、序号列、以及非 td 元素的点击
    if (!td || td.classList.contains('col-actions') || td.classList.contains('col-index')) return;
    // 如果点击的是当前正在编辑的单元格，不做处理
    if (currentEditCell && currentEditCell === td) return;

    const tr = td.closest('tr');
    if (!tr) return;

    // 如果有其他单元格正在编辑，先保存
    if (currentEditCell) {
      saveCurrent();
    }

    // 根据列类型进入编辑模式
    if (td.classList.contains('col-key')) {
      startEditKey(td, tr);
    } else if (td.classList.contains('col-value')) {
      startEditValue(td, tr);
    }
  }

  /**
   * 双击事件处理（仅对 Key 列生效，提供双击也能编辑的体验）
   */
  function handleDblClick(e) {
    const td = e.target.closest('td');
    if (!td || !td.classList.contains('col-key')) return;
    if (currentEditCell && currentEditCell === td) return;

    const tr = td.closest('tr');
    if (!tr) return;

    if (currentEditCell) {
      saveCurrent();
    }
    startEditKey(td, tr);
  }

  /**
   * 退出编辑状态，恢复单元格为普通文本
   */
  function exitEdit() {
    if (!currentEditCell) return;

    // 移除编辑器（input 或 textarea）
    const input = currentEditCell.querySelector('input, textarea');
    if (input) input.remove();

    currentEditCell.classList.remove('editing');
    currentEditCell = null;
    currentEditType = null;
    currentSaveHandler = null;
  }

  /**
   * 保存当前正在编辑的内容
   * 如果没有设置保存回调，直接退出编辑状态
   */
  function saveCurrent() {
    if (!currentEditCell || !currentSaveHandler) {
      exitEdit();
      return;
    }
    currentSaveHandler();
  }

  // ========================================================
  //  Key 行内编辑
  // ========================================================

  /**
   * 开始编辑 Key 列
   * 将单元格文本替换为 input 输入框
   * 保存逻辑：如果 Key 名称有变化，先检查重名，再通过 removeItem + setItem 完成重命名
   */
  function startEditKey(td, tr) {
    const oldKey = tr.dataset.key;
    const originalText = td.textContent;

    // 创建输入框，预填充当前 Key
    const input = document.createElement('input');
    input.type = 'text';
    input.value = oldKey;
    input.className = 'inline-input';

    // 清空单元格内容，放入输入框
    td.textContent = '';
    td.appendChild(input);
    td.classList.add('editing');
    input.focus();
    input.select();

    currentEditCell = td;
    currentEditType = 'key';

    // saved 标记防止 blur 和 Enter 重复触发保存
    let saved = false;

    // 保存逻辑
    async function doSave() {
      if (saved) return;
      saved = true;

      const newKey = input.value.trim();

      // 空 Key 不允许保存，恢复原值
      if (newKey === '') {
        td.textContent = originalText;
        exitEdit();
        return;
      }

      // Key 有变化时才需要执行重命名
      if (newKey !== oldKey) {
        // 先检查新 Key 是否已存在
        const exists = await StorageManager.keyExists(newKey);
        if (exists) {
          saved = false; // 允许用户继续编辑
          showTooltip(td, 'Key 已存在');
          input.focus();
          input.select();
          return;
        }
        // 执行重命名
        await StorageManager.renameKey(oldKey, newKey);
      }

      exitEdit();
      // 刷新列表以反映最新数据
      if (onRefresh) await onRefresh();
    }

    // 取消编辑，恢复原值
    function doCancel() {
      if (saved) return;
      saved = true;
      td.textContent = originalText;
      exitEdit();
    }

    // 将保存函数注册到全局，以便其他地方调用（比如点击其他单元格时）
    currentSaveHandler = () => doSave();

    // 键盘事件：Enter 保存，Escape 取消
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        doSave();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        doCancel();
      }
    });

    // 失焦时自动保存（鼠标点击其他地方的场景）
    input.addEventListener('blur', () => {
      if (currentEditCell === td) {
        doSave();
      }
    });
  }

  // ========================================================
  //  Value 行内编辑
  // ========================================================

  /**
   * 开始编辑 Value 列
   * 短文本用 input，含换行符的长文本用 textarea
   * textarea 会自动调整高度以适配内容
   */
  function startEditValue(td, tr) {
    const key = tr.dataset.key;
    const originalDisplay = td.textContent;

    td.textContent = '';
    td.classList.add('editing');

    let editor;

    // 根据内容是否包含换行符，选择不同的编辑器
    if (originalDisplay.includes('\n')) {
      editor = document.createElement('textarea');
      editor.className = 'inline-textarea';
      editor.value = originalDisplay;
      td.appendChild(editor);
      autoResize(editor);
    } else {
      editor = document.createElement('input');
      editor.type = 'text';
      editor.className = 'inline-input';
      editor.value = originalDisplay;
      td.appendChild(editor);
    }

    editor.focus();
    // input 自动选中文本，textarea 不选中（光标在末尾更自然）
    if (editor.tagName === 'INPUT') {
      editor.select();
    }

    currentEditCell = td;
    currentEditType = 'value';

    // textarea 内容变化时自动调整高度
    if (editor.tagName === 'TEXTAREA') {
      editor.addEventListener('input', () => autoResize(editor));
    }

    let saved = false;

    // 保存逻辑：直接用 setValue 写入新值
    async function doSave() {
      if (saved) return;
      saved = true;

      const newValue = editor.value;
      await StorageManager.setValue(key, newValue);
      exitEdit();
      if (onRefresh) await onRefresh();
    }

    // 取消编辑，恢复原值
    function doCancel() {
      if (saved) return;
      saved = true;
      td.textContent = originalDisplay;
      exitEdit();
    }

    currentSaveHandler = () => doSave();

    // 键盘事件
    editor.addEventListener('keydown', (e) => {
      // Escape：取消编辑
      if (e.key === 'Escape') {
        e.preventDefault();
        doCancel();
        return;
      }
      // input 中 Enter 保存
      if (editor.tagName === 'INPUT' && e.key === 'Enter') {
        e.preventDefault();
        doSave();
        return;
      }
      // textarea 中 Ctrl+Enter 保存（普通 Enter 是换行）
      if (editor.tagName === 'TEXTAREA' && e.key === 'Enter' && e.ctrlKey) {
        e.preventDefault();
        doSave();
      }
    });

    // 失焦时自动保存
    editor.addEventListener('blur', () => {
      if (currentEditCell === td) {
        doSave();
      }
    });
  }

  // ========================================================
  //  工具函数
  // ========================================================

  /**
   * textarea 高度自适应
   * 先重置为 auto，再根据 scrollHeight 撑开
   */
  function autoResize(textarea) {
    textarea.style.height = 'auto';
    textarea.style.height = textarea.scrollHeight + 'px';
  }

  /**
   * 在单元格内显示一个短暂的提示气泡（用于 Key 重名等提示）
   * 2 秒后自动消失
   */
  function showTooltip(td, message) {
    // 移除已有的提示
    const existing = td.querySelector('.tooltip');
    if (existing) existing.remove();

    td.style.position = 'relative';

    const tooltip = document.createElement('span');
    tooltip.className = 'tooltip';
    tooltip.textContent = message;
    td.appendChild(tooltip);

    // 2 秒后自动移除
    setTimeout(() => {
      if (tooltip.parentNode) tooltip.remove();
    }, 2000);
  }

  // 对外暴露的接口
  return { init, saveCurrent, exitEdit };
})();
