export default (listener) => {
  chrome.storage.onChanged.addListener((changes) => {
    const { sideKickEnabled: enabled } = changes;
    listener(enabled && enabled.newValue === true);
  });
};
