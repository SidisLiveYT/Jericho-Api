const { enumData } = require('../../types/interfaces')
const Utils = require('../../Utils/Youtube-Utils')

class YoutubePlaylist {
  constructor(cookedHtmlData, forceHtmlSearchResult = false) {
    if (!cookedHtmlData)
      throw new Error(
        `Cannot Making up the "${this.constructor.name}" class without "cookedHtmlData"`,
      )
    if (forceHtmlSearchResult) this.#__parseSearchResults(cookedHtmlData)
    else this.#__parse(cookedHtmlData)
  }

  toJSON() {
    return {
      playlistId: this.playlistId,
      name: this.name,
      thumbnail: this.thumbnail.toJSON(),
      channel: {
        name: this.channel.name,
        id: this.channel.id,
        icon: this.channel.iconURL(),
      },
      url: this.url,
      videos: this.videos,
    }
  }

  #__parse(cookedHtmlData) {
    this.playlistId = cookedHtmlData.playlistId ?? undefined
    this.name = cookedHtmlData.name ?? undefined
    this.videoCount = cookedHtmlData.videoCount ?? 0
    this.lastUpdate = cookedHtmlData.lastUpdate ?? undefined
    this.views = cookedHtmlData.views ?? 0
    this.url = cookedHtmlData.url ?? undefined
    this.link = cookedHtmlData.link ?? undefined
    this.channel = cookedHtmlData.author ?? undefined
    this.thumbnail = cookedHtmlData.thumbnail ?? undefined
    this.videos = cookedHtmlData.videos ?? []
    this._continuation = {
      api: cookedHtmlData.continuation?.api ?? undefined,
      token: cookedHtmlData.continuation?.token ?? undefined,
      clientVersion:
        cookedHtmlData.continuation?.clientVersion ?? '<important data>',
    }

    return undefined
  }

  #__parseSearchResults(cookedHtmlData) {
    this.playlistId = cookedHtmlData.playlistId ?? undefined
    this.name = cookedHtmlData.name ?? undefined
    this.thumbnail = cookedHtmlData.thumbnail ?? undefined
    this.channel = cookedHtmlData.channel ?? undefined
    this.videos = []
    this.videoCount = cookedHtmlData.videos ?? 0
    this.url = this.playlistId
      ? `${enumData.HTML_YOUTUBE_PLAYLIST_BASE_URL}${this.playlistId}`
      : null
    this.link = undefined
    this.lastUpdate = undefined
    this.views = 0

    return undefined
  }

  async next(limit = Infinity) {
    if (!this._continuation?.token) return []

    const rawhtmlNextPage = await Utils.getHtmlData(
      `${enumData.BASE_HTML_YOUTUBE_API_URL}${this._continuation.api}`,
      {
        body: JSON.stringify({
          continuation: this._continuation.token,
          context: {
            client: {
              utcOffsetMinutes: 0,
              gl: 'US',
              hl: 'en',
              clientName: 'WEB',
              clientVersion: this._continuation.clientVersion,
            },
            user: {},
            request: {},
          },
        }),
      },
      'POST',
    )
    if (!rawhtmlNextPage) return []
    try {
      const contents = JSON.parse(rawhtmlNextPage)?.onResponseReceivedActions[0]
        ?.appendContinuationItemsAction?.continuationItems
      if (!contents) return []
      const cookedVideos = Utils.getHtmlSearchVideos(contents, limit)
      this._continuation.token = Utils.getHtmlcontinuationToken(contents)
      this.videos = [...this.videos, ...cookedVideos]

      return cookedVideos
    } catch {
      return []
    }
  }

  async fetchAll(fetchCount = Infinity) {
    if (!this._continuation?.token) return this
    if (fetchCount < 1)
      throw TypeError(`Invalid Fetch Video Count is Detected: '${fetchCount}'`)

    while (
      typeof this._continuation?.token === 'string' &&
      this._continuation?.token?.length > 0
    ) {
      if (this.videos?.length >= fetchCount) break
      const response = await this.next()
      if (!response?.length) break
    }
    return this
  }

  get type() {
    if (!this.channelId) return undefined
    return 'playlist'
  }
}

module.exports = YoutubePlaylist
