/* eslint-disable no-console */
import { useEffect, useState } from 'react';
import { createClient as createMgmtClient } from 'contentful-management';
import { createClient as createCdnClient } from 'contentful';
import getContentfulVarsFromPage from './getContentfulVarsFromPgae';

const CLIENT_ID = 'MAxWQWzejdnoIVRa0VO6ZX0c-DIOBfws9VC51xySmLQ';
const getAuthUrl = (redirectUri) =>
  `https://be.contentful.com/oauth/authorize?response_type=token&client_id=${CLIENT_ID}&redirect_uri=${redirectUri}&scope=content_management_manage`;

function useContentful() {
  const [spaceId, setSpaceId] = useState(null);
  const [envId, setEnvId] = useState(null);
  const [cmaToken, setCmaToken] = useState(null);
  const [user, setUser] = useState(null);
  const [environment, setEnvironment] = useState(null);
  const [previewClient, setPreviewClient] = useState(null);
  const [loaded, setLoaded] = useState(false);

  const handleLogin = () => {
    const redirectUri = chrome.runtime.getURL('html/oauth_redirect.html');

    const authUrl = getAuthUrl(redirectUri);

    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const currentTab = tabs[0];
      const newTabIndex = currentTab.index + 1;
      chrome.tabs.create({ url: authUrl, index: newTabIndex, openerTabId: currentTab.id });
    });
  };

  const handleLogout = () => {
    chrome.storage.sync.set({ cma: '' }, () => {
      // token cleared
    });
  };

  useEffect(() => {
    const setClientValues = async () => {
      if (!cmaToken) {
        setUser(null);
        setEnvironment(null);
        setPreviewClient(null);
        setLoaded(true);
        return;
      }
      try {
        const client = createMgmtClient({
          accessToken: cmaToken
        });
        const [newSpace, newUser] = await Promise.all([client.getSpace(spaceId), client.getCurrentUser()]);
        setUser(newUser.email);
        const [newEnv, keys] = await Promise.all([newSpace.getEnvironment(envId), newSpace.getPreviewApiKeys()]);
        const previewToken = keys.items[0].accessToken;
        setEnvironment(newEnv);
        setPreviewClient(
          createCdnClient({
            accessToken: previewToken,
            space: spaceId,
            environment: envId,
            host: 'preview.contentful.com',
            resolveLinks: true
          })
        );
      } catch (err) {
        console.log('error setting client values', err);
        setUser(null);
        setEnvironment(null);
        setPreviewClient(null);
      } finally {
        setLoaded(true);
      }
    };

    setClientValues();
    // spaceId and env will not change, so we can ignore them
  }, [cmaToken]);

  useEffect(() => {
    const initCmaToken = (t) => {
      setCmaToken(t);
    };

    const init = async () => {
      let { spaceId: s, env: e } = getContentfulVarsFromPage();

      if (!s || !e) {
        ({ spaceId: s, env: e } = await chrome.storage.sync.get(['spaceId', 'env']));
      }

      setSpaceId(s);
      setEnvId(e);

      if (!s || !e) {
        return;
      }
      const { cma } = await chrome.storage.sync.get('cma');
      initCmaToken(cma);
    };

    const listener = (changes) => {
      if (changes.cma) {
        initCmaToken(changes.cma.newValue);
      }
    };

    init();
    chrome.storage.sync.onChanged.addListener(listener);

    return () => {
      chrome.storage.sync.onChanged.removeListener(listener);
    };
  }, []);

  return { user, environment, previewClient, loaded, envId, handleLogin, handleLogout };
}

export default useContentful;
