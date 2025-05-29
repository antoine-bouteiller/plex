import { logger } from '#config/logger'
import { updatePlexSelectedLanguages } from '#controllers/language_crontroller'
import { transcodeAll } from '#controllers/transcode_controller'
import { cleanupAll } from '#services/cleaner_service'
import { CronJob } from 'cron'

class Cron {
  cleanerCronJob = new CronJob('0 */10 * * * *', cleanupAll)

  languageCronJob = new CronJob('0 0 */12 * * *', updatePlexSelectedLanguages)

  transcodeCronJob = new CronJob('0 0 */12 * * *', transcodeAll)

  start() {
    this.cleanerCronJob.start()
    logger.info('Cleaner cron running every 10 minutes')
    this.languageCronJob.start()
    logger.info('Language cron running every 12 hours')
    this.transcodeCronJob.start()
    logger.info('Transcode cron running every 12 hours')
  }
}

const cron = new Cron()

export default cron
