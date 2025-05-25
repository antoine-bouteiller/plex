import { updatePlexSelectedLanguages } from '#controllers/language_crontroller'
import { transcodeAll } from '#controllers/transcode_controller'
import { CronJob } from 'cron'

const scannerCronJob = new CronJob('0 0 */12 * * *', async () => {
  await transcodeAll()
  await updatePlexSelectedLanguages()
})

export default scannerCronJob
