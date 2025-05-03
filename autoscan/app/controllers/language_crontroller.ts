import { logger } from '#config/logger'
import executeWithErrorHandler from '#exceptions/handler'
import { handleUpdateLanguage } from '#services/language_service'
import { getMediaDetails, getSectionMedia, getSections } from '#services/plex_service'

export async function languageController() {
  const sections = await getSections()

  for (const section of sections) {
    const medias = await getSectionMedia(section.key, section.type)
    for (const media of medias) {
      const { partsId, mediaTitle, originalLanguage, streams } = await getMediaDetails(media)

      if (!streams.filter((stream) => stream.streamType === 2).length) {
        logger.error(`[${mediaTitle}] No audio streams found: ${JSON.stringify(media)}`)
        return
      }

      if (!streams.filter((stream) => stream.streamType === 1).length) {
        logger.error(`[${mediaTitle}] No video streams found: ${JSON.stringify(media)}`)
        return
      }

      await executeWithErrorHandler(async () =>
        handleUpdateLanguage(mediaTitle, streams, originalLanguage, partsId)
      )
    }
  }
}
