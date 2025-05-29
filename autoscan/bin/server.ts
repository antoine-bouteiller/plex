import { logger } from '#config/logger'
import { handleError } from '#exceptions/handler'
import cron from '#start/cron'
import app from '#start/routes'
import telegram from '#start/telegram'

cron.start()

if (process.env.NODE_ENV !== 'development') {
  void telegram.start()
}

app.setErrorHandler((error, _, reply) => {
  handleError(error)
  reply.status(500).send({ message: 'Internal Server Error', statusCode: 500 })
})

app
  .listen({ host: '0.0.0.0', port: 3030 })
  .then(() => {
    logger.info('Webserver started on port 3030')
  })
  .catch(() => {
    logger.error('Failed to start webserver on port 3030')
    process.exit(1)
  })
