const Utils = require('../Utils/Youtube-Utils.js')
const { enumData, searchOptions } = require('../types/interfaces.js')
const YoutubeVideo = require('../Structures/Youtube-Elements/video-element')
const YoutubeChannel = require('../Structures/Youtube-Elements/channel-element.js')
const YoutubePlaylist = require('../Structures/Youtube-Elements/playlist-element.js')

/**
 * @class YoutubeApiLTE -> Custom Youtube API and not related to Official Youtube API | Though <Class>.<methods> fetches from Actual Youtube Page and Parses the Whole HTML Source Code from Request and returns Value .
 *  ### We Developers are not Responsible for the Data used by Someone else for any legal/illegal means returned by our Package/Repo
 */

class YoutubeApiLTE {
  /**
   * @constructor
   * @param {searchOptions} searchOptions -> Youtube Search Options for Request Module and Filter Parsing Sections
   */

  constructor(searchOptions) {
    /**
     * @type {searchOptions} searchOptions -> Youtube Search Options for Request Module and Filter Parsing Sections
     */
    this.searchOptions = { type: 'all', ...searchOptions }
  }

  /**
   * @method search() -> Normal Search Method for Youtube with "https://www.youtube.com/results" as Base Search Query Url and fetches data given by Youtube
   * @param {string | YoutubeChannel | YoutubePlaylist | YoutubeVideo } rawQuery Raw Query like Url , Youtube Ids or instance of YoutubeVideo | <YoutubeApiLTE>.validate() will Validate the value to Request
   * @param {searchOptions} searchOptions Youtube Search Options for Request Module and Filter Parsing Sections
   * @returns {Promise<YoutubeVideo[] | YoutubePlaylist[] | YoutubeChannel[] | void>} Returns Array of Youtube Video/Playlist/Channel Based on Client's requested searchOptions.type> value
   */

