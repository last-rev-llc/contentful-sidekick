import { useEffect, useState } from 'react';
import getContentfulClient from './getContentfulClient';

export const useAuth = () => {
  const [loaded, setLoaded] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const verifiyAuth = async () => {
    try {
      await new Promise((resolve) =>
        chrome.storage.sync.get(['spaceId', 'env'], async (obj) => {
          const { spaceId, env } = obj || {};
          try {
            const { client, space, environment } = await getContentfulClient({ spaceId, env });
            const keys = await space.getPreviewApiKeys();
            const previewToken = keys.items[0].accessToken;
            console.log('PreviewToken', previewToken);
            await chrome.storage.sync.set({ previewToken });
            if (client) setIsLoggedIn(true);
            resolve();
          } catch (error) {
            console.log('VerifyAuthError', error);
            resolve();
          }
        })
      );
    } catch (error) {
      console.log('VerifiyAuthError', error);
      setIsLoggedIn(false);
    }
  };

  useEffect(() => {
    async function init() {
      try {
        await verifiyAuth();
      } catch (error) {
        console.log('InitError', error);
      } finally {
        setLoaded(true);
      }
    }
    init();
  }, []);
  const handleLogin = () => {
    chrome.identity.launchWebAuthFlow(
      {
        interactive: true,
        url:
          'https://be.contentful.com/oauth/authorize?response_type=token&client_id=WccRf7M_eDzfIgOrC1gFKBEi4Pae7w1lw_LbQZHiK4U&redirect_uri=https://cmheemjjmooepppggclooeejginffobo.chromiumapp.org&scope=content_management_manage'
      },
      async (token) => {
        let cmaToken = token.split('=')[1];
        cmaToken = cmaToken.substring(0, cmaToken.indexOf('&'));
        console.log(cmaToken);
        await chrome.storage.sync.set({ cma: cmaToken });
        await verifiyAuth();
        // const { client, space, environment } = await getContentfulClient({ spaceId, env, cmaToken });
      }
    );
  };
  return {
    loaded,
    isLoggedIn,
    handleLogin
  };
};

export default useAuth;
