import prisma from "#config/prisma";
import executeWithErrorHandler from "#exceptions/handler";
import { handleUpdateLanguage } from "#services/languageService";
import {
  getMediaDetails,
  getSectionMedia,
  getSections,
} from "#services/plexService";
import type { PlexMedia } from "#types/plex";

export async function languageController() {
  const sections = await getSections();

  for (const section of sections) {
    const medias = await getSectionMedia(section.key, section.type);

    for (const media of medias) {
      const processedMedias = await prisma.processedMedia.findUnique({
        where: {
          plexId: media.ratingKey,
        },
      });
      if (!processedMedias) {
        await executeWithErrorHandler(() => handleMedia(media, section.key));
      }
    }
  }
}

async function handleMedia(plexMedia: PlexMedia, sectionId: number) {
  const { streams, tmdbId, originalLanguage, mediaTitle, partsId } =
    await getMediaDetails(plexMedia);

  await executeWithErrorHandler(async () =>
    handleUpdateLanguage(mediaTitle, streams, originalLanguage, partsId),
  );

  await prisma.processedMedia.create({
    data: {
      plexId: plexMedia.ratingKey,
      tmdbId,
      title: mediaTitle,
    },
  });
}
