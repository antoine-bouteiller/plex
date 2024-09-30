import { CronJob } from "cron";
import { logger } from "#config/logger";
import { languageController } from "#controllers/languageCrontroller";

class Cron {
  isAlreadyRunning = false;

  languageCronJob = new CronJob("* * */12 * * *", async () => {
    if (!this.isAlreadyRunning) {
      this.isAlreadyRunning = true;
      await languageController();
      this.isAlreadyRunning = false;
    }
  });

  start() {
    logger.info("Setup cron to launch every 5min");
    this.languageCronJob.start();
  }
}

const cron = new Cron();

export default cron;
