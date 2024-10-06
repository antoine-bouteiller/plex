import { logger } from "#config/logger";
import { languageController } from "#controllers/languageCrontroller";
import { transcodeController } from "#controllers/transcodeController";
import { CronJob } from "cron";

class Cron {
  scannerCronJob = new CronJob("* * */12 * * *", async () => {
    await transcodeController();
    await languageController();
  });

  start() {
    logger.info("Setup cron to launch every 12h");
    this.scannerCronJob.start();
  }
}

const cron = new Cron();

export default cron;
