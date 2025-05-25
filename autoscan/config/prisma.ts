import { logger } from '#config/logger'
import { PrismaClient } from '#prisma'
import { execPromise } from '#utils/exec_promisify'
import { PrismaBetterSQLite3 } from '@prisma/adapter-better-sqlite3'

try {
  const stdout = await execPromise('npx prisma migrate status')

  if (stdout.includes('The following migration(s) are pending')) {
    await execPromise('npx prisma migrate deploy')
  }
} catch {
  logger.info('Error while checking migrations, deploying...')
  await execPromise('npx prisma migrate deploy')
}

const adapter = new PrismaBetterSQLite3({
  url: 'file:./resources/autoscan.db',
})
const prisma = new PrismaClient({ adapter })

export default prisma
