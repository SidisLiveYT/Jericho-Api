const YoutubeChannel = require('./channel-element')
const YoutubeThumbnail = require('./thumbnail-element')
const { enumData, searchOptions } = require('../../types/interfaces')
const Utils = require('../../utils/Youtube-Utils')

/**
 * @class YoutubeVideo -> Class for Youtube Video Instance
 */

class YoutubeVideo {
  /**
   * @private
   * @property {boolean} fetchedData Fetched Data to be checked to avoid un-neccassay data fetching
   */
  #fetchedData = false

  /**
   * @constructor
   * @param {JSON} cookedHtmlData Cooked Json formated Data for parsing into instance
   * @param {number | void | "0"} initialIndex Initial index for video as Id
   * @param {boolean | void} fetchedDataBoolean if its fetched Data
   */
  constructor(cookedHtmlData, initialIndex = 0, fetchedDataBoolean = false) {
    this.#__parse(cookedHtmlData, initialIndex, fetchedDataBoolean)
  }

  /**
   * @private
   * #__parse() -> Youtube Video Parsing method for Raw Json to indiviual data properties
   * @param {JSON} cookedHtmlData Cooked Json formated Data for parsing into instance
   * @param {number | void | "0"} initialIndex Initial index for video as Id
   * @param {boolean | void} fetchedDataBoolean Boolean Value for Giving Checks for Fetched Data
   * @returns {void} Returns undefined on completion
   */
  #__parse(cookedHtmlData, initialIndex, fetchedDataBoolean = false) {
    if (!cookedHtmlData) return undefined
    this.Id = parseInt(
      initialIndex !== 0
        ? initialIndex
        : undefined ?? cookedHtmlData?.Id !== 0
          ? cookedHtmlData?.Id
          : undefined ?? 0,
    )
    this.videoId = cookedHtmlData.videoId ?? undefined
    this.title = cookedHtmlData.title ?? cookedHtmlData.name ?? undefined
    this.description = cookedHtmlData.description ?? undefined
    this.duration_raw = cookedHtmlData.duration_raw ?? '0:00'
    this.duration =
      (cookedHtmlData.duration < 0 ? 0 : cookedHtmlData.duration) ?? 0
    this.url = `${enumData.HTML_YOUTUBE_VIDEO_BASE_URL}${this.videoId}`
    this.uploadedAt = cookedHtmlData.uploadedAt ?? undefined
    this.views = parseInt(cookedHtmlData.views ?? 0) ?? 0
    this.thumbnail =
      cookedHtmlData.thumbnail instanceof YoutubeThumbnail
        ? cookedHtmlData.thumbnail
        : new YoutubeThumbnail(cookedHtmlData.thumbnail ?? undefined)
    this.channel =
      cookedHtmlData.channel instanceof YoutubeChannel
        ? cookedHtmlData.channel
        : new YoutubeChannel(cookedHtmlData.channel ?? undefined)
    this.likes = cookedHtmlData?.ratings?.likes ?? cookedHtmlData?.likes ?? 0
    this.dislikes =
      cookedHtmlData?.ratings?.dislikes ?? cookedHtmlData?.dislikes ?? 0
    this.islive =
      !!cookedHtmlData.islive ?? !!cookedHtmlData.live ?? !!cookedHtmlData.Live
    this.isprivate =
      !!cookedHtmlData.isprivate ??
      !!cookedHtmlData.private ??
      !!cookedHtmlData.Private
    this.tags = cookedHtmlData.tags ?? []
    this.suggestionVideos =
      cookedHtmlData?.videos ?? cookedHtmlData?.suggestionVideos ?? []

