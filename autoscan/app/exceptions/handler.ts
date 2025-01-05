import { logger } from '#config/logger'
import { AxiosError } from 'axios'
import { z } from 'zod'

export default async function executeWithErrorHandler<T>(fn: (...args: unknown[]) => Promise<T>) {
  try {
    return await fn()
  } catch (error) {
    void handleError(error)
  }
}

export async function handleError(error: unknown) {
  if (error instanceof AxiosError) {
    logger.error(error.response?.data)
  } else if (error instanceof z.ZodError) {
    logger.error(
      `Validation error : ${JSON.stringify(error.errors.map((e) => `${e.path}: ${e.message}`))}`
    )
  } else if (error instanceof Error) {
    logger.error(`Unknown error: ${error.message}`)
  } else {
    logger.error(`Unknown error: ${error}`)
  }
}
