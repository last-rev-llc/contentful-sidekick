import { logger } from '../../../core/utils/logger';
import { loadSidebar, removeSidebar } from './sidebar';
import { initializeSidekickApp, uninitializeSidekickApp } from './sidekick';
import { cleanupTreeObserver } from '../../../core/services/treeService';

// // UI State management
let isUIInitialized = false;

// // Function to check UI state
export const isUIActive = () => isUIInitialized;

// Function to reset the UI
export const resetUI = async () => {
  if (!isUIInitialized) {
    logger.debug('UI already reset');
    return;
  }

  cleanupTreeObserver();
  uninitializeSidekickApp();
  removeSidebar();
  isUIInitialized = false;
  logger.info('UI reset successfully');
};

// Function to initialize the UI
export const initializeUI = async () => {
  if (isUIInitialized) {
    logger.debug('UI already initialized');
    return;
  }

  try {
    loadSidebar();
    initializeSidekickApp();
    isUIInitialized = true;
    logger.info('UI initialized successfully');
  } catch (error) {
    // If initialization fails, clean up any partial state
    await resetUI();
    throw error;
  }
};
