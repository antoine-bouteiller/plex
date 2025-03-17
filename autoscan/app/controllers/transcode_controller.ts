import { logger } from '#config/logger'
import executeWithErrorHandler from '#exceptions/handler'
import {
  getMediaDetails,
  getSectionMedia,
  getSections,
  refreshSection,
} from '#services/plex_service'
import { TranscodeService } from '#services/transcode_service'
import { resolve } from 'node:path'

export async function transcodeController() {
  const sections = await getSections()

  for (const section of sections) {
    const medias = await getSectionMedia(section.key, section.type)

    for (const media of medias) {
      const { file, mediaTitle, originalLanguage } = await getMediaDetails(media)

      const transcodeService = new TranscodeService(file, mediaTitle, originalLanguage)

      const executedTranscode = await executeWithErrorHandler(() =>
        transcodeService.transcodeFile()
      )

      if (executedTranscode) {
        await refreshSection(section.key, resolve(file, '..'))
      }
    }
  }

  logger.info('Transcoding finished')
}
