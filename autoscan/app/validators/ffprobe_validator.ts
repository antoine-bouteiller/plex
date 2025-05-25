import type { Infer } from '@vinejs/vine/types'

import vine from '@vinejs/vine'

export const ffprobeOutputValidator = vine.compile(
  vine.object({
    streams: vine.array(
      vine.object({
        channels: vine.number().optional(),
        codec_name: vine.string().optional(),
        codec_type: vine.string().optional(),
        index: vine.number().optional(),
        sample_rate: vine.number().optional(),
        tags: vine
          .object({
            language: vine.string().optional(),
            title: vine.string().optional(),
          })
          .optional(),
      })
    ),
  })
)

export type FfprobeOutput = Infer<typeof ffprobeOutputValidator>

export type FFprobeStream = FfprobeOutput['streams'][number]
