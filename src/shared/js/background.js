/* global chrome */
// Called when the user clicks on the browser action

const toggleActive = () => {
  chrome.storage.sync.get({
    sideKickEnabled: false,
  }, (items) => {
    const curEnabled = !items.sideKickEnabled;
    chrome.storage.sync.set({ sideKickEnabled: curEnabled });
  });
};


chrome.browserAction.onClicked.addListener((tab) => {
  toggleActive();
});
