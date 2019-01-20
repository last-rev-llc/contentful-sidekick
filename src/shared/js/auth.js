/* global chrome */
const crypto = require('crypto');
const _ = require('lodash');
const commonTags = require('common-tags');
const helperFn = require('./helpers');


const CONTENTFUL_OAUTH_CLIENTID = '7862b715f1cd95104c4b522cac4f1cab66253aa21a64ace39428332bcd1d0546';
const OAUTH_STATE_LOCAL_KEY = 'oauthState';

const getStateFromStorage = () => new Promise((resolve) => {
  chrome.storage.local.get(OAUTH_STATE_LOCAL_KEY, (items) => {
    const prevState = items.oauthState;
    if (prevState && prevState.expiresAt > Date.now()) {
      resolve(prevState);
    } else {
      resolve();
    }
  });
});

const setStateInStorage = (state) => {
  console.log('hello state', state);
  return new Promise((resolve, reject) => {
    try {
      chrome.storage.local.set({
        [OAUTH_STATE_LOCAL_KEY]: state,
      }, () => {
        resolve(state);
      });
    } catch (error) {
      console.log(error);
      reject(error);
    }
  });
};

/**
 * This function will check if tReturns a promise for a string to use as the OAuth2 state parameter, to protect against CSRF attacks.
 *  A new state string is generated as needed and expires after 10 mins.
 */
const getAuthState = (previousState) => {
  const STATE_LIFESPAN = 10 * 60 * 1000; // 10 mins
  return new Promise((resolve, reject) => {
    if (_.isUndefined(previousState) || _.isObject(previousState)) {
      if (_.isObject(previousState)) {
        if (!_.has(previousState, 'val')) reject(new Error('previousState must have the val property'));
        if (!_.has(previousState, 'expiresAt')) reject(new Error('previousState must have the val property'));
      }

      if (previousState && previousState.expiresAt > Date.now()) {
        resolve(previousState);
        return;
      }

      let state = '';
      const randos = new Uint32Array(4);
      crypto.randomBytes(randos.length);

      for (let i = 0; i < randos.length; i++) {
        state += randos[i].toString();
      }

      const newState = {
        val: state,
        expiresAt: Date.now() + STATE_LIFESPAN,
      };

      resolve(newState);
    }

    reject(new Error('previous state must be empty or an object'));
  });
};

const getAuthToken = () => {
  return new Promise((resolve, reject) => {
    getStateFromStorage()
      .then(getAuthState)
      .then(setStateInStorage)
      .then((oauthState) => {
        const oauthUrl = commonTags.oneLineTrim`https://be.contentful.com/oauth/authorize?
            response_type=token
            &client_id=${CONTENTFUL_OAUTH_CLIENTID}
            &redirect_uri=${encodeURIComponent(chrome.identity.getRedirectURL('oauth2'))}
            &scope=content_management_manage
            &state=${oauthState.val}`;
        debugger;
        console.log(oauthUrl);
        chrome.identity.launchWebAuthFlow({
          url: oauthUrl,
          interactive: true,
        }, (responseUrl) => {
          debugger;
          if (!responseUrl) {
            reject(new Error('No response URL given'));
          }
          const fragmentString = responseUrl.split('#')[1];
          const accessToken = helperFn.getQueryParam('access_token', fragmentString);
          resolve(accessToken);
        });
      });
  });
};

module.exports = {
  getAuthState,
  getAuthToken,
  setStateInStorage,
  getStateFromStorage,
};
