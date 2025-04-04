import { useState, useEffect } from 'react';
import { logger } from '../../../core/utils/logger';

export const useElementTree = () => {
  const [elementTree, setElementTree] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Function to get the tree
  const getTreeFromTab = async () => {
    try {
      setIsLoading(true);

      // Send request through background script
      chrome.runtime.sendMessage({ type: 'GET_ELEMENT_TREE' }, response => {
        if (chrome.runtime.lastError) {
          logger.error('Error getting tree from runtime', chrome.runtime.lastError);
          setError('Cannot access page content. Try refreshing the page.');
          setIsLoading(false);
          return;
        }

        if (response.error) {
          logger.error('Error from background script', { error: response.error });
          setError(response.error);
          setIsLoading(false);
          return;
        }

        if (response?.tree) {
          logger.info('Received element tree', { tree: response.tree });
          setElementTree(response.tree);
          setError(null);
        }
        setIsLoading(false);
      });
    } catch (err) {
      logger.error('Error getting tree', err);
      setError('An error occurred while loading the element tree.');
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let mounted = true;

    // Initial load
    getTreeFromTab();

    // Listen for updates from the main page
    const messageListener = message => {
      if (!mounted) return;

      if (message.type === 'ELEMENT_TREE_UPDATE' && message.tree) {
        logger.info('Received tree update', { tree: message.tree });
        setElementTree(message.tree);
        setError(null);
        setIsLoading(false);
      }
    };
    chrome.runtime.onMessage.addListener(messageListener);

    // Also listen for tab activation events
    chrome.tabs.onActivated.addListener(() => {
      if (mounted) {
        logger.debug('Tab changed, refreshing element tree in hook');
        getTreeFromTab();
      }
    });

    // Cleanup message listener
    return () => {
      mounted = false;
      chrome.runtime.onMessage.removeListener(messageListener);
    };
  }, []);

  return {
    elementTree,
    isLoading,
    error,
    refreshTree: getTreeFromTab
  };
};
