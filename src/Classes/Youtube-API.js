const Utils = require('../Utils/Youtube-Utils.js')
const { enumData } = require('../types/interfaces.js')
const YoutubeVideo = require('../Structures/Youtube-Elements/video-element')

class YoutubeAPI {
  constructor(searchOptions, apiOptions) {
    this.searchOptions = { type: 'all', ...searchOptions }
    this.apiOptions = apiOptions
  }

  async search(query, searchOptions = this.searchOptions) {
    if (!query) return undefined

    return await this.#htmlSearchResultFetch(query, {
      ...this.searchOptions,
      ...searchOptions,
    })
      .then((cookedData) => {
        if (!cookedData?.length) return undefined
        return cookedData
      })
      .catch((error) => undefined)
  }

  async searchOne(query, searchOptions = this.searchOptions) {
    if (!query) return undefined
    return await this.search(query, {
      type: searchOptions?.type ?? 'video',
      limit: 1,
      htmlrequestOptions: searchOptions?.htmlrequestOptions,
      safeSearchMode: searchOptions?.safeSearchMode ?? false,
    })
      .then((cookedData) => {
        if (!cookedData?.length) return undefined
        return cookedData[0]
      })
      .catch(() => undefined)
  }

  async safeSearch(query, searchOptions = this.searchOptions) {
    if (!query) return undefined
    return await this.search(query, {
      type: searchOptions?.type ?? 'video',
      limit: searchOptions?.limit ?? 1,
      htmlrequestOptions: searchOptions?.htmlrequestOptions,
      safeSearchMode: true,
    })
      .then((cookedData) => {
        if (!cookedData?.length) return undefined
        return cookedData
      })
      .catch(() => undefined)
  }

  async safeSearchOne(query, searchOptions = this.searchOptions) {
    if (!query) return undefined
    return await this.search(query, {
      type: searchOptions?.type ?? 'video',
      limit: 1,
      htmlrequestOptions: searchOptions?.htmlrequestOptions,
      safeSearchMode: true,
    })
      .then((cookedData) => {
        if (!cookedData?.length) return undefined
        return cookedData[0]
      })
      .catch(() => undefined)
  }

  async isSafeCheck(rawUrl, searchOptions = this.searchOptions) {
    let cookedUrl
    if (rawUrl instanceof YoutubeVideo) cookedUrl = rawUrl.url
    else if (typeof rawUrl === 'string') cookedUrl = rawUrl
    else
      throw TypeError(
        'Invalid rawUrl is Detected for Safe Check: "Only needs Video URls to check"',
      )

    if (Utils.youtubeUrlParseHtmlSearch(cookedUrl)?.contentType !== 'video')
      throw TypeError(
        'Invalid rawUrl is Detected for Safe Check: "Only needs Video URls to check"',
      )
    return await this.safeSearchOne(cookedUrl, {
      type: 'video',
      htmlrequestOptions: searchOptions?.htmlrequestOptions,
    })
      .then((cookedData) => {
        if (!cookedData) return false
        else return true
      })
      .catch(() => false)
  }

  async getVideo(rawUrl, searchOptions = this.searchOptions) {
    let cookedUrl
    if (rawUrl instanceof YoutubeVideo) cookedUrl = rawUrl.url
    else if (typeof rawUrl === 'string') cookedUrl = rawUrl
    else
      throw TypeError(
        'Invalid rawUrl is Detected for Safe Check: "Only needs Video URls to check"',
      )

    if (Utils.youtubeUrlParseHtmlSearch(cookedUrl)?.contentType !== 'video')
      throw TypeError(
        'Invalid rawUrl is Detected for Safe Check: "Only needs Video URls to check"',
      )

    return Utils.hardHTMLSearchfetch(
      await Utils.getHtmlData(
        `${cookedUrl}&hl=en`,
        searchOptions?.requestOptions,
      ),
      'video',
    )
  }

  async #htmlSearchResultFetch(rawQuery, searchOptions) {
    if (!rawQuery) return void null
    if (
      !['all', 'channel', 'video', 'playlist', 'query'].includes(
        searchOptions?.type?.toLowerCase()?.trim(),
      )
    )
      return undefined
    const cookedQuery = Utils.youtubeUrlParseHtmlSearch(rawQuery)
    if (!cookedQuery?.parsedData) return undefined
    const rawFilter =
      searchOptions?.type?.toLowerCase()?.trim() === 'all'
        ? ''
        : `&sp=${Utils.htmlFilterParser(
          searchOptions?.type?.toLowerCase()?.trim(),
        )}`

    const htmlgetUrl =
      `${enumData.HTML_BASE_SEARCH_QUERY_URL}?q=${encodeURIComponent(
        cookedQuery?.parsedData?.trim(),
      ).replace(/%20/g, '+')}` +
      '&hl=en' +
      `${rawFilter}`

    const htmlOptions = searchOptions?.safeSearchMode
      ? {
        ...searchOptions.htmlrequestOptions,
        headers: { cookie: enumData?.HTML_SAFE_SEARCH_COOKIE },
      }
      : {
        headers: {
          'User-Agent':
              'Mozilla/5.0 (Windows NT 10.0; rv:78.0) Gecko/20100101 Firefox/78.0',
        },
      }
    const rawHtmlData = await Utils.getHtmlData(htmlgetUrl, htmlOptions)
    return Utils.parseHtmlSearchResults(rawHtmlData, searchOptions)
  }
}

module.exports = YoutubeAPI
