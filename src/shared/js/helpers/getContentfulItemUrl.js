import getContentfulVarsFromPage from './getContentfulVarsFromPgae';

export default (contentId, field, selectedPath = []) => {
  const { spaceId: SPACE_ID, env: ENV } = getContentfulVarsFromPage();
  const reversed = [...selectedPath]
    .reverse()
    .filter((node) => node.id && node.id !== contentId)
    .map((node) => node.id);
  const previousEntries = reversed.length ? `&previousEntries=${reversed.join(',')}` : '';
  const focusedField = field ? `focusedField=${field}` : '';
  return `https://app.contentful.com/spaces/${SPACE_ID}/environments/${ENV}/entries/${contentId}?${focusedField}${previousEntries}`;
};
