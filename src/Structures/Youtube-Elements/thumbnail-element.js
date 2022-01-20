const { enumData } = require('../../types/interfaces')

/**
 * @class YoutubeThumbnail -> Youtube Thumbnail based Class
 */

class YoutubeThumbnail {
  /**
   * @constructor
   * @param {JSON} cookedHtmlData Cooked Json formated Data for parsing into instance
   */
  constructor(cookedHtmlData) {
    this.#__parse(cookedHtmlData)
  }

  /**
   * @private
   * #__parse() -> Parsing Raw Json Formated Given Value to YoutubeThmbnail Instance
   * @param {JSON} cookedHtmlData Cooked Json formated Data for parsing into instance
   * @returns {void} Returns undefined after Parsing
   */
  #__parse(cookedHtmlData) {
    if (!cookedHtmlData) return undefined

    this.thumbnailId = cookedHtmlData.thumbnailId ?? null
    this.width = cookedHtmlData.width ?? 0
    this.height = cookedHtmlData.height ?? 0
    this.url = cookedHtmlData.url ?? undefined

    return undefined
  }

  /**
   * displayThumbnailURL() -> parsing to Custom Display Thumbnail Url
   * @param {string | void | "ultrares"} thumbnailType Youtube Thumbnail Type for Display Thumbnail Url
   * @returns {void | string} Returns Custom Display Thumbnail Url
   */

  displayThumbnailURL(thumbnailType = 'ultrares') {
    if (!this.thumbnailId) return undefined
    if (
      ![
        'default',
        'hqdefault',
        'mqdefault',
        'sddefault',
        'maxresdefault',
        'ultrares',
      ].includes(thumbnailType)
    )
      throw new Error(`Invalid Thumbnail Type is Detected: "${thumbnailType}"`)
    if (thumbnailType === 'ultrares') return this.url
    return `${enumData.HTML_YOUTUBE_THUMBNAIL_BASE_URL}${this.thumbnailId}/${thumbnailType}.jpg`
  }

  /**
   * defaultThumbnailURL() -> parsing to Custom Default Thumbnail Url
   * @param {string | void | "0"} thumbnailId Youtube Thumbnail Type for Default Thumbnail Url
   * @returns {void | string} Returns Custom Default Thumbnail Url
   */

  defaultThumbnailURL(thumbnailId = '0') {
    if (!thumbnailId) thumbnailId = '0'
    if (!['0', '1', '2', '3', '4'].includes(thumbnailId))
      throw new Error(`Invalid Thumbnail Id is Detected: "${thumbnailId}"`)
    return `${enumData.HTML_YOUTUBE_THUMBNAIL_BASE_URL}${this.thumbnailId}/${thumbnailId}.jpg`
  }

  /**
   * toString() -> String value of instance's Thumbnail url
   * @returns {string} returns string url
   */

  toString() {
    return this.url ? `${this.url}` : undefined
  }

  /**
   * toJSON() -> JSON Formated from raw instance properties
   * @returns {JSON} Returns Json Formated Value
   */

  toJSON() {
    if (!this.thumbnailId) return undefined
    return {
      thumbnailId: this.thumbnailId,
      width: this.width,
      height: this.height,
      url: this.url,
    }
  }

  /**
   * @type {string | void}
   * @readonly
   * return type of instance
   */
  get type() {
    if (!this.thumbnailId) return undefined
    return 'thumbnail'
  }
}

module.exports = YoutubeThumbnail
