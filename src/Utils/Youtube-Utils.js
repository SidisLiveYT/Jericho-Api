const Axios = require('axios').default
const {
  youtubeUrlParseHtmlSearchData,
  enumData,
  searchOptions,
} = require('../types/interfaces.js')
const YoutubeVideo = require('../Structures/Youtube-Elements/video-element')
const YoutubePlaylist = require('../Structures/Youtube-Elements/playlist-element')
const YoutubeChannel = require('../Structures/Youtube-Elements/channel-element')

class Utils {
  /**
   * @method htmlSearchrawFilterParser() _> parsing filter type for HTML fetch from youtbe Watch page
   * @param {string} rawFilter String value of playlist , video , channel Data
   * @returns {string | void} string value for html query search for Youtube Default Watch Page
   */
  static htmlSearchrawFilterParser(rawFilter) {
    if (!rawFilter) return ''
    switch (rawFilter?.toLowerCase()?.trim()) {
      case 'playlist':
        return '&sp=EgIQAw%253D%253D'
      case 'video':
        return '&sp=EgIQAQ%253D%253D'
      case 'query':
        return '&sp=EgIQAQ%253D%253D'
      case 'channel':
        return '&sp=EgIQAg%253D%253D'
      case 'all':
        return ''
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
    if (!(rawUrl && typeof rawUrl === 'string')) return undefined
    let rawMatch = rawUrl.match(
      /^(?:\w+:)?\/\/([^\s\.]+\.\S{2}|localhost[\:?\d]*)\S*$/,
    )
    if (!rawMatch?.[1] && /(PL|UU|LL|RD|OL)[a-zA-Z0-9-_]{16,41}/.test(rawUrl))
      return {
        parsedData: rawUrl,
        parsedUrl: enumData.HTML_YOUTUBE_PLAYLIST_BASE_URL + rawUrl?.trim(),
        searchQueryUrl: `${
          enumData.HTML_YOUTUBE_BASE_SEARCH_QUERY_URL +
          encodeURIComponent(
            enumData.HTML_YOUTUBE_PLAYLIST_BASE_URL + rawUrl?.trim(),
          ).replace(/%20/g, '+')
        }`,
        contentType: 'playlistId',
        rawMatchData: rawMatch,
      }
    if (!rawMatch?.[1] && /^[a-zA-Z0-9-_]{11}$/.test(rawUrl))
      return {
        parsedData: rawUrl,
        parsedUrl: enumData.HTML_YOUTUBE_VIDEO_BASE_URL + rawUrl?.trim(),
        searchQueryUrl: `${
          enumData.HTML_YOUTUBE_BASE_SEARCH_QUERY_URL +
          encodeURIComponent(
            enumData.HTML_YOUTUBE_VIDEO_BASE_URL + rawUrl?.trim(),
          ).replace(/%20/g, '+')
        }`,
        contentType: 'videoId',
        rawMatchData: rawMatch,
      }
    else if (!rawMatch?.[1])
      return {
        parsedData: rawUrl,
        parsedUrl:
          enumData.HTML_YOUTUBE_BASE_SEARCH_QUERY_URL +
          encodeURIComponent(rawUrl?.trim()).replace(/%20/g, '+'),
        searchQueryUrl: `${
          enumData.HTML_YOUTUBE_BASE_SEARCH_QUERY_URL +
          encodeURIComponent(rawUrl?.trim()).replace(/%20/g, '+')
        }`,
        contentType: 'query',
        rawMatchData: rawMatch,
      }
    rawMatch = rawUrl.match(/[?&]list=([^#&?]+)/)
    if (rawMatch?.[1])
      return {
        parsedData: rawMatch?.[1],
        parsedUrl:
          enumData.HTML_YOUTUBE_PLAYLIST_BASE_URL +
          encodeURIComponent(rawMatch?.[1]?.trim()).replace(/%20/g, '+'),
        searchQueryUrl: `${
          enumData.HTML_YOUTUBE_BASE_SEARCH_QUERY_URL +
          encodeURIComponent(
            enumData.HTML_YOUTUBE_PLAYLIST_BASE_URL + rawUrl?.trim(),
          ).replace(/%20/g, '+')
        }`,
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
        parsedUrl:
          enumData.HTML_YOUTUBE_VIDEO_BASE_URL +
          encodeURIComponent(rawMatch?.[1]?.trim()).replace(/%20/g, '+'),
        searchQueryUrl: `${
          enumData.HTML_YOUTUBE_BASE_SEARCH_QUERY_URL +
          encodeURIComponent(
            enumData.HTML_YOUTUBE_VIDEO_BASE_URL + rawUrl?.trim(),
          ).replace(/%20/g, '+')
        }`,
        rawMatchData: rawMatch,
      }
    rawMatch = rawUrl.match(/\/channel\/([\w-]+)/)
    if (rawMatch?.[1])
      return {
        parsedData: rawMatch?.[1],
        contentType: 'channel',
        parsedUrl:
          enumData.HTML_YOUTUBE_CHANNEL_BASE_URL +
          encodeURIComponent(rawMatch?.[1]?.trim()).replace(/%20/g, '+'),
        searchQueryUrl: `${
          enumData.HTML_YOUTUBE_BASE_SEARCH_QUERY_URL +
          encodeURIComponent(
            enumData.HTML_YOUTUBE_CHANNEL_BASE_URL + rawUrl?.trim(),
          ).replace(/%20/g, '+')
        }`,
        rawMatchData: rawMatch,
      }
    rawMatch = rawUrl.match(/\/(?:c|user)\/([\w-]+)/)
    if (rawMatch?.[1])
      return {
        parsedData: rawMatch?.[1],
        parsedUrl:
          enumData.HTML_YOUTUBE_USER_BASE_URL +
          encodeURIComponent(rawMatch?.[1]?.trim()).replace(/%20/g, '+'),
        searchQueryUrl: `${
          enumData.HTML_YOUTUBE_BASE_SEARCH_QUERY_URL +
          encodeURIComponent(
            enumData.HTML_YOUTUBE_USER_BASE_URL + rawUrl?.trim(),
          ).replace(/%20/g, '+')
        }`,
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
   * @param {boolean | void} ignoreRejection Ignore the Response.status code !== '200' if possible
   * @returns {Promise<string|void>} returns response.text() as Data for Raw HTML Data of Youtube Watch Page
   */
  static async getHtmlData(
    rawHtmlUrl,
    htmlRequestOption,
    method = 'GET',
    ignoreRejection = false,
  ) {
    return new Promise(async (resolve, reject) => {
      if (method?.toLowerCase()?.trim() === 'get') {
        await Axios.get(rawHtmlUrl, htmlRequestOption)
          .then((response) => {
            if (!response.ok && response.status !== 200 && !ignoreRejection)
              throw new Error(
                `Rejected GET Request with status code: ${response.status}`,
              )
            else if (!response.ok && response.status !== 200) return false
            else return response.data ?? response.text()
          })
          .then((rawHtmlData) => resolve(rawHtmlData))
          .catch(() => resolve(false))
      } else {
        await Axios.post(rawHtmlUrl, htmlRequestOption)
          .then((response) => {
            if (!response.ok && response.status !== 200 && !ignoreRejection)
              throw new Error(
                `Rejected POST Request with status code: ${response.status}`,
              )
            else if (!response.ok && response.status !== 200) return false
            else return response.data ?? response.text()
          })
          .then((rawHtmlData) => resolve(rawHtmlData))
          .catch(() => resolve(false))
      }
    })
  }

  /**
   * @method parseHtmlSearchResults() -> Parse Raw Html Search Results "Response String Value" | Returns Array of Youtube Video/Playlist/Channel
   * @param {string} rawHtml String Value of Response.text() or String Value of response.data to Parse in Json and Filter the accurate Data from sections
   * @param {searchOptions} parsingSearchOptions Parsing Options form Client Side/User Side for Filtering raw json Data
   * @returns {YoutubeVideo[]|YoutubeChannel[]|YoutubePlaylist[]|void} Returns Array of Youtube Video/Playlist/Channel Data from the Parsing Raw HTML Data
   */
  static parseHtmlSearchResults(rawHtml, parsingSearchOptions) {
    if (!rawHtml)
      throw new Error(
        'Recevied Invalid Raw HTML Data from "Youtube Search Query Page"',
      )
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
      let tempType
      if (
        parsingSearchOptions.type === 'all' ||
        !parsingSearchOptions?.type ||
        parsingSearchOptions?.type === 'query'
      ) {
        if (tempcachedData?.videoRenderer) tempType = 'video'
        else if (tempcachedData?.channelRenderer) tempType = 'channel'
        else if (tempcachedData?.playlistRenderer) tempType = 'playlist'
        else continue
      }

      const parsedCookedData =
        Utils.patchCookedHtmlSearchResults(
          tempcachedData,
          tempType ?? parsingSearchOptions.type ?? 'video',
          resultsCollected.length,
        ) ?? undefined

      if (!parsedCookedData) continue
      else resultsCollected.push(parsedCookedData)
    }

    return resultsCollected ?? []
  }

  /**
   * @method getHtmlSearchVideos() -> Parsing Suggestion Videos for Video Watch Page from raw Json Data to Youtube Video Array Format
   * @param {JSON} rawJsonHtmlData raw Json Data fetched from Youtube and Parsed to Json Format
   * @param {number | void} limit Numerical Value to limit suggestion Datas
   * @returns {YoutubeVideo[] | void} Returns Array of Youtube Video Data on filtered limit value | or Returns void on failure
   */

  static getHtmlSearchVideos(rawJsonHtmlData, limit = Infinity) {
    if (!rawJsonHtmlData) return undefined

    const cookedVideos = []
    for (let count = 0, len = rawJsonHtmlData.length; count < len; count++) {
      if (limit === cookedVideos.length) break
      if (!rawJsonHtmlData[count]?.playlistVideoRenderer?.shortBylineText)
        continue

      cookedVideos.push(
        new YoutubeVideo(
          {
            videoId: rawJsonHtmlData[count]?.playlistVideoRenderer?.videoId,
            Id:
              parseInt(
                rawJsonHtmlData[count]?.playlistVideoRenderer?.index
                  ?.simpleText,
              ) || 0,
            duration:
              Utils.parseYoutubeDurationStringTomiliseconds(
                rawJsonHtmlData[count]?.playlistVideoRenderer?.lengthText
                  ?.simpleText,
              ) || 0,
            duration_raw:
              rawJsonHtmlData[count]?.playlistVideoRenderer?.lengthText
                ?.simpleText ?? '0:00',
            thumbnail: {
              thumbnailId:
                rawJsonHtmlData[count]?.playlistVideoRenderer?.videoId,
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
              channelId:
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
          },
          count + 1,
        ),
      )
    }
    return cookedVideos
  }

  /**
   * @method patchCookedHtmlSearchResults() -> Patch raw Search Results Json Data to Seperate Class Type Value like Youtube Video / Playlist / Channel
   * @param {JSON} rawJson Json raw Data after Parsing the string value of html source code
   * @param {string} type what type of Parsing to be done | By default -> "video"
   * @param {number | void} initialIndex To implement Video Index Value for special cases
   * @returns {YoutubeChannel|YoutubeVideo|YoutubePlaylist|void} Returns switch based on type Value on desired condition
   */

  static patchCookedHtmlSearchResults(
    rawJson,
    type = 'video',
    initialIndex = 0,
  ) {
    if (!rawJson) return undefined
    switch (type?.toLowerCase()?.trim()) {
      case 'video':
        if (!rawJson?.videoRenderer) return undefined
        return new YoutubeVideo(
          {
            Id: ++initialIndex,
            videoId: rawJson?.videoRenderer?.videoId ?? undefined,
            url: `${enumData.HTML_YOUTUBE_VIDEO_BASE_URL}${rawJson?.videoRenderer?.videoId}`,
            title: rawJson?.videoRenderer?.title?.runs?.[0]?.text ?? undefined,
            description:
              rawJson?.descriptionSnippet?.runs?.[0]?.text ?? undefined,
            duration:
              Utils.parseYoutubeDurationStringTomiliseconds(
                rawJson?.videoRenderer?.lengthText?.simpleText,
              ) ?? 0,
            duration_raw:
              rawJson?.videoRenderer?.lengthText?.simpleText ?? undefined,
            thumbnail: {
              thumbnailId: rawJson?.videoRenderer?.videoId,
              url: rawJson?.videoRenderer?.thumbnail?.thumbnails?.pop()?.url,
              height: rawJson?.videoRenderer?.thumbnail?.thumbnails?.pop()
                ?.height,
              width: rawJson?.videoRenderer?.thumbnail?.thumbnails?.pop()
                ?.width,
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
                    ?.channelThumbnailWithLinkRenderer?.thumbnail
                    ?.thumbnails?.[0]?.url,
                width:
                  rawJson?.videoRenderer?.channelThumbnailSupportedRenderers
                    ?.channelThumbnailWithLinkRenderer?.thumbnail
                    ?.thumbnails?.[0]?.width,
                height:
                  rawJson?.videoRenderer?.channelThumbnailSupportedRenderers
                    ?.channelThumbnailWithLinkRenderer?.thumbnail
                    ?.thumbnails?.[0]?.height,
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
              rawJson?.videoRenderer?.publishedTimeText?.simpleText ??
              undefined,
            views:
              rawJson?.videoRenderer?.viewCountText?.simpleText?.replace(
                /\D/g,
                '',
              ) ?? 0,
          },
          initialIndex,
        )
      case 'channel':
        if (!rawJson?.channelRenderer) return undefined
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
        if (!rawJson?.playlistRenderer) return undefined
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

  /**
   * @method parseYoutubeDurationStringTomiliseconds() ->
   * @param {string} rawDuration raw Duration in String Parsed to Milli-Seconds
   * @returns {number | void} Returns Milli-Seconds from String Value
   */

  static parseYoutubeDurationStringTomiliseconds(rawDuration) {
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

  /**
   * @method getHtmlcontinuationToken() ->
   * @param {Object} rawObjectData raw Object Data from Playlist Data
   * @returns {string | void} Returns and Continuation Token for Playlist Videos next() method
   */

  static getHtmlcontinuationToken(rawObjectData) {
    const continuationToken = rawObjectData.find(
      (rawData) => Object.keys(rawData)[0] === 'continuationItemRenderer',
    )?.continuationItemRenderer?.continuationEndpoint?.continuationCommand
      ?.token
    return continuationToken ?? undefined
  }

  /**
   * @method hardHTMLSearchparse() -> Function to Hard or Full parse method of Videos and Playlist from their own watch Page but not from Default search Results
   * @param {string} rawHtmlData Raw HTML Data from get Request of URL
   * @param {string | void} type Type Value for Parsing HTML Data for switch case js function
   * @param {number | void} limit Numerical Value for Playlist Limit if asked in Type
   * @returns {YoutubeVideo|YoutubePlaylist|void} Returns Youtube Video / Playlist Data after Parsing it from Raw HTML Data
   */

  static hardHTMLSearchparse(rawHtmlData, type = 'video', limit = 10) {
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
          ...cookedJson,
        }
        if (!cookedJson?.videoId) return undefined
        return new YoutubeVideo(
          {
            videoId: cookedJson?.videoId,
            title: cookedJson?.title,
            views: parseInt(cookedJson?.viewCount) ?? 0,
            tags: cookedJson?.keywords,
            isprivate: cookedJson?.isPrivate,
            islive: cookedJson?.isLiveContent,
            duration: parseInt(cookedJson?.lengthSeconds) * 1000,
            duration_raw: Utils.parseDurationToString(
              Utils.parseYoutubeDurationStringTomiliseconds(
                parseInt(cookedJson?.lengthSeconds ?? 0) * 1000,
              ),
            ),
            channel: {
              name: cookedJson?.author,
              channelId: cookedJson?.channelId,
              url: `https://www.youtube.com${cookedJson?.owner?.videoOwnerRenderer?.title?.runs?.[0]?.navigationEndpoint?.browseEndpoint?.canonicalBaseUrl}`,
              icon:
                cookedJson?.owner?.videoOwnerRenderer?.thumbnail
                  ?.thumbnails?.[0],
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
            videos: Utils.parseExtraHtmlVideos(nextJsonData ?? {}) || [],
          },
          1,
        )

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
              rawHtmlData?.split('INNERTUBE_API_KEY":"')[1]?.split('"')?.[0] ??
              rawHtmlData?.split('innertubeApiKey":"')[1]?.split('"')?.[0] ??
              enumData?.DEFAULT_API_KEY,
            token: Utils.getHtmlcontinuationToken(rawParsed),
            clientVersion:
              rawHtmlData
                ?.split('"INNERTUBE_CONTEXT_CLIENT_VERSION":"')?.[1]
                ?.split('"')?.[0] ??
              rawHtmlData
                ?.split('"innertube_context_client_version":"')?.[1]
                ?.split('"')?.[0] ??
              '<some version>',
          },
          playlistId:
            parsedJsonData?.title?.runs?.[0]?.navigationEndpoint?.watchEndpoint
              ?.playlistId,
          title: parsedJsonData?.title?.runs?.[0]?.text,
          videoCount:
            parseInt(
              parsedJsonData?.stats?.[0]?.runs?.[0]?.text?.replace(
                /[^0-9]/g,
                '',
              ) ?? 0,
            ) ?? 0,
          lastUpdate:
            parsedJsonData?.stats
              ?.find(
                (data) => 'runs' in data &&
                  data?.runs?.find((subData) => subData?.text.toLowerCase().includes('last update')),
              )
              ?.runs.pop()?.text ?? undefined,
          views:
            parseInt(
              parsedJsonData?.stats?.[1]?.simpleText?.replace(/[^0-9]/g, '') ??
                0,
            ) ?? 0,
          videos: Utils.fetchPlaylistHtmlVideos(rawParsed, limit),
          url: `https://www.youtube.com/playlist?list=${parsedJsonData?.title?.runs[0]?.navigationEndpoint?.watchEndpoint?.playlistId}`,
          previewLink: `https://www.youtube.com${parsedJsonData?.title?.runs?.[0]?.navigationEndpoint?.commandMetadata?.webCommandMetadata?.url}`,
          author: {
            name:
              rawJsonData[1]?.playlistSidebarSecondaryInfoRenderer?.videoOwner
                ?.videoOwnerRenderer?.title?.runs?.[0]?.text,
            channelId:
              rawJsonData[1]?.playlistSidebarSecondaryInfoRenderer?.videoOwner
                ?.videoOwnerRenderer?.title?.runs?.[0]?.navigationEndpoint
                ?.browseEndpoint?.browseId,
            url: `https://www.youtube.com${
              rawJsonData[1]?.playlistSidebarSecondaryInfoRenderer?.videoOwner
                ?.videoOwnerRenderer?.navigationEndpoint?.commandMetadata
                ?.webCommandMetadata?.url ||
              rawJsonData[1]?.playlistSidebarSecondaryInfoRenderer?.videoOwner
                ?.videoOwnerRenderer?.navigationEndpoint?.browseEndpoint
                ?.canonicalBaseUrl
            }`,
            icon: rawJsonData[1]?.playlistSidebarSecondaryInfoRenderer
              ?.videoOwner?.videoOwnerRenderer?.thumbnail?.thumbnails?.length
              ? rawJsonData[1]?.playlistSidebarSecondaryInfoRenderer?.videoOwner?.videoOwnerRenderer?.thumbnail?.thumbnails?.pop()
                ?.url
              : undefined,
          },
          thumbnail: {
            thumbnailId:
              parsedJsonData?.title?.runs?.[0]?.navigationEndpoint
                ?.watchEndpoint?.playlistId,
            ...(rawJsonData?.[0]?.playlistSidebarPrimaryInfoRenderer?.thumbnailRenderer?.playlistVideoThumbnailRenderer?.thumbnail?.thumbnails?.pop() ??
              undefined),
          },
        })
      default:
        return undefined
    }
  }

  /**
   * @method fetchPlaylistHtmlVideos() -> fetch Playlist Videos from Raw HTML Video Json Data
   * @param {JSON} rawVideosData Raw Json Data parsed from Playlists
   * @param {number | void} limit Limit the Parsing Video content length
   * @returns {YoutubeVideo[] | void} Returns Array of Youtube Video Same as per Search Result of Type of Video though
   */

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
            videoId: rawVideosData[count]?.playlistVideoRenderer?.videoId,
            Id:
              parseInt(
                rawVideosData[count]?.playlistVideoRenderer?.index?.simpleText,
              ) || 0,
            duration:
              Utils.parseYoutubeDurationStringTomiliseconds(
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
          count + 1,
        ),
      )
    }
    return cookedVideos
  }

  /**
   * @method parseDurationToString() -> Parsing of Milliseconds Duration to String Value of Human Readable Value
   * @param {number | void} rawDuration Raw Number Value | Milliseconds Value
   * @returns {string} Returns Human Readable Time/Duration Value
   */

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

  /**
   * @method parseExtraHtmlVideos() -> Parsing Suggestive Videos from Background
   * @param {JSON} rawHTMLJsonData raw HTML Json Data from Parsed Video Watch Pages
   * @param {boolean | void} parseHomePageBoolean Parsing homepage if
   * @returns {YoutubeVideo[] | void} Returns Array of Youtube Video Value
   */

  static parseExtraHtmlVideos(rawHTMLJsonData, parseHomePageBoolean = false) {
    const cookedResults = []
    let garbageCount = 0
    if (typeof rawHTMLJsonData[Symbol.iterator] !== 'function')
      return cookedResults

    for (const rawbody of rawHTMLJsonData) {
      const rawDetails = parseHomePageBoolean
        ? rawbody
        : rawbody?.compactVideoRenderer

      if (rawDetails) {
        try {
          cookedResults.push(
            new YoutubeVideo(
              {
                videoId: rawDetails?.videoId,
                title:
                  rawDetails?.title?.simpleText ??
                  rawDetails?.title?.runs?.[0]?.text,
                views:
                  parseInt(
                    (/^\d/.test(rawDetails?.viewCountText?.simpleText)
                      ? rawDetails?.viewCountText?.simpleText
                      : '0'
                    )
                      ?.split(' ')?.[0]
                      ?.replace(/,/g, ''),
                  ) || 0,
                duration_raw:
                  rawDetails?.lengthText?.simpleText ??
                  rawDetails?.lengthText?.accessibility?.accessibilityData
                    ?.label,
                duration:
                  Utils.parseYoutubeDurationStringTomiliseconds(
                    rawDetails?.lengthText?.simpleText,
                  ) / 1000,
                channel: {
                  name: rawDetails?.shortBylineText?.runs?.[0].text,
                  channelId:
                    rawDetails?.shortBylineText?.runs?.[0]?.navigationEndpoint
                      ?.browseEndpoint?.browseId,
                  url: `https://www.youtube.com${rawDetails?.shortBylineText?.runs?.[0].navigationEndpoint?.browseEndpoint?.canonicalBaseUrl}`,
                  icon: parseHomePageBoolean
                    ? rawDetails?.channelThumbnailSupportedRenderers
                      ?.channelThumbnailWithLinkRenderer?.thumbnail
                      ?.thumbnails?.[0]
                    : rawDetails?.channelThumbnail?.thumbnails?.[0],
                  subscribers: '0',
                  verified: Boolean(
                    rawDetails?.ownerBadges?.[0].metadataBadgeRenderer
                      ?.tooltip === 'Verified',
                  ),
                },
                thumbnail: {
                  ...rawDetails?.thumbnail?.thumbnails?.pop(),
                  thumbnailId: rawDetails?.videoId,
                },
                uploadedAt: rawDetails?.publishedTimeText?.simpleText,
                likes: 0,
                dislikes: 0,
                description: rawDetails?.descriptionSnippet?.runs?.[0]?.text,
              },
              garbageCount + 1,
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
