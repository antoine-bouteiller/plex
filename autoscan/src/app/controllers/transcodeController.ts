import path from "node:path";
import prisma from "#config/prisma";
import executeWithErrorHandler from "#exceptions/handler";
import {
  getMediaDetails,
  getSectionMedia,
  getSections,
  refreshSection,
} from "#services/plexService";
import { transcodeFile } from "#services/transcodeService";

export async function transcodeController() {
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
        const { file, originalLanguage, mediaTitle } =
          await getMediaDetails(media);

        const executedTranscode = await executeWithErrorHandler(() =>
          transcodeFile(file, originalLanguage, mediaTitle),
        );

        if (executedTranscode) {
          await refreshSection(section.key, path.resolve(file, ".."));
        }
      }
    }
  }
}
