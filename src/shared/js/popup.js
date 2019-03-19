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
});