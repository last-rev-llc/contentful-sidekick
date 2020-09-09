export default async () => {
  return new Promise((resolve) => {
    chrome.storage.sync.get({ sideKickEnabled: false }, (items) => {
      const { sideKickEnabled } = items;
      resolve(!!sideKickEnabled);
    });
  });
};
