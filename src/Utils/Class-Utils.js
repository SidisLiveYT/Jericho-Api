const Axios = require('axios').default
const { youtubeUrlParseHtmlSearchData } = require('../types/interfaces.js')

class Utils {
  /**
   * @method htmlFilterParser() _> parsing filter type for HTML fetch from youtbe Watch page
   * @param {string} rawFilter String value of playlist , video , channel Data
   * @returns {string | void} string value for html query search for Youtube Default Watch Page
   */
  static htmlFilterParser(rawFilter) {
    switch (rawFilter?.toLowerCase()?.trim()) {
      case 'playlist':
        return 'EgIQAw%253D%253D'
      case 'video':
        return 'EgIQAQ%253D%253D'
      case 'channel':
        return 'EgIQAg%253D%253D'
      default:
        throw new TypeError(
          `Invalid Search type is Detected | Value : "${rawFilter}"`,
        )
    }
  }

  /**
   * @method youtubeUrlParseHtmlSearch() -> Parsing rawUrl for Actual Regex checking list/video/channel Ids
   * @param {string} rawUrl Youtube Url or Search if any
   * @returns {youtubeUrlParseHtmlSearchData} Returns Json Format of Parsing of Youtube Url Raw Data
   */
  static youtubeUrlParseHtmlSearch(rawUrl) {
    let rawMatch = rawUrl.match(
      /^(?:\w+:)?\/\/([^\s\.]+\.\S{2}|localhost[\:?\d]*)\S*$/,
    )
    if (!rawMatch?.[1])
      return {
        parsedData: rawUrl,
        contentType: 'query',
        rawMatchData: rawMatch,
      }
    rawMatch = rawUrl.match(/[?&]list=([^#&?]+)/)
    if (rawMatch?.[1])
      return {
        parsedData: rawMatch?.[1],
        contentType: 'playlist',
        rawMatchData: rawMatch,
      }
    rawMatch = rawUrl.match(
      /(?:(?:v|vi|be|videos|embed)\/(?!videoseries)|(?:v|ci)=)([\w-]{11})/i,
    )
    if (rawMatch?.[1])
      return {
        parsedData: rawMatch?.[1],
        contentType: 'video',
        rawMatchData: rawMatch,
      }
    rawMatch = rawUrl.match(/\/channel\/([\w-]+)/)
    if (rawMatch?.[1])
      return {
        parsedData: rawMatch?.[1],
        contentType: 'channel',
        rawMatchData: rawMatch,
      }
    rawMatch = rawUrl.match(/\/(?:c|user)\/([\w-]+)/)
    if (rawMatch?.[1])
      return {
        parsedData: rawMatch?.[1],
        contentType: 'channel',
        rawMatchData: rawMatch,
      }
    else return undefined
  }

  /**
   * @method getHtmlData() -> Fetch response.text() for Parsing the Watch Page Data
   * @param {string} rawHtmlUrl Raw Youtube Get Request Url "search url query" as Defination
   * @param {Object} htmlRequestOption html get Request Options for Axios get fetch method
   * @returns {Promise<string|void>} returns response.text() as Data for Raw HTML Data of Youtube Watch Page
   */
  static async getHtmlData(rawHtmlUrl, htmlRequestOption) {
    return new Promise((resolve, reject) => {
      Axios.get(rawHtmlUrl, htmlRequestOption)
        .then((response) => {
          if (!response.ok)
            throw new Error(
              `Rejected GET Request with status code: ${response.status}`,
            )
          return response.text()
        })
        .then((rawHtmlData) => resolve(rawHtmlData))
        .catch((error) => reject(error))
    })
  }

  static parseHtmlData(rawHtml, parsingSearchOptions) {
    if (!rawHtml)
      throw new Error('Recevied Invalid Raw HTML Data from Youtube Watch Page')
    if (!parsingSearchOptions)
      parsingSearchOptions = { type: 'video', limit: 1 }
  }
}

module.exports = Utils
