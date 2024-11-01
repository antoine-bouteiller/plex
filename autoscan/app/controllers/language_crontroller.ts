import { logger } from "#config/logger";
import executeWithErrorHandler from "#exceptions/handler";
import { handleUpdateLanguage } from "#services/language_service";
import {
  getMediaDetails,
  getSectionMedia,
  getSections,
} from "#services/plex_service";

export async function languageController() {
  const sections = await getSections();

  for (const section of sections) {
    const medias = await getSectionMedia(section.key, section.type);
    for (const media of medias) {
      const { streams, originalLanguage, mediaTitle, partsId } =
        await getMediaDetails(media);

      if (!streams?.length) {
        logger.warn(
          `[${mediaTitle}] No streams found: ${JSON.stringify(media)}`
        );
        return;
      }

      await executeWithErrorHandler(async () =>
        handleUpdateLanguage(mediaTitle, streams, originalLanguage, partsId)
      );
    }
  }
}
