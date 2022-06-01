export default () => {
  return new Promise((resolve, reject) => {
    chrome.storage.sync.get('previewToken', (items) => {
      resolve(items.previewToken);
    });
  });
};
