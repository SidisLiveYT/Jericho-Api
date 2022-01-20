const youtubeUrlParseHtmlSearchData = {
  parsedData: '',
  parsedUrl: '',
  searchQueryUrl: '',
  contentType: '',
  rawMatchData: [],
}

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

const httpRequestOptions = {
  proxy: '' || { host: '', port: 0 },
  headers: { ...enumData.HTML_YOUTUBE_HEADER_DATA, cookie: '' },
  ...{},
}

const youtubeValidateData = {
  Id: '',
  url: '',
  type: '',
  isSafeCheck: true,
}

const searchOptions = {
  type: 'all',
  safeSearchMode: true,
  limit: 1,
  AxiosHttpRequestConfigs: httpRequestOptions,
}

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
