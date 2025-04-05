export const getContentfulItemUrl = (contentId, selectedPath = []) => {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage({ type: 'GET_CONTENTFUL_VARS' }, response => {
      if (response) {
        const { spaceId: SPACE_ID, env: ENV } = response;
        const reversed = [...selectedPath].reverse();
        const previousEntries = selectedPath
          ? `?previousEntries=${reversed
              .filter(node => node.id && node.id !== contentId)
              .map(node => node.id)
              .join(',')}`
          : '';
        resolve(
          `https://app.contentful.com/spaces/${SPACE_ID}/environments/${ENV}/entries/${contentId}${previousEntries}`
        );
      } else {
        reject(new Error('Failed to get Contentful variables'));
      }
    });
  });
};
