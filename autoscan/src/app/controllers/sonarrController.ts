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

  if (body.eventType === "Test") {
    response.send("ok");
    return;
  }

  logger.info(JSON.stringify(body));

  const file = body.episodeFile.path;

  if (!file) {
    logger.error(`[sonarr] No file found: ${JSON.stringify(request.json())}`);
    response.status(400).send("No file found");
    return;
  }

  const originalLanguage = await getLanguage(body.series.tmdbId, "episode");

  await transcodeFile(
    file,
    originalLanguage,
    `${body.series.title} ${body.episode[0].title}`,
  );

  const sections = await getSections();

  for (const section of sections.filter((section) => section.type === "show")) {
    await refreshSection(section.key, file);
  }

  response.send("ok");
};
