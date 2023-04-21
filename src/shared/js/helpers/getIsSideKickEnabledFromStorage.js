export default async () => {
  return !!(await chrome.storage.sync.get({ sideKickEnabled: false })).sideKickEnabled;
};
