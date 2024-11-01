import { join } from 'node:path';

export const testTempDir = join(import.meta.dirname, './tmp');

export const videosPath = join(import.meta.dirname, 'videos');

global.config = {
  transcodeCachePath: join(testTempDir, 'transcode_cache'),
  plex: {
    url: 'http://localhost:32400',
    token: 'test',
  },
  tmdb: {
    url: 'http://localhost:32400',
    token: 'test',
  },
};
