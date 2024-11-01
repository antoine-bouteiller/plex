type Movie = {
  title: string;
  tmdbId: number;
  folderPath: string;
};

type MovieFile = {
  relativePath: string;
};

export type RadarrRequest = {
  movie: Movie;
  movieFile: MovieFile;
  eventType: 'Test' | 'Download';
};
