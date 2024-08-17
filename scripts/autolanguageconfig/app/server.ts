import { CronJob } from "cron";
import { logger } from "../config/logger";
import { updateLanguage } from "./services/updateLanguage";

const job = new CronJob("0 */5 * * * *", async () => {
  logger.info("Starting update tv shows and movies language");
  await updateLanguage(1);
  await updateLanguage(2);
});

logger.info("Setup cron to launch every 5min");

job.start();
