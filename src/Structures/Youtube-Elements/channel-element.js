const { enumData } = require('../../types/interfaces')

class YoutubeChannel {
  constructor(cookedHtmlData) {
    this.#__parse(cookedHtmlData)
  }

  #__parse(cookedHtmlData) {
    if (!cookedHtmlData) return undefined
    this.name = cookedHtmlData?.name ?? undefined
    this.verified = !!cookedHtmlData?.verified ?? false
    this.channelId = cookedHtmlData?.channelId ?? undefined
    this.icon = cookedHtmlData?.icon
      ? {
        url: cookedHtmlData?.icon?.url.startsWith('//')
          ? cookedHtmlData?.icon?.url.replace('//', 'https://')
          : cookedHtmlData?.icon?.url,
        width: cookedHtmlData?.icon?.width,
        height: cookedHtmlData?.icon?.height,
      }
      : undefined ?? { url: undefined, width: 0, height: 0 }
    this.subscribers = cookedHtmlData?.subscribers ?? undefined
    this.url = `${enumData.HTML_YOUTUBE_CHANNEL_BASE_URL}${this.channelId}`

    return undefined
  }

  iconURL(iconSize = 0) {
    if (typeof iconSize !== 'number' || iconSize < 0)
      throw new Error('Invalid icon-size is Detected for IconUrl')
    if (!this.icon.url) return null
    const defaultSize = this.icon.url.split('=s')[1].split('-c')[0]
    return this.icon.url.replace(`=s${defaultSize}-c`, `=s${iconSize}-c`)
  }

  toString() {
    return this.name || undefined
  }

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

  get type() {
    if (!this.channelId) return undefined
    return 'channel'
  }
}

module.exports = YoutubeChannel
