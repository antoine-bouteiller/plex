import axios, { AxiosError } from "axios";
import { readFileSync, writeFileSync } from "node:fs";
import { HEADERS, PLEX_URL } from "../../start/environement";
import { logger } from "../../start/logger";
import type { Media, MediaStream, TreatedMedias } from "../types/plex";
import { getMediaByKey, getSectionMedia } from "../utils/plex";
import { getTvdbMovieByYearAndName, getTvdbSerieById } from "../utils/tvdb";

export async function updateLanguage(sectionId: number) {
  try {
    const treatedMedias: TreatedMedias = JSON.parse(
      readFileSync("config/treatedMedias.json", "utf-8")
    );
    const newTreated: string[] = [];
    const medias = await getSectionMedia(sectionId);
    for (const media of medias) {
      if (!treatedMedias[sectionId]?.includes(media.ratingKey)) {
        handleUpdateLanguage(media);
      }

      newTreated.push(media.ratingKey);
    }
    writeFileSync(
      "config/treatedMedias.json",
      JSON.stringify({ ...treatedMedias, [sectionId]: newTreated })
    );
  } catch (err) {
    if (err instanceof Error) {
      logger.error(err.message);
    } else if (err instanceof AxiosError) {
      logger.error(err.response?.data);
    }
  }
}

export async function handleUpdateLanguage(media: Media) {
  const partsId = media.Media[0].Part[0].id;
  const tvShowName = media.grandparentTitle
    ? `${media.grandparentTitle} ${media.parentTitle ?? ""}:`
    : "";
  const mediaName = media.title;
  const { fileName, streams } = await getMediaByKey(media.key).then((res) => {
    return {
      fileName: res[0].Media[0].Part[0].file,
      streams: res[0].Media[0].Part[0].Stream,
    };
  });

  let originalLanguage = "eng";
  if (media.type === "movie") {
    originalLanguage = await getTvdbMovieByYearAndName(mediaName, media.year);
  } else if (media.type === "episode") {
    const tvdbId = /{tvdb-(.*)}/g.exec(fileName)?.[1];
    originalLanguage = tvdbId ? await getTvdbSerieById(tvdbId) : "eng";
  }
  await handleSubtitles(
    streams,
    mediaName,
    tvShowName,
    partsId,
    originalLanguage
  );
  await handleAudio(streams, tvShowName, mediaName, partsId, originalLanguage);
}

function getStreams(
  stream: MediaStream[],
  streamType: number,
  languageTag: string
) {
  const englishStreams = stream.filter(
    (stream: MediaStream) =>
      stream.streamType === streamType && stream.languageCode === languageTag
  );
  if (englishStreams.length === 0) {
    return null;
  }

  return (
    englishStreams.find(
      (stream) =>
        !stream?.title?.toLocaleLowerCase()?.includes("sdh") &&
        !stream?.title?.toLocaleLowerCase()?.includes("forced")
    ) ||
    englishStreams.find(
      (stream) => !stream?.title?.toLocaleLowerCase()?.includes("forced")
    ) ||
    englishStreams[0]
  );
}

async function handleSubtitles(
  streams: MediaStream[],
  mediaName: string,
  tvShowName: string,
  partsId: number,
  originalLanguage: string
) {
  const subtitleStream = getStreams(streams, 3, "eng");
  if (!subtitleStream) {
    logger.info(
      `No english subtitle stream found for ${tvShowName} ${mediaName} `
    );
    return;
  }
  if (!subtitleStream.selected) {
    logger.info(`Setting subtitles for ${tvShowName} ${mediaName} in English`);
    await axios
      .put(
        `${PLEX_URL}/library/parts/${partsId}?subtitleStreamID=${
          originalLanguage === "fr" ? 0 : subtitleStream.id
        }&allParts=1`,
        undefined,
        { headers: HEADERS }
      )
      .catch((err) => {
        logger.error(err?.reponse?.data);
      });
  }
}

async function handleAudio(
  streams: MediaStream[],
  tvShowName: string,
  mediaName: string,
  partsId: number,
  originalLanguage: string
) {
  const audioStreams = getStreams(streams, 2, originalLanguage);
  if (!audioStreams) {
    logger.info(
      `No ${originalLanguage} audio stream found for ${tvShowName} ${mediaName} `
    );
    return;
  }
  if (!audioStreams.selected) {
    logger.info(
      `Setting audio for ${tvShowName} ${mediaName} in ${originalLanguage}`
    );
    await axios
      .put(
        `${PLEX_URL}/library/parts/${partsId}?audioStreamID=${
          originalLanguage === "fr" ? 0 : audioStreams.id
        }&allParts=1`,
        undefined,
        { headers: HEADERS }
      )
      .catch((err) => {
        logger.error(err?.message);
      });
  }
}
