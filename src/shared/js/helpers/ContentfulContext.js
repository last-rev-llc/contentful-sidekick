/* eslint-disable no-console */
import React, { createContext, useCallback, useContext, useEffect, useState, useMemo } from 'react';
import { createClient as createMgmtClient } from 'contentful-management';
import { createClient as createCdnClient } from 'contentful';
import get from 'lodash/get';
import set from 'lodash/set';
import { getContentfulVarsFromPage } from './getContentfulVarsFromPage';
import { getHashedIDFromString } from './getHashedIDFromString';
import { logger } from '../../../core/utils/logger';

const CLIENT_ID = 'N0sUte_UZ7vaCjSEcP8n11Ta2VOZY3yYqD67ZQWHCT4';
const getAuthUrl = redirectUri =>
  `https://be.contentful.com/oauth/authorize?response_type=token&client_id=${CLIENT_ID}&redirect_uri=${redirectUri}&scope=content_management_manage`;

const ContentfulContext = createContext();

function ContentfulProvider({ children }) {
  const [spaceId, setSpaceId] = useState(null);
  const [envId, setEnvId] = useState(null);
  const [cmaToken, setCmaToken] = useState(null);
  const [user, setUser] = useState(null);
  const [userDetails, setUserDetails] = useState(null);
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

      const getAllContent = async id => {
        try {
          const entry = await environment.getEntry(id);

          const refEntryIds = [];
          const getChildrenRefIds = (content, key) => {
            if (Array.isArray(content)) {
              const hashedEntrys = content.map(ref => {
                if (get(ref, 'sys.linkType') === 'Entry') {
                  refEntryIds.push(ref.sys.id);
                }
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

          Object.keys(entry.fields).forEach(key => {
            const localizedField = get(entry, `fields.${key}.${defaultLocale}`);
            getChildrenRefIds(localizedField, key);
          });

          idsMap[entry.sys.id] = getHashedIDFromString(`${hashId}-${pageId}-${entry.sys.id}`);
          allChildrenEntries.push(entry);

          await Promise.all(
            refEntryIds.map(async refId => {
              await getAllContent(refId);
            })
          );
        } catch (error) {
          logger.error('Error getting content', error, { id });
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

      const allEntryPromiseArray = allChildrenEntries.map(async entry => {
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

    chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
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
        setUserDetails(null);
        setEnvironment(null);
        setPreviewClient(null);
        setLoaded(true);
        return;
      }
      try {
        const client = createMgmtClient({
          accessToken: cmaToken
        });

        // First get the user info
        const newUser = await client.getCurrentUser();

        // If we don't have a space/env, get the first available ones
        let newSpace;
        if (!spaceId) {
          const spaces = await client.getSpaces();
          if (spaces.items.length > 0) {
            [newSpace] = spaces.items;
            setSpaceId(newSpace.sys.id);
            // Save for next time
            await chrome.storage.sync.set({ spaceId: newSpace.sys.id });
          } else {
            throw new Error('No spaces available');
          }
        } else {
          newSpace = await client.getSpace(spaceId);
        }

        // Store full user details
        const details = {
          email: newUser.email,
          firstName: newUser.firstName,
          lastName: newUser.lastName,
          fullName: `${newUser.firstName} ${newUser.lastName}`.trim(),
          spaceName: newSpace.name,
          spaceId: newSpace.sys.id
        };

        setUser(newUser.email);
        setUserDetails(details);

        // Get or set environment
        let newEnv;
        if (!envId) {
          const environments = await newSpace.getEnvironments();
          if (environments.items.length > 0) {
            [newEnv] = environments.items;
            setEnvId(newEnv.sys.id);
            // Save for next time
            await chrome.storage.sync.set({ env: newEnv.sys.id });
          } else {
            throw new Error('No environments available');
          }
        } else {
          newEnv = await newSpace.getEnvironment(envId);
        }

        const [locales, keys] = await Promise.all([
          newEnv.getLocales(),
          newSpace.getPreviewApiKeys()
        ]);

        const newDefaultLocale = get(
          locales.items.find(locale => get(locale, 'default') === true),
          'code',
          'en-US'
        );

        setDefaultLocale(newDefaultLocale);

        const previewToken = keys.items[0].accessToken;
        setEnvironment(newEnv);
        setPreviewClient(
          createCdnClient({
            accessToken: previewToken,
            space: newSpace.sys.id,
            environment: newEnv.sys.id,
            host: 'preview.contentful.com'
          })
        );
      } catch (err) {
        logger.error('Error setting client values', err);
        setUser(null);
        setUserDetails(null);
        setEnvironment(null);
        setPreviewClient(null);
      } finally {
        setLoaded(true);
      }
    };

    setClientValues();
  }, [cmaToken, spaceId, envId]);

  useEffect(() => {
    const init = async () => {
      try {
        // Get space/env from page
        const { spaceId: pageSpaceId, envId: pageEnvId } = getContentfulVarsFromPage();
        logger.debug('pageSpaceId', pageSpaceId, 'pageEnvId', pageEnvId);
        if (pageSpaceId) {
          setSpaceId(pageSpaceId);
        }
        if (pageEnvId) {
          setEnvId(pageEnvId);
        }

        // Get token from storage
        const result = await chrome.storage.sync.get(['cma', 'spaceId']);
        if (result.cma) {
          setCmaToken(result.cma);
        }
        if (result.spaceId && !pageSpaceId) {
          setSpaceId(result.spaceId);
        }
      } catch (err) {
        logger.error('Error fetching space/environment', err);
      }
    };

    const listener = changes => {
      if (changes.cma) {
        init(); // Re-run init when token changes to get space/env if needed
      }
    };

    init();
    chrome.storage.sync.onChanged.addListener(listener);

    return () => {
      chrome.storage.sync.onChanged.removeListener(listener);
    };
  }, []);

  const contextValue = useMemo(
    () => ({
      spaceId,
      envId,
      cmaToken,
      user,
      userDetails,
      environment,
      previewClient,
      loaded,
      defaultLocale,
      handleLogin,
      handleLogout,
      insertTemplateIntoPage,
      reorderContent,
      removeContentFromIndex
    }),
    [
      spaceId,
      envId,
      cmaToken,
      user,
      userDetails,
      environment,
      previewClient,
      loaded,
      defaultLocale,
      insertTemplateIntoPage,
      reorderContent,
      removeContentFromIndex
    ]
  );

  return <ContentfulContext.Provider value={contextValue}>{children}</ContentfulContext.Provider>;
}

function useContentfulContext() {
  const context = useContext(ContentfulContext);
  if (!context) {
    throw new Error('useContentfulContext must be used within a ContentfulProvider');
  }
  return context;
}

export { ContentfulProvider, useContentfulContext };
