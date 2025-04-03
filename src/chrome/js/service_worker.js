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

// Listen for messages from the side panel and handle tab info requests
chrome.runtime.onMessage.addListener(message => {
  if (message.type === 'FROM_SIDEPANEL') {
    // Handle messages from the side panel
    console.log('Message from side panel:', message);
  } else if (message.type === 'GET_TAB_INFO') {
    chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
      const tab = tabs[0];
      if (tab) {
        chrome.runtime.sendMessage({
          type: 'TAB_INFO_UPDATE',
          data: {
            url: tab.url,
            title: tab.title,
            id: tab.id
          }
        });
      }
    });
  }
});
