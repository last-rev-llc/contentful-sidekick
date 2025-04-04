// Side panel specific functionality
import React from 'react';
import { createRoot } from 'react-dom/client';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { theme } from './theme';
import { SidePanel } from './components/SidePanel/SidePanel';
import { logger } from '../../core/utils/logger';

document.addEventListener('DOMContentLoaded', function () {
  // Initialize React component for Side Panel
  const container = document.getElementById('root');
  if (container) {
    const root = createRoot(container);
    root.render(
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <SidePanel />
      </ThemeProvider>
    );
  }

  // Request tree refresh when side panel first loads
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    if (tabs && tabs[0] && tabs[0].id) {
      chrome.tabs.sendMessage(tabs[0].id, { type: 'REFRESH_TREE' }).catch(() => {
        // Ignore errors - content script might not be ready
      });
    }
  });

  // Handle visibility changes (when side panel is opened)
  document.addEventListener('visibilitychange', function () {
    if (document.visibilityState === 'visible') {
      logger.debug('Side panel became visible, requesting tree refresh');
      // Request a refresh from the active tab
      chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        if (tabs && tabs[0] && tabs[0].id) {
          chrome.tabs.sendMessage(tabs[0].id, { type: 'REFRESH_TREE' }).catch(() => {
            // Ignore errors - content script might not be ready
          });
        }
      });
    }
  });

  // Listen for messages from the service worker or content script
  chrome.runtime.onMessage.addListener(message => {
    if (message.type === 'UPDATE_SIDEPANEL') {
      // Handle updates to the side panel
      logger.info('Received sidepanel update', { data: message.data });
    }

    if (message.type === 'ELEMENT_TREE_UPDATE') {
      logger.info('Received element tree update in side panel');
      // The tree update will be handled by the useElementTree hook
      // Just log it here for debugging
    }
  });
});
