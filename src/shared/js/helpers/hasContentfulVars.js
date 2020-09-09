import getContentfulVars from './getContentfulVars';

export default () => {
  const [a, b] = getContentfulVars();
  return !!(a && b);
};
