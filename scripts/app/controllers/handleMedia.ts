import { readFileSync, writeFileSync } from "node:fs";
import { logger } from "../../start/logger";
import { transcodeFiles } from "../services/transcodeFiles";
import { handleUpdateLanguage } from "../services/updateLanguage";
import type { Media, TreatedMedias } from "../types/plex";
import { getMediaByKey, getSectionMedia, getSections } from "../utils/plex";
import {
  getLanguageTvdbSerieById,
  getTvdbMovieLanguageByYearAndName,
} from "../utils/tvdb";

export async function handleMedias() {
  const sections = await getSections();

  const treatedMedias: TreatedMedias = JSON.parse(
    readFileSync("config/treatedMedias.json", "utf-8"),
  );

  for (const section of sections) {
    const newTreated: string[] = [];
    const medias = await getSectionMedia(section.key);
    for (const media of medias) {
      if (!treatedMedias[section.key]?.includes(media.ratingKey)) {
        try {
          await handleMedia(media, section.key);
          newTreated.push(media.ratingKey);
        } catch (err) {
          logger.error(err);
        }
      }
    }
    writeFileSync(
      "config/treatedMedias.json",
      JSON.stringify({ ...treatedMedias, [section.key]: newTreated }),
    );
  }
}

async function handleMedia(media: Media, sectionId: number) {
  const { fileName, streams } = await getMediaByKey(media.key).then((res) => {
    return {
      fileName: res[0].Media[0].Part[0].file,
      streams: res[0].Media[0].Part[0].Stream,
    };
  });
  const mediaName = media.title;
  let originalLanguage = "eng";
  if (media.type === "movie") {
    originalLanguage = await getTvdbMovieLanguageByYearAndName(
      mediaName,
      media.year,
    );
  } else if (media.type === "episode") {
    const tvdbId = /{tvdb-(.*)}/g.exec(fileName)?.[1];
    originalLanguage = tvdbId ? await getLanguageTvdbSerieById(tvdbId) : "eng";
  }

  const fullName = media.grandparentTitle
    ? `${media.grandparentTitle} ${media.parentTitle ?? ""}: ${mediaName}`
    : mediaName;

  logger.info("-------------------------------------------------------------");
  logger.info(`Processing ${fullName}`);
  logger.info("-------------------------------------------------------------");

  await transcodeFiles(
    media.Media[0].Part[0].file,
    originalLanguage,
    fullName,
    sectionId,
  );

  await handleUpdateLanguage(
    fullName,
    streams,
    originalLanguage,
    media.Media[0].Part[0].id,
  );
}
