const { hash } = window.location;
const token = new URLSearchParams(hash.slice(1)).get('access_token');

if (token) {
  chrome.storage.sync.set({ cma: token }, () => {
    window.close();
  });
} else {
  document.body.innerHTML = 'No token in URL';
}
