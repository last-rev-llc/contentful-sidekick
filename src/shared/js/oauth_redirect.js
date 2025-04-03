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
      chrome.storage.sync.remove(['spaceId', 'env'], () => {
        window.close();
      });
    });
  } else {
    document.body.innerHTML = 'No token in URL';
  }
} catch (err) {
  console.error('Error during OAuth redirect:', err);
  document.body.innerHTML = 'Error processing OAuth response';
}
