export default async () =>
  !!(await chrome.storage.sync.get({ sideKickEnabled: false })).sideKickEnabled;
