const Utils = require('../Utils/Class-Utils.js')
const { enumData } = require('../types/interfaces.js')

class YoutubeAPI {
  constructor(searchOptions, apiOptions) {
    this.searchOptions = searchOptions
    this.apiOptions = apiOptions
    this.htmlApiUrl = 'https://youtube.com/results'
  }

  search(query, type) {}

  async #htmlfetch(rawQuery, type) {
    if (!rawQuery) return void null
    if (
      !['all', 'channel', 'video', 'playlist'].includes(
        type?.toLowerCase()?.trim(),
      )
    )
      return undefined
    const cookedQuery = Utils.youtubeUrlParseHtmlSearch(rawQuery)
    if (!cookedQuery?.parsedData) return undefined
    type =
      type?.toLowerCase()?.trim() === 'all'
        ? ''
        : `&sp=${Utils.htmlFilterParser(type)}`

    const htmlgetUrl =
      `${this.htmlApiUrl
      }?q=${encodeURIComponent(cookedQuery?.parsedData?.trim()).replace(
        /%20/g,
        '+',
      )}` +
      '&hl=en' +
      `${type}`

    const htmlOptions = this.searchOptions?.safeSearchMode
      ? {
        ...this.searchOptions.htmlrequestOptions,
        headers: { cookie: enumData?.SAFE_SEARCH_COOKIE },
      }
      : {
        headers: {
          'User-Agent':
              'Mozilla/5.0 (Windows NT 10.0; rv:78.0) Gecko/20100101 Firefox/78.0',
        },
      }
    const rawHtmlData = await Utils.getHtmlData(htmlgetUrl, htmlOptions)
    return undefined
  }
}

module.exports = YoutubeAPI
