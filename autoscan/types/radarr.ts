export interface RadarrRequest {
  eventType: 'DeleteFile' | 'Download' | 'Test'
  movie: Movie
  movieFile: MovieFile
}

interface Movie {
  tmdbId: number
  folderPath: string
  title: string
}

interface MovieFile {
  relativePath: string
}
