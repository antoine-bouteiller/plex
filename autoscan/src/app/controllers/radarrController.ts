import type { DefaultResponseLocals, Request, Response } from "hyper-express";
import { logger } from "#config/logger";
import { getLanguage } from "#services/languageService";
import { getSections, refreshSection } from "#services/plexService";
import { transcodeFile } from "#services/transcodeService";
import type { RadarrRequest } from "#types/radarr";

export const radarrController = async (
  request: Request,
  response: Response<DefaultResponseLocals>,
) => {
  const body: RadarrRequest = await request.json();

  if (body.eventType === "Test") {
    response.send("ok");
    return;
  }

  logger.info(JSON.stringify(body));

  const file = body.movie.path;

  if (!file) {
    logger.error(`[radarr] No file found: ${JSON.stringify(request.json())}`);
    response.status(400).send("No file found");
    return;
  }

  const originalLanguage = await getLanguage(body.movie.tmdbId, "episode");

  await transcodeFile(file, originalLanguage, body.movie.title);

  const sections = await getSections();

  for (const section of sections.filter(
    (section) => section.type === "movie",
  )) {
    await refreshSection(section.key, file);
  }

  response.send("ok");
};