    this.#fetchedData = !!fetchedDataBoolean
    return undefined
  }

  /**
   * embedHTML() -> Parsing Data for Embed HTML URL
   * @param {Object} options embedHTML Options for creating the URL
   * @returns {string | void} Return embed Url on success or undefined on failure
   */

  embedHTML(options = { id: 'ytplayer', width: 640, height: 360 }) {
    if (!this.videoId) return undefined
    return `<iframe title="__youtube_wrapper_frame__" id="${
      options.id ?? 'ytplayer'
    }" type="text/html" width="${options.width ?? 640}" height="${
      options.height ?? 360
    }" src="${this.embedURL}" frameborder="0"></iframe>`
  }

  /**
   * fetch() -> Fetch Method to fetch Youtube Data Completely
   * @param {searchOptions} searchOptions Search Options for HTTP Request Options and limit
   * @param {number | void | "0"} initialIndex Initial index for video as Id
   * @returns {Promise<this>} Returns Instance but with altered and modified Data
   */

  async fetch(searchOptions = { limit: 1, type: 'video' }, initialIndex = 1) {
    if (!this.url) return undefined
    if (this.#fetchedData) return this
    searchOptions = { ...searchOptions, limit: 1 }

    const rawHtmlData = await Utils.getHtmlData(
      `${this.url}&hl=en`,
      searchOptions?.AxiosHttpRequestConfigs,
    )

    let rawJson
    let nextJsonData = {}
    try {
      const rawParsedJson = JSON.parse(
        rawHtmlData.split('var ytInitialData = ')[1].split(';</script>')[0],
      )
      rawJson =
        rawParsedJson.contents.twoColumnWatchNextResults.results.results
          .contents

      try {
        nextJsonData =
          rawParsedJson.contents.twoColumnWatchNextResults.secondaryResults
            .secondaryResults.results
      } catch {}
    } catch {
      throw new Error('Could not parse video metadata!')
    }

    const rawCachedData = {
      primary: rawJson.find((section) => 'videoPrimaryInfoRenderer' in section)
        ?.videoPrimaryInfoRenderer,
      secondary: rawJson.find(
        (section) => 'videoSecondaryInfoRenderer' in section,
      )?.videoSecondaryInfoRenderer,
    }

    let cookedJson

    try {
      cookedJson = JSON.parse(
        rawHtmlData
          .split('var ytInitialPlayerResponse = ')[1]
          .split(';</script>')[0],
      ).videoDetails
    } catch {
      cookedJson = JSON.parse(
        rawHtmlData
          .split('var ytInitialPlayerResponse = ')[1]
          .split(';var meta')[0],
      ).videoDetails
    }

    cookedJson = {
      ...rawCachedData.primary,
      ...rawCachedData.secondary,
      ...cookedJson,
    }
    if (!cookedJson?.videoId) return undefined
    this.#__parse(
      {
        videoId: cookedJson?.videoId,
        title: cookedJson?.title,
        views: parseInt(cookedJson?.viewCount) ?? 0,
        tags: cookedJson?.keywords,
        isprivate: cookedJson?.isPrivate,
        islive: cookedJson?.isLiveContent,
        duration: parseInt(cookedJson?.lengthSeconds) * 1000,
        duration_raw: Utils.parseDurationToString(
          parseInt(cookedJson?.lengthSeconds ?? 0) * 1000,
        ),
        channel: {
          name: cookedJson?.author,
          channelId: cookedJson?.channelId,
          url: `https://www.youtube.com${cookedJson?.owner?.videoOwnerRenderer?.title?.runs?.[0]?.navigationEndpoint?.browseEndpoint?.canonicalBaseUrl}`,
          icon:
            cookedJson?.owner?.videoOwnerRenderer?.thumbnail?.thumbnails?.[0],
          subscribers: cookedJson?.owner?.videoOwnerRenderer?.subscriberCountText?.simpleText?.replace(
            ' subscribers',
            '',
          ),
        },
        description: cookedJson?.shortDescription,
        thumbnail: {
          ...cookedJson?.thumbnail?.thumbnails?.pop(),
          thumbnailId: cookedJson?.videoId,
        },
        uploadedAt: cookedJson?.dateText?.simpleText,
        likes:
          parseInt(
            cookedJson?.videoActions?.menuRenderer?.topLevelButtons
              ?.find(
                (button) => button?.toggleButtonRenderer?.defaultIcon?.iconType ===
                  'LIKE',
              )
              ?.toggleButtonRenderer?.defaultText?.accessibility?.accessibilityData?.label?.split(
                ' ',
              )?.[0]
              ?.replace(/,/g, '') ?? 0,
          ) ?? 0,
        dislikes: 0,
        videos: Utils.parseExtraHtmlVideos(nextJsonData ?? {}) ?? [],
      },
      initialIndex ?? 1,
      true,
    )
    return this
  }

  /**
   * toString() -> String value of instance's Video URL
   * @returns {string} returns string URL
   */

  toString() {
    return this.url ?? undefined
  }

  /**
   * toJSON() -> JSON Formated from raw instance properties
   * @returns {JSON} Returns Json Formated Value
   */

  toJSON() {
    if (!this.videoId) return undefined
    return {
      Id: this.Id,
      videoId: this.videoId,
      url: this.url,
      title: this.title,
      description: this.description,
      duration: this.duration,
      duration_formatted: this.durationFormatted,
      uploadedAt: this.uploadedAt,
      thumbnail: this.thumbnail.toJSON(),
      channel: this.channel.toJSON(),
      views: this.views,
      type: this.type,
      tags: this.tags,
      likes: this.likes,
      dislikes: this.dislikes,
      islive: this.islive,
      isprivate: this.isprivate,
      suggestionVideos: this.suggestionVideos,
    }
  }

  /**
   * @type {string | void}
   * @readonly
   * return Embed URL
   */

  get embedURL() {
    if (!this.videoId) return null
    return `https://www.youtube.com/embed/${this.videoId}`
  }

  /**
   * @type {string | void}
   * @readonly
   * return type of instance
   */

  get type() {
    if (!this.videoId) return undefined
    return 'video'
  }
}

module.exports = YoutubeVideo
