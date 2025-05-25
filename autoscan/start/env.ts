import type { Infer } from '@vinejs/vine/types'

import { logger } from '#config/logger'
import vine from '@vinejs/vine'
import 'dotenv/config'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { parse } from 'yaml'

const envSchema = vine.compile(
  vine.object({
    plex: vine.object({
      token: vine.string(),
      url: vine.string(),
    }),
    telegram: vine.object({
      chatId: vine.number(),
      token: vine.string(),
    }),
    tmdb: vine.object({
      token: vine.string(),
      url: vine.string(),
    }),
  })
)

type Env = Infer<typeof envSchema>

const getConfigPath = () => {
  switch (process.env.NODE_ENV) {
    case 'development':
      return join(import.meta.dirname, '../../configs/autoscan.yaml')
    default:
      return '/autoscan/resources/autoscan.yaml'
  }
}

let env: Env

try {
  const path = getConfigPath()
  const fileContent = readFileSync(path, 'utf8')
  const parsedConfig = parse(fileContent)
  env = await envSchema.validate({ ...parsedConfig })
} catch (error) {
  logger.error(error)
  process.exit(1)
}

export default env
