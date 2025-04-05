import { logger } from '../../core/utils/logger';

try {
  const { hash } = window.location;
  if (!hash) {
    document.body.innerHTML = 'No token in URL';
    throw new Error('No hash in URL');
  }

  // Remove the leading # if present
  const params = new URLSearchParams(hash.startsWith('#') ? hash.slice(1) : hash);
  const token = params.get('access_token');

  if (token) {
    logger.info('OAuth token received, storing credentials');
    document.body.innerHTML = 'Authentication successful! You can close this window.';

    chrome.storage.sync.set({ cma: token }, () => {
      // Clear any existing space/env IDs to force fetching fresh ones
      chrome.storage.sync.remove(['spaceId', 'env'], async () => {
        try {
          // Notify all tabs about the authentication state change
          const tabs = await chrome.tabs.query({});
          logger.info(`Notifying ${tabs.length} tabs about auth state change`);

          // First notify the service worker
          chrome.runtime
            .sendMessage({
              type: 'AUTH_STATE_CHANGED',
              payload: { isAuthenticated: true }
            })
            .catch(err => {
              logger.error('Failed to notify service worker about auth change', err);
            });

          // Then notify all tabs
          const promises = tabs.map(tab =>
            chrome.tabs
              .sendMessage(tab.id, {
                type: 'AUTH_STATE_CHANGED',
                payload: { isAuthenticated: true }
              })
              .catch(err => {
                logger.debug(`Could not send auth message to tab ${tab.id}`, err?.message);
                // Ignore errors for tabs that don't have the content script
              })
          );

          await Promise.allSettled(promises);
          logger.info('All tabs notified about auth state change');

          // Close the window after a short delay to allow messages to be processed
          setTimeout(() => {
            window.close();
          }, 500);
        } catch (err) {
          logger.error('Error broadcasting auth state change', err);
          document.body.innerHTML =
            'Authentication successful, but there was an error syncing. Please try refreshing your tabs.';
        }
      });
    });
  } else {
    document.body.innerHTML = 'No token received from authorization';
    logger.error('No access token in OAuth response');
  }
} catch (err) {
  logger.error('Error during OAuth redirect', err);
  document.body.innerHTML = `Error processing OAuth response: ${err.message}`;
}
