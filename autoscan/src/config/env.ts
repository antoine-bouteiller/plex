import { join } from 'path'
import 'dotenv/config'
import { z } from 'zod/v4'

const envSchema = z.object({
  PLEX_TOKEN: z.string(),
  PLEX_URL: z.string(),

  TELEGRAM_CHAT_ID: z.coerce.number(),
  TELEGRAM_TOKEN: z.string(),

  TMDB_API_TOKEN: z.string(),
  TMDB_API_URL: z.string(),

  API_TIMEOUT: z.number().optional(),

  RADARR_API_KEY: z.string(),
  RADARR_API_URL: z.string(),

  SONARR_API_KEY: z.string(),
  SONARR_API_URL: z.string(),
})

const env = envSchema.parse(process.env)

export default {
  ...env,
  DATABASE_URL: join(import.meta.dirname, '../../resources/autoscan.db'),
}
