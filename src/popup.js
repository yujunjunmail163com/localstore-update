const Popup = (() => {
  const tableBody = document.getElementById('storageBody');
  const tableContainer = document.getElementById('tableContainer');
  const emptyState = document.getElementById('emptyState');
  const searchInput = document.getElementById('searchInput');
  const addBtn = document.getElementById('addBtn');
  const refreshBtn = document.getElementById('refreshBtn');
  const addModal = document.getElementById('addModal');
  const newKeyInput = document.getElementById('newKey');
  const newValueInput = document.getElementById('newValue');
  const cancelAdd = document.getElementById('cancelAdd');
  const confirmAdd = document.getElementById('confirmAdd');

  let searchFilter = '';
  let cachedData = [];

  function init() {
    InlineEditor.init(tableContainer, render);
    bindEvents();
    render();
  }

  function bindEvents() {
    searchInput.addEventListener('input', (e) => {
      searchFilter = e.target.value.trim().toLowerCase();
      renderFromCache();
    });

    refreshBtn.addEventListener('click', render);

    addBtn.addEventListener('click', () => {
      newKeyInput.value = '';
      newValueInput.value = '';
      addModal.style.display = 'flex';
      newKeyInput.focus();
    });

    cancelAdd.addEventListener('click', closeModal);

    confirmAdd.addEventListener('click', async () => {
      const key = newKeyInput.value.trim();
      const value = newValueInput.value;
      if (!key) { newKeyInput.focus(); return; }
      const exists = await StorageManager.keyExists(key);
      if (exists) { newKeyInput.focus(); return; }
      await StorageManager.setValue(key, value);
      closeModal();
      await render();
    });

    addModal.addEventListener('click', (e) => {
      if (e.target === addModal) closeModal();
    });
  }

  function closeModal() {
    addModal.style.display = 'none';
  }

  async function render() {
    try {
      cachedData = await StorageManager.getAll();
    } catch (e) {
      cachedData = [];
      emptyState.textContent = '无法访问当前页面的 localStorage';
      emptyState.style.display = 'block';
      tableContainer.style.display = 'none';
      return;
    }
    renderFromCache();
  }

  function renderFromCache() {
    const filtered = searchFilter
      ? cachedData.filter(item => item.key.toLowerCase().includes(searchFilter))
      : cachedData;

    tableBody.innerHTML = '';

    if (filtered.length === 0) {
      emptyState.textContent = '暂无 localStorage 数据';
      emptyState.style.display = 'block';
      tableContainer.style.display = 'none';
      return;
    }

    emptyState.style.display = 'none';
    tableContainer.style.display = 'block';

    filtered.forEach((item, index) => {
      const tr = document.createElement('tr');
      tr.dataset.key = item.key;

      const tdIndex = document.createElement('td');
      tdIndex.className = 'col-index';
      tdIndex.textContent = index + 1;

      const tdKey = document.createElement('td');
      tdKey.className = 'col-key';
      tdKey.textContent = item.key;

      const tdValue = document.createElement('td');
      tdValue.className = 'col-value';
      tdValue.textContent = item.value;

      const tdActions = document.createElement('td');
      tdActions.className = 'col-actions';
      const delBtn = document.createElement('button');
      delBtn.className = 'btn btn-danger btn-sm';
      delBtn.textContent = '删除';
      delBtn.addEventListener('click', async (e) => {
        e.stopPropagation();
        await StorageManager.removeKey(item.key);
        await render();
      });
      tdActions.appendChild(delBtn);

      tr.appendChild(tdIndex);
      tr.appendChild(tdKey);
      tr.appendChild(tdValue);
      tr.appendChild(tdActions);
      tableBody.appendChild(tr);
    });
  }

  return { init, render };
})();

document.addEventListener('DOMContentLoaded', () => {
  Popup.init();
});
