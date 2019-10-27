/* global chrome */
/* eslint no-undef: "error" */
import 'jquery';

let sideKickEnabled = false;
// Check if there are spaces sent

const loadStorage = () => {
  chrome.storage.sync.get({
    sideKickEnabled: false,
  }, (items) => {
    sideKickEnabled = items.sideKickEnabled;
    $('#sideKickEnabled').prop('checked', sideKickEnabled);
  });
};

$(() => {
  loadStorage();
});

$('#sideKickEnabled').on('change', (el) => {
  chrome.storage.sync.set({
    sideKickEnabled: $(el.currentTarget).is(':checked'),
  });

  chrome.tabs.getSelected(null, (tab) => {
    const code = 'window.location.reload();';
    chrome.tabs.executeScript(tab.id, { code });

    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if ($(el.currentTarget).is(':checked')) {
        chrome.tabs.executeScript(
          tabs[0].id,
          { code: 'document.body.addAttribute("data-init-csk")' },
        );
      } else {
        chrome.tabs.executeScript(
          tabs[0].id,
          { code: 'document.body.removeAttribute("data-init-csk")' },
        );
      }
    });
  });
});
