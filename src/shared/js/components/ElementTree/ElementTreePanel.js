import React, { useState, useEffect } from 'react';
import Sidebar from '../Sidekick/Sidebar';

function ElementTreePanel() {
  const [elementTree, setElementTree] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Function to get the tree
  const getTreeFromTab = async () => {
    try {
      // Send request through background script
      chrome.runtime.sendMessage({ type: 'GET_ELEMENT_TREE' }, response => {
        if (chrome.runtime.lastError) {
          console.error('Error getting tree:', chrome.runtime.lastError);
          setError('Cannot access page content. Try refreshing the page.');
          setIsLoading(false);
          return;
        }

        if (response.error) {
          console.error('Error from background script:', response.error);
          setError(response.error);
          setIsLoading(false);
          return;
        }

        if (response?.tree) {
          console.log('Received tree:', response.tree);
          setElementTree(response.tree);
          setError(null);
        }
        setIsLoading(false);
      });
    } catch (err) {
      console.error('Error getting tree:', err);
      setError('An error occurred while loading the element tree.');
    }
  };

  useEffect(() => {
    let mounted = true;

    // Function to handle tab visibility changes
    const handleTabVisibility = mutationsList => {
      for (const mutation of mutationsList) {
        if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
          const isActive = mutation.target.classList.contains('active');
          if (isActive && mounted) {
            console.log('Element Tree tab became active, refreshing tree...');
            setIsLoading(true);
            getTreeFromTab();
          }
        }
      }
    };

    // Set up observer for the tab panel
    const tabPanel = document.getElementById('tab-elementTree');
    if (tabPanel) {
      const observer = new MutationObserver(handleTabVisibility);
      observer.observe(tabPanel, { attributes: true });

      // Initial load if the tab is already active
      if (tabPanel.classList.contains('active')) {
        getTreeFromTab();
      }

      // Cleanup observer
      return () => {
        observer.disconnect();
        mounted = false;
      };
    }

    // Listen for updates from the main page
    const messageListener = message => {
      if (message.type === 'ELEMENT_TREE_UPDATE' && mounted) {
        console.log('Received tree update:', message.tree);
        setElementTree(message.tree);
        setError(null);
        setIsLoading(false);
      }
    };
    chrome.runtime.onMessage.addListener(messageListener);

    // Cleanup message listener
    return () => {
      mounted = false;
      chrome.runtime.onMessage.removeListener(messageListener);
    };
  }, []);

  if (isLoading) {
    return <div className="element-tree-loading">Loading...</div>;
  }

  if (error) {
    return <div className="element-tree-error">{error}</div>;
  }

  if (!elementTree || elementTree.length === 0) {
    return <div className="element-tree-empty">No elements found</div>;
  }

  return <Sidebar tree={elementTree} show />;
}

export default ElementTreePanel;
