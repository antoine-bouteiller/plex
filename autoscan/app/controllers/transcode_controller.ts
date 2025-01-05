import { logger } from '#config/logger'
import executeWithErrorHandler from '#exceptions/handler'
import {
  getMediaDetails,
  getSectionMedia,
  getSections,
  refreshSection,
} from '#services/plex_service'
import { transcodeFile } from '#services/transcode_service'
import { resolve } from 'node:path'

export async function transcodeController() {
  const sections = await getSections()

  for (const section of sections) {
    const medias = await getSectionMedia(section.key, section.type)

    for (const media of medias) {
      const { file, mediaTitle, originalLanguage } = await getMediaDetails(media)

      const executedTranscode = await executeWithErrorHandler(() =>
        transcodeFile(file, originalLanguage, mediaTitle)
      )

      if (executedTranscode) {
        await refreshSection(section.key, resolve(file, '..'))
      }
    }
  }

  logger.info('Transcoding finished')
}
