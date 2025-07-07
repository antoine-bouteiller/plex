import { z } from 'zod/v4'

export const ffprobeOutputValidator = z.object({
  streams: z.array(
    z.object({
      channels: z.number().optional(),
      codec_name: z.string().optional(),
      codec_type: z.string().optional(),
      index: z.number().optional(),
      sample_rate: z.number().optional(),
      tags: z
        .object({
          language: z.string().optional(),
          title: z.string().optional(),
        })
        .optional(),
    })
  ),
})

export type FfprobeOutput = z.infer<typeof ffprobeOutputValidator>

export type FFprobeStream = FfprobeOutput['streams'][number]
