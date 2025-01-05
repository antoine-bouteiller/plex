export interface RadarrRequest {
  eventType: 'DeleteFile' | 'Download' | 'Test'
  movie: Movie
  movieFile: MovieFile
}

interface Movie {
  folderPath: string
  title: string
  tmdbId: number
}

interface MovieFile {
  relativePath: string
}
