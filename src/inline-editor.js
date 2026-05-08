const InlineEditor = (() => {
  let currentEditCell = null;
  let currentEditType = null;
  let currentSaveHandler = null;
  let onRefresh = null;

  function init(container, refreshCallback) {
    onRefresh = refreshCallback;
    container.addEventListener('click', handleClick);
    container.addEventListener('dblclick', handleDblClick);
  }

  function handleClick(e) {
    const td = e.target.closest('td');
    if (!td || td.classList.contains('col-actions') || td.classList.contains('col-index')) return;
    if (currentEditCell && currentEditCell === td) return;

    const tr = td.closest('tr');
    if (!tr) return;

    const colClass = td.classList;

    if (colClass.contains('col-key')) {
      if (currentEditCell) saveCurrent();
      startEditKey(td, tr);
    } else if (colClass.contains('col-value')) {
      if (currentEditCell) saveCurrent();
      startEditValue(td, tr);
    }
  }

  function handleDblClick(e) {
    const td = e.target.closest('td');
    if (!td || !td.classList.contains('col-key')) return;
    if (currentEditCell && currentEditCell === td) return;

    const tr = td.closest('tr');
    if (!tr) return;

    if (currentEditCell) saveCurrent();
    startEditKey(td, tr);
  }

  function exitEdit() {
    if (!currentEditCell) return;
    const input = currentEditCell.querySelector('input, textarea');
    if (input) {
      input.remove();
    }
    currentEditCell.classList.remove('editing');
    currentEditCell = null;
    currentEditType = null;
    currentSaveHandler = null;
  }

  function saveCurrent() {
    if (!currentEditCell || !currentSaveHandler) { exitEdit(); return; }
    currentSaveHandler();
  }

  function startEditKey(td, tr) {
    const oldKey = tr.dataset.key;
    const originalText = td.textContent;

    const input = document.createElement('input');
    input.type = 'text';
    input.value = oldKey;
    input.className = 'inline-input';

    td.textContent = '';
    td.appendChild(input);
    td.classList.add('editing');
    input.focus();
    input.select();

    currentEditCell = td;
    currentEditType = 'key';

    let saved = false;
    async function doSave() {
      if (saved) return;
      saved = true;
      const newKey = input.value.trim();

      if (newKey === '') {
        td.textContent = originalText;
        exitEdit();
        return;
      }

      if (newKey !== oldKey) {
        const exists = await StorageManager.keyExists(newKey);
        if (exists) {
          saved = false;
          showTooltip(td, 'Key 已存在');
          input.focus();
          input.select();
          return;
        }
        await StorageManager.renameKey(oldKey, newKey);
      }

      exitEdit();
      if (onRefresh) await onRefresh();
    }

    function doCancel() {
      if (saved) return;
      saved = true;
      td.textContent = originalText;
      exitEdit();
    }

    currentSaveHandler = () => doSave();

    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        doSave();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        doCancel();
      }
    });

    input.addEventListener('blur', () => {
      if (currentEditCell === td) {
        doSave();
      }
    });
  }

  function startEditValue(td, tr) {
    const key = tr.dataset.key;
    const originalDisplay = td.textContent;

    td.textContent = '';
    td.classList.add('editing');

    let editor;
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
    if (editor.tagName === 'INPUT') editor.select();

    currentEditCell = td;
    currentEditType = 'value';

    if (editor.tagName === 'TEXTAREA') {
      editor.addEventListener('input', () => autoResize(editor));
    }

    let saved = false;
    async function doSave() {
      if (saved) return;
      saved = true;
      const newValue = editor.value;
      await StorageManager.setValue(key, newValue);
      exitEdit();
      if (onRefresh) await onRefresh();
    }

    function doCancel() {
      if (saved) return;
      saved = true;
      td.textContent = originalDisplay;
      exitEdit();
    }

    currentSaveHandler = () => doSave();

    editor.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        doCancel();
        return;
      }
      if (editor.tagName === 'INPUT' && e.key === 'Enter') {
        e.preventDefault();
        doSave();
        return;
      }
      if (editor.tagName === 'TEXTAREA' && e.key === 'Enter' && e.ctrlKey) {
        e.preventDefault();
        doSave();
      }
    });

    editor.addEventListener('blur', () => {
      if (currentEditCell === td) {
        doSave();
      }
    });
  }

  function autoResize(textarea) {
    textarea.style.height = 'auto';
    textarea.style.height = textarea.scrollHeight + 'px';
  }

  function showTooltip(td, message) {
    const existing = td.querySelector('.tooltip');
    if (existing) existing.remove();

    td.style.position = 'relative';
    const tooltip = document.createElement('span');
    tooltip.className = 'tooltip';
    tooltip.textContent = message;
    td.appendChild(tooltip);

    setTimeout(() => { if (tooltip.parentNode) tooltip.remove(); }, 2000);
  }

  return { init, saveCurrent, exitEdit };
})();
