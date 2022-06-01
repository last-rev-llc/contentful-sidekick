export default () => {
  return new Promise((resolve, reject) => {
    chrome.storage.sync.get('cma', (items) => {
      resolve(items.cma);
    });
  });
};
