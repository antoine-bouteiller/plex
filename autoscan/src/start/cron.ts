import { CronJob } from 'cron'

import { updatePlexSelectedLanguages } from '@/app/controllers/language_crontroller'
import { transcodeAll } from '@/app/controllers/transcode_controller'
import { cleanupAll } from '@/app/services/cleaner_service'
import { logger } from '@/config/logger'

new CronJob('0 */10 * * * *', cleanupAll, null, true, 'Europe/Paris')
logger.info('Cleaner cron running every 10 minutes')

new CronJob('0 0 */12 * * *', updatePlexSelectedLanguages, null, true, 'Europe/Paris')
logger.info('Language cron running every 12 hours')

new CronJob('0 0 */12 * * *', transcodeAll, null, true, 'Europe/Paris')
logger.info('Transcode cron running every 12 hours')
