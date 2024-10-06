import { join } from "node:path";
import type { DefaultResponseLocals, Request, Response } from "hyper-express";
import { logger } from "#config/logger";
import { getLanguage } from "#services/languageService";
import { getSections, refreshSection } from "#services/plexService";
import { transcodeFile } from "#services/transcodeService";
import type { SonarrRequest } from "#types/sonarr";

export const sonarrController = async (
  request: Request,
  response: Response<DefaultResponseLocals>,
) => {
  const body: SonarrRequest = await request.json();

  const eventType = body.eventType;

  if (eventType === "Test") {
    response.send("ok");
    return;
  }

  try {
    if (eventType === "Download") {
      const file = join(body.series.path, body.episodeFile.relativePath);

      const originalLanguage = await getLanguage(body.series.tmdbId, "episode");

      await transcodeFile(
        file,
        originalLanguage,
        `${body.series.title} ${body.episodes[0].title}`,
      );
    }

    const sections = await getSections();

    for (const section of sections.filter(
      (section) => section.type === "show",
    )) {
      await refreshSection(section.key, body.series.path);
    }
  } catch (err) {
    logger.error(err);
    logger.error(JSON.stringify(body));
  }

  response.send("ok");
};
