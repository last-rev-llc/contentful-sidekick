export const getPageId = () => {
  const metaPageIdEl = document.querySelector('meta[name="pageId"]');
  let metaPageId = metaPageIdEl ? metaPageIdEl.content : null;
  if (!metaPageId) {
    const pageParams = new URLSearchParams(window.location.search);
    metaPageId = pageParams.get('id');
  }
  return metaPageId;
};
