const Axios = require('axios').default
const {
  youtubeUrlParseHtmlSearchData,
  enumData,
} = require('../types/interfaces.js')
const YoutubeVideo = require('../Structures/Youtube-Elements/video-element')
const YoutubePlaylist = require('../Structures/Youtube-Elements/playlist-element')
const YoutubeChannel = require('../Structures/Youtube-Elements/channel-element')

class Utils {
  /**
   * @method htmlFilterParser() _> parsing filter type for HTML fetch from youtbe Watch page
   * @param {string} rawFilter String value of playlist , video , channel Data
   * @returns {string | void} string value for html query search for Youtube Default Watch Page
   */
  static htmlFilterParser(rawFilter) {
    switch (rawFilter?.toLowerCase()?.trim()) {
      case 'playlist':
        return 'EgIQAw%253D%253D'
      case 'video':
        return 'EgIQAQ%253D%253D'
      case 'query':
        return 'EgIQAQ%253D%253D'
      case 'channel':
        return 'EgIQAg%253D%253D'
      default:
        throw new TypeError(
          `Invalid Search type is Detected | Value : "${rawFilter}"`,
        )
    }
  }

  /**
   * @method youtubeUrlParseHtmlSearch() -> Parsing rawUrl for Actual Regex checking list/video/channel Ids
   * @param {string} rawUrl Youtube Url or Search if any
   * @returns {youtubeUrlParseHtmlSearchData} Returns Json Format of Parsing of Youtube Url Raw Data
   */
  static youtubeUrlParseHtmlSearch(rawUrl) {
    let rawMatch = rawUrl.match(
      /^(?:\w+:)?\/\/([^\s\.]+\.\S{2}|localhost[\:?\d]*)\S*$/,
    )
    if (!rawMatch?.[1])
      return {
        parsedData: rawUrl,
        contentType: 'query',
        rawMatchData: rawMatch,
      }
    rawMatch = rawUrl.match(/[?&]list=([^#&?]+)/)
    if (rawMatch?.[1])
      return {
        parsedData: rawMatch?.[1],
        contentType: 'playlist',
        rawMatchData: rawMatch,
      }
    rawMatch = rawUrl.match(
      /(?:(?:v|vi|be|videos|embed)\/(?!videoseries)|(?:v|ci)=)([\w-]{11})/i,
    )
    if (rawMatch?.[1])
      return {
        parsedData: rawMatch?.[1],
        contentType: 'video',
        rawMatchData: rawMatch,
      }
    rawMatch = rawUrl.match(/\/channel\/([\w-]+)/)
    if (rawMatch?.[1])
      return {
        parsedData: rawMatch?.[1],
        contentType: 'channel',
        rawMatchData: rawMatch,
      }
    rawMatch = rawUrl.match(/\/(?:c|user)\/([\w-]+)/)
    if (rawMatch?.[1])
      return {
        parsedData: rawMatch?.[1],
        contentType: 'channel',
        rawMatchData: rawMatch,
      }
    else return undefined
  }

  /**
   * @method getHtmlData() -> Fetch response.text() for Parsing the Watch Page Data
   * @param {string} rawHtmlUrl Raw Youtube Get Request Url "search url query" as Defination
   * @param {Object} htmlRequestOption html get Request Options for Axios get fetch method
   * @param {string | void} method HTTP Request for Axios | Bydefault its GET Request handler
   * @returns {Promise<string|void>} returns response.text() as Data for Raw HTML Data of Youtube Watch Page
   */
  static async getHtmlData(rawHtmlUrl, htmlRequestOption, method = 'GET') {
    return new Promise(async (resolve, reject) => {
      if (method?.toLowerCase()?.trim() === 'get') {
        await Axios.get(rawHtmlUrl, htmlRequestOption)
          .then((response) => {
            if (!response.ok && response.status !== 200)
              throw new Error(
                `Rejected GET Request with status code: ${response.status}`,
              )

            return response.data ?? response.text()
          })
          .then((rawHtmlData) => resolve(rawHtmlData))
          .catch((error) => reject(error))
      } else {
        await Axios.post(rawHtmlUrl, htmlRequestOption)
          .then((response) => {
            if (!response.ok && response.status !== 200)
              throw new Error(
                `Rejected POST Request with status code: ${response.status}`,
              )
            return response.data ?? response.text()
          })
          .then((rawHtmlData) => resolve(rawHtmlData))
          .catch((error) => reject(error))
      }
    })
  }

  static parseHtmlSearchResults(rawHtml, parsingSearchOptions) {
    if (!rawHtml)
      throw new Error('Recevied Invalid Raw HTML Data from Youtube Watch Page')
    if (
      !parsingSearchOptions ||
      parsingSearchOptions?.type?.toLowerCase()?.trim() === 'query'
    )
      parsingSearchOptions = {
        type: 'all',
        limit: parsingSearchOptions?.limit ?? 1,
      }

    const resultsCollected = []
    let rawHtmlData
    let cookedHTMLDetails = []
    let booleanFetched = false

    try {
      rawHtmlData = rawHtml
        .split("ytInitialData = JSON.parse('")[1]
        .split("');</script>")[0]
      rawHtml = rawHtmlData.replace(/\\x([0-9A-F]{2})/gi, (...items) => String.fromCharCode(parseInt(items[1], 16)))
    } catch {
      // Nothing to be Done and ignored the Error
    }

    try {
      cookedHTMLDetails = JSON.parse(
        rawHtml
          .split('{"itemSectionRenderer":{"contents":')
          [
            rawHtml.split('{"itemSectionRenderer":{"contents":').length - 1
          ].split(',"continuations":[{')[0],
      )
      booleanFetched = true
    } catch {
      // Nothing to be Done and ignored the Error
    }

    if (!booleanFetched) {
      try {
        cookedHTMLDetails = JSON.parse(
          rawHtml
            .split('{"itemSectionRenderer":')
            [rawHtml.split('{"itemSectionRenderer":').length - 1].split(
              '},{"continuationItemRenderer":{',
            )[0],
        )?.contents
        booleanFetched = true
      } catch {
        return []
      }
    }

    if (!booleanFetched) return []

    for (let count = 0, len = cookedHTMLDetails?.length; count < len; ++count) {
      if (
        typeof parsingSearchOptions.limit === 'number' &&
        parsingSearchOptions.limit > 0 &&
        resultsCollected.length >= parsingSearchOptions.limit
      )
        break
      const tempcachedData = cookedHTMLDetails[count]
      if (parsingSearchOptions.type === 'all') {
        if (tempcachedData?.videoRenderer) parsingSearchOptions.type = 'video'
        else if (tempcachedData?.channelRenderer)
          parsingSearchOptions.type = 'channel'
        else if (tempcachedData?.playlistRenderer)
          parsingSearchOptions.type = 'playlist'
        else continue
      }

      const parsedCookedData =
        Utils.patchCookedHtmlSearchResults(
          tempcachedData,
          parsingSearchOptions.type,
          resultsCollected.length,
        ) ?? undefined

      if (!parsedCookedData) continue
      else resultsCollected.push(parsedCookedData)
    }

    return resultsCollected ?? []
  }

  static getHtmlSearchVideos(rawJsonHtmlData, limit = Infinity) {
    const videos = []

    for (let count = 0, len = rawJsonHtmlData.length; count < len; count++) {
      if (limit === videos.length) break
      if (!rawJsonHtmlData[count]?.playlistVideoRenderer?.shortBylineText)
        continue

      videos.push(
        new YoutubeVideo({
          videoId: rawJsonHtmlData[count]?.playlistVideoRenderer?.videoId,
          Id:
            parseInt(
              rawJsonHtmlData[count]?.playlistVideoRenderer?.index?.simpleText,
            ) || 0,
          duration:
            Utils.parseYoutubeDuration(
              rawJsonHtmlData[count]?.playlistVideoRenderer?.lengthText
                ?.simpleText,
            ) || 0,
          duration_raw:
            rawJsonHtmlData[count]?.playlistVideoRenderer?.lengthText
              ?.simpleText ?? '0:00',
          thumbnail: {
            id: rawJsonHtmlData[count]?.playlistVideoRenderer?.videoId,
            url: rawJsonHtmlData[
              count
            ]?.playlistVideoRenderer?.thumbnail.thumbnails.pop().url,
            height: rawJsonHtmlData[
              count
            ]?.playlistVideoRenderer?.thumbnail.thumbnails.pop().height,
            width: rawJsonHtmlData[
              count
            ]?.playlistVideoRenderer?.thumbnail.thumbnails.pop().width,
          },
          title:
            rawJsonHtmlData[count]?.playlistVideoRenderer?.title?.runs?.[0]
              ?.text,
          channel: {
            id:
              rawJsonHtmlData[count]?.playlistVideoRenderer?.shortBylineText
                .runs[0].navigationEndpoint.browseEndpoint.browseId ??
              undefined,
            name:
              rawJsonHtmlData[count]?.playlistVideoRenderer?.shortBylineText
                .runs[0].text ?? undefined,
            url: `https://www.youtube.com${
              rawJsonHtmlData[count]?.playlistVideoRenderer?.shortBylineText
                .runs[0].navigationEndpoint.browseEndpoint.canonicalBaseUrl ??
              rawJsonHtmlData[count]?.playlistVideoRenderer?.shortBylineText
                .runs[0].navigationEndpoint.commandMetadata.webCommandMetadata
                .url
            }`,
            icon: undefined,
          },
        }),
      )
    }
    return videos
  }

  static patchCookedHtmlSearchResults(
    rawJson,
    type = 'video',
    initialIndex = 0,
  ) {
    if (!rawJson) return undefined
    switch (type?.toLowerCase()?.trim()) {
      case 'video':
        return new YoutubeVideo({
          Id: ++initialIndex,
          videoId: rawJson.videoRenderer.videoId ?? undefined,
          url: `https://www.youtube.com/watch?v=${rawJson.videoRenderer.videoId}`,
          title: rawJson?.videoRenderer?.title?.runs?.[0]?.text ?? undefined,
          description:
            rawJson?.descriptionSnippet?.runs?.[0]?.text ?? undefined,
          duration:
            Utils.parseYoutubeDuration(
              rawJson?.videoRenderer?.lengthText?.simpleText,
            ) ?? 0,
          duration_raw:
            rawJson?.videoRenderer?.lengthText?.simpleText ?? undefined,
          thumbnail: {
            thumbnailId: rawJson?.videoRenderer?.videoId,
            url: rawJson?.videoRenderer?.thumbnail?.thumbnails?.pop()?.url,
            height: rawJson?.videoRenderer?.thumbnail?.thumbnails?.pop()
              ?.height,
            width: rawJson?.videoRenderer?.thumbnail?.thumbnails?.pop()?.width,
          },
          channel: {
            channelId:
              rawJson?.videoRenderer?.ownerText?.runs?.[0]?.navigationEndpoint
                ?.browseEndpoint?.browseId ?? undefined,
            name:
              rawJson?.videoRenderer?.ownerText?.runs?.[0]?.text ?? undefined,
            url: `https://www.youtube.com${
              rawJson?.videoRenderer?.ownerText?.runs?.[0]?.navigationEndpoint
                ?.browseEndpoint?.canonicalBaseUrl ??
              rawJson?.videoRenderer?.ownerText?.runs?.[0]?.navigationEndpoint
                ?.commandMetadata?.webCommandMetadata?.url ??
              undefined
            }`,
            icon: {
              url:
                rawJson?.videoRenderer?.channelThumbnailSupportedRenderers
                  ?.channelThumbnailWithLinkRenderer?.thumbnail?.thumbnails?.[0]
                  ?.url,
              width:
                rawJson?.videoRenderer?.channelThumbnailSupportedRenderers
                  ?.channelThumbnailWithLinkRenderer?.thumbnail?.thumbnails?.[0]
                  ?.width,
              height:
                rawJson?.videoRenderer?.channelThumbnailSupportedRenderers
                  ?.channelThumbnailWithLinkRenderer?.thumbnail?.thumbnails?.[0]
                  ?.height,
            },
            verified:
              !!(
                rawJson.videoRenderer.ownerBadges &&
                rawJson.videoRenderer.ownerBadges[0]
              )?.metadataBadgeRenderer?.style
                ?.toLowerCase()
                ?.includes('verified') ?? false,
          },
          uploadedAt:
            rawJson?.videoRenderer?.publishedTimeText?.simpleText ?? undefined,
          views:
            rawJson?.videoRenderer?.viewCountText?.simpleText?.replace(
              /\D/g,
              '',
            ) ?? 0,
        })
      case 'channel':
        return new YoutubeChannel({
          channelId: rawJson?.channelRenderer?.channelId,
          name: rawJson?.channelRenderer?.title?.simpleText,
          icon: rawJson?.channelRenderer?.thumbnail?.thumbnails?.pop(),
          url: `https://www.youtube.com${
            rawJson?.channelRenderer?.navigationEndpoint?.browseEndpoint
              ?.canonicalBaseUrl ??
            rawJson?.channelRenderer?.navigationEndpoint?.commandMetadata
              ?.webCommandMetadata?.url
          }`,
          verified:
            !!rawJson?.videoRenderer?.ownerBadges?.metadataBadgeRenderer?.style
              ?.toLowerCase()
              ?.includes('verified') ??
            !!rawJson?.videoRenderer?.ownerBadges?.metadataBadgeRenderer?.accessibilityData?.label
              ?.toLowerCase()
              ?.includes('verified') ??
            !!rawJson?.videoRenderer?.ownerBadges?.metadataBadgeRenderer?.tooltip
              ?.toLowerCase()
              ?.includes('verified') ??
            !!`${rawJson?.videoRenderer?.ownerBadges[0]}`
              ?.toLowerCase()
              ?.includes('verified') ??
            false,
          subscribers:
            rawJson?.channelRenderer?.subscriberCountText?.simpleText,
        })
      case 'playlist':
        return new YoutubePlaylist(
          {
            playlistId: rawJson?.playlistRenderer?.playlistId,
            name: rawJson?.playlistRenderer?.title?.simpleText,
            thumbnail: {
              thumbnailId: rawJson?.playlistRenderer?.playlistId,
              url: rawJson?.playlistRenderer?.thumbnails?.[0]?.thumbnails?.pop()
                ?.url,
              height: rawJson?.playlistRenderer?.thumbnails?.[0]?.thumbnails?.pop()
                ?.height,
              width: rawJson?.playlistRenderer?.thumbnails?.[0]?.thumbnails?.pop()
                ?.width,
            },
            channel: {
              channelId:
                rawJson?.playlistRenderer?.shortBylineText?.runs?.[0]
                  ?.navigationEndpoint?.browseEndpoint?.browseId,
              name: rawJson?.playlistRenderer?.shortBylineText?.runs?.[0]?.text,
              url: `https://www.youtube.com${rawJson?.playlistRenderer?.shortBylineText?.runs?.[0]?.navigationEndpoint?.commandMetadata?.webCommandMetadata?.url}`,
            },
            videos: parseInt(
              rawJson?.playlistRenderer?.videoCount?.replace(/\D/g, ''),
            ),
          },
          true,
        )
      default:
        return undefined
    }
  }

  static parseYoutubeDuration(rawDuration) {
    if (!(rawDuration && typeof rawDuration === 'string')) return undefined
    rawDuration ??= '0:00'
    const rawArgs = rawDuration.split(':')
    let cookedDuration = 0

    switch (rawArgs.length) {
      case 3:
        cookedDuration =
          parseInt(rawArgs[0]) * 60 * 60 * 1000 +
          parseInt(rawArgs[1]) * 60 * 1000 +
          parseInt(rawArgs[2]) * 1000
        break
      case 2:
        cookedDuration =
          parseInt(rawArgs[0]) * 60 * 1000 + parseInt(rawArgs[1]) * 1000
        break
      default:
        cookedDuration = parseInt(rawArgs[0]) * 1000
    }

    return cookedDuration
  }

  static getHtmlcontinuationToken(rawObjectData) {
    const continuationToken = rawObjectData.find(
      (rawData) => Object.keys(rawData)[0] === 'continuationItemRenderer',
    )?.continuationItemRenderer?.continuationEndpoint?.continuationCommand
      ?.token
    return continuationToken ?? undefined
  }

  static async hardHTMLSearchfetch(rawHtmlData, type = 'video', limit = 1) {
    if (!rawHtmlData) return undefined

    switch (type?.toLowerCase()?.trim()) {
      case 'video':
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
          primary: rawJson.find(
            (section) => 'videoPrimaryInfoRenderer' in section,
          )?.videoPrimaryInfoRenderer,
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
          cookedJson,
        }

        return new YoutubeVideo({
          videoId: cookedJson?.info?.videoId,
          title: cookedJson?.info?.title,
          views: parseInt(cookedJson?.info?.viewCount) ?? 0,
          tags: cookedJson?.info?.keywords,
          isprivate: cookedJson?.info?.isPrivate,
          islive: cookedJson?.info?.isLiveContent,
          duration: parseInt(cookedJson?.info?.lengthSeconds) * 1000,
          duration_raw: Utils.parseDurationToString(
            Utils.parseYoutubeDuration(
              parseInt(cookedJson?.info?.lengthSeconds) * 1000 ?? 0,
            ),
          ),
          channel: {
            name: cookedJson?.info?.author,
            channelId: cookedJson?.info?.channelId,
            url: `https://www.youtube.com${cookedJson?.owner?.videoOwnerRenderer?.title?.runs?.[0]?.navigationEndpoint?.browseEndpoint?.canonicalBaseUrl}`,
            icon:
              cookedJson?.owner?.videoOwnerRenderer?.thumbnail?.thumbnails?.[0],
            subscribers: cookedJson?.owner?.videoOwnerRenderer?.subscriberCountText?.simpleText?.replace(
              ' subscribers',
              '',
            ),
          },
          description: cookedJson?.info?.shortDescription,
          thumbnail: {
            ...cookedJson?.info?.thumbnail?.thumbnails?.pop(),
            thumbnailId: cookedJson?.info?.videoId,
          },
          uploadedAt: cookedJson?.dateText?.simpleText,
          likes: Utils.parseHtmllikesCount(cookedJson) || 0,
          dislikes: 0,
          videos: Utils.fetchExtraHtmlVideos(nextJsonData ?? {}) || [],
        })

      case 'playlist':
        if (
          !limit ||
          typeof limit !== 'number' ||
          (limit && typeof limit !== 'number' && limit <= 0)
        )
          limit = Infinity
        let rawParsed
        let rawJsonData
        try {
          const rawJSON = `${
            rawHtmlData
              .split('{"playlistVideoListRenderer":{"contents":')[1]
              .split('}],"playlistId"')[0]
          }}]`
          rawParsed = JSON.parse(rawJSON)
          rawJsonData = JSON.parse(
            rawHtmlData
              .split('{"playlistSidebarRenderer":')[1]
              .split('}};</script>')[0],
          ).items
        } catch {
          return null
        }

        const parsedJsonData = rawJsonData[0].playlistSidebarPrimaryInfoRenderer

        if (!parsedJsonData.title.runs || !parsedJsonData.title.runs.length)
          return undefined

        return new YoutubePlaylist({
          continuation: {
            api:
              rawHtmlData.split('INNERTUBE_API_KEY":"')[1]?.split('"')[0] ??
              rawHtmlData.split('innertubeApiKey":"')[1]?.split('"')[0] ??
              enumData.DEFAULT_API_KEY,
            token: Utils.getHtmlcontinuationToken(rawParsed),
            clientVersion:
              rawHtmlData
                .split('"INNERTUBE_CONTEXT_CLIENT_VERSION":"')[1]
                ?.split('"')[0] ??
              rawHtmlData
                .split('"innertube_context_client_version":"')[1]
                ?.split('"')[0] ??
              '<some version>',
          },
          id:
            parsedJsonData.title.runs[0].navigationEndpoint.watchEndpoint
              .playlistId,
          title: parsedJsonData.title.runs[0].text,
          videoCount:
            parseInt(
              parsedJsonData.stats[0].runs[0].text.replace(/[^0-9]/g, '') ?? 0,
            ) ?? 0,
          lastUpdate:
            parsedJsonData.stats
              .find(
                (data) => 'runs' in data &&
                  data.runs.find((subData) => subData.text.toLowerCase().includes('last update')),
              )
              ?.runs.pop()?.text ?? undefined,
          views:
            parseInt(
              parsedJsonData.stats?.[1]?.simpleText?.replace(/[^0-9]/g, '') ??
                0,
            ) ?? 0,
          videos: Utils.fetchPlaylistHtmlVideos(rawParsed, limit),
          url: `https://www.youtube.com/playlist?list=${parsedJsonData.title.runs[0].navigationEndpoint.watchEndpoint.playlistId}`,
          link: `https://www.youtube.com${parsedJsonData.title.runs[0].navigationEndpoint.commandMetadata.webCommandMetadata.url}`,
          author: {
            name:
              rawJsonData[1]?.playlistSidebarSecondaryInfoRenderer?.videoOwner
                ?.videoOwnerRenderer?.title?.runs?.[0]?.text,
            id:
              rawJsonData[1]?.playlistSidebarSecondaryInfoRenderer?.videoOwner
                .videoOwnerRenderer.title.runs[0].navigationEndpoint
                .browseEndpoint.browseId,
            url: `https://www.youtube.com${
              rawJsonData[1]?.playlistSidebarSecondaryInfoRenderer?.videoOwner
                .videoOwnerRenderer.navigationEndpoint.commandMetadata
                .webCommandMetadata.url ||
              rawJsonData[1]?.playlistSidebarSecondaryInfoRenderer?.videoOwner
                .videoOwnerRenderer.navigationEndpoint.browseEndpoint
                .canonicalBaseUrl
            }`,
            icon: rawJsonData[1]?.playlistSidebarSecondaryInfoRenderer
              ?.videoOwner.videoOwnerRenderer.thumbnail.thumbnails.length
              ? rawJsonData[1]?.playlistSidebarSecondaryInfoRenderer?.videoOwner.videoOwnerRenderer.thumbnail.thumbnails.pop()
                .url
              : undefined,
          },
          thumbnail: rawJsonData[1]?.playlistSidebarSecondaryInfoRenderer
            ?.videoOwner.thumbnailRenderer.playlistVideoThumbnailRenderer
            ?.thumbnail.thumbnails.length
            ? rawJsonData[1]?.playlistSidebarSecondaryInfoRenderer?.videoOwner.thumbnailRenderer.playlistVideoThumbnailRenderer.thumbnail.thumbnails.pop()
              .url
            : undefined,
        })
      default:
        return undefined
    }
  }

  static fetchPlaylistHtmlVideos(rawVideosData, limit = Infinity) {
    const cookedVideos = []

    for (let count = 0, len = rawVideosData.length; count < len; count++) {
      if (limit === cookedVideos.length) break
      if (
        !rawVideosData[count]?.playlistVideoRenderer ||
        !rawVideosData[count]?.playlistVideoRenderer?.shortBylineText
      )
        continue

      cookedVideos.push(
        new YoutubeVideo(
          {
            id: rawVideosData[count]?.playlistVideoRenderer?.videoId,
            index:
              parseInt(
                rawVideosData[count]?.playlistVideoRenderer?.index?.simpleText,
              ) || 0,
            duration:
              Utils.parseYoutubeDuration(
                rawVideosData[count]?.playlistVideoRenderer?.lengthText
                  ?.simpleText,
              ) || 0,
            duration_raw:
              rawVideosData[count]?.playlistVideoRenderer?.lengthText
                ?.simpleText ?? '0:00',
            thumbnail: {
              id: rawVideosData[count]?.playlistVideoRenderer?.videoId,
              url: rawVideosData[
                count
              ]?.playlistVideoRenderer?.thumbnail.thumbnails.pop().url,
              height: rawVideosData[
                count
              ]?.playlistVideoRenderer?.thumbnail.thumbnails.pop().height,
              width: rawVideosData[
                count
              ]?.playlistVideoRenderer?.thumbnail.thumbnails.pop().width,
            },
            title:
              rawVideosData[count]?.playlistVideoRenderer?.title.runs[0].text,
            channel: {
              id:
                rawVideosData[count]?.playlistVideoRenderer?.shortBylineText
                  .runs[0].navigationEndpoint.browseEndpoint.browseId || null,
              name:
                rawVideosData[count]?.playlistVideoRenderer?.shortBylineText
                  .runs[0].text || null,
              url: `https://www.youtube.com${
                rawVideosData[count]?.playlistVideoRenderer?.shortBylineText
                  .runs[0].navigationEndpoint.browseEndpoint.canonicalBaseUrl ||
                rawVideosData[count]?.playlistVideoRenderer?.shortBylineText
                  .runs[0].navigationEndpoint.commandMetadata.webCommandMetadata
                  .url
              }`,
              icon: null,
            },
          },
          count,
        ),
      )
    }
    return cookedVideos
  }

  static parseDurationToString(rawDuration = 0) {
    if (!rawDuration) return undefined
    const rawObjects = Object.keys(rawDuration)
    const defaultRequired = ['days', 'hours', 'minutes', 'seconds']

    const rawParsed = rawObjects
      .filter((object) => defaultRequired.includes(object))
      .map((cookedObject) => (rawDuration[cookedObject] > 0 ? rawDuration[cookedObject] : ''))
    const cookedParsed = rawParsed
      .filter((object) => !!object)
      .map((cookedObject) => cookedObject.toString().padStart(2, '0'))
      .join(':')
    return cookedParsed.length <= 3
      ? `0:${cookedParsed.padStart(2, '0') || 0}`
      : cookedParsed
  }

  static parseHtmllikesCount(rawJson) {
    const buttons = rawJson?.videoActions?.menuRenderer?.topLevelButtons
    const button = buttons?.find(
      (button) => button?.toggleButtonRenderer?.defaultIcon?.iconType === 'LIKE',
    )
    if (!button) return 0

    return parseInt(
      button?.toggleButtonRenderer?.defaultText?.accessibility?.accessibilityData?.label
        ?.split(' ')?.[0]
        ?.replace(/,/g, ''),
    )
  }

  static fetchExtraHtmlVideos(rawHtmlbody, parseHomePageBoolean = false) {
    const cookedResults = []
    let garbageCount = 0
    if (typeof rawHtmlbody[Symbol.iterator] !== 'function') return cookedResults

    for (const rawbody of rawHtmlbody) {
      const rawDetails = parseHomePageBoolean
        ? rawbody
        : rawbody.compactVideoRenderer

      if (rawDetails) {
        try {
          cookedResults.push(
            new YoutubeVideo(
              {
                videoId: rawDetails.videoId,
                title:
                  rawDetails.title.simpleText ?? rawDetails.title.runs[0]?.text,
                views:
                  parseInt(
                    (/^\d/.test(rawDetails.viewCountText.simpleText)
                      ? rawDetails.viewCountText.simpleText
                      : '0'
                    )
                      .split(' ')[0]
                      .replace(/,/g, ''),
                  ) || 0,
                duration_raw:
                  rawDetails.lengthText.simpleText ??
                  rawDetails.lengthText.accessibility.accessibilityData.label,
                duration:
                  Utils.parseYoutubeDuration(rawDetails.lengthText.simpleText) /
                  1000,
                channel: {
                  name: rawDetails.shortBylineText.runs[0].text,
                  channelId:
                    rawDetails.shortBylineText.runs[0].navigationEndpoint
                      .browseEndpoint.browseId,
                  url: `https://www.youtube.com${rawDetails.shortBylineText.runs[0].navigationEndpoint.browseEndpoint.canonicalBaseUrl}`,
                  icon: parseHomePageBoolean
                    ? rawDetails.channelThumbnailSupportedRenderers
                      .channelThumbnailWithLinkRenderer.thumbnail
                      .thumbnails[0]
                    : rawDetails.channelThumbnail.thumbnails[0],
                  subscribers: '0',
                  verified: Boolean(
                    rawDetails.ownerBadges[0].metadataBadgeRenderer.tooltip ===
                      'Verified',
                  ),
                },
                thumbnail: {
                  ...rawDetails.thumbnail.thumbnails[
                    rawDetails.thumbnail.thumbnails.length - 1
                  ],
                  thumbnailId: rawDetails.videoId,
                },
                uploadedAt: rawDetails.publishedTimeText.simpleText,
                likes: 0,
                dislikes: 0,
                description: rawDetails.descriptionSnippet?.runs[0]?.text,
              },
              garbageCount,
            ),
          )
        } catch {
          continue
        }
        ++garbageCount
      }
    }

    return cookedResults
  }
}

module.exports = Utils
