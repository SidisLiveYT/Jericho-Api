const { enumData } = require('../../types/interfaces')

class YoutubeThumbnail {
  constructor(cookedHtmlData) {
    this.#__parse(cookedHtmlData)
  }

  #__parse(cookedHtmlData) {
    if (!cookedHtmlData) return undefined

    this.thumbnailId = cookedHtmlData.thumbnailId || null
    this.width = cookedHtmlData.width ?? 0
    this.height = cookedHtmlData.height ?? 0
    this.url = cookedHtmlData.url ?? undefined

    return undefined
  }

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

  defaultThumbnailURL(thumbnailId = '0') {
    if (!thumbnailId) thumbnailId = '0'
    if (!['0', '1', '2', '3', '4'].includes(thumbnailId))
      throw new Error(`Invalid Thumbnail Id is Detected: "${thumbnailId}"`)
    return `${enumData.HTML_YOUTUBE_THUMBNAIL_BASE_URL}${this.thumbnailId}/${thumbnailId}.jpg`
  }

  toString() {
    return this.url ? `${this.url}` : undefined
  }

  toJSON() {
    if (!this.thumbnailId) return undefined
    return {
      thumbnailId: this.thumbnailId,
      width: this.width,
      height: this.height,
      url: this.url,
    }
  }

  get type() {
    if (!this.thumbnailId) return undefined
    return 'thumbnail'
  }
}

module.exports = YoutubeThumbnail
