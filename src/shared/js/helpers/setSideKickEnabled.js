export const setSideKickEnabled = async enabled => {
  chrome.storage.sync.set({ sideKickEnabled: enabled });
};
