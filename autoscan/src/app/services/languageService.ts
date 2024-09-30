import { logger } from "#config/logger";
import prisma from "#config/prisma";
import { updateStream } from "#services/plexService";
import { getLanguageByIdAndType } from "#services/tmdbService";
import type { iso2 } from "#types/isoCodes";
import type { PlexMediaStream } from "#types/plex";

export async function handleUpdateLanguage(
  mediaName: string,
  streams: PlexMediaStream[],
  originalLanguage: string,
  partsId: number,
) {
  await handleSubtitles(streams, mediaName, partsId, originalLanguage);
  await handleAudio(streams, mediaName, partsId, originalLanguage);
}

function getStreams(
  stream: PlexMediaStream[],
  streamType: number,
  languageTag: string,
) {
  const englishStreams = stream.filter(
    (stream: PlexMediaStream) =>
      stream.streamType === streamType && stream.languageCode === languageTag,
  );
  if (englishStreams.length === 0) {
    return null;
  }

  return (
    englishStreams.find(
      (stream) =>
        !stream.title?.toLocaleLowerCase().includes("sdh") &&
        !stream.title?.toLocaleLowerCase().includes("forced"),
    ) ||
    englishStreams.find(
      (stream) => !stream.title?.toLocaleLowerCase().includes("forced"),
    ) ||
    englishStreams[0]
  );
}

async function handleSubtitles(
  streams: PlexMediaStream[],
  mediaName: string,
  partsId: number,
  originalLanguage: string,
) {
  const subtitleStream = getStreams(streams, 3, "eng");
  if (!subtitleStream) {
    logger.warn(`[${mediaName}] No english subtitle stream found`);
    return;
  }
  if (!subtitleStream.selected) {
    logger.info(`[${mediaName}] Setting subtitles`);
    await updateStream(
      partsId,
      subtitleStream.id,
      originalLanguage,
      "subtitle",
    );
  }
}

async function handleAudio(
  streams: PlexMediaStream[],
  mediaName: string,
  partsId: number,
  originalLanguage: string,
) {
  const audioStream = getStreams(streams, 2, originalLanguage);
  if (!audioStream) {
    logger.warn(`[${mediaName}] No ${originalLanguage} audio stream found`);
    return;
  }
  if (!audioStream.selected) {
    logger.info(`[${mediaName}] Setting audio in ${originalLanguage}`);
    await updateStream(partsId, audioStream.id, originalLanguage, "audio");
  }
}

export async function getLanguage(
  tmdbId: number,
  mediaType: "movie" | "episode",
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
      : "eng";
  } else {
    originalLanguage = mediaDetails.originalLanguage as iso2;
  }

  return originalLanguage;
}
