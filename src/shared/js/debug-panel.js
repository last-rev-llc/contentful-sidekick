// Update debug info
function updateDebugInfo(info) {
  const debugEl = document.getElementById('debug-info');
  debugEl.textContent = JSON.stringify(info, null, 2);
}

// Request initial tab info
function requestTabInfo() {
  chrome.runtime.sendMessage({ type: 'GET_TAB_INFO' });
}

// Listen for messages from the extension
chrome.runtime.onMessage.addListener(message => {
  console.log({ message });
  if (message.type === 'TAB_INFO_UPDATE') {
    updateDebugInfo(message.data);
  }
});

// Get initial data when page loads
document.addEventListener('DOMContentLoaded', requestTabInfo);

// Request data periodically to ensure we're up to date
setInterval(requestTabInfo, 1000);
