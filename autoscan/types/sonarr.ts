interface EpisodeFile {
  relativePath: string
}

interface Episode {
  title: string
}

interface Series {
  title: string
  path: string
  tmdbId: number
}

export interface SonarrRequest {
  series: Series
  episodes: Episode[]
  episodeFile: EpisodeFile
  eventType: 'Test' | 'Download' | 'EpisodeFileDelete' | 'SeriesDelete'
}
