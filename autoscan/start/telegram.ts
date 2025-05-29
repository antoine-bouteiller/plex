import type { TelegramContext } from '#types/telegram'

import { logger } from '#config/logger'
import { selectMediaType } from '#controllers/telegram_controller'
import env from '#start/env'
import { conversations, createConversation } from '@grammyjs/conversations'
import { hydrate } from '@grammyjs/hydrate'
import { Bot } from 'grammy'

const bot = new Bot<TelegramContext>(env.TELEGRAM_TOKEN)

bot.use(conversations())

bot.catch((err) => {
  logger.error(err.message)
  return err.ctx.reply('An error occurred')
})

bot.use(createConversation(selectMediaType, { plugins: [hydrate()] }))

bot.command('setlanguage', (ctx) => ctx.conversation.enter('selectMediaType'))

bot.command('cancel', async (ctx) => {
  return ctx.reply('Nothing to cancel')
})

export default bot
