import { getIsSideKickEnabledFromStorage } from './helpers/getIsSideKickEnabledFromStorage';
import { setSideKickEnabled } from './helpers/setSideKickEnabled';
import { logger } from '../../core/utils/logger';

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

// Function to ensure content script is injected
async function ensureContentScript(tabId) {
  try {
    // First, check the tab URL to make sure it's a page we can inject into
    const tab = await chrome.tabs.get(tabId);

    // Skip chrome:// URLs and other restricted URLs
    if (
      tab.url &&
      (tab.url.startsWith('chrome://') ||
        tab.url.startsWith('chrome-extension://') ||
        tab.url.startsWith('devtools://') ||
        tab.url.startsWith('chrome-devtools://'))
    ) {
      logger.debug(`Skipping restricted URL: ${tab.url}`);
      return false;
    }

    // Try to ping the content script
    await chrome.tabs.sendMessage(tabId, { type: 'PING' });
    return true;
  } catch (error) {
    // If the PING failed, try to inject the content script
    try {
      const tab = await chrome.tabs.get(tabId);

      // Skip chrome:// URLs and other restricted URLs
      if (
        tab.url &&
        (tab.url.startsWith('chrome://') ||
          tab.url.startsWith('chrome-extension://') ||
          tab.url.startsWith('devtools://') ||
          tab.url.startsWith('chrome-devtools://'))
      ) {
        logger.debug(`Cannot inject into restricted URL: ${tab.url}`);
        return false;
      }

      await chrome.scripting.executeScript({
        target: { tabId },
        files: ['js/vendor.js', 'js/content.js']
      });
      return true;
    } catch (injectionError) {
      logger.error('Failed to inject content script', injectionError);
      return false;
    }
  }
}

