/* eslint-disable no-console */
import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { createClient as createMgmtClient } from 'contentful-management';
import { createClient as createCdnClient } from 'contentful';
import get from 'lodash/get';
import set from 'lodash/set';
import getContentfulVarsFromPage from './getContentfulVarsFromPgae';
import getHashedIDFromString from './getHashedIDFromString';

const CLIENT_ID = 'N0sUte_UZ7vaCjSEcP8n11Ta2VOZY3yYqD67ZQWHCT4';
const getAuthUrl = (redirectUri) =>
  `https://be.contentful.com/oauth/authorize?response_type=token&client_id=${CLIENT_ID}&redirect_uri=${redirectUri}&scope=content_management_manage`;

const ContentfulContext = createContext();

function ContentfulProvider({ children }) {
  const [spaceId, setSpaceId] = useState(null);
  const [envId, setEnvId] = useState(null);
  const [cmaToken, setCmaToken] = useState(null);
  const [user, setUser] = useState(null);
  const [environment, setEnvironment] = useState(null);
  const [previewClient, setPreviewClient] = useState(null);
  const [loaded, setLoaded] = useState(false);
  const [defaultLocale, setDefaultLocale] = useState('en-US');

  const getTemplateChildren = useCallback(
    async (templateId, pageId) => {
      const idsMap = {};
      const hashId = new Date().getTime();
      const template = await environment.getEntry(templateId);

      const templateContentId = get(template, `fields.content.${defaultLocale}.sys.id`);

      const allChildrenEntries = [];

      const getAllContent = async (id) => {
        try {
          const entry = await environment.getEntry(id);

          const refEntryIds = [];
          const getChildrenRefIds = (content, key) => {
            if (Array.isArray(content)) {
              const hashedEntrys = content.map((ref) => {
                if (get(ref, 'sys.linkType') === 'Entry') {
                  refEntryIds.push(ref.sys.id);
                }
                // if (get(content, 'sys.id')) {
                //   refEntryIds.push(content.sys.id);
                // }
                idsMap[ref.sys.id] = getHashedIDFromString(`${hashId}-${pageId}-${ref.sys.id}`);
                return {
                  sys: {
                    id: idsMap[ref.sys.id],
                    linkType: ref.sys.linkType,
                    type: ref.sys.type
                  }
                };
              });
              set(entry, `fields.${key}.${defaultLocale}`, hashedEntrys);
            }
          };

          Object.keys(entry.fields).map((key) => {
            const localizedField = get(entry, `fields.${key}.${defaultLocale}`);
            getChildrenRefIds(localizedField, key);
          });

          idsMap[entry.sys.id] = getHashedIDFromString(`${hashId}-${pageId}-${entry.sys.id}`);
          allChildrenEntries.push(entry);

          await Promise.all(
            refEntryIds.map(async (refId) => {
              await getAllContent(refId);
            })
          );
        } catch (error) {
          console.log('ERROR->getAllContent', { id, error });
          throw error;
        }
      };

      await getAllContent(templateContentId);

      return { allChildrenEntries, idsMap };
    },
    [defaultLocale, environment]
  );

  const insertTemplateIntoPage = useCallback(
    async (pageId, templateId, index, uniqueId) => {
      const pageEntry = await environment.getEntry(pageId);

      // const templateEntry = await client.getEntry(templateId);
      // const templateContentId = get(templateEntry, `fields.content.${defaultLocale}.sys.id`);

      const { allChildrenEntries, idsMap } = await getTemplateChildren(templateId, pageId);

      const allEntryPromiseArray = allChildrenEntries.map(async (entry) => {
        const origId = entry.sys.id;
        const newId = idsMap[origId];
        // Map fields, look for links and replace with new ids
        let internalTitle = entry.fields.internalTitle['en-US'];
        internalTitle =
          internalTitle.indexOf('TEMPLATE - ') === 0
            ? internalTitle.replace('TEMPLATE - ', `${uniqueId} - `)
            : `${uniqueId} - ${internalTitle}`;
        const newitem = await environment.createEntryWithId(entry.sys.contentType.sys.id, newId, {
          fields: {
            ...entry.fields,
            internalTitle: {
              'en-US': internalTitle
            }
          },
          metadata: {
            tags: [
              {
                sys: {
                  type: 'Link',
                  linkType: 'Tag',
                  id: 'templatedContent'
                }
              }
            ]
          }
        });
        return newitem;
      });

      const newItems = await Promise.all(allEntryPromiseArray);

      if (!pageEntry.fields.contents) {
        pageEntry.fields.contents = {
          'en-US': []
        };
      }
      if (typeof index !== 'undefined') {
        pageEntry.fields.contents['en-US'].splice(index, 0, {
          sys: {
            // First Item is always the copy of the template
            id: newItems[0].sys.id,
            linkType: 'Entry',
            type: 'Link'
          }
        });
      } else {
        pageEntry.fields.contents['en-US'].push({
          sys: {
            // First Item is always the copy of the template
            id: newItems[0].sys.id,
            linkType: 'Entry',
            type: 'Link'
          }
        });
      }
      await pageEntry.update();
      setTimeout(() => {
        window.postMessage({ type: 'REFRESH_CONTENT' }, '*');
      }, 1000);
      // const updatedPage = await updateEntry('4uogEyr2z3e8VqlFMn4VpX', {fields: pageData.fields}, SPACE_ID, ENV_ID, 'page', pageData.sys.version, cmaToken);
    },
    [environment, defaultLocale, getTemplateChildren]
  );

  const reorderContent = useCallback(
    async ({ pageId, field = 'contents', from, to }) => {
      const pageEntry = await environment.getEntry(pageId);

      if (typeof from !== 'undefined' && typeof to !== 'undefined') {
        const aux = pageEntry.fields[field][defaultLocale][from];
        pageEntry.fields[field][defaultLocale][from] = pageEntry.fields[field][defaultLocale][to];
        pageEntry.fields[field][defaultLocale][to] = aux;
        await pageEntry.update();
      }

      setTimeout(() => {
        window.postMessage({ type: 'REFRESH_CONTENT' }, '*');
      }, 100);
      // const updatedPage = await updateEntry('4uogEyr2z3e8VqlFMn4VpX', {fields: pageData.fields}, SPACE_ID, ENV_ID, 'page', pageData.sys.version, cmaToken);
    },
    [environment, defaultLocale]
  );

  const removeContentFromIndex = useCallback(
    async ({ pageId, field = 'contents', index }) => {
      const pageEntry = await environment.getEntry(pageId);

      if (typeof index !== 'undefined') {
        pageEntry.fields[field][defaultLocale].splice(index, 1);
      }
      await pageEntry.update();

      setTimeout(() => {
        window.postMessage({ type: 'REFRESH_CONTENT' }, '*');
      }, 100);
      // const updatedPage = await updateEntry('4uogEyr2z3e8VqlFMn4VpX', {fields: pageData.fields}, SPACE_ID, ENV_ID, 'page', pageData.sys.version, cmaToken);
    },
    [environment, defaultLocale]
  );

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
        if (cmaToken !== null) {
          setLoaded(true);
        }
        return;
      }
      try {
        const client = createMgmtClient({
          accessToken: cmaToken
        });
        const [newSpace, newUser] = await Promise.all([client.getSpace(spaceId), client.getCurrentUser()]);
        setUser(newUser.email);
        const [newEnv, keys] = await Promise.all([newSpace.getEnvironment(envId), newSpace.getPreviewApiKeys()]);
        const locales = await newEnv.getLocales();

        const newDefaultLocale = get(
          locales.items.find((locale) => {
            return get(locale, 'default') === true;
          }),
          'code',
          'en-US'
        );

        setDefaultLocale(newDefaultLocale);

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

  const contentful = {
    user,
    environment,
    previewClient,
    loaded,
    envId,
    defaultLocale,
    handleLogin,
    handleLogout,
    insertTemplateIntoPage,
    reorderContent,
    removeContentFromIndex
  };

  return <ContentfulContext.Provider value={contentful}>{children}</ContentfulContext.Provider>;
}

function useContentfulContext() {
  const context = useContext(ContentfulContext);
  if (!context) {
    throw new Error('useContentfulContext must be used within a ContentfulProvider');
  }
  return context;
}

export { ContentfulProvider, useContentfulContext };
