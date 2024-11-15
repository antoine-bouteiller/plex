import { join } from 'node:path'

import type { Request, Response } from 'hyper-express'

import { logger } from '#config/logger'
import { getLanguage } from '#services/language_service'
import { getSections, refreshSection } from '#services/plex_service'
import { transcodeFile } from '#services/transcode_service'
import type { RadarrRequest } from '#types/radarr'

export const radarrController = async (request: Request, response: Response) => {
  const body: RadarrRequest = await request.json()

  const eventType = body.eventType

  if (eventType === 'Test') {
    response.send('ok')
    return
  }

  try {
    if (eventType === 'Download') {
      const file = join(body.movie.folderPath, body.movieFile.relativePath)
      const originalLanguage = await getLanguage(body.movie.tmdbId, 'episode')

      await transcodeFile(file, originalLanguage, body.movie.title)
    }
    const sections = await getSections()

    for (const section of sections.filter((section) => section.type === 'movie')) {
      await refreshSection(section.key, body.movie.folderPath)
    }
  } catch (err) {
    logger.error(err)
    logger.error(JSON.stringify(body))
  }

  response.send('ok')
}
