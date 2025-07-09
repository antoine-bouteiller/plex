import { z } from 'zod/v4'

export const radarrValidator = z.object({
  eventType: z.enum(['DeleteFile', 'Download', 'Test']),
  movie: z.object({
    tmdbId: z.coerce.number(),
    folderPath: z.string(),
    title: z.string(),
  }),
  movieFile: z.object({
    relativePath: z.string(),
  }),
})
