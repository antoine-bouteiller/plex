import { logger } from '#config/logger'
import { updatePlexSelectedLanguages } from '#controllers/language_crontroller'
import { transcodeAll } from '#controllers/transcode_controller'
import { CronJob } from 'cron'

class Cron {
  scannerCronJob = new CronJob('0 0 */12 * * *', async () => {
    await transcodeAll()
    await updatePlexSelectedLanguages()
  })

  start() {
    logger.info('Setup cron to launch every 12h')
    this.scannerCronJob.start()
  }
}

const cron = new Cron()

export default cron
