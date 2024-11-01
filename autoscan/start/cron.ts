import { CronJob } from 'cron';
import { logger } from '#config/logger';
import { languageController } from '#controllers/language_crontroller';
import { transcodeController } from '#controllers/transcode_controller';

class Cron {
  scannerCronJob = new CronJob('0 0 */12 * * *', async () => {
    await transcodeController();
    await languageController();
  });

  start() {
    logger.info('Setup cron to launch every 12h');
    this.scannerCronJob.start();
  }
}

const cron = new Cron();

export default cron;
