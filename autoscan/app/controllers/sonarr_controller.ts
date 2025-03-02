import type { SonarrRequest } from '#types/sonarr'
import type { Request, Response } from 'hyper-express'

import { handleError } from '#exceptions/handler'
import { getLanguage } from '#services/language_service'
import { getSections, refreshSection } from '#services/plex_service'
import { transcodeFile } from '#services/transcode_service'
import { join } from 'node:path'

export const sonarrController = async (request: Request, response: Response) => {
  const body: SonarrRequest = await request.json()

  const eventType = body.eventType

  if (eventType === 'Test') {
    response.send('ok')
    return
  }

  try {
    if (eventType === 'Download') {
      const file = join(body.series.path, body.episodeFile.relativePath)

      const originalLanguage = await getLanguage(body.series.tmdbId, 'episode')

      await transcodeFile(file, originalLanguage, `${body.series.title} ${body.episodes[0].title}`)
    }

    const sections = await getSections()

    for (const section of sections.filter((section) => section.type === 'show')) {
      await refreshSection(section.key, body.series.path)
    }
  } catch (err) {
    await handleError(err)
  }

  response.send('ok')
}
