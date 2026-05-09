/**
 * StorageManager - localStorage 数据操作层
 *
 * 因为扩展运行在 popup 上下文，直接访问 window.localStorage
 * 拿到的是扩展自身的数据，而不是用户网页的数据。
 * 所以这里通过 chrome.scripting.executeScript 把函数注入到当前标签页执行。
 */
const StorageManager = (() => {

  // 获取当前活跃标签页的 ID
  async function getTabId() {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab || !tab.id) {
      throw new Error('无法获取当前标签页');
    }
    return tab.id;
  }

  // 在当前标签页中执行指定函数，返回执行结果
  async function executeInTab(func, args) {
    const tabId = await getTabId();
    const [result] = await chrome.scripting.executeScript({
      target: { tabId },
      func,
      args: args || []
    });
    return result.result;
  }

  // ========== 以下函数会在用户网页的上下文中执行 ==========

  // 获取所有 localStorage 数据，返回 [{ key, value }, ...]
  function _getAll() {
    const data = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      data.push({ key, value: localStorage.getItem(key) });
    }
    return data;
  }

  // 根据 key 获取单个值
  function _getValue(key) {
    return localStorage.getItem(key);
  }

  // 设置一对 key-value
  function _setValue(key, value) {
    localStorage.setItem(key, value);
  }

  // 删除指定 key
  function _removeKey(key) {
    localStorage.removeItem(key);
  }

  // 重命名 key（原生 API 不支持 rename，所以用 delete + set 模拟）
  function _renameKey(oldKey, newKey) {
    const value = localStorage.getItem(oldKey);
    if (value === null) return false;
    localStorage.removeItem(oldKey);
    localStorage.setItem(newKey, value);
    return true;
  }

  // 检查某个 key 是否存在
  function _keyExists(key) {
    return localStorage.getItem(key) !== null;
  }

  // ========== 对外暴露的异步方法 ==========

  function getAll()          { return executeInTab(_getAll); }
  function getValue(key)     { return executeInTab(_getValue, [key]); }
  function setValue(key, val){ return executeInTab(_setValue, [key, val]); }
  function removeKey(key)    { return executeInTab(_removeKey, [key]); }
  function renameKey(oldKey, newKey) { return executeInTab(_renameKey, [oldKey, newKey]); }
  function keyExists(key)    { return executeInTab(_keyExists, [key]); }

  return { getAll, getValue, setValue, removeKey, renameKey, keyExists };
})();
