import axios from "axios";
import ffmpeg, { type FfprobeData } from "fluent-ffmpeg";
import { renameSync, unlinkSync } from "node:fs";
import { HEADERS, PLEX_URL } from "../../start/environement";
import { logger } from "../../start/logger";
import type { PlexReponse } from "../types/plex";

export function getFfprobeData(file: string): Promise<FfprobeData> {
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

export async function executeFfmpeg(
  file: string,
  command: string[],
  mediaName: string,
  fileName: string | undefined,
  librarySectionId: number,
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
            `[${mediaName}] ${getProgressBar(Math.round(progress.percent ?? 0))}`,
          );
        }
      })
      .on("error", (err) => {
        logger.error(err.message);
        reject(err);
      })
      .on("end", resolve)
      .saveToFile(`/data/transcode_cache/${fileName}.mkv`),
  );

  unlinkSync(file);

  renameSync(
    `/data/transcode_cache/${fileName}.mkv`,
    `${path.join("/")}/${fileName}.mkv`,
  );

  await axios.get<PlexReponse>(
    `${PLEX_URL}/library/sections/${librarySectionId}/refresh`,
    {
      headers: HEADERS,
      params: {
        path: path.join("/"),
      },
    },
  );

  await new Promise((resolve) => {
    setTimeout(resolve, 60000);
  });
}

function getProgressBar(progress: number) {
  return `[${"=".repeat(Math.floor(progress / 10))}${"-".repeat(10 - Math.floor(progress / 10))}] ${Math.floor(progress)}%`;
}
