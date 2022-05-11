import { get, set, keys, isArray } from 'lodash';
import getContentfulClient from './getContentfulEnvironment';
import getHashedIDFromString from './getHashedIDFromString';



export default async (templateId, pageId, defaultLocale) => {
  const client = await getContentfulClient();
  
  const template = await client.getEntry(templateId);

  const templateContentId = get(template, `fields.content.${defaultLocale}.sys.id`);
  console.log('CONTENT', template);

  const allChildrenEntries = [];

  const getAllContent = async (id) => {
    const entry = await client.getEntry(id);

    const refEntryIds = [];
    const getChildrenRefIds = (content, key) => {
      if(isArray(content)){
        const hashedEntrys = content.map((ref) => {
          if(get(ref, 'sys.linkType') === 'Entry'){
            refEntryIds.push(ref.sys.id);
          }
          return {
            sys: {
              id: getHashedIDFromString(`${pageId}-${ref.sys.id}`),
              linkType: ref.sys.linkType,
              type: ref.sys.type
            }
          };
        });
        set(entry, `fields.${key}.${defaultLocale}`, hashedEntrys);
      }
  
      if(get(content, 'sys.id')) {
        refEntryIds.push(content.sys.id);
      }
    };

    keys(entry.fields).map((key) => {
      const localizedField = get(entry, `fields.${key}.${defaultLocale}`);
      // console.log('LOCALIZED', localizedField);
      // console.log('KEY', `${key}.${defaultLocale}`);
      // console.log('is array', localizedField);
      getChildrenRefIds(localizedField, key);
    });

    allChildrenEntries.push(entry);

    // console.log('REF ENTRY IDS', refEntryIds);

    await Promise.all(refEntryIds.map(async (refId) => {
      await getAllContent(refId);
    }));
  };

  await getAllContent(templateContentId);

  console.log('ALL CHILDREN', allChildrenEntries);

  return allChildrenEntries;

  
};