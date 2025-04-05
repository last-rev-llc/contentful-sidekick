import debounce from 'lodash/debounce';
import { handlePageStateChange } from './pageState';
import { buildCskEntryTree } from './buildCskEntryTree';
import { logger } from '../../../core/utils/logger';
import { getContentfulVarsFromPage } from './getContentfulVarsFromPage';

let isInitialized = false;
let currentUrl = window.location.href;

// Function to refresh the element tree
const refreshElementTree = () => {
  try {
    const tree = buildCskEntryTree();
    logger.debug('Refreshing element tree due to page change');

    // Notify the sidepanel about the tree update
    try {
      chrome.runtime
        .sendMessage({
          type: 'ELEMENT_TREE_UPDATE',
          tree
        })
        .catch(error => {
          // Silently catch any messaging errors - most likely means side panel isn't open
          logger.debug('Could not send tree update, side panel may not be open:', error?.message);
        });
    } catch (error) {
      // This can happen if extension context is invalidated
      logger.debug('Could not send tree update due to extension context:', error?.message);
    }
  } catch (error) {
    logger.error('Error refreshing element tree', error);
  }
};

// Initialize page state change listeners
export const initializePageStateListeners = () => {
  if (isInitialized) return;

  // Listen for page load events
  window.addEventListener('load', () => {
    handlePageStateChange();
    refreshElementTree();
  });

  // Set up an interval to check for URL changes (for SPAs)
  const urlCheckInterval = setInterval(() => {
    if (currentUrl !== window.location.href) {
      logger.debug('URL changed from', currentUrl, 'to', window.location.href);
      currentUrl = window.location.href;
      handlePageStateChange();
      refreshElementTree();
    }
  }, 500);

  // Listen for dynamic content changes
  const observer = new MutationObserver(
    debounce(() => {
      handlePageStateChange();
      refreshElementTree();
    }, 500)
  );

  observer.observe(document.body, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['data-contentful-entry-id']
  });

  // Clean up on unload
  window.addEventListener('unload', () => {
    clearInterval(urlCheckInterval);
    observer.disconnect();
  });

  isInitialized = true;
};

// Initialize message listeners
export const initializeMessageListeners = () => {
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'PING') {
      sendResponse({ status: 'ready' });
      return true;
    }

    if (message.type === 'GET_ELEMENT_TREE') {
      try {
        const tree = buildCskEntryTree();
        logger.info('Built tree for sidepanel', { tree });
        sendResponse({ tree });
      } catch (error) {
        logger.error('Error building tree', error);
        sendResponse({ tree: [] });
      }
      return true;
    }

    if (message.type === 'AUTH_STATE_CHANGED') {
      logger.info('Authentication state changed', message);
      handlePageStateChange();
      refreshElementTree();
    }

    if (message.type === 'INIT_SIDEKICK') {
      handlePageStateChange();
      refreshElementTree();
    }

    if (message.type === 'URL_CHANGED') {
      logger.info('URL change detected by extension', message);
      handlePageStateChange();
      refreshElementTree();
    }

    if (message.type === 'TAB_ACTIVATED') {
      logger.info('Tab activated', message);
      // Force a complete refresh when switching tabs
      currentUrl = window.location.href; // Update stored URL to prevent duplicate handling
      handlePageStateChange();
      refreshElementTree();
    }

    if (message.type === 'TOGGLE_HIGHLIGHT') {
      logger.info('Highlight toggle requested', message);
      // Toggle highlight functionality in the DOM
      try {
        if (message.enabled) {
          // Enable highlight by ensuring sidebar elements are loaded
          // Import the necessary functions to ensure they're available
          import('./sidebar').then(({ loadSidebar }) => {
            loadSidebar();
            logger.info('Sidebar loaded for highlighting');
          });
        } else {
          // Disable highlight by removing sidebar elements
          import('./sidebar').then(({ removeSidebar }) => {
            removeSidebar();
            logger.info('Sidebar removed to disable highlighting');
          });
        }
      } catch (error) {
        logger.error('Error toggling highlight:', error);
      }
    }

    if (message.type === 'REFRESH_TREE') {
      logger.info('Manual tree refresh requested');
      refreshElementTree();
    }

    if (message.type === 'GET_CONTENTFUL_VARS') {
      const { spaceId, env } = getContentfulVarsFromPage();
      sendResponse({ spaceId, env });
      return true;
    }
  });
};
