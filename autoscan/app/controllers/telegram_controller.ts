import type { iso2 } from '#types/iso_codes'
import type { MediaType } from '#types/plex'
import type { TelegramContext } from '#types/telegram'

import prisma from '#config/prisma'
import { countMediaByType, getMediaByTypeWithPagination } from '#services/media_service'
import env from '#start/env'
import { countryISOMapping } from '#types/iso_codes'
import { Markup, Scenes } from 'telegraf'
import { callbackQuery, message } from 'telegraf/filters'

const selectMediaType = new Scenes.BaseScene<TelegramContext>('select-media-type')

const PAGE_SIZE = 10

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
  ctx.session.mediaType = ctx.callbackQuery.data as MediaType
  return ctx.scene.enter('select-media')
})

const selectMedia = new Scenes.BaseScene<TelegramContext>('select-media')

async function updatePage(ctx: TelegramContext, page: number) {
  ctx.scene.session.page = page

  const media = await getMediaByTypeWithPagination(
    ctx.session.mediaType,
    ctx.scene.session.page,
    PAGE_SIZE
  )

  const buttons = media.map((m) => [Markup.button.callback(m.title, m.tmdbId.toString())])

  if (ctx.scene.session.total > ctx.scene.session.page * PAGE_SIZE + media.length) {
    buttons.push([Markup.button.callback('Next page', 'next')])
  }

  if (ctx.scene.session.page > 0) {
    buttons.push([Markup.button.callback('Previous page', 'previous')])
  }

  return ctx.editMessageText(
    `Wich ${ctx.session.mediaType} do you want to configure ?`,
    Markup.inlineKeyboard(buttons)
  )
}

selectMedia.enter(async (ctx) => {
  ctx.scene.session.total = await countMediaByType(ctx.session.mediaType)

  if (ctx.scene.session.total === 0) {
    await ctx.editMessageText(`No ${ctx.session.mediaType} found`)
    return ctx.scene.leave()
  }

  return updatePage(ctx, 0)
})

selectMedia.action('next', async (ctx) => {
  return updatePage(ctx, ctx.scene.session.page + 1)
})

selectMedia.action('previous', async (ctx) => {
  return updatePage(ctx, ctx.scene.session.page - 1)
})

selectMedia.on(callbackQuery('data'), async (ctx) => {
  ctx.session.tmdbId = ctx.callbackQuery.data

  const media = await prisma.media.findUniqueOrThrow({
    where: {
      tmdbId_type: {
        tmdbId: Number.parseInt(ctx.session.tmdbId),
        type: ctx.session.mediaType,
      },
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
      tmdbId_type: {
        tmdbId: Number.parseInt(ctx.session.tmdbId),
        type: ctx.session.mediaType,
      },
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
