import getContentfulVars from './getContentfulVars';

export default (contentId) => {
  const [CONTENTFUL_CURRENT_SPACE_ID, CONTENTFUL_ENVIRONMENT] = getContentfulVars();
  return `https://app.contentful.com/spaces/${CONTENTFUL_CURRENT_SPACE_ID}/environments/${CONTENTFUL_ENVIRONMENT}/entries/${contentId}`;
};
