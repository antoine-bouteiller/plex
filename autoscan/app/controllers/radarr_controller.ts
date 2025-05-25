import type { FastifyReply, FastifyRequest } from 'fastify'

import { handleError } from '#exceptions/handler'
import { getLanguage } from '#services/language_service'
import { getSections, refreshSection } from '#services/plex_service'
import { TranscodeService } from '#services/transcode_service'
import { radarrValidator } from '#validators/radarr_validator'
import { join } from 'node:path'

export const radarrWebhook = async (request: FastifyRequest, response: FastifyReply) => {
  const body = await radarrValidator.validate(request.body)

  const eventType = body.eventType

  if (eventType === 'Test') {
    response.send('ok')
    return
  }

  try {
    if (eventType === 'Download') {
      const file = join(body.movie.folderPath, body.movieFile.relativePath)
      const originalLanguage = await getLanguage(body.movie.tmdbId, 'movie')

      const transcodeService = new TranscodeService(file, body.movie.title, originalLanguage)

      await transcodeService.transcodeFile()
    }
    const sections = await getSections()

    for (const section of sections.filter((section) => section.type === 'movie')) {
      await refreshSection(section.key, body.movie.folderPath)
    }
  } catch (err) {
    handleError(err)
  }

  response.send('ok')
}
