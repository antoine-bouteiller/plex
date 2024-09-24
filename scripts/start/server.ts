import { CronJob } from "cron";
import { existsSync, writeFileSync } from "node:fs";
import { handleMedias } from "../app/controllers/handleMedia";
import { logger } from "./logger";

if (!existsSync("config/treatedMedias.json")) {
  writeFileSync("config/treatedMedias.json", "{}");
}

if (!existsSync("config/tvdbToken.json")) {
  writeFileSync("config/tvdbToken.json", "{}");
}

let isAlreadyRunning = false;

const job = new CronJob("* */5 * * * *", async () => {
  if (!isAlreadyRunning) {
    isAlreadyRunning = true;
    await handleMedias();
    isAlreadyRunning = false;
  }
});

logger.info("Setup cron to launch every 5min");

job.start();
