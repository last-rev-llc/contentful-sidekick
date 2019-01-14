/* global chrome */
/* eslint no-undef: "error" */
import 'jquery';

$('#test').show();
$('#test').css({color: 'blue'});

chrome.runtime.sendMessage({
  method: 'initAuthFlow',
});
