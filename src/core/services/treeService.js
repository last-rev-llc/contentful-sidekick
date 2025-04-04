import { logger } from '../utils/logger';

// Tree state management
let treeObserver = null;

// Initialize tree observer
export const initializeTreeObserver = onTreeUpdate => {
  if (treeObserver) {
    logger.debug('Tree observer already initialized');
    return;
  }

  try {
    treeObserver = new MutationObserver(() => {
      try {
        onTreeUpdate();
      } catch (error) {
        logger.error('Error in tree update callback', error);
      }
    });

    treeObserver.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['data-contentful-entry-id']
    });

    logger.info('Tree observer initialized successfully');
  } catch (error) {
    logger.error('Failed to initialize tree observer', error);
    throw error;
  }
};

// Clean up tree observer
export const cleanupTreeObserver = () => {
  if (treeObserver) {
    treeObserver.disconnect();
    treeObserver = null;
    logger.debug('Tree observer cleaned up');
  }
};

// Send tree update to sidepanel
export const notifySidepanelOfTreeUpdate = tree => {
  try {
    chrome.runtime.sendMessage({
      type: 'ELEMENT_TREE_UPDATE',
      tree
    });
    logger.debug('Tree update sent to sidepanel');
  } catch (error) {
    logger.error('Failed to send tree update to sidepanel', error);
  }
};
