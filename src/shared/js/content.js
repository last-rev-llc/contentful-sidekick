import React from 'react';
import { createRoot } from 'react-dom/client';
import debounce from 'lodash/debounce';
import Sidekick from './components/Sidekick/Sidekick';
import buildCskEntryTree from './helpers/buildCskEntryTree';
import { loadSidebar, applyBgColorVar, resetDom } from './helpers/sidebarUtils';

// Track initialization state
let isInitialized = false;

const loadSidekick = async () => {
  document.body.setAttribute('data-init-csk', true);
  loadSidebar();
  applyBgColorVar();

  // Build initial tree
  const currentTree = buildCskEntryTree();

  // Render React app
  const root = createRoot(document.getElementById('csk-sidekick'));
  root.render(<Sidekick defaultTree={currentTree} />);

  // Set up observer to track tree changes
  const observer = new MutationObserver(() => {
    const updatedTree = buildCskEntryTree();
    // Notify sidepanel of tree updates
    chrome.runtime.sendMessage({
      type: 'ELEMENT_TREE_UPDATE',
      tree: updatedTree
    });
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['data-contentful-entry-id']
  });

  // Add click handler for overlay
  $('#csk-overlay').on('click', () => {
    $('#csk-overlay').removeClass('show');
  });

  // Add click handler for edit link
  $('#csk-edit-link').on('click', e => {
    e.preventDefault();
    const href = $(e.target).attr('href');
    if (href === '#') return;

    if (window.self !== window.top) {
      window.parent.postMessage(
        {
          type: 'NAVIGATE_TO',
          payload: {
            href
          }
        },
        '*'
      );
    } else {
      window.open(href, '_blank');
    }
  });
};

// Function to check if user is authenticated
const checkAuthentication = async () => {
  return new Promise(resolve => {
    chrome.storage.sync.get(['cma'], result => {
      resolve(!!result.cma);
    });
  });
};

// Function to handle page state changes
const handlePageStateChange = async () => {
  const isAuthenticated = await checkAuthentication();
  if (isAuthenticated) {
    loadSidekick().catch(error => {
      console.error('Failed to load sidekick after page state change:', error);
    });
  } else {
    resetDom();
  }
};

// Initialize page state change listeners
const initializePageStateListeners = () => {
  if (isInitialized) return;

  // Listen for navigation events
  window.addEventListener('popstate', handlePageStateChange);
  window.addEventListener('pushstate', handlePageStateChange);
  window.addEventListener('replacestate', handlePageStateChange);

  // Listen for page load events
  window.addEventListener('load', handlePageStateChange);

  // Listen for dynamic content changes
  const observer = new MutationObserver(
    debounce(() => {
      handlePageStateChange();
    }, 500)
  );

  observer.observe(document.body, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['data-contentful-entry-id']
  });

  isInitialized = true;
};

// Add message listener for Element Tree tab requests and ping
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'PING') {
    sendResponse({ status: 'ready' });
    return true;
  }

  if (message.type === 'GET_ELEMENT_TREE') {
    try {
      const tree = buildCskEntryTree();
      console.log('Built tree for sidepanel:', tree);
      sendResponse({ tree });
    } catch (error) {
      console.error('Error building tree:', error);
      sendResponse({ tree: [] });
    }
    return true;
  }

  if (message.type === 'TOGGLE_HIGHLIGHT') {
    if (message.enabled) {
      loadSidekick().catch(error => {
        console.error('Failed to load sidekick after toggle:', error);
      });
    } else {
      resetDom();
    }
    return true;
  }

  if (message.type === 'AUTH_STATE_CHANGED') {
    console.log('auth', message);
    handlePageStateChange();
  }

  // Handle authentication state changes
  if (message.type === 'AUTH_STATE_CHANGED' && message.payload.isAuthenticated) {
    loadSidekick().catch(error => {
      console.error('Failed to load sidekick after authentication:', error);
    });
  }
});

// Initialize listeners when the script loads
initializePageStateListeners();

export default loadSidekick;
