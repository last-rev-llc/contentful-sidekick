import getContentfulVars from './getContentfulVars';

export default (contentId, selectedPath = []) => {
  const [CONTENTFUL_CURRENT_SPACE_ID, CONTENTFUL_ENVIRONMENT] = getContentfulVars();
  const reversed = [...selectedPath].reverse();
  const previousEntries = selectedPath
    ? `?previousEntries=${reversed
        .filter((node) => node.id && node.id !== contentId)
        .map((node) => node.id)
        .join(',')}`
    : '';
  return `https://app.contentful.com/spaces/${CONTENTFUL_CURRENT_SPACE_ID}/environments/${CONTENTFUL_ENVIRONMENT}/entries/${contentId}${previousEntries}`;
};
