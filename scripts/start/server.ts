import { CronJob } from "cron";
import { updateLanguage } from "../app/services/updateLanguage";
import { getSections } from "../app/utils/plex";
import { logger } from "./logger";

const job = new CronJob("0 */5 * * * *", async () => {
  const sections = await getSections();

  for (const section of sections) {
    logger.info(`Scanning section ${section.title}`);
    await updateLanguage(section.key);
  }
});

logger.info("Setup cron to launch every 5min");

job.start();
