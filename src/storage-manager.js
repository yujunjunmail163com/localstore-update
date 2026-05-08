const StorageManager = (() => {
  async function getTabId() {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab || !tab.id) throw new Error('无法获取当前标签页');
    return tab.id;
  }

  async function executeInTab(func, args) {
    const tabId = await getTabId();
    const [result] = await chrome.scripting.executeScript({
      target: { tabId },
      func,
      args: args || []
    });
    return result.result;
  }

  function _getAll() {
    const data = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      data.push({ key, value: localStorage.getItem(key) });
    }
    return data;
  }

  function _getValue(key) {
    return localStorage.getItem(key);
  }

  function _setValue(key, value) {
    localStorage.setItem(key, value);
  }

  function _removeKey(key) {
    localStorage.removeItem(key);
  }

  function _renameKey(oldKey, newKey) {
    const value = localStorage.getItem(oldKey);
    if (value === null) return false;
    localStorage.removeItem(oldKey);
    localStorage.setItem(newKey, value);
    return true;
  }

  function _keyExists(key) {
    return localStorage.getItem(key) !== null;
  }

  function getAll() { return executeInTab(_getAll); }
  function getValue(key) { return executeInTab(_getValue, [key]); }
  function setValue(key, value) { return executeInTab(_setValue, [key, value]); }
  function removeKey(key) { return executeInTab(_removeKey, [key]); }
  function renameKey(oldKey, newKey) { return executeInTab(_renameKey, [oldKey, newKey]); }
  function keyExists(key) { return executeInTab(_keyExists, [key]); }

  return { getAll, getValue, setValue, removeKey, renameKey, keyExists };
})();
