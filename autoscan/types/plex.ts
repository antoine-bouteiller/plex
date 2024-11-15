export interface PlexMediaStream {
  title?: string
  selected: boolean
  id: number
  streamType: number
  languageCode: string
}

export interface PlexMedia {
  librarySectionID: number
  Media: {
    Part: {
      id: number
      file: string
      Stream: PlexMediaStream[]
    }[]
  }[]
  key: string
  title: string
  ratingKey: string
  type: 'episode' | 'movie'
  grandparentTitle?: string
  parentTitle?: string
  primaryExtraKey: string
  year: number
}

export interface PlexReponse {
  MediaContainer: {
    Directory: {
      key: number
      title: string
      type: 'movie' | 'show'
    }[]
    Metadata: PlexMedia[]
  }
}
