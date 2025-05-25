import { logger } from '#config/logger'

export function handleError(error: unknown) {
  if (error instanceof Error) {
    logger.error(error.message)
  } else {
    logger.error(String(error))
  }
}
