const NodeFetch = require('node-fetch');

/**
 * @property {Class} CryptoCurrency Class for Making a Default Instance
 * @param {Object.<any>} Option Default Option for CryptoCurrency if required
 */

class CryptoSector {
  constructor(Option) {
    /**
         * @property {Object} Option Default Option if required by Developer
         * @param {boolean} Raw If Raw Data is required to Filter Data for further use
         * @param {number} Amount Amount of data in Array should be send if any
         */

    this.Raw = Option && Option.Raw && typeof Option.Raw === 'boolean' ? Option.Raw : false;
    this.Amount = Option && Option.Amount && typeof Option.Amount === 'boolean' ? Option.Amount : 10;
    this.Type = Option && Option.Type && typeof Option.Type === 'string' ? Option.Type : null;
  }

  /**
      * @function getCoins To Fetch Coins Data for a Amount or Fetch Data about sepcific Coin
      * @param {any} Value Amount of Coins or Coin ID to be Displayed
      * @returns {Object} Response from the API | Raw if any
      */

  /**
     * @param {any} Option Custom Options or Coin's ID
     * @returns {Object} Coin/Market/OHCL Data Report
     */

  FetchData(Option) {
    const Settings = {
      Amount: Option && Option.Amount && typeof Option.Amount === 'number' ? Option.Amount : this.Amount,
      Raw: Option && Option.Raw && typeof Option.Raw === 'boolean' ? Option.Raw : this.Raw,
      Type: Option && Option.Type && typeof Option.Type === 'string' ? Option.Type : this.Type,
    };
    const Url = 'https://api.coinpaprika.com/v1/coins';
    const ReturnValue = { Raw: null, Refined: null };

    if (Option && Option.ID && Option.Type === 'null') {
      return NodeFetch(`${Url}/${Option.ID}`).then((response) => response.json()).then((JsonResponse) => {
        if (!Settings.Raw) ReturnValue.Raw = JsonResponse;
        ReturnValue.Refined = {
          ID: JsonResponse.id,
          Name: JsonResponse.name,
          Symbol: JsonResponse.symbol,
          Parent: JsonResponse.parent,
          Rank: JsonResponse.rank,
          New: JsonResponse.is_new,
          Active: JsonResponse.is_active,
          Team: JsonResponse.team,
          Description: JsonResponse.description,
          OpenSource: JsonResponse.open_source,
          Started: JsonResponse.started_at,
          HashAlgorithum: JsonResponse.hash_algorithum,
          Links: JsonResponse.links.extended,
        };
        return ReturnValue;
      }).catch((error) => error);
    }
    if (Option && Option.ID && Option.Type === 'twitter') {
      return NodeFetch(`${Url}/${Option.ID}/twitter`).then((response) => response.json()).then((JsonResponse) => {
        ReturnValue.Raw = JsonResponse;
        return ReturnValue;
      }).catch((error) => error);
    }
    if (Option && Option.ID && Option.Type === 'events') {
      return NodeFetch(`${Url}/${Option.ID}/events`).then((response) => response.json()).then((JsonResponse) => {
        ReturnValue.Raw = JsonResponse;
        return ReturnValue;
      }).catch((error) => error);
    }
    if (Option && Option.ID && Option.Type === 'markets') {
      return NodeFetch(`${Url}/${Option.ID}/markets`).then((response) => response.json()).then((JsonResponse) => {
        ReturnValue.Raw = JsonResponse;
        return ReturnValue;
      }).catch((error) => error);
    }
    if (Option && Option.ID && Option.Type === 'latest') {
      return NodeFetch(`${Url}/${Option.ID}/ohclv/latest`).then((response) => response.json()).then((JsonResponse) => {
        ReturnValue.Raw = JsonResponse;
        return ReturnValue;
      }).catch((error) => error);
    }
    if (Option && Option.ID && Option.Type === 'today') {
      return NodeFetch(`${Url}/${Option.ID}/ohclv/today`).then((response) => response.json()).then((JsonResponse) => {
        ReturnValue.Raw = JsonResponse;
        return ReturnValue;
      }).catch((error) => error);
    }

    return NodeFetch(`${Url}`).then((response) => response.json()).then((JsonResponse) => {
      ReturnValue.Raw = JsonResponse;
      return ReturnValue;
    }).catch((error) => error);
  }
}

module.exports = { CryptoSector };
