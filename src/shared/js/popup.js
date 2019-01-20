/* global chrome */
/* eslint no-undef: "error" */
import 'jquery';


// Check if there are spaces sent

chrome.runtime.sendMessage({
  method: 'initAuthFlow',
});
