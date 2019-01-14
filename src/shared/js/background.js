/* global chrome */
/* eslint no-undef: "error" */

function getOAuthState() {
  /* Returns a promise for a string to use as the OAuth2 state parameter, to protect against CSRF attacks.

  See https://tools.ietf.org/html/rfc6749#section-10.12.

  A new state string is generated as needed and expires after 10 mins.
   */
  const OAUTH_STATE_KEY = 'oauthState';
  const STATE_LIFESPAN = 10 * 60 * 1000;  // 10 mins

  return new Promise((resolve, reject) => {
    chrome.storage.local.get(OAUTH_STATE_KEY, (items) => {
      const preexistingState = items[OAUTH_STATE_KEY];
      if (preexistingState && preexistingState.expiresAt > Date.now()) {
        resolve(preexistingState.val);
        return;
      }

      let state = '';
      const randos = new Uint32Array(4);
      window.crypto.getRandomValues(randos);

      for (let i = 0; i < randos.length; i++) {
        state += randos[i].toString();
      }

      const newState = {
        val: state,
        expiresAt: Date.now() + STATE_LIFESPAN,
      };

      chrome.storage.local.set({
        [OAUTH_STATE_KEY]: newState,
      }, () => {
        resolve(newState.val);
      });
    });
  });
}

const storeProjectIds = () => {
  console.log('is this actually working???????');
};

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.method === 'initAuthFlow') {
    getOAuthState()
      .then((oauthState) => {
        const oauthUrl = `https://be.contentful.com/oauth/authorize?
            response_type=token
            &client_id=d509a1a8f532d5519557cb060c7b035caae04f032a7533d445ef11ae85a0a0c1
            &redirect_uri=${encodeURIComponent(chrome.identity.getRedirectURL('oauth2'))}
            &scope=content_management_manage
            &state=${oauthState}`;

        chrome.identity.launchWebAuthFlow({
          url: oauthUrl,
          interactive: true,
        }, storeProjectIds);
      });
  }
});
