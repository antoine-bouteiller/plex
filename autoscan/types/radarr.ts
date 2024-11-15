interface Movie {
  title: string
  tmdbId: number
  folderPath: string
}

interface MovieFile {
  relativePath: string
}

export interface RadarrRequest {
  movie: Movie
  movieFile: MovieFile
  eventType: 'Test' | 'Download' | 'DeleteFile'
}
