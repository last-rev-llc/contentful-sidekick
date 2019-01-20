/* global chrome */
import 'jquery';

console.log('settings.js');
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  // Will run if the user has not selected the spaces they want to enable
  console.log('message received');
  if (message.method === 'settings') {
    $('#spaces').text(JSON.stringify(message.spaces));
  }
});
