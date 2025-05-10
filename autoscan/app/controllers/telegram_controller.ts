import type { iso2 } from '#types/iso_codes'
import type { TelegramContext } from '#types/telegram'

import prisma from '#config/prisma'
import env from '#start/env'
import { countryISOMapping } from '#types/iso_codes'
import { Markup, Scenes } from 'telegraf'
import { callbackQuery, message } from 'telegraf/filters'

const selectMediaType = new Scenes.BaseScene<TelegramContext>('select-media-type')

selectMediaType.enter(async (ctx) => {
  if (ctx.message?.chat.id !== env.telegram.chatId) {
    return ctx.reply('Unauthorized')
  }

  return await ctx.reply(
    'What kind of media do you want to configure ?',
    Markup.inlineKeyboard([
      Markup.button.callback('🎞️ Movie', 'movie'),
      Markup.button.callback('📺 TV Show', 'show'),
    ])
  )
})

selectMediaType.on(callbackQuery('data'), async (ctx) => {
  ctx.session.mediaType = ctx.callbackQuery.data
  return ctx.scene.enter('select-media')
})

const selectMedia = new Scenes.BaseScene<TelegramContext>('select-media')

selectMedia.enter(async (ctx) => {
  const media = await prisma.media.findMany({
    where: {
      type: ctx.session.mediaType,
    },
  })

  if (media.length === 0) {
    await ctx.reply(`No ${ctx.session.mediaType} found`)
    return ctx.scene.leave()
  }

  return ctx.editMessageText(
    `Wich ${ctx.session.mediaType} do you want to configure ?`,
    Markup.inlineKeyboard(media.map((m) => [Markup.button.callback(m.title, m.tmdbId.toString())]))
  )
})

selectMedia.on(callbackQuery('data'), async (ctx) => {
  ctx.session.tmdbId = ctx.callbackQuery.data

  const media = await prisma.media.findUniqueOrThrow({
    where: {
      tmdbId: Number.parseInt(ctx.session.tmdbId),
    },
  })

  ctx.session.title = media.title

  return ctx.scene.enter('select-language')
})

const selectLanguage = new Scenes.BaseScene<TelegramContext>('select-language')

selectLanguage.enter(async (ctx) => {
  return ctx.editMessageText(`Respond with the language you want to set for ${ctx.session.title}`)
})

selectLanguage.command('cancel', async (ctx) => {
  await ctx.scene.leave()
  return ctx.reply('Cancelled')
})

selectLanguage.on(message('text'), async (ctx) => {
  const language = ctx.message.text.toLowerCase()

  if (!Object.values(countryISOMapping).includes(language as iso2)) {
    return ctx.reply('Invalid language code')
  }

  await prisma.media.update({
    data: {
      originalLanguage: language,
    },
    where: {
      tmdbId: Number.parseInt(ctx.session.tmdbId),
    },
  })

  await ctx.reply(`Lanuage of ${ctx.session.title} updated to ${language}`)
  return ctx.scene.leave()
})

export const configMediaStage = new Scenes.Stage<TelegramContext>([
  selectMediaType,
  selectMedia,
  selectLanguage,
])
