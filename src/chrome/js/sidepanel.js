// Side panel specific functionality
document.addEventListener('DOMContentLoaded', function () {
  // Initialize the side panel
  console.log('Side panel loaded');

  // You can add more functionality here to interact with the main extension
  chrome.runtime.onMessage.addListener(message => {
    if (message.type === 'UPDATE_SIDEPANEL') {
      // Handle updates to the side panel
      console.log('Received update:', message.data);
    }
  });
});
