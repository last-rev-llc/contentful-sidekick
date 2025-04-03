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
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let mounted = true;

    // Initial load
    getTreeFromTab();

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

  return <Sidebar tree={elementTree} />;
}

export default ElementTreePanel;
