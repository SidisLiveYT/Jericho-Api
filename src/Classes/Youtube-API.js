const Utils = require('../Utils/Youtube-Utils.js')
const { enumData } = require('../types/interfaces.js')
const YoutubeVideo = require('../Structures/Youtube-Elements/video-element')
const YoutubeChannel = require('../Structures/Youtube-Elements/channel-element.js')
const YoutubePlaylist = require('../Structures/Youtube-Elements/playlist-element.js')

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
      .catch((error) => {
        console.log(error)
        return undefined
      })
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
    const validationData = await this.validate(
      rawUrl,
      searchOptions?.safeSearchMode,
    )
    if (
      validationData?.type !== 'video' ||
      (validationData?.type === 'video' &&
        searchOptions?.safeSearchMode &&
        !validationData?.isSafeCheck)
    )
      throw TypeError(
        'Invalid rawUrl is Detected for Safe Check: "Only needs Video URls to check"',
      )

    return Utils.hardHTMLSearchparse(
      await Utils.getHtmlData(
        `${validationData.url}&hl=en`,
        searchOptions?.requestOptions,
      ),
      'video',
    )
  }

  async validate(rawData, safeSearchMode = false) {
    let cookedUrl
    if (!rawData) return undefined
    else if (
      rawData instanceof YoutubeVideo ||
      rawData instanceof YoutubeChannel ||
      rawData instanceof YoutubePlaylist
    )
      cookedUrl = rawData.url
    else if (typeof rawData === 'string') cookedUrl = rawData.trim()
    else return undefined

    const parsedData = Utils.youtubeUrlParseHtmlSearch(cookedUrl)
    if (typeof cookedUrl === 'string' && parsedData?.contentType === 'query') {
      return {
        Id: cookedUrl,
        url: parsedData.parsedUrl,
        type: 'query',
        isSafeCheck: true,
      }
    } else if (
      (typeof cookedUrl === 'string' &&
        Utils.youtubeUrlParseHtmlSearch(cookedUrl)?.contentType === 'video') ||
      Utils.youtubeUrlParseHtmlSearch(cookedUrl)?.contentType === 'videoId'
    ) {
      return {
        Id: Utils.youtubeUrlParseHtmlSearch(cookedUrl)?.parsedData?.trim(),
        url: parsedData.parsedUrl,
        type: 'video',
        isSafeCheck: safeSearchMode
          ? await this.isSafeCheck(
            enumData.HTML_YOUTUBE_VIDEO_BASE_URL + cookedUrl,
          )
          : undefined,
      }
    } else if (
      typeof cookedUrl === 'string' &&
      Utils.youtubeUrlParseHtmlSearch(cookedUrl)?.contentType === 'playlist'
    ) {
      return {
        Id: Utils.youtubeUrlParseHtmlSearch(cookedUrl)?.parsedData?.trim(),
        url: parsedData.parsedUrl,
        type: 'playlist',
        isSafeCheck: true,
      }
    } else return undefined
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
    if (!cookedQuery?.parsedData || !cookedQuery.searchQueryUrl)
      return undefined

    const htmlgetUrl =
      `${cookedQuery?.searchQueryUrl}` +
      '&hl=en' +
      `${Utils.htmlSearchrawFilterParser(
        searchOptions?.type?.toLowerCase()?.trim(),
      )}`

    const htmlOptions = searchOptions?.safeSearchMode
      ? {
        ...searchOptions.htmlrequestOptions,
        headers: { cookie: enumData?.HTML_SAFE_SEARCH_COOKIE_VALUE },
      }
      : {
        headers: enumData.HTML_YOUTUBE_HEADER_DATA,
        ...searchOptions.htmlrequestOptions,
      }
    const rawHtmlData = await Utils.getHtmlData(htmlgetUrl, htmlOptions)
    return Utils.parseHtmlSearchResults(rawHtmlData, searchOptions)
  }
}

module.exports = YoutubeAPI
