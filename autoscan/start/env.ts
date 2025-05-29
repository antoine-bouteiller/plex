import vine from '@vinejs/vine'
import 'dotenv/config'

const envSchema = vine.compile(
  vine.object({
    PLEX_TOKEN: vine.string(),
    PLEX_URL: vine.string(),

    TELEGRAM_CHAT_ID: vine.number(),
    TELEGRAM_TOKEN: vine.string(),

    TMDB_API_TOKEN: vine.string(),
    TMDB_API_URL: vine.string(),

    API_TIMEOUT: vine.number().optional(),

    RADARR_API_KEY: vine.string(),
    RADARR_API_URL: vine.string(),

    SONARR_API_KEY: vine.string(),
    SONARR_API_URL: vine.string(),
    STRIKE_COUNT: vine.number().optional(),
  })
)

const env = await envSchema.validate(process.env)

export default env
