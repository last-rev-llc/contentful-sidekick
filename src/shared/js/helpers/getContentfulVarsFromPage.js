export const getContentfulVarsFromPage = () => {
  const spaceElement = document.querySelector('[name="contentful_space"]');
  const envElement = document.querySelector('[name="contentful_environment"]');

  return {
    spaceId: spaceElement ? spaceElement.getAttribute('content') : null,
    env: envElement ? envElement.getAttribute('content') : null
  };
};