// Handle action button click to toggle the sidekick
chrome.action.onClicked.addListener(async tab => {
  try {
    // Get current state
    const currentEnabled = await getIsSideKickEnabledFromStorage();

    // Toggle state
    const newState = !currentEnabled;
    await setSideKickEnabled(newState);

    // Update icon
    setExtensionIcon(newState);

    if (newState) {
      // Enable and open the side panel
      await chrome.sidePanel.open({ tabId: tab.id });

      // Initialize Sidekick on the page
      await ensureContentScript(tab.id);
      chrome.tabs
        .sendMessage(tab.id, { type: 'INIT_SIDEKICK' })
        .catch(error => logger.error('Failed to initialize sidekick:', error));
    } else {
      // Disable the side panel
      await chrome.sidePanel.setOptions({ tabId: tab.id, enabled: false });
    }
  } catch (error) {
    logger.error('Error handling action click:', error);
  }
});

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
  try {
    const API_BASE_URL =
      'https://staging.theanswer.ai/lr-staging.studio.theanswer.ai/api/v1/prediction';
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
    logger.info('Bug report submitted successfully', { data });
    return data;
  } catch (error) {
    logger.error('Error submitting bug report', error, { payload });
    throw new Error(`Failed to submit bug report: ${error.message}`);
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

  // Handle highlight toggling from side panel
  if (message.type === 'TOGGLE_HIGHLIGHT') {
    // Forward the highlight toggle to the active tab
    chrome.tabs.query({ active: true, currentWindow: true }, async tabs => {
      if (tabs[0]) {
        try {
          // Ensure content script is ready
          const isReady = await ensureContentScript(tabs[0].id);
          if (isReady) {
            // Forward the message to content script
            chrome.tabs.sendMessage(tabs[0].id, message);
          }
        } catch (error) {
          logger.error('Error forwarding highlight toggle:', error);
        }
      }
    });
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

  // Handle authentication state changes
  if (message.type === 'AUTH_STATE_CHANGED') {
    logger.info('Authentication state changed in service worker', message);

    // Forward this to all tabs and the side panel
    chrome.tabs.query({}, tabs => {
      const messagePromises = tabs.map(tab => {
        return chrome.tabs.sendMessage(tab.id, message).catch(() => {
          // Ignore errors for tabs without content script
        });
      });

      Promise.allSettled(messagePromises).then(() => {
        logger.debug('Auth state change forwarded to all tabs');
      });
    });

    // Also notify the side panel directly if it's open
    chrome.runtime.sendMessage(message).catch(error => {
      logger.debug('Could not forward auth state to side panel', error?.message);
    });

    return true;
  }

  // Handle GET_CONTENTFUL_VARS message forwarding
  if (message.type === 'GET_CONTENTFUL_VARS') {
    // Forward to active tab to get the variables from the page
    chrome.tabs.query({ active: true, currentWindow: true }, async tabs => {
      if (!tabs || !tabs[0]) {
        sendResponse({ error: 'No active tab found' });
        return;
      }

      try {
        // Ensure content script is ready
        const isReady = await ensureContentScript(tabs[0].id);
        if (!isReady) {
          sendResponse({ error: 'Could not initialize content script' });
          return;
        }

        // Forward the request to content script
        chrome.tabs.sendMessage(tabs[0].id, { type: 'GET_CONTENTFUL_VARS' }, response => {
          if (chrome.runtime.lastError) {
            sendResponse({ error: chrome.runtime.lastError.message });
            return;
          }

          logger.debug('Forwarding Contentful vars from page to requester', response);
          sendResponse(response);
        });
      } catch (error) {
        logger.error('Error getting Contentful vars', error);
        sendResponse({ error: error.message });
      }
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
  .catch(error => logger.error('Failed to set panel behavior', error));

// Listen for tab updates to enable/disable the side panel as needed
chrome.tabs.onUpdated.addListener(async (tabId, info, tab) => {
  if (!tab.url) return;

  try {
    await chrome.sidePanel.setOptions({
      tabId,
      path: 'html/sidepanel.html',
      enabled: true
    });
  } catch (error) {
    logger.error('Error setting side panel options', error);
  }
});

// Listen for messages from the side panel
chrome.runtime.onMessage.addListener(message => {
  if (message.type === 'FROM_SIDEPANEL') {
    logger.info('Message from side panel', { message });
  }
});

// Listen for tab updates to detect URL changes
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url) {
    // Try to send a message to the content script
    try {
      chrome.tabs
        .sendMessage(tabId, {
          type: 'URL_CHANGED',
          url: tab.url
        })
        .catch(() => {
          // Ignore error if content script is not ready yet
        });
    } catch {
      // Ignore error if content script is not ready yet
    }
  }
});

// Listen for tab activation (when user switches tabs)
chrome.tabs.onActivated.addListener(async activeInfo => {
  try {
    const tab = await chrome.tabs.get(activeInfo.tabId);

    // Check if Sidekick is enabled
    const isSidekickEnabled = await getIsSideKickEnabledFromStorage();
    if (!isSidekickEnabled) return;

    // Ensure content script is ready
    const isReady = await ensureContentScript(activeInfo.tabId);

    // Notify content script that tab was activated
    if (isReady) {
      chrome.tabs
        .sendMessage(activeInfo.tabId, {
          type: 'TAB_ACTIVATED',
          url: tab.url
        })
        .catch(() => {
          // Ignore error if content script is not ready yet
        });
    }

    // Also request a fresh tree from the content script and send it directly to the side panel
    try {
      const response = await chrome.tabs.sendMessage(activeInfo.tabId, {
        type: 'GET_ELEMENT_TREE'
      });
      if (response && response.tree) {
        // Forward the tree to the side panel
        chrome.runtime.sendMessage({
          type: 'ELEMENT_TREE_UPDATE',
          tree: response.tree
        });
        logger.debug('Sent updated tree to side panel after tab switch');
      }
    } catch {
      logger.debug('Could not get element tree immediately after tab switch');
    }
  } catch (error) {
    logger.error('Error handling tab activation:', error);
  }
});
