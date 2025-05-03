export interface SonarrRequest {
  episodeFile: EpisodeFile
  episodes: Episode[]
  eventType: 'Download' | 'EpisodeFileDelete' | 'SeriesDelete' | 'Test'
  series: Series
}

interface Episode {
  title: string
}

interface EpisodeFile {
  relativePath: string
}

interface Series {
  tmdbId: number
  path: string
  title: string
}
