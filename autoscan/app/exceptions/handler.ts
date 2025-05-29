import { logger } from '#config/logger'

export function handleError(error: unknown) {
  if (error instanceof Error) {
    let message = error.message
    if (error.cause && typeof error.cause === 'object' && 'message' in error.cause) {
      message += `: ${error.cause.message}`
    }
    logger.error(message)
  } else {
    logger.error(String(error))
  }
}

export async function tryCatch<T>(fn: () => Promise<T>) {
  try {
    return await fn()
  } catch (error) {
    handleError(error)
  }
}
