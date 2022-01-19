const { enumData, searchOptions } = require('../../types/interfaces')
const Utils = require('../../Utils/Youtube-Utils.js')
const YoutubeChannel = require('./channel-element')
const YoutubeThumbnail = require('./thumbnail-element')
const YoutubeVideo = require('./video-element')

/**
 * @class YoutubePlaylist -> Youtube Playlist for Generating Playlist Instance for Results
 */

class YoutubePlaylist {
  #continuation = undefined

  #remainingParsedvideos = undefined

  /**
   * @constructor
   * @param {Object} cookedHtmlData Actual Structured Data for Parsing into Playlist Instance
   * @param {boolean | void} forceHtmlSearchResult Force Boolean Parsing check for "Search Query Result's Parsing"
   * @param {number | void | 'Infinity'} limit Numerical Limit Value for Parsing Playlist Videos if required
   */

  constructor(cookedHtmlData, forceHtmlSearchResult = false, limit = Infinity) {
    if (!cookedHtmlData)
      throw new Error(
        `Cannot Making up the "${this.constructor.name}" class without "cookedHtmlData"`,
      )
    if (forceHtmlSearchResult) this.#__parseSearchResults(cookedHtmlData)
    else this.#__parse(cookedHtmlData, limit)
  }

  /**
   * @method next() -> Fetches Next List of Playlist Videos from Token and Default Youtube API
   * @param {number | void | 'Infinity'} limit Numerical Limit Value for Parsing Playlist Videos if required
   * @returns {Promise<YoutubeVideo[] | []> | []} Returns Array of Youtube Video
   */
  async next(limit = Infinity) {
    const cookedVideos = [
      ...this.#parseContainedVideos(undefined, undefined, true),
    ]
    if (
      !this.#continuation?.token &&
      cookedVideos &&
      Array.isArray(cookedVideos) &&
      cookedVideos.length > 0
    ) {
      this.videos = [...this.videos, ...cookedVideos]
      return cookedVideos ?? []
    }

    const rawhtmlNextPage = await Utils.getHtmlData(
      `${enumData.BASE_HTML_YOUTUBE_API_URL}${this.#continuation.api}`,
      {
        body: JSON.stringify({
          continuation: this.#continuation.token,
          context: {
            client: {
              utcOffsetMinutes: 0,
              gl: 'US',
              hl: 'en',
              clientName: 'WEB',
              clientVersion: this.#continuation.clientVersion,
            },
            user: {},
            request: {},
          },
        }),
      },
      'POST',
    )
    if (!rawhtmlNextPage) return cookedVideos ?? []
    try {
      const contents = JSON.parse(rawhtmlNextPage)?.onResponseReceivedActions[0]
        ?.appendContinuationItemsAction?.continuationItems
      if (!contents) return []

      this.videos = [
        ...this.videos,
        ...cookedVideos,
        ...Utils.getHtmlSearchVideos(contents, limit),
      ]
      this.#continuation.token = Utils.getHtmlcontinuationToken(contents)
      return cookedVideos ?? []
    } catch {
      return cookedVideos ?? []
    }
  }

  /**
   * @method fetchAll() -> Fetching all Videos from Youtube | Can take more time based on videocount
   * @param {number | void | 'Infinity'} fetchCount Numerical Fetch-Count Value for Parsing Playlist Videos
   * @returns {Promise<YoutubePlaylist>} Returns the Youtube Playlist Default Instance but with altered and fetched data
   */

