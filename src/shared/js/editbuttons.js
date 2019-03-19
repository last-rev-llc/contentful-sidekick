/* global chrome */
$(() => {
  const CONTENTFUL_CURRENT_SPACE_ID = $('[name="contentful_space"]').attr('content');
  const CONTENTFUL_ENVIRONMENT = $('[name="contentful_environment"]').attr('content');

  const getEditBox = (elementId) => {
    return `<a class="csk-button csk-edit-button icons icon-pencil" href="https://app.contentful.com/spaces/${CONTENTFUL_CURRENT_SPACE_ID}/environments/${CONTENTFUL_ENVIRONMENT}/entries/${elementId}" target="_blank"></a>`;
  };

  if (CONTENTFUL_CURRENT_SPACE_ID && CONTENTFUL_ENVIRONMENT) {
    $.each($('[data-csk-entry-id]'), (index, el) => {
      // Get the data for each element
      const elementId = $(el).data('csk-entry-id');
      $(el).addClass('csk-element');
      $(el).prepend(getEditBox(elementId));
    });
  }
});
