/**
 * @typedef {Object} youtubeUrlParseHtmlSearchData
 * @property {String} parsedData Parsed Ids Data from URls or Raw Ids
 * @property {String} parsedUrl Parsed Urls from Raw Data
 * @property {String} searchQueryUrl Search Query Url for HTML Request on Youtube
 * @property {String} contentType raw Data validation checks Type as -> 'video' | 'channel' | 'playlist' | 'query' | 'videoId' | 'playlistId'
 * @property {String[]} rawMatchData Raw Data on Regex testing
 */

const youtubeUrlParseHtmlSearchData = {
  parsedData: '',
  parsedUrl: '',
  searchQueryUrl: '',
  contentType: '',
  rawMatchData: [],
}

/**
 * @typedef {Object} enumData
 * @property {String} HTML_SAFE_SEARCH_COOKIE_VALUE "PREF=f2=8000000"
 * @property {String} BASE_HTML_YOUTUBE_API_URL "https://www.youtube.com/youtubei/v1/browse?key="
 * @property {String} HTML_BASE_SEARCH_QUERY_URL "https://youtube.com/results"
 * @property {String} DEFAULT_HTML_YOUTUBE_API_KEY 'AIzaSyAO_FJ2SlqU8Q4STEHLGCilw_Y9_11qcW8'
 * @property {String} HTML_YOUTUBE_BASE_SEARCH_QUERY_URL "https://youtube.com/results?q="
 * @property {String} HTML_YOUTUBE_VIDEO_BASE_URL "https://www.youtube.com/watch?v="
 * @property {String} HTML_YOUTUBE_CHANNEL_BASE_URL "https://www.youtube.com/channel/"
 * @property {String} HTML_YOUTUBE_USER_BASE_URL "https://www.youtube.com/c/"
 * @property {String} HTML_YOUTUBE_THUMBNAIL_BASE_URL "https://i3.ytimg.com/vi/"
 * @property {String} HTML_YOUTUBE_HOMEPAGE_BASE_URL "https://www.youtube.com?hl=en"
 * @property {String} HTML_YOUTUBE_TRENDING_PAGE_BASE_URL "https://www.youtube.com/feed/explore?hl=en"
 * @property {String} HTML_YOUTUBE_PLAYLIST_BASE_URL "https://www.youtube.com/playlist?list="
 * @property {Object} HTML_YOUTUBE_HEADER_DATA { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; rv:78.0) Gecko/20100101 Firefox/78.0", }
 */

const enumData = {
  HTML_SAFE_SEARCH_COOKIE_VALUE: 'PREF=f2=8000000',
  BASE_HTML_YOUTUBE_API_URL: 'https://www.youtube.com/youtubei/v1/browse?key=',
  HTML_BASE_SEARCH_QUERY_URL: 'https://youtube.com/results',
  DEFAULT_HTML_YOUTUBE_API_KEY: 'AIzaSyAO_FJ2SlqU8Q4STEHLGCilw_Y9_11qcW8',
  HTML_YOUTUBE_BASE_SEARCH_QUERY_URL: 'https://youtube.com/results?q=',
  HTML_YOUTUBE_VIDEO_BASE_URL: 'https://www.youtube.com/watch?v=',
  HTML_YOUTUBE_CHANNEL_BASE_URL: 'https://www.youtube.com/channel/',
  HTML_YOUTUBE_USER_BASE_URL: 'https://www.youtube.com/c/',
  HTML_YOUTUBE_THUMBNAIL_BASE_URL: 'https://i3.ytimg.com/vi/',
  HTML_YOUTUBE_HOMEPAGE_BASE_URL: 'https://www.youtube.com?hl=en',
  HTML_YOUTUBE_TRENDING_PAGE_BASE_URL:
    'https://www.youtube.com/feed/explore?hl=en',
  HTML_YOUTUBE_PLAYLIST_BASE_URL: 'https://www.youtube.com/playlist?list=',
  HTML_YOUTUBE_HEADER_DATA: {
    'User-Agent':
      'Mozilla/5.0 (Windows NT 10.0; rv:78.0) Gecko/20100101 Firefox/78.0',
  },
}

/**
 * @typedef {Object} httpRequestOptions
 * @property {String | Object} proxy Proxy Value as "https://www.goggle.com:456" or { host: "www.google.com", port: 456 } as Value
 * @property {object} headers headers Value for Axios Get and Post Request | Default -> { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; rv:78.0) Gecko/20100101 Firefox/78.0", }
 * @property {String} cookie Youtube Cookie Vlaue in string as 1 line if possible | Cookie Session Value can be collected after inspecting network packets in youtube Homepage
 */

const httpRequestOptions = {
  proxy: '' || { host: '', port: 0 },
  headers: { ...enumData.HTML_YOUTUBE_HEADER_DATA, cookie: '' },
  cookie: '',
  ...{},
}

/**
 * @typedef {Object} youtubeValidateData
 * @property {string} Id Validata fetched Id Data
 * @property {string} url Type Based Parsed Url
 * @property {string} type Data validation Type | like -> 'video' , 'channel' . 'playlist' , 'query'
 * @property {boolean} isSafeCheck Safety Checks for Videos Only if Safe Search Mode is enabled
 */

const youtubeValidateData = {
  Id: '',
  url: '',
  type: '',
  isSafeCheck: true,
}

/**
 * @typedef {Object} searchOptions
 * @property {string} type Search Options Filter Type
 * @property {boolean} safeSearchMode Safe Search Mode for Search Query Filter
 * @property {string} limit Limit Count Number for fetch Data in Array
 * @property {httpRequestOptions} AxiosHttpRequestConfigs Axios Config Options like 'headers' and many more...
 */

const searchOptions = {
  type: 'all',
  safeSearchMode: true,
  limit: 1,
  AxiosHttpRequestConfigs: httpRequestOptions,
}

/**
 * @typedef {Object} embedHTMLvideoURLOptions
 * @property {string} id Embed YTPLAYER Id
 * @property {number} width Embed's Width Value
 * @property {number} height Embed's Height Value
 */

const embedHTMLvideoURLOptions = {
  id: 'ytplayer',
  width: 640,
  height: 360,
}

module.exports = {
  youtubeUrlParseHtmlSearchData,
  enumData,
  searchOptions,
  youtubeValidateData,
  embedHTMLvideoURLOptions,
  httpRequestOptions,
}
