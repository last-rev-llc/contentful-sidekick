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

// Setup WebSocket connection for hot reload
const setupHotReload = () => {
  const ws = new WebSocket('ws://localhost:8082');

  ws.onmessage = (event) => {
    try {
      const message = JSON.parse(event.data);
      if (message.type === 'reload') {
        console.log('[HMR] Reloading extension...');
        chrome.runtime.reload();
      }
    } catch (error) {
      console.error('[HMR] Error processing message:', error);
    }
  };

  ws.onclose = () => {
    // Try to reconnect every 2 seconds
    setTimeout(setupHotReload, 2000);
  };
};

// Only setup hot reload in development
if (process.env.NODE_ENV === 'development') {
  setupHotReload();
}
