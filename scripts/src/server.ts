import { CronJob } from "cron";
import { updateMoviesLanguage } from "./services/movies";
import { updateTvShowsLanguage } from "./services/tv";
import { logger } from "./utils/logger";

const job = new CronJob("0 0 * * * *", async () => {
	logger.info("Starting update tv shows and movies language");
	await updateTvShowsLanguage();
	await updateMoviesLanguage();
});

logger.info("Setup cron to launch every hour");

job.start();
