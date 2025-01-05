import { join } from 'node:path'

export const testTempDir = join(import.meta.dirname, './tmp')

export const videosPath = join(import.meta.dirname, 'videos')

global.config = {
  plex: {
    token: 'test',
    url: 'http://localhost:32400',
  },
  tmdb: {
    token: 'test',
    url: 'http://localhost:32400',
  },
  transcodeCachePath: join(testTempDir, 'transcode_cache'),
}
