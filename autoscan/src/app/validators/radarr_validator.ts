import { z } from 'zod'

export const radarrValidator = z.object({
  eventType: z.enum(['DeleteFile', 'Download', 'Test']),
  movie: z.optional(
    z.object({
      tmdbId: z.coerce.number(),
      folderPath: z.string(),
      title: z.string(),
    })
  ),
  movieFile: z.optional(
    z.object({
      relativePath: z.string(),
    })
  ),
})
