import { AxiosError } from "axios";
import { logger } from "#config/logger";

export default async function executeWithErrorHandler<T>(
  fn: (...args: unknown[]) => Promise<T>,
) {
  try {
    return await fn();
  } catch (err) {
    if (err instanceof Error) {
      logger.error(err.message);
    } else if (err instanceof AxiosError) {
      logger.error(err.response?.data);
    } else {
      logger.error("Une erreur inconnue est survenue");
    }
  }
}
