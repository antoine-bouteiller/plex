import vine from '@vinejs/vine'

export const radarrValidator = vine.compile(
  vine.object({
    eventType: vine.enum(['DeleteFile', 'Download', 'Test']),
    movie: vine.object({
      tmdbId: vine.number(),
      folderPath: vine.string(),
      title: vine.string(),
    }),
    movieFile: vine.object({
      relativePath: vine.string(),
    }),
  })
)
