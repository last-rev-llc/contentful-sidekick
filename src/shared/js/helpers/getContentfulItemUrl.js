import getContentfulVarsFromPage from './getContentfulVarsFromPgae';

export default (contentId, selectedPath = []) => {
  const { spaceId: SPACE_ID, env: ENV } = getContentfulVarsFromPage();
  const reversed = [...selectedPath].reverse();
  const previousEntries = selectedPath
    ? `?previousEntries=${reversed
        .filter((node) => node.id && node.id !== contentId)
        .map((node) => node.id)
        .join(',')}`
    : '';
  return `https://app.contentful.com/spaces/${SPACE_ID}/environments/${ENV}/entries/${contentId}${previousEntries}`;
};
