import { logger } from '#config/logger';
import prisma from '#config/prisma';
import { updateStream } from '#services/plex_service';
import { getLanguageByIdAndType } from '#services/tmdb_service';
import type { iso2 } from '#types/iso_codes';
import type { PlexMediaStream } from '#types/plex';

export async function handleUpdateLanguage(
  mediaTitle: string,
  streams: PlexMediaStream[],
  originalLanguage: string,
  partsId: number,
) {
  const audioStream = getStreams(streams, 2, originalLanguage);
  if (!audioStream) {
    logger.warn(`[${mediaTitle}] No ${originalLanguage} audio stream found`);
    return;
  }
  if (!audioStream.selected) {
    logger.info(`[${mediaTitle}] Setting audio in ${originalLanguage}`);
    await updateStream(partsId, audioStream.id, originalLanguage, 'audio');
  }
}

function getStreams(
  streams: PlexMediaStream[],
  streamType: number,
  languageTag: string,
) {
  const englishStreams = streams.filter(
    (stream: PlexMediaStream) =>
      stream.streamType === streamType && stream.languageCode === languageTag,
  );
  if (englishStreams.length === 0) {
    return null;
  }

  return (
    englishStreams.find(
      (stream) =>
        !stream.title?.toLocaleLowerCase().includes('sdh') &&
        !stream.title?.toLocaleLowerCase().includes('forced'),
    ) ||
    englishStreams.find(
      (stream) => !stream.title?.toLocaleLowerCase().includes('forced'),
    ) ||
    englishStreams[0]
  );
}

export async function getLanguage(
  tmdbId: number,
  mediaType: 'movie' | 'episode',
) {
  const mediaDetails = await prisma.media.findUnique({
    where: {
      tmdbId,
    },
  });

  let originalLanguage: iso2;
  if (!mediaDetails) {
    originalLanguage = tmdbId
      ? await getLanguageByIdAndType(tmdbId, mediaType)
      : 'eng';
  } else {
    originalLanguage = mediaDetails.originalLanguage as iso2;
  }

  return originalLanguage;
}
