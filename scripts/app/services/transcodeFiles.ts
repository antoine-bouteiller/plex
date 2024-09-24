import ffmpegPath from "ffmpeg-ffprobe-static";
import ffmpeg, { type FfprobeStream } from "fluent-ffmpeg";
import { logger } from "../../start/logger";
import { executeFfmpeg, getFfprobeData } from "../utils/ffmpeg";

if (!ffmpegPath.ffmpegPath || !ffmpegPath.ffprobePath) {
  throw new Error("ffmpegPath not found");
}

ffmpeg.setFfprobePath(ffmpegPath.ffprobePath);
ffmpeg.setFfmpegPath(ffmpegPath.ffmpegPath);

export async function transcodeFiles(
  file: string,
  originalLanguage: string,
  mediaName: string,
  librarySectionId: number,
) {
  const ffProbeData = await getFfprobeData(file);

  const command = cleanAudio(ffProbeData.streams, originalLanguage, mediaName);

  command.push(...cleanSubtitles(ffProbeData.streams, mediaName));

  const [fileName, extension] = [
    file.slice(0, file.lastIndexOf(".")).split("/").pop(),
    file.split(".").pop(),
  ];

  if (command.length > 0) {
    await executeFfmpeg(
      file,
      ["-map 0", ...command, "-c copy"],
      mediaName,
      fileName,
      librarySectionId,
    );
  } else if (extension !== "mkv") {
    logger.info(`[${mediaName}] Transcoding to mkv`);
    await executeFfmpeg(
      file,
      ["-c copy"],
      mediaName,
      fileName,
      librarySectionId,
    );
  }
}

function cleanAudio(
  streams: FfprobeStream[],
  originalLanguage: string,
  mediaName: string,
) {
  const command: string[] = [];

  let removedAudio = 0;
  let audioIdx = 0;

  for (const stream of streams) {
    if (stream.codec_type?.toLowerCase() !== "audio") continue;

    let kept = true;

    if (
      typeof stream.tags === "undefined" ||
      typeof stream.tags.language === "undefined" ||
      stream.tags.language.toLowerCase() === "und"
    ) {
      command.push(`-metadata:s:a:${audioIdx} language=${originalLanguage}`);
      logger.info(
        `[${mediaName}] Audio stream 0:a:${audioIdx} detected as having no language, tagging as ${originalLanguage}.`,
      );
    } else if (
      ![originalLanguage, "fre", "eng"].includes(
        stream.tags.language.toLowerCase(),
      )
    ) {
      logger.info(
        `[${mediaName}] Audio stream 0:a:${audioIdx} has unwanted language tag ${stream.tags.language.toLowerCase()}, removing.`,
      );
      command.push(`-map -0:a:${audioIdx}`);
      removedAudio += 1;
      kept = false;
    }

    if (kept && stream.codec_name?.toLowerCase() === "dts") {
      command.push(`-map 0:a:${audioIdx} -c:a:${audioIdx} aac`);
      logger.info(
        `[${mediaName}] Audio stream 0:a:${audioIdx} is dts, converting to aac.`,
      );
    }
  }

  audioIdx += 1;

  if (removedAudio === audioIdx) {
    logger.warn(
      `[${mediaName}] Not removing any audio streams because all streams would be removed.`,
    );
    return [];
  }

  return command;
}

function cleanSubtitles(streams: FfprobeStream[], mediaName: string) {
  const command: string[] = [];

  let subIdx = 0;

  for (const stream of streams) {
    if (stream.codec_type?.toLowerCase() !== "subtitle") continue;

    try {
      if (
        typeof stream.tags === "undefined" ||
        typeof stream.tags.language === "undefined" ||
        stream.tags.language.toLowerCase() === "und"
      ) {
        command.push(`-metadata:s:s:${subIdx} language=eng`);
        logger.info(
          `[${mediaName}] Subtitle stream 0:s:${subIdx} detected as having no language, tagging as eng.`,
        );
      } else if (stream.tags.language.toLowerCase() !== "eng") {
        logger.info(
          `[${mediaName}] Subtitle stream 0:s:${subIdx} has unwanted language tag ${stream.tags.language.toLowerCase()}, removing.`,
        );
        command.push(`-map -0:s:${subIdx}`);
      }

      if (stream.tags.language.toLowerCase().includes("und")) {
        command.push(`-metadata:s:a:${subIdx} language=eng`);
        logger.info(
          `[${mediaName}] Subtitle stream 0:s:${subIdx} detected as having no language, tagging as eng.`,
        );
      }

      subIdx += 1;
    } catch (err) {
      logger.error(err);
    }
  }

  return command;
}
