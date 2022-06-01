import getIsSideKickEnabledFromStorage from './helpers/getIsSideKickEnabledFromStorage';

const setExtensionIcon = (curEnabled = false) => {
  if (curEnabled) {
    chrome.browserAction.setIcon({
      path: {
        16: '../img/icon16.png',
        32: '../img/icon32.png',
        48: '../img/icon48.png',
        64: '../img/icon64.png',
        128: '../img/icon128.png',
        256: '../img/icon256.png'
      }
    });
  } else {
    chrome.browserAction.setIcon({
      path: {
        16: '../img/icon16Off.png',
        32: '../img/icon32Off.png',
        48: '../img/icon48Off.png',
        64: '../img/icon64Off.png',
        128: '../img/icon128Off.png',
        256: '../img/icon256Off.png'
      }
    });
  }
};

const toggleActive = async () => {
  const curEnabled = await getIsSideKickEnabledFromStorage();

  chrome.storage.sync.set({ sideKickEnabled: curEnabled });
  setExtensionIcon(curEnabled);
};

chrome.tabs.onUpdated.addListener((tabId, changeInfo) => {
  getIsSideKickEnabledFromStorage().then((opt) => setExtensionIcon(opt));
  if (changeInfo.url) {
    chrome.tabs.sendMessage(tabId, { changedUrl: changeInfo.url });
  }
});

chrome.browserAction.onClicked.addListener(() => {
  toggleActive();
});

chrome.commands.onCommand.addListener((shortcut) => {
  console.log('lets reload');
  console.log(shortcut);
  if (shortcut.includes('+M')) {
    chrome.runtime.reload();
  }
});