  async fetchAll(fetchCount = Infinity) {
    if (!this.#continuation?.token && this.#parseContainedVideos()?.length <= 0)
      return this

    if (fetchCount < 1)
      throw TypeError(`Invalid Fetch Video Count is Detected: '${fetchCount}'`)

    do {
      if (this.videos?.length >= fetchCount) break
      const response = await this.next()
      if (!response?.length) break
    } while (
      typeof this.#continuation?.token === 'string' &&
      this.#continuation?.token?.length > 0
    )
    return this
  }

  /**
   * @method toJSON() -> Json Representation of Youtube Playlist
   * @returns {JSON<YoutubePlaylist>} Returns Json Representation of Youtube Playlist
   */

  toJSON() {
    return {
      playlistId: this.playlistId,
      name: this.name,
      thumbnail: this.thumbnail?.toJSON(),
      channel: this.channel?.toJSON(),
      url: this.url,
      videos: this.videos,
    }
  }

  /**
   * @private
   * @method #__parse() -> parsing of raw JSON formated Youtube Playlist Data
   * @param {Object} cookedHtmlData Actual Structured Data for Parsing into Playlist Instance
   * @param {number | void | 'Infinity'} limit Numerical Limit Value for Parsing Playlist Videos if required
   * @returns {void} Returns undefined because its used for Parsing and patch data with <YoutubePlaylist> Instance
   */

  #__parse(cookedHtmlData, limit = Infinity) {
    this.playlistId = cookedHtmlData.playlistId ?? undefined
    this.name = cookedHtmlData.title ?? cookedHtmlData.name ?? undefined
    this.videoCount = cookedHtmlData.videoCount ?? 0
    this.lastUpdate = cookedHtmlData.lastUpdate ?? undefined
    this.views = cookedHtmlData.views ?? 0
    this.url = cookedHtmlData.url ?? undefined
    this.previewLink =
      cookedHtmlData.previewLink ?? cookedHtmlData.link ?? undefined
    this.channel = new YoutubeChannel(
      cookedHtmlData.channel ?? cookedHtmlData.author ?? undefined,
    )
    this.thumbnail = new YoutubeThumbnail(cookedHtmlData.thumbnail ?? undefined)
    this.videos = this.#parseContainedVideos(cookedHtmlData.videos ?? [], limit)
    this.#continuation = {
      api: cookedHtmlData.continuation?.api ?? undefined,
      token: cookedHtmlData.continuation?.token ?? undefined,
      clientVersion:
        cookedHtmlData.continuation?.clientVersion ?? '<important data>',
    }

    return undefined
  }

  /**
   * @private
   * @method #__parseSearchResults() -> parsing of raw JSON formated Youtube Playlist Data
   * @param {Object} cookedHtmlData Actual Structured Data for Parsing into Playlist Instance
   * @returns {void} Returns undefined because its used for Parsing and patch data with <YoutubePlaylist> Instance
   */

  #__parseSearchResults(cookedHtmlData) {
    this.playlistId = cookedHtmlData.playlistId ?? undefined
    this.name = cookedHtmlData.title ?? cookedHtmlData.name ?? undefined
    this.thumbnail = new YoutubeThumbnail(cookedHtmlData.thumbnail ?? undefined)
    this.channel = new YoutubeChannel(
      cookedHtmlData.channel ?? cookedHtmlData.author ?? undefined,
    )
    this.videos = []
    this.videoCount = cookedHtmlData.videos ?? 0
    this.url = this.playlistId
      ? `${enumData.HTML_YOUTUBE_PLAYLIST_BASE_URL}${this.playlistId}`
      : null
    this.previewLink =
      cookedHtmlData?.previewLink ?? cookedHtmlData?.link ?? undefined
    this.lastUpdate = undefined
    this.views = 0

    return undefined
  }

  /**
   * @private
   * @method #parseContainedVideos() -> parsing and storing rest remaining videos to private | cleaning of remaining if requested
   * @param {YoutubeVideo[] | void} rawVideos Raw Youtube Video Data in Array to Parse
   * @param {number | void | 'Infinity'} limit Numerical Limit Value for Parsing Playlist Videos if required
   * @param {boolean | void | 'false'} clearRemaining If Clearing Cache comes in boolean as answer
   * @returns {YoutubeVideo[] | void} Returns Array of Youtube Videos or undefined on failure
   */

  #parseContainedVideos(rawVideos, limit = Infinity, clearRemaining = false) {
    if (!(rawVideos && Array.isArray(rawVideos) && rawVideos.length > 0)) {
      const cachedGarbage = this.#remainingParsedvideos ?? []
      clearRemaining ? (this.#remainingParsedvideos = undefined) : undefined
      return cachedGarbage ?? []
    }
    const filteredVideos = []
    for (let count = 0, len = rawVideos.length; count < len; count++) {
      if (limit <= count) {
        this.#remainingParsedvideos = rawVideos.slice(count)
        break
      } else filteredVideos.push(rawVideos[count])
    }
    return filteredVideos ?? []
  }

  /**
   * @type {string} type -> returns instance type
   */
  get type() {
    if (!this.playlistId) return undefined
    return 'playlist'
  }
}

module.exports = YoutubePlaylist
