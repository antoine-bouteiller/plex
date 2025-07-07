import vine from '@vinejs/vine'

export const sonarrValidator = vine.compile(
  vine.object({
    episodeFile: vine.object({
      relativePath: vine.string(),
    }),
    episodes: vine.array(
      vine.object({
        title: vine.string(),
      })
    ),
    eventType: vine.enum(['Download', 'EpisodeFileDelete', 'SeriesDelete', 'Test']),
    series: vine.object({
      tmdbId: vine.number(),
      path: vine.string(),
      title: vine.string(),
    }),
  })
)
