/**
 * Popup - 主控制器
 *
 * 负责整个弹出面板的逻辑：
 * - 页面加载时读取并渲染 localStorage 数据
 * - 搜索过滤
 * - 新增数据（弹窗表单）
 * - 删除数据（二次确认弹窗）
 * - 初始化本地开发环境数据
 */
const Popup = (() => {

  // ========== DOM 元素引用 ==========
  const tableBody      = document.getElementById('storageBody');
  const tableContainer = document.getElementById('tableContainer');
  const emptyState     = document.getElementById('emptyState');
  const searchInput    = document.getElementById('searchInput');
  const addBtn         = document.getElementById('addBtn');
  const refreshBtn     = document.getElementById('refreshBtn');

  // 新增数据弹窗
  const addModal     = document.getElementById('addModal');
  const newKeyInput  = document.getElementById('newKey');
  const newValueInput = document.getElementById('newValue');
  const cancelAdd    = document.getElementById('cancelAdd');
  const confirmAdd   = document.getElementById('confirmAdd');

  // 删除确认弹窗
  const confirmModal   = document.getElementById('confirmModal');
  const confirmKey     = document.getElementById('confirmKey');
  const confirmCancel  = document.getElementById('confirmCancel');
  const confirmOk      = document.getElementById('confirmOk');
  const confirmClose   = document.getElementById('confirmClose');

  // ========== 状态变量 ==========
  let searchFilter = '';    // 当前搜索关键字
  let cachedData = [];      // 缓存的 localStorage 数据，避免重复请求
  let confirmResolve = null; // 自定义确认弹窗的 Promise resolve 回调
  const recentlyAdded = new Set(); // 最近添加的 Key，排序置顶

  // ========== 白名单配置（本地开发环境 Key） ==========
  const storageWhiteList = [
    'CTMSURL', 'CTMSV3URL', 'EDCURL', 'RTSMURL', 'ECOAURL', 'ETMFURL',
    'TMURL', 'MAMSURL', 'ELEARNINGURL', 'MDSURL_OLD', 'language',
    'DMURL', 'CDAURL', 'QSURL', 'IRCURL', 'PASS_AUTH', 'AIURL'
  ];

  // ========== 白名单排序映射（用于 O(1) 查找优先级） ==========
  const whiteListOrder = new Map(
    storageWhiteList.map((key, index) => [key, index])
  );

  /**
   * 初始化
   * 绑定行内编辑器 → 绑定所有事件 → 首次加载数据
   */
  function init() {
    InlineEditor.init(tableContainer, render);
    bindEvents();
    render();
  }

  /**
   * 绑定所有事件监听
   */
  function bindEvents() {
    // 搜索框输入时实时过滤
    searchInput.addEventListener('input', (e) => {
      searchFilter = e.target.value.trim().toLowerCase();
      renderFromCache();
    });

    // 初始化按钮：补充白名单数据后刷新
    refreshBtn.addEventListener('click', initializeStorage);

    // 新增按钮：打开弹窗
    addBtn.addEventListener('click', () => {
      newKeyInput.value = '';
      newValueInput.value = '';
      addModal.style.display = 'flex';
      newKeyInput.focus();
    });

    // 取消新增
    cancelAdd.addEventListener('click', closeModal);

    // 确认新增
    confirmAdd.addEventListener('click', async () => {
      const key = newKeyInput.value.trim();
      const value = newValueInput.value;

      // Key 不能为空
      if (!key) {
        newKeyInput.focus();
        return;
      }

      // Key 不能重复
      const exists = await StorageManager.keyExists(key);
      if (exists) {
        newKeyInput.focus();
        return;
      }

      await StorageManager.setValue(key, value);
      recentlyAdded.add(key);
      closeModal();
      await render();
    });

    // 点击弹窗背景关闭（点击遮罩层区域）
    addModal.addEventListener('click', (e) => {
      if (e.target === addModal) closeModal();
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

    // 点击遮罩层也关闭确认弹窗
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

  /**
   * 关闭新增数据弹窗
   */
  function closeModal() {
    addModal.style.display = 'none';
  }

  /**
   * 初始化本地开发环境数据
   * 遍历白名单，补充缺失的 Key（默认值 http://localhost:9528），不覆盖已有数据
   */
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

  /**
   * 显示单按钮通知弹窗（复用确认弹窗结构，仅展示"确定"）
   * @param {string} message - 通知内容
   */
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

  /**
   * 显示自定义确认弹窗
   * @param {string} keyName - 要删除的 Key 名称
   * @returns {Promise<boolean>} 用户点击"删除"返回 true，点击"取消"或遮罩返回 false
   */
  function showConfirm(keyName) {
    confirmKey.textContent = keyName;
    confirmModal.style.display = 'flex';
    return new Promise((resolve) => {
      confirmResolve = resolve;
    });
  }

  /**
   * 从 StorageManager 重新读取数据，然后渲染表格
   * 如果读取失败（比如在 chrome:// 页面），显示错误提示
   */
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

  /**
   * 根据缓存数据渲染表格
   * 如果有搜索关键字，先过滤再渲染
   */
  function renderFromCache() {
    // 根据搜索关键字过滤
    const filtered = searchFilter
      ? cachedData.filter(item => item.key.toLowerCase().includes(searchFilter))
      : cachedData;

    // 排序：白名单 Key 置顶（按白名单顺序），其余保持原序
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

    // 清空表格
    tableBody.innerHTML = '';

    // 无数据时显示空状态提示
    if (sorted.length === 0) {
      emptyState.textContent = '暂无 localStorage 数据';
      emptyState.style.display = 'block';
      tableContainer.style.display = 'none';
      return;
    }

    emptyState.style.display = 'none';
    tableContainer.style.display = 'block';

    // 逐行渲染
    sorted.forEach((item, index) => {
      const tr = document.createElement('tr');
      tr.dataset.key = item.key;

      // 序号列
      const tdIndex = document.createElement('td');
      tdIndex.className = 'col-index';
      tdIndex.textContent = index + 1;

      // Key 列
      const tdKey = document.createElement('td');
      tdKey.className = 'col-key';
      tdKey.textContent = item.key;

      // Value 列
      const tdValue = document.createElement('td');
      tdValue.className = 'col-value';
      tdValue.textContent = item.value;

      // 操作列（删除按钮 — 使用 iconfont 图标）
      const tdActions = document.createElement('td');
      tdActions.className = 'col-actions';

      const delBtn = document.createElement('button');
      delBtn.className = 'btn btn-danger btn-sm';
      delBtn.innerHTML = '<span class="iconfont icon-shanchu1"></span>';
      delBtn.addEventListener('click', async (e) => {
        e.stopPropagation(); // 阻止冒泡，避免触发单元格编辑
        const confirmed = await showConfirm(item.key);
        if (!confirmed) return;
        await StorageManager.removeKey(item.key);
        await render();
      });

      tdActions.appendChild(delBtn);

      // 组装行
      tr.appendChild(tdIndex);
      tr.appendChild(tdKey);
      tr.appendChild(tdValue);
      tr.appendChild(tdActions);
      tableBody.appendChild(tr);
    });
  }

  return { init, render };
})();

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
  Popup.init();
});
