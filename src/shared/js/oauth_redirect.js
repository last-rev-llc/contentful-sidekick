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
    chrome.storage.sync.set({ cma: token }, () => {
      // Clear any existing space/env IDs to force fetching fresh ones
      chrome.storage.sync.remove(['spaceId', 'env'], async () => {
        // Notify all tabs about the authentication state change
        const tabs = await chrome.tabs.query({});
        await Promise.all(
          tabs.map(tab =>
            chrome.tabs
              .sendMessage(tab.id, {
                type: 'AUTH_STATE_CHANGED',
                payload: { isAuthenticated: true }
              })
              .catch(() => {
                // Ignore errors for tabs that don't have the content script
              })
          )
        );
        window.close();
      });
    });
  } else {
    document.body.innerHTML = 'No token in URL';
  }
} catch (err) {
  logger.error('Error during OAuth redirect', err);
  document.body.innerHTML = 'Error processing OAuth response';
}
