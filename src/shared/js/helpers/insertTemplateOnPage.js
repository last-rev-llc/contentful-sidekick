import get from 'lodash/get';

import getTemplateChildren from './getTemplateChilrdren';
import getHashedIDFromString from './getHashedIDFromString';
import useContentful from './useContentful';

export default async (pageId, templateId, index, client) => {
  const instanceId = new Date().getTime();
  const {
    items: [pageEntry]
  } = await client.getEntries({
    'content_type': 'page',
    'sys.id': pageId,
    'include': 6
  });

  const locales = await client.getLocales();

  const defaultLocale = get(
    locales.items.find((locale) => {
      return get(locale, 'default') === true;
    }),
    'code',
    'en-US'
  );

  const templateEntry = await client.getEntry(templateId);
  const templateContentId = get(templateEntry, `fields.content.${defaultLocale}.sys.id`);

  const { allChildrenEntries, idsMap } = await getTemplateChildren(templateId, pageId, defaultLocale, client);

  console.log('ALL COMPS', { idsMap, allChildrenEntries });

  const allEntryPromiseArray = allChildrenEntries.map(async (entry) => {
    const origId = entry.sys.id;
    const newId = idsMap[origId];
    console.log('NEW ID', newId);
    // Map fields, look for links and replace with new ids
    const newitem = await client.createEntryWithId(entry.sys.contentType.sys.id, newId, {
      fields: {
        ...entry.fields
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

  console.log('ALL PROMISES', allEntryPromiseArray);

  const newItems = await Promise.all(allEntryPromiseArray);

  console.log('New Items', newItems);

  console.log('PAGE DATA', pageEntry);
  console.log('NewContentRoot', newItems[0].sys.id);
  if (!pageEntry.fields.contents) {
    pageEntry.fields.contents = {
      ['en-US']: []
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
  console.log('UPDATED PAGE DATA', pageEntry);
  await pageEntry.update();
  setTimeout(() => {
    window.postMessage({ type: 'REFRESH_CONTENT' }, '*');
  }, 1000);
  // const updatedPage = await updateEntry('4uogEyr2z3e8VqlFMn4VpX', {fields: pageData.fields}, SPACE_ID, ENV_ID, 'page', pageData.sys.version, cmaToken);

  // console.log('PAGE', updatedPage);
  // console.log('ENTRY', newEntry);
};
