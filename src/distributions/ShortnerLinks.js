const NodeFetch = require('node-fetch');
const UrlChecker = require('valid-url');

/**
 * @function Shortner Short the Existing Url having length > 10
 * @param {*} URl Url should be Valid and having correct background check
 * @return {Object} Short Url Result from the API
 */

function Shortner(Url) {
  if (!UrlChecker.isUri(`${Url}`)) throw SyntaxError('Invalid Url has been Detected!');
  else if (Url.length < 10) throw TypeError('Url is already Short');
  else return NodeFetch(`https://api.shrtco.de/v2/shorten?url=${Url}`).then((response) => response.json()).then((JsonResponse) => JsonResponse.result).catch((error) => error);
}

module.exports = { Shortner };
