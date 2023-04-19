import get from 'lodash/get';

export default async ({ pageId, field = 'contents', index, client }) => {
  console.log('RemoveContent', { pageId, field, index });

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

  if (typeof index !== 'undefined') {
    pageEntry.fields[field][defaultLocale].splice(index, 1);
  }
  console.log('UPDATED PAGE DATA', pageEntry);
  await pageEntry.update();

  setTimeout(() => {
    window.postMessage({ type: 'REFRESH_CONTENT' }, '*');
  }, 100);
  // const updatedPage = await updateEntry('4uogEyr2z3e8VqlFMn4VpX', {fields: pageData.fields}, SPACE_ID, ENV_ID, 'page', pageData.sys.version, cmaToken);

  // console.log('PAGE', updatedPage);
  // console.log('ENTRY', newEntry);
};
