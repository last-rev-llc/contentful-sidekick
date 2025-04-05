import React from 'react';
import { createRoot } from 'react-dom/client';
import { Sidekick } from '../components/Sidekick/Sidekick';
import { buildCskEntryTree } from './buildCskEntryTree';
import { logger } from '../../../core/utils/logger';
import {
  initializeTreeObserver,
  notifySidepanelOfTreeUpdate,
  cleanupTreeObserver
} from '../../../core/services/treeService';

let root = null;

// Initialize the React app
export const initializeSidekickApp = () => {
  try {
    logger.debug('initializeSidekickApp');
    // Get container element
    const container = document.getElementById('csk-sidekick');
    if (!container) {
      throw new Error('Sidekick container not found');
    }

    // Render React app
    root = createRoot(container);
    root.render(<Sidekick />);

    // Set up tree observer
    initializeTreeObserver(() => {
      const updatedTree = buildCskEntryTree();
      notifySidepanelOfTreeUpdate(updatedTree);
    });

    logger.info('Sidekick app initialized successfully');
    return true;
  } catch (error) {
    logger.error('Failed to initialize Sidekick app', error);
    return false;
  }
};

// Cleanup the React app
export const uninitializeSidekickApp = () => {
  try {
    // Cleanup tree observer
    cleanupTreeObserver();

    // Unmount React app
    if (root) {
      root.unmount();
      root = null;
    }

    logger.info('Sidekick app uninitialized successfully');
    return true;
  } catch (error) {
    logger.error('Failed to uninitialize Sidekick app', error);
    return false;
  }
};
