import type { iso2 } from '#types/iso_codes'
import type { MediaType, PlexMediaStream } from '#types/plex'

import { logger } from '#config/logger'
import prisma from '#config/prisma'
import { updateStream } from '#services/plex_service'
import { getLanguageByIdAndType } from '#services/tmdb_service'

export async function getLanguage(tmdbId: number, mediaType: MediaType) {
  const mediaDetails = await prisma.media.findUnique({
    where: {
      tmdbId,
      type: mediaType,
    },
  })

  let originalLanguage: iso2
  if (!mediaDetails) {
    originalLanguage = tmdbId ? await getLanguageByIdAndType(tmdbId, mediaType) : 'eng'
  } else {
    originalLanguage = mediaDetails.originalLanguage as iso2
  }

  return originalLanguage
}

export async function handleUpdateLanguage(
  mediaTitle: string,
  streams: PlexMediaStream[],
  originalLanguage: iso2,
  partsId: number
) {
  const audioStream = streams.find(
    (stream: PlexMediaStream) =>
      stream.streamType === 2 && stream.languageCode === originalLanguage.replace('fre', 'fra')
  )
  if (!audioStream) {
    logger.warn(`[${mediaTitle}] No ${originalLanguage} audio stream found`)
    return
  }
  if (!audioStream.selected) {
    logger.info(`[${mediaTitle}] Setting audio in ${originalLanguage}`)
    await updateStream(partsId, audioStream.id, originalLanguage, 'audio')
  }
}
