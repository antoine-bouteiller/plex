type EpisodeFile = {
  relativePath: string;
};

type Episode = {
  title: string;
};

type Series = {
  title: string;
  path: string;
  tmdbId: number;
};

export type SonarrRequest = {
  series: Series;
  episodes: Episode[];
  episodeFile: EpisodeFile;
  eventType: 'Test' | 'Download' | 'EpisodeFileDelete' | 'SeriesDelete';
};
