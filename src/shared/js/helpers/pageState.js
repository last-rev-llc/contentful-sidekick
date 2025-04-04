import { logger } from '../../../core/utils/logger';
import { initializeUI, resetUI } from './ui-state';

/**
 * Function to check if user is authenticated and handle UI state accordingly
 * @returns {Promise<boolean>} Whether the user is authenticated
 */
export const checkAuthState = async () => {
  try {
    // Send message to check auth state
    const isAuthenticated = await new Promise(resolve => {
      try {
        chrome.runtime.sendMessage({ type: 'CHECK_AUTH' }, response => {
          // Handle no response case (could be due to context invalidation)
          if (chrome.runtime.lastError) {
            logger.warn('Auth check interrupted:', chrome.runtime.lastError.message);
            resolve(false);
            return;
          }
          resolve(response);
        });
      } catch (err) {
        // This catches errors like "Extension context invalidated"
        logger.warn('Auth check failed, assuming not authenticated:', err.message);
        resolve(false);
      }
    });

    logger.debug('Auth state checked', { isAuthenticated });

    if (isAuthenticated) {
      try {
        await initializeUI();
      } catch (error) {
        logger.error('Failed to initialize UI after page state change', error);
      }
    } else {
      await resetUI();
    }

    return isAuthenticated;
  } catch (error) {
    logger.error('Failed to check auth state', error);
    return false;
  }
};

/**
 * Function to handle changes in page state
 * @returns {Promise<void>}
 */
export const handlePageStateChange = () => {
  checkAuthState();
};
