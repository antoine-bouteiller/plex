import { errors } from '@vinejs/vine'

import { logger } from '@/config/logger'

export function handleError(error: unknown) {
  if (error instanceof errors.E_VALIDATION_ERROR) {
    if (Array.isArray(error.messages)) {
      logger.error(error.messages.join(', '))
    } else {
      logger.error(error.messages)
    }
  } else if (error instanceof Error) {
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
