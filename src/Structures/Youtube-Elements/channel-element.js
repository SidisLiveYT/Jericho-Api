const { enumData } = require('../../types/interfaces')

/**
 * @class YoutubeChannel -> Youtube Channel Type Class for making instance
 */
class YoutubeChannel {
  /**
   * @constructor
   * @param {JSON} cookedHtmlData Cooked Json formated Data for parsing into instance
   */
  constructor(cookedHtmlData) {
    this.#__parse(cookedHtmlData)
  }

  /**
   * @private
   * @method #__parse() -> Parsing Raw Json Formated Given Value to YoutubeChannel Instance
   * @param {JSON} cookedHtmlData Cooked Json formated Data for parsing into instance
   * @returns {void} Returns undefined after Parsing
   */

  #__parse(cookedHtmlData) {
    if (!cookedHtmlData) return undefined
    this.name = cookedHtmlData?.name ?? undefined
    this.verified = !!cookedHtmlData?.verified ?? false
    this.channelId = cookedHtmlData?.channelId ?? undefined
    this.icon = cookedHtmlData?.icon?.url
      ? {
        url: cookedHtmlData?.icon?.url?.startsWith('//')
          ? cookedHtmlData?.icon?.url?.replace('//', 'https://')
          : cookedHtmlData?.icon?.url,
        width: cookedHtmlData?.icon?.width,
        height: cookedHtmlData?.icon?.height,
      }
      : undefined ?? {
        url:
            typeof cookedHtmlData?.icon === 'string'
              ? cookedHtmlData?.icon
              : undefined,
        width: 0,
        height: 0,
      }
    this.subscribers = cookedHtmlData?.subscribers ?? undefined
    this.url = `${enumData.HTML_YOUTUBE_CHANNEL_BASE_URL}${this.channelId}`

    return undefined
  }

  /**
   * @method iconURL() -> iconUrl Data Parsing from iconSize
   * @param {number | void | '0'} iconSize Numeric Value for iconURL Data
   * @returns {string | void} Returns String as Url or undefined on failure
   */
  iconURL(iconSize = 0) {
    if (typeof iconSize !== 'number' || iconSize < 0)
      throw new Error('Invalid icon-size is Detected for IconUrl')
    if (!this?.icon?.url) return null
    const defaultSize = this.icon.url.split('=s')[1].split('-c')[0]
    return this.icon.url.replace(`=s${defaultSize}-c`, `=s${iconSize}-c`)
  }

  /**
   * @method toString() -> String value of instance's Channel name
   * @returns {string} returns string name
   */

  toString() {
    return this.name ?? undefined
  }

  /**
   * @method toJSON() -> JSON Formated from raw instance properties
   * @returns {JSON} Returns Json Formated Value
   */

  toJSON() {
    return {
      name: this.name,
      verified: this.verified,
      channelId: this.channelId,
      url: this.url,
      iconURL: this.iconURL(),
      type: this.type,
      subscribers: this.subscribers,
    }
  }

  /**
   * @type {string | void} return type of instance
   */
  get type() {
    if (!this.channelId) return undefined
    return 'channel'
  }
}

module.exports = YoutubeChannel
