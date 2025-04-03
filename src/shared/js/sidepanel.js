// Side panel specific functionality
import React from 'react';
import { createRoot } from 'react-dom/client';
import { initTabs } from './tabs';
import ElementTreePanel from './components/ElementTree/ElementTreePanel';

document.addEventListener('DOMContentLoaded', function () {
  // Initialize the side panel
  console.log('Side panel loaded');

  // Initialize tabs
  const tabs = initTabs();
  console.log('Tabs initialized:', tabs);

  // Initialize React component for Element Tree
  const elementTreeContainer = document.getElementById('element-tree-content');
  if (elementTreeContainer) {
    const root = createRoot(elementTreeContainer);
    root.render(React.createElement(ElementTreePanel));
  }

  // You can add more functionality here to interact with the main extension
  chrome.runtime.onMessage.addListener(message => {
    if (message.type === 'UPDATE_SIDEPANEL') {
      // Handle updates to the side panel
      console.log('Received update:', message.data);
    }
  });
});
