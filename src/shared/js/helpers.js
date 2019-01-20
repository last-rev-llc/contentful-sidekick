/* global chrome */
/**
* Extract the value for a query parameter from `window.location.search` or from a provided query string.
* @param {string} name - the name of the query parameter
* @param {number} queryString - an optional query string to examine instead of `window.location.search`
*/
const getQueryParam = (name, queryString) => {
  const match = (queryString || window.location.search).match(`${name}=([^&]*)`);
  return match ? match[1] : undefined;
};

module.exports = {
  getQueryParam,
};
