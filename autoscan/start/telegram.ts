import type { TelegramContext } from '#types/telegram'

import { configMediaStage } from '#controllers/telegram_controller'
import env from '#start/env'
import { session, Telegraf } from 'telegraf'

const telegram = new Telegraf<TelegramContext>(env.telegram.token)

telegram.use(session())

telegram.use(configMediaStage.middleware())

telegram.command('setlanguage', (ctx) => ctx.scene.enter('select-media-type'))

telegram.command('cancel', async (ctx) => {
  return ctx.reply('Nothing to cancel')
})

export { telegram }
