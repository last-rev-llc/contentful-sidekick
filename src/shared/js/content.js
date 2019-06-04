/* global chrome */
$(() => {
  const getState = new Promise((resolve, reject) => {
    chrome.storage.sync.get({
      sideKickEnabled: false,
    }, (items) => {
      resolve(items.sideKickEnabled);
    });
  });

  getState.then((active) => {
    if (active) {
      const CONTENTFUL_CURRENT_SPACE_ID = $('[name="contentful_space"]').attr('content');
      const CONTENTFUL_ENVIRONMENT = $('[name="contentful_environment"]').attr('content');

      const getContentfulUrl = (elementId) => {
        return `https://app.contentful.com/spaces/${CONTENTFUL_CURRENT_SPACE_ID}/environments/${CONTENTFUL_ENVIRONMENT}/entries/${elementId}`;
      };

      if (CONTENTFUL_CURRENT_SPACE_ID && CONTENTFUL_ENVIRONMENT) {
        $.each($('[data-csk-entry-id]'), (index, el) => {
          // Get the data for each element
          const elementId = $(el).data('csk-entry-id');
          $(el)
            .addClass('csk-element')
            .off('click')
            .on('click', (e) => {
              if ($(e.target).data('csk-entry-id') !== elementId) return;
              e.stopPropagation();
              window.open(getContentfulUrl(elementId));
            });
        });
      }
    }
  });
});
