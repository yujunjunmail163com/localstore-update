/**
 * Popup - 主控制器
 *
 * 负责整个弹出面板的逻辑：
 * - 页面加载时读取并渲染 localStorage 数据
 * - 搜索过滤
 * - 快速添加数据
 * - 删除数据（二次确认弹窗）
 * - 初始化本地开发环境数据
 */
const Popup = (() => {

  // ========== DOM 元素引用 ==========
  const tableBody      = document.getElementById('storageBody');
  const tableContainer = document.getElementById('tableContainer');
  const emptyState     = document.getElementById('emptyState');
  const searchInput    = document.getElementById('searchInput');
  const refreshBtn     = document.getElementById('refreshBtn');

  // 顶部信息栏
  const tabFavicon     = document.getElementById('tabFavicon');
  const tabDomain      = document.getElementById('tabDomain');
  const closePanel     = document.getElementById('closePanel');

  // 快速添加区
  const quickKey       = document.getElementById('quickKey');
  const quickValue     = document.getElementById('quickValue');
  const quickAddBtn    = document.getElementById('quickAddBtn');

  // 删除确认弹窗
  const confirmModal   = document.getElementById('confirmModal');
  const confirmKey     = document.getElementById('confirmKey');
  const confirmCancel  = document.getElementById('confirmCancel');
  const confirmOk      = document.getElementById('confirmOk');
  const confirmClose   = document.getElementById('confirmClose');

  // ========== 状态变量 ==========
  let searchFilter = '';
  let cachedData = [];
  let confirmResolve = null;
  const recentlyAdded = new Set();

  // ========== 白名单配置（本地开发环境 Key） ==========
  const storageWhiteList = [
    'CTMSURL', 'CTMSV3URL', 'EDCURL', 'RTSMURL', 'ECOAURL', 'ETMFURL',
    'TMURL', 'MAMSURL', 'ELEARNINGURL', 'MDSURL_OLD', 'language',
    'DMURL', 'CDAURL', 'QSURL', 'IRCURL', 'PASS_AUTH', 'AIURL'
  ];

  const whiteListOrder = new Map(
    storageWhiteList.map((key, index) => [key, index])
  );

  function init() {
    InlineEditor.init(tableContainer, render);
    bindEvents();
    loadTabInfo();
    render();
  }

  // ========== 加载当前标签页信息（Favicon + 域名） ==========
  async function loadTabInfo() {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!tab || !tab.url) return;

      const url = new URL(tab.url);
      tabDomain.textContent = url.hostname;

      if (tab.favIconUrl) {
        tabFavicon.src = tab.favIconUrl;
        tabFavicon.style.display = 'inline-block';
      }
    } catch (e) {
      // 无法获取标签信息时静默忽略
    }
  }

  function bindEvents() {
    // 搜索框输入时实时过滤
    searchInput.addEventListener('input', (e) => {
      searchFilter = e.target.value.trim().toLowerCase();
      renderFromCache();
    });

    // 初始化按钮
    refreshBtn.addEventListener('click', initializeStorage);

    // 关闭面板
    closePanel.addEventListener('click', () => window.close());

    // 快速添加
    quickAddBtn.addEventListener('click', handleQuickAdd);
    quickKey.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') quickValue.focus();
    });
    quickValue.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') handleQuickAdd();
    });

    // ---- 删除确认弹窗事件 ----

    confirmCancel.addEventListener('click', () => {
      confirmModal.style.display = 'none';
      if (confirmResolve) {
        confirmResolve(false);
        confirmResolve = null;
      }
    });

    confirmClose.addEventListener('click', () => {
      confirmModal.style.display = 'none';
      if (confirmResolve) {
        confirmResolve(false);
        confirmResolve = null;
      }
    });

    confirmOk.addEventListener('click', () => {
      confirmModal.style.display = 'none';
      if (confirmResolve) {
        confirmResolve(true);
        confirmResolve = null;
      }
    });

    confirmModal.addEventListener('click', (e) => {
      if (e.target === confirmModal) {
        confirmModal.style.display = 'none';
        if (confirmResolve) {
          confirmResolve(false);
          confirmResolve = null;
        }
      }
    });
  }

  // ========== 快速添加处理 ==========
  async function handleQuickAdd() {
    const key = quickKey.value.trim();
    const value = quickValue.value;

    if (!key) {
      quickKey.focus();
      return;
    }

    const exists = await StorageManager.keyExists(key);
    if (exists) {
      quickKey.focus();
      return;
    }

    await StorageManager.setValue(key, value);
    recentlyAdded.add(key);
    quickKey.value = '';
    quickValue.value = '';
    quickKey.focus();
    await render();
  }

  // ========== 初始化本地开发环境数据 ==========
  async function initializeStorage() {
    const defaultUrl = 'http://localhost:9528';
    let addedCount = 0;
    for (const key of storageWhiteList) {
      const exists = await StorageManager.keyExists(key);
      if (!exists) {
        const value = key === 'PASS_AUTH' ? '1' : defaultUrl;
        await StorageManager.setValue(key, value);
        addedCount++;
      }
    }
    await render();
    if (addedCount > 0) {
      showNotice('初始化完成，已自动补充缺失的开发环境配置。');
    }
  }

  // ========== 通知弹窗（复用确认弹窗结构） ==========
  function showNotice(message) {
    const bodyEl = confirmModal.querySelector('.modal-body');
    const savedHTML = bodyEl.innerHTML;

    bodyEl.innerHTML = `<p class="confirm-message">${message}</p>`;
    confirmCancel.style.display = 'none';
    confirmOk.textContent = '确定';
    confirmModal.style.display = 'flex';

    const closeNotice = () => {
      confirmModal.style.display = 'none';
      bodyEl.innerHTML = savedHTML;
      confirmCancel.style.display = '';
      confirmOk.textContent = '确定';
      confirmOk.onclick = null;
      confirmClose.onclick = null;
      confirmModal.removeEventListener('click', backdropHandler);
    };

    const backdropHandler = (e) => {
      if (e.target === confirmModal) closeNotice();
    };

    confirmOk.onclick = closeNotice;
    confirmClose.onclick = closeNotice;
    confirmModal.addEventListener('click', backdropHandler);
  }

  // ========== 确认弹窗 ==========
  function showConfirm(keyName) {
    confirmKey.textContent = keyName;
    confirmModal.style.display = 'flex';
    return new Promise((resolve) => {
      confirmResolve = resolve;
    });
  }

  // ========== 数据加载 & 渲染 ==========
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

    const sorted = [...filtered].sort((a, b) => {
      const aRecent = recentlyAdded.has(a.key);
      const bRecent = recentlyAdded.has(b.key);
      if (aRecent && !bRecent) return -1;
      if (!aRecent && bRecent) return 1;

      const aOrder = whiteListOrder.get(a.key);
      const bOrder = whiteListOrder.get(b.key);
      const aInList = aOrder !== undefined;
      const bInList = bOrder !== undefined;
      if (aInList && bInList) return aOrder - bOrder;
      if (aInList) return -1;
      if (bInList) return 1;
      return 0;
    });

    tableBody.innerHTML = '';

    if (sorted.length === 0) {
      emptyState.textContent = '暂无 localStorage 数据';
      emptyState.style.display = 'block';
      tableContainer.style.display = 'none';
      return;
    }

    emptyState.style.display = 'none';
    tableContainer.style.display = 'block';

    sorted.forEach((item, index) => {
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
      delBtn.innerHTML = '<span class="iconfont icon-shanchu1"></span>';
      delBtn.addEventListener('click', async (e) => {
        e.stopPropagation();
        const confirmed = await showConfirm(item.key);
        if (!confirmed) return;
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
