export const getIsSideKickEnabledFromStorage = async () =>
  !!(await chrome.storage.sync.get({ sideKickEnabled: false })).sideKickEnabled;
