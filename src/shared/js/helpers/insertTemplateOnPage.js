import { get } from 'lodash';
import getContentfulClient from './getContentfulEnvironment';
import getTemplateChildren from './getTemplateChilrdren';
import getHashedIDFromString from './getHashedIDFromString';


export default async (pageId, templateId) => {  
  const client = await getContentfulClient();
  const pageData = await client.getEntries({
    content_type: 'page',
    'sys.id': pageId,
    include: 6,
  });

  const locales = await client.getLocales();

  const defaultLocale = get(locales.items.find((locale) => {
    return get(locale, 'default') === true;
  }), 'code', 'en-US');

  const templateEntry = await client.getEntry(templateId);
  const templateContentId = get(templateEntry, `fields.content.${defaultLocale}.sys.id`);

  const pageEntry = pageData.items[0];

  const allClonedComponents = await getTemplateChildren(templateId, pageId, defaultLocale);

  // console.log('ALL COMPS', allClonedComponents);

  const allEntryPromiseArray = allClonedComponents.map(async (entry) => {
    const origId = entry.sys.id;
    const newId = getHashedIDFromString(`${pageId}-${origId}`);
    console.log('NEW ID', newId);
    const newitem = await client.createEntryWithId(entry.sys.contentType.sys.id, newId, {
      fields: entry.fields
    });
    return newitem;
  });

  // console.log('ALL PROMISES' , allEntryPromiseArray);

  const newItems = await Promise.all(allEntryPromiseArray);
  
  // console.log('New Items', newItems);

  // console.log('PAGE DATA', pageEntry);

  pageEntry.fields.contents['en-US'].push({
    sys: {
      id: getHashedIDFromString(`${pageId}-${templateContentId}`),
      linkType: 'Entry',
      type: 'Link'
    }
  });

  pageEntry.update();

  // const updatedPage = await updateEntry('4uogEyr2z3e8VqlFMn4VpX', {fields: pageData.fields}, SPACE_ID, ENV_ID, 'page', pageData.sys.version, cmaToken);

  // console.log('PAGE', updatedPage);
  // console.log('ENTRY', newEntry);
}; 