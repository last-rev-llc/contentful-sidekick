export default (handler) => {
  chrome.storage.onChanged.addListener(({ sideKickEnabled }) => {
    if (sideKickEnabled) {
      handler(sideKickEnabled.newValue === true);
    }
  });
};
