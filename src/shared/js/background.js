/* global chrome */
import { getAuthToken } from './auth';
import { getSpaces, getEntry, getContentType } from './contentful';

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  switch (message.method) {
    case 'intAuthFlow':
      getAuthToken()
        .then(getSpaces)
        .then((spaces) => {
          console.log(spaces);
        });
      break;
    case 'getEntry':
      getAuthToken()
        .then((authToken) => {
          getEntry(authToken, message.spaceId, message.contentId)
            .then((item) => {
              sendResponse(item);
            });
        });
      return true;
    case 'getContentType':
      getAuthToken()
        .then((authToken) => {
          getContentType(authToken, message.spaceId, message.contentTypeId)
            .then((item) => {
              sendResponse(item);
            });
        });
      return true;
    default:
      break;
  }
});
