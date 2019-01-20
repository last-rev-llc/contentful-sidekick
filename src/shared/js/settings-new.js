/* global chrome */
// import * as _ from 'lodash';

// const getSpaceOptionHtml = (space) => {
//   return `
//     <div class="">
//       <input type="checkbox" value="${space.sys.id}" />
//       <h2>${space.name}</h2>
//     </div>
//   `;
// };

// // Display the spaces for the user to choose
// const displaySpaces = (spaces) => {
//   console.log(spaces);
//   _.each(spaces.items, (space) => {
//     $('#spaces').append(getSpaceOptionHtml(space));
//   });
// };

// Listens for the 
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  // Will run if the user has not selected the spaces they want to enable
  console.log('afasfasfsafsadf');
  if (message.method === 'settings') {
    alert('asdfasfasfasdf');
    //displaySpaces(message.spaces);
  }
});
