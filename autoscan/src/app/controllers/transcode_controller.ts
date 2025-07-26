import { resolve } from 'node:path'

import { tryCatch } from '@/app/exceptions/handler'
import {
  getMediaDetails,
  getSectionMedia,
  getSections,
  refreshSection,
} from '@/app/services/plex_service'
import { TranscodeService } from '@/app/services/transcode_service'
import { logger } from '@/config/logger'

export async function transcodeAll() {
  const sections = await getSections()

  await Promise.all(
    sections.map(async (section) => {
      const medias = await getSectionMedia(section.key, section.type)

      await Promise.all(
        medias.map(async (media) => {
          const { file, mediaTitle, originalLanguage } = await getMediaDetails(media)

          const transcodeService = new TranscodeService(file, mediaTitle, originalLanguage)

          const executedTranscode = await tryCatch(async () => transcodeService.transcodeFile())

          if (executedTranscode) {
            await refreshSection(section.key, resolve(file, '..'))
          }
        })
      )
    })
  )

  logger.info('Transcoding finished')
}