  async search(rawQuery, searchOptions = this.searchOptions) {
    const validationData = await this.validate(rawQuery)
    if (!rawQuery || !validationData)
      throw TypeError(
        'Invalid Query is Detected for Safe Check: "Only needs Youtube URLs or Ids for: <YoutubeApiLTE>.search()"',
      )

    return await this.#htmlSearchResultFetch(
      validationData?.type === 'query' ? rawQuery : validationData?.url,
      {
        ...this.searchOptions,
        ...searchOptions,
      },
    )
      .then((cookedData) => {
        if (!cookedData?.length) return undefined
        return cookedData
      })
      .catch((error) => {
        console.log(error)
        return undefined
      })
  }

  /**
   * @method searchOne() -> Search One Specific Data in Search Query Result
   * @param {string | YoutubeChannel | YoutubePlaylist | YoutubeVideo } rawQuery Raw Query like Url , Youtube Ids or instance of YoutubeVideo | <YoutubeApiLTE>.validate() will Validate the value to Request
   * @param {searchOptions} searchOptions Youtube Search Options for Request Module and Filter Parsing Sections
   * @returns {Promise<YoutubeVideo | YoutubePlaylist | YoutubeChannel | void>} Returns  Youtube Video/Playlist/Channel Based on Client's requested searchOptions.type> value
   */

  async searchOne(rawQuery, searchOptions = this.searchOptions) {
    if (!rawQuery) return undefined
    return await this.search(rawQuery, {
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

  /**
   * @method safeSearch() -> Safe Search Mode Function where "safeSearchMode" will be enabled by default
   * @param {string | YoutubeChannel | YoutubePlaylist | YoutubeVideo } rawQuery Raw Query like Url , Youtube Ids or instance of YoutubeVideo | <YoutubeApiLTE>.validate() will Validate the value to Request
   * @param {searchOptions} searchOptions Youtube Search Options for Request Module and Filter Parsing Sections
   * @returns {Promise<YoutubeVideo[] | YoutubePlaylist[] | YoutubeChannel[] | void>} Returns Array of Youtube Video/Playlist/Channel Based on Client's requested searchOptions.type> value
   */

  async safeSearch(rawQuery, searchOptions = this.searchOptions) {
    if (!rawQuery) return undefined
    return await this.search(rawQuery, {
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

  /**
   * @method safeSearchOne() -> Safe Search Mode Function where "safeSearchMode" will be enabled by default and Fetches 1 Value as its Answer
   * @param {string | YoutubeChannel | YoutubePlaylist | YoutubeVideo } rawQuery Raw Query like Url , Youtube Ids or instance of YoutubeVideo | <YoutubeApiLTE>.validate() will Validate the value to Request
   * @param {searchOptions} searchOptions Youtube Search Options for Request Module and Filter Parsing Sections
   * @returns {Promise<YoutubeVideo | YoutubePlaylist | YoutubeChannel | void>} Returns  Youtube Video/Playlist/Channel Based on Client's requested searchOptions.type> value
   */

  async safeSearchOne(rawQuery, searchOptions = this.searchOptions) {
    if (!rawQuery) return undefined
    return await this.search(rawQuery, {
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

  /**
   * @method isSafeCheck() -> Safe Function check for Youtube Video as its primary scope and returns boolean as "true" or "false"
   * @param {string | YoutubeChannel | YoutubePlaylist | YoutubeVideo } rawUrl Raw Query like Url , Youtube Ids or instance of YoutubeVideo | <YoutubeApiLTE>.validate() will Validate the value to Request
   * @param {searchOptions} searchOptions Youtube Search Options for Request Module and Filter Parsing Sections
   * @returns {Promise<Boolean | void> | void} Returns Boolean Value for if its safe to use or not
   */

  async isSafeCheck(rawUrl, searchOptions = this.searchOptions) {
    let cookedUrl
    if (rawUrl instanceof YoutubeVideo) cookedUrl = rawUrl.url
    else if (typeof rawUrl === 'string') cookedUrl = rawUrl
    else
      throw TypeError(
        'Invalid rawUrl is Detected for Safe Check: "Only needs Video URls to check"',
      )
    if (
      Utils.youtubeUrlParseHtmlSearch(cookedUrl)?.contentType !== 'video' &&
      Utils.youtubeUrlParseHtmlSearch(cookedUrl)?.contentType !== 'videoId'
    )
      throw TypeError(
        'Invalid rawUrl is Detected for Safe Check: "Only needs Video URls to check"',
      )
    return await this.safeSearchOne(
      Utils.youtubeUrlParseHtmlSearch(cookedUrl)?.parsedUrl,
      {
        type: 'video',
        htmlrequestOptions: searchOptions?.htmlrequestOptions,
      },
    )
      .then((cookedData) => {
        if (cookedData || (Array.isArray(cookedData) && cookedData?.[0]))
          return true
        else return false
      })
      .catch(() => false)
  }

  /**
   * @method getVideo() -> Fetches Only Video and Fetches Data from Video's Official Page for correct and more valuable Data to Fetch
   * @param {string | YoutubeChannel | YoutubePlaylist | YoutubeVideo } rawUrl Raw Query like Url , Youtube Ids or instance of YoutubeVideo | <YoutubeApiLTE>.validate() will Validate the value to Request
   * @param {searchOptions} searchOptions Youtube Search Options for Request Module and Filter Parsing Sections
   * @returns {Promise<YoutubeVideo | void> | void} Returns Youtube Video Data or undefined on failure
   */

  async getVideo(rawUrl, searchOptions = this.searchOptions) {
    const validationData = await this.validate(
      rawUrl,
      searchOptions?.safeSearchMode,
    )
    if (
      !rawUrl ||
      !validationData ||
      validationData?.type !== 'video' ||
      (validationData?.type === 'video' &&
        searchOptions?.safeSearchMode &&
        !validationData?.isSafeCheck)
    )
      throw TypeError(
        'Invalid rawUrl is Detected for Safe Check: "Only needs Video URls or Video IDs to check"',
      )

    return Utils.hardHTMLSearchparse(
      await Utils.getHtmlData(
        `${validationData.url}&hl=en`,
        searchOptions?.requestOptions,
      ),
      'video',
    )
  }

  /**
   * @method getPlaylist() -> Fetches Playlist Data from Playlist Url or Id and Fetches Data from Actual Playlist Page
   * @param {string | YoutubeChannel | YoutubePlaylist | YoutubeVideo } rawUrl Raw Query like Url , Youtube Ids or instance of YoutubeVideo | <YoutubeApiLTE>.validate() will Validate the value to Request
   * @param {searchOptions} searchOptions Youtube Search Options for Request Module and Filter Parsing Sections
   * @returns {Promise<YoutubePlaylist | void> | void} Returns Youtube Playlist Data or undefined on failure
   */

  async getPlaylist(rawUrl, searchOptions = this.searchOptions) {
    const validationData = await this.validate(
      rawUrl,
      searchOptions?.safeSearchMode,
    )
    if (
      validationData?.type !== 'playlist' ||
      (validationData?.type === 'playlist' &&
        searchOptions?.safeSearchMode &&
        !validationData?.isSafeCheck)
    )
      throw TypeError(
        'Invalid rawUrl is Detected for Safe Check: "Only needs Playlist URls or Playlist IDs to check"',
      )

    return Utils.hardHTMLSearchparse(
      await Utils.getHtmlData(
        `${validationData.url}&hl=en`,
        searchOptions?.requestOptions,
      ),
      'playlist',
      searchOptions?.limit ?? 0,
    )
  }

  /**
   *
   * @param {string | YoutubeChannel | YoutubePlaylist | YoutubeVideo } rawUrl Raw Query like Url , Youtube Ids or instance of YoutubeVideo | <YoutubeApiLTE>.validate() will Validate the value to Request
   * @param {string | void} safeSearchMode Youtube Search Options for Request Module and Filter Parsing Sections
   * @returns
   */

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

    const cookedData = Utils.youtubeUrlParseHtmlSearch(cookedUrl)
    if (typeof cookedUrl === 'string' && cookedData?.contentType === 'query') {
      return {
        Id: cookedUrl,
        url: cookedData.parsedUrl,
        type: 'query',
        isSafeCheck: true,
      }
    } else if (
      (typeof cookedUrl === 'string' && cookedData?.contentType === 'video') ||
      cookedData?.contentType === 'videoId'
    ) {
      return {
        Id: cookedData?.parsedData?.trim(),
        url: cookedData?.parsedUrl,
        type: 'video',
        isSafeCheck: safeSearchMode
          ? await this.isSafeCheck(cookedData.parsedUrl)
          : undefined,
      }
    } else if (
      (typeof cookedUrl === 'string' &&
        cookedData?.contentType === 'playlist') ||
      cookedData?.contentType === 'playlistId'
    ) {
      return {
        Id: cookedData?.parsedData?.trim(),
        url: cookedData?.parsedUrl,
        type: 'playlist',
        isSafeCheck: true,
      }
    } else return undefined
  }

  async #htmlSearchResultFetch(rawQuery, searchOptions) {
    if (!rawQuery) return undefined
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
    return Utils.parseHtmlSearchResults(
      await Utils.getHtmlData(htmlgetUrl, htmlOptions),
      searchOptions,
    )
  }
}

module.exports = YoutubeApiLTE
