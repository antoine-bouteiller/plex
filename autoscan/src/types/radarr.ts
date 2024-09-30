type Movie = {
  title: string;
  path: string;
  tmdbId: number;
};

export type RadarrRequest = {
  movie: Movie;
  eventType: "Test" | "Download";
};
