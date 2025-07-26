import { CronJob } from 'cron'

import { updatePlexSelectedLanguages } from '@/app/controllers/language_crontroller'
import { transcodeAll } from '@/app/controllers/transcode_controller'
import { cleanupAll } from '@/app/services/cleaner_service'
import { logger } from '@/config/logger'

function startCron(cronExpression: string, callback: () => void) {
  const cronJob = new CronJob(cronExpression, callback)
  cronJob.start()
  logger.info(`Cron ${cronExpression} running`)
}

startCron('0 */10 * * * *', cleanupAll)

startCron('0 0 */12 * * *', updatePlexSelectedLanguages)

startCron('0 0 */12 * * *', transcodeAll)
