type EpisodeFile = {
  path: string;
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
  episode: Episode[];
  episodeFile: EpisodeFile;
  eventType: "Test" | "Download" | "EpisodeFileDelete";
};
