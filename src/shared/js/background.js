/* global chrome */
// Called when the user clicks on the browser action

const toggleActive = () => {
  chrome.storage.sync.get({
    sideKickEnabled: false,
  }, (items) => {
    const curEnabled = !items.sideKickEnabled;
    chrome.storage.sync.set({ sideKickEnabled: curEnabled });

    chrome.tabs.query({ active: true, currentWindow: true },
      (tabs) => {
        const activeTab = tabs[0];
        chrome.tabs.sendMessage(activeTab.id,
          { message: curEnabled ? 'enable' : 'disable' });
      });
  });
};


chrome.browserAction.onClicked.addListener((tab) => {
  toggleActive();
});
