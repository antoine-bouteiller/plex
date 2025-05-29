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
  })
)

const env = await envSchema.validate(process.env)

export default env
