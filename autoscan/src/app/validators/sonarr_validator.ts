import { z } from 'zod/v4'

export const sonarrValidator = z.object({
  episodeFile: z.optional(
    z.object({
      relativePath: z.string(),
    })
  ),
  episodes: z.optional(
    z.array(
      z.object({
        title: z.string(),
      })
    )
  ),
  eventType: z.enum(['Download', 'EpisodeFileDelete', 'SeriesDelete', 'Test']),
  series: z.optional(
    z.object({
      tmdbId: z.coerce.number(),
      path: z.string(),
      title: z.string(),
    })
  ),
})
