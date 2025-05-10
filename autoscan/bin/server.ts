import { logger } from '#config/logger'
import cron from '#start/cron'
import webserver from '#start/routes'
import { telegram } from '#start/telegram'
import { exec } from 'node:child_process'
import { promisify } from 'node:util'

const execPromise = promisify(exec)

cron.start()

await telegram.launch()

try {
  try {
    const { stdout } = await execPromise('npx prisma migrate status')

    if (stdout.includes('The following migration(s) are pending')) {
      await execPromise('npx prisma migrate deploy')
    }
  } catch {
    logger.info('Error while checking migrations, deploying...')
    await execPromise('npx prisma migrate deploy')
  }
} catch (error) {
  logger.error('Error during migrations', error)
  process.exit(1)
}

webserver
  .listen(3030)
  .then(() => {
    logger.info('Webserver started on port 3030')
  })
  .catch(() => {
    logger.error('Failed to start webserver on port 3030')
  })
