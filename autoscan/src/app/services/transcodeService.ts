import ffmpeg from "#config/ffmpeg";
import { logger } from "#config/logger";
import type { FfprobeData, FfprobeStream } from "fluent-ffmpeg";
import { renameSync, unlinkSync } from "node:fs";

export async function transcodeFile(
  file: string,
  originalLanguage: string,
  mediaName: string
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
      fileName
    );
    return true;
  }
  if (extension !== "mkv") {
    logger.info(`[${mediaName}] Transcoding to mkv`);
    await executeFfmpeg(file, ["-c copy"], mediaName, fileName);
    return true;
  }
  return false;
}

function cleanAudio(
  streams: FfprobeStream[],
  originalLanguage: string,
  mediaName: string
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
        `[${mediaName}] Audio stream 0:a:${audioIdx} detected as having no language, tagging as ${originalLanguage}.`
      );
    } else if (
      ![originalLanguage, "fre", "eng"].includes(
        stream.tags.language.toLowerCase()
      )
    ) {
      logger.info(
        `[${mediaName}] Audio stream 0:a:${audioIdx} has unwanted language tag ${stream.tags.language.toLowerCase()}, removing.`
      );
      command.push(`-map -0:a:${audioIdx}`);
      removedAudio += 1;
      kept = false;
    }

    if (kept && stream.codec_name?.toLowerCase() === "dts") {
      if (
        !streams.some(
          (it) =>
            it.codec_name?.toLowerCase() !== "dts" &&
            it.tags?.language?.toLowerCase() ===
              stream.tags?.language?.toLowerCase()
        )
      ) {
        command.push(`-map 0:a:${audioIdx} -c:a aac`);
        logger.info(
          `[${mediaName}] Audio stream 0:a:${audioIdx} is dts, converting to aac.`
        );
      } else {
        logger.info(
          `[${mediaName}] Audio stream 0:a:${audioIdx} is dts, but another stream is not dts, removing dts.`
        );
        command.push(`-map -0:a:${audioIdx}`);
        removedAudio += 1;
      }
    }

    audioIdx += 1;
  }

  if (removedAudio === audioIdx) {
    logger.warn(
      `[${mediaName}] Not removing any audio streams because all streams would be removed.`
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
        !stream.tags ||
        !stream.tags.language ||
        stream.tags.language.toLowerCase() === "und"
      ) {
        command.push(`-metadata:s:s:${subIdx} language=eng`);
        logger.info(
          `[${mediaName}] Subtitle stream 0:s:${subIdx} detected as having no language, tagging as eng.`
        );
      } else if (stream.tags.language.toLowerCase() !== "eng") {
        logger.info(
          `[${mediaName}] Subtitle stream 0:s:${subIdx} has unwanted language tag ${stream.tags.language.toLowerCase()}, removing.`
        );
        command.push(`-map -0:s:${subIdx}`);
      } else if (stream.tags.title?.toLowerCase().includes("forced")) {
        logger.info(
          `[${mediaName}] Subtitle stream 0:s:${subIdx} has unwanted title ${stream.tags.title}, removing.`
        );
        command.push(`-map -0:s:${subIdx}`);
      }

      if (stream.tags.language.toLowerCase().includes("und")) {
        command.push(`-metadata:s:a:${subIdx} language=eng`);
        logger.info(
          `[${mediaName}] Subtitle stream 0:s:${subIdx} detected as having no language, tagging as eng.`
        );
      }

      subIdx += 1;
    } catch (err) {
      logger.error(err);
    }
  }

  return command;
}

function getFfprobeData(file: string): Promise<FfprobeData> {
  return new Promise((resolve, reject) => {
    ffmpeg(file).ffprobe((err, data) => {
      if (err) {
        reject(new Error(err));
      } else {
        resolve(data);
      }
    });
  });
}

async function executeFfmpeg(
  file: string,
  command: string[],
  mediaName: string,
  fileName: string | undefined
) {
  let prevProgress = -1;
  const path = file.split("/");
  path.pop();

  await new Promise((resolve, reject) =>
    ffmpeg(file, { logger })
      .outputOptions(command)
      .on("progress", (progress) => {
        const progressPercent = Math.round(progress.percent ?? 0);
        if (progressPercent % 10 === 0 && progressPercent !== prevProgress) {
          prevProgress = progressPercent;
          logger.info(
            `[${mediaName}] [${"=".repeat(
              Math.floor(progressPercent / 10)
            )}${"-".repeat(
              Math.max(10 - Math.floor(progressPercent / 10), 0)
            )}] ${Math.floor(progressPercent)}%`
          );
        }
      })
      .on("error", (err) => {
        reject(err);
      })
      .on("end", resolve)
      .saveToFile(`/data/transcode_cache/${fileName}.mkv`)
  );

  unlinkSync(file);

  renameSync(
    `/data/transcode_cache/${fileName}.mkv`,
    `${path.join("/")}/${fileName}.mkv`
  );
}
