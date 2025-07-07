import { z } from 'zod/v4'

export const sonarrValidator = z.object({
  episodeFile: z.object({
    relativePath: z.string(),
  }),
  episodes: z.array(
    z.object({
      title: z.string(),
    })
  ),
  eventType: z.enum(['Download', 'EpisodeFileDelete', 'SeriesDelete', 'Test']),
  series: z.object({
    tmdbId: z.number(),
    path: z.string(),
    title: z.string(),
  }),
})
