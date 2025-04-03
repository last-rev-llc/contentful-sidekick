// Side panel specific functionality
import React from 'react';
import { createRoot } from 'react-dom/client';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import theme from './theme';
import SidePanel from './components/SidePanel/SidePanel';

document.addEventListener('DOMContentLoaded', function () {
  // Initialize the side panel
  console.log('Side panel loaded');

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

  // You can add more functionality here to interact with the main extension
  chrome.runtime.onMessage.addListener(message => {
    if (message.type === 'UPDATE_SIDEPANEL') {
      // Handle updates to the side panel
      console.log('Received update:', message.data);
    }
  });
});
