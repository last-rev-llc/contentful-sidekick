import getIsSideKickEnabledFromStorage from './helpers/getIsSideKickEnabledFromStorage';

const setExtensionIcon = (curEnabled = false) => {
  if (curEnabled) {
    chrome.action.setIcon({
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
    chrome.action.setIcon({
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

chrome.tabs.onUpdated.addListener(async () => {
  const opt = await getIsSideKickEnabledFromStorage();
  setExtensionIcon(opt);
});

chrome.storage.sync.onChanged.addListener(async (changes) => {
  if (changes.sideKickEnabled) {
    setExtensionIcon(changes.sideKickEnabled.newValue);
  }
});

chrome.commands.onCommand.addListener((shortcut) => {
  if (shortcut.includes('+M')) {
    chrome.runtime.reload();
  }
});

const CLIENT_ID = 'N0sUte_UZ7vaCjSEcP8n11Ta2VOZY3yYqD67ZQWHCT4';
const getAuthUrl = (redirectUri) =>
  `https://be.contentful.com/oauth/authorize?response_type=token&client_id=${CLIENT_ID}&redirect_uri=${redirectUri}&scope=content_management_manage`;

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message === 'login') {
    const redirectUri = chrome.runtime.getURL('html/oauth_redirect.html');

    const authUrl = getAuthUrl(redirectUri);

    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const currentTab = tabs[0];
      const newTabIndex = currentTab.index + 1;
      chrome.tabs.create({ url: authUrl, index: newTabIndex, openerTabId: currentTab.id }, () => {
        sendResponse();
      });
    });

    return true;
  } else if (message === 'logout') {
    chrome.storage.sync.set({ cma: '' }, () => {
      sendResponse();
    });
    return true;
  }
});
