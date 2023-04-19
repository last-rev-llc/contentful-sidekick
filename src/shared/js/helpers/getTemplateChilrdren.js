import get from 'lodash/get';
import set from 'lodash/set';

import getHashedIDFromString from './getHashedIDFromString';

export default async (templateId, pageId, defaultLocale, client) => {
  const idsMap = {};
  const hashId = new Date().getTime();
  const template = await client.getEntry(templateId);

  const templateContentId = get(template, `fields.content.${defaultLocale}.sys.id`);
  console.log('Template', template);

  const allChildrenEntries = [];

  const getAllContent = async (id) => {
    try {
      console.log('getAllContent', { id });
      const entry = await client.getEntry(id);

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
        // console.log('LOCALIZED', localizedField);
        // console.log('KEY', `${key}.${defaultLocale}`);
        // console.log('is array', localizedField);
        getChildrenRefIds(localizedField, key);
      });

      idsMap[entry.sys.id] = getHashedIDFromString(`${hashId}-${pageId}-${entry.sys.id}`);
      allChildrenEntries.push(entry);

      // console.log('REF ENTRY IDS', refEntryIds);

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

  console.log('ALL CHILDREN', allChildrenEntries);

  return { allChildrenEntries, idsMap };
};
