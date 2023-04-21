import getContentfulVarsFromPage from './getContentfulVarsFromPgae';

export default () => {
  const { spaceId, env } = getContentfulVarsFromPage();
  return !!(spaceId && env);
};
