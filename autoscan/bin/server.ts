import { logger } from '#config/logger'
import cron from '#start/cron'
import app from '#start/routes'
import telegram from '#start/telegram'

cron.start()

void telegram.start()

app
  .listen({ port: 3030 })
  .then(() => {
    logger.info('Webserver started on port 3030')
  })
  .catch(() => {
    logger.error('Failed to start webserver on port 3030')
    process.exit(1)
  })
