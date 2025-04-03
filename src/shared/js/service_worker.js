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

chrome.storage.sync.onChanged.addListener(async changes => {
  if (changes.sideKickEnabled) {
    setExtensionIcon(changes.sideKickEnabled.newValue);
  }
});

chrome.commands.onCommand.addListener(shortcut => {
  if (shortcut.includes('+M')) {
    chrome.runtime.reload();
  }
});

// Setup WebSocket connection for hot reload
const setupHotReload = () => {
  const ws = new WebSocket('ws://localhost:8082');

  ws.onmessage = event => {
    try {
      const message = JSON.parse(event.data);
      if (message.type === 'reload') {
        chrome.runtime.reload();
      }
    } catch (error) {
      // Ignore error silently in production
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

async function handleBugReport(payload) {
  // console.log('here', {
  //   method: 'POST',
  //   headers: {
  //     'Content-Type': 'application/json',
  //     'Accept': 'application/json'
  //   },
  //   body: JSON.stringify({
  //     question: payload.data.question,
  //     elementData: payload.data.elementData,
  //     overrideConfig: payload.data.overrideConfig
  //   })
  // });
  try {
    // Using the chatflow API endpoint
    const API_BASE_URL =
      'https://staging.theanswer.ai/lr-staging.studio.theanswer.ai/api/v1/prediction'; // Replace with your actual API base URL
    const response = await fetch(`${API_BASE_URL}/b98e2d5b-00ac-4ee0-bbd9-e18eae3f9670`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        question: payload.data.question,
        elementData: payload.data.elementData,
        overrideConfig: payload.data.overrideConfig
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(errorData?.error || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('Bug report submitted successfully:', data);
    return data;
  } catch (error) {
    console.error({ payload });
    console.error('Error submitting bug report:', error);
    throw new Error(`Failed to submit bug report: ${error.message}`);
  }
}

// Function to ensure content script is injected
async function ensureContentScript(tabId) {
  try {
    // Try to send a ping message to check if content script is ready
    await chrome.tabs.sendMessage(tabId, { type: 'PING' });
    return true;
  } catch (error) {
    // Content script not ready, inject it
    try {
      await chrome.scripting.executeScript({
        target: { tabId },
        files: ['js/vendor.js', 'js/content.js']
      });
      return true;
    } catch (injectionError) {
      console.error('Failed to inject content script:', injectionError);
      return false;
    }
  }
}

// Listen for messages from the side panel or content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'GET_ELEMENT_TREE') {
    // Get the active tab
    chrome.tabs.query({ active: true, currentWindow: true }, async tabs => {
      const activeTab = tabs[0];
      if (!activeTab) {
        sendResponse({ error: 'No active tab found' });
        return;
      }

      try {
        // Ensure content script is ready
        const isReady = await ensureContentScript(activeTab.id);
        if (!isReady) {
          sendResponse({ error: 'Could not initialize content script' });
          return;
        }

        // Forward the request to content script
        chrome.tabs.sendMessage(activeTab.id, { type: 'GET_ELEMENT_TREE' }, response => {
          if (chrome.runtime.lastError) {
            sendResponse({ error: chrome.runtime.lastError.message });
            return;
          }
          sendResponse(response);
        });
      } catch (error) {
        sendResponse({ error: error.message });
      }
    });
    return true; // Will respond asynchronously
  }

  if (message.type === 'OPEN_OPTIONS_PAGE') {
    // Open options page
    chrome.runtime.openOptionsPage();
  } else if (message.type === 'OPEN_OAUTH_WINDOW') {
    // Handle OAuth window opening
  } else if (message.type === 'SUBMIT_BUG_REPORT') {
    // Handle bug report submission
    handleBugReport(message.payload)
      .then(result => {
        sendResponse({ success: true, data: result });
      })
      .catch(error => {
        sendResponse({ success: false, error: error.message });
      });
    return true; // Will respond asynchronously
  }
});

chrome.runtime.onInstalled.addListener(() => {
  // Extension installed or updated
  // Initialize any required settings
});

// Service Worker for Contentful Sidekick

// Handle side panel behavior
chrome.sidePanel
  .setPanelBehavior({ openPanelOnActionClick: true })
  .catch(error => console.error('Failed to set panel behavior:', error));

// Listen for tab updates to enable/disable the side panel as needed
chrome.tabs.onUpdated.addListener(async (tabId, info, tab) => {
  if (!tab.url) return;

  try {
    // Enable the side panel for all URLs
    await chrome.sidePanel.setOptions({
      tabId,
      path: 'html/sidepanel.html',
      enabled: true
    });
  } catch (error) {
    console.error('Error setting side panel options:', error);
  }
});

// Listen for messages from the side panel
chrome.runtime.onMessage.addListener(message => {
  if (message.type === 'FROM_SIDEPANEL') {
    // Handle messages from the side panel
    console.log('Message from side panel:', message);
  }
});
