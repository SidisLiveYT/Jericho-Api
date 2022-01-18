const YoutubeChannel = require('./channel-element')
const YoutubeThumbnail = require('./thumbnail-element')
const { enumData } = require('../../types/interfaces')

class YoutubeVideo {
  constructor(cookedHtmlData, initialIndex) {
    this.#__parse(cookedHtmlData, initialIndex)
  }

  #__parse(cookedHtmlData, initialIndex) {
    if (!cookedHtmlData) return undefined
    this.Id = initialIndex ?? cookedHtmlData.Id ?? 0
    this.videoId = cookedHtmlData.videoId ?? undefined
    this.title = cookedHtmlData.title ?? undefined
    this.description = cookedHtmlData.description ?? undefined
    this.duration_raw = cookedHtmlData.duration_raw ?? '0:00'
    this.duration =
      (cookedHtmlData.duration < 0 ? 0 : cookedHtmlData.duration) ?? 0
    this.url = `${enumData.HTML_YOUTUBE_VIDEO_BASE_URL}${this.videoId}`
    this.uploadedAt = cookedHtmlData.uploadedAt ?? undefined
    this.views = parseInt(cookedHtmlData.views) ?? 0
    this.thumbnail = new YoutubeThumbnail(cookedHtmlData.thumbnail ?? undefined)
    this.channel = new YoutubeChannel(cookedHtmlData.channel ?? undefined)
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
    this.suggestionVideos = cookedHtmlData?.videos || []

    return undefined
  }

  embedHTML(options = { id: 'ytplayer', width: 640, height: 360 }) {
    if (!this.videoId) return undefined
    return `<iframe title="__youtube_sr_frame__" id="${
      options.id || 'ytplayer'
    }" type="text/html" width="${options.width || 640}" height="${
      options.height || 360
    }" src="${this.embedURL}" frameborder="0"></iframe>`
  }

  fetch() {}

  toString() {
    return this.url || undefined
  }

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

  get embedURL() {
    if (!this.videoId) return null
    return `https://www.youtube.com/embed/${this.videoId}`
  }

  get type() {
    if (!this.videoId) return undefined
    return 'video'
  }
}

module.exports = YoutubeVideo
