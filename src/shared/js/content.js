/* global chrome */
import $ from 'jquery';

const SIDEKICK_ID = 'imkbeabdibcecfhkbphdkdeaiblfbhpa';

const getEditBox = (spaceId, contentId) => {
  return `<a id="csk-${contentId}" class="csk-button csk-edit-button icons icon-pencil" 
  data-spaceId=${spaceId} data-contentId=${contentId}">Edit</a>`;
};

const getEntry = (spaceId, contentId) => {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage(SIDEKICK_ID, {
      method: 'getEntry',
      spaceId,
      contentId,
    }, (item) => {
      resolve(item);
    });
  });
};

const getContentType = (spaceId, contentTypeId) => {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage(SIDEKICK_ID, {
      method: 'getContentType',
      spaceId,
      contentTypeId,
    }, (item) => {
      resolve(item);
    });
  });
};

const showContentEntryForm = async (spaceId, contentId) => {
  const entry = await getEntry(spaceId, contentId);
  console.log(entry);
  debugger;
  const contentType = await getContentType(spaceId, entry.sys.contentType.sys.id);
  console.log(contentType);
};

$(() => {
  const CONTENTFUL_CURRENT_SPACE_ID = $('[name="contentful_space"]').attr('content');
  // Get Array of all elements that have contentful elements
  console.log('this is a content script');
  $.each($('[data-csk-content-id]'), (index, el) => {
    // Get the data for each element
    const contentId = $(el).data('csk-content-id');
    const editBox = getEditBox(CONTENTFUL_CURRENT_SPACE_ID, contentId);
    $(el).prepend(editBox);
    $(`#csk-${contentId}`).on('click', () => {
      showContentEntryForm(CONTENTFUL_CURRENT_SPACE_ID, contentId);
    });
  });
});
