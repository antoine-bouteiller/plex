import 'dotenv/config'

import { mkdirSync, readFileSync } from 'node:fs'

import { parse } from 'yaml'
import { z } from 'zod'

import { handleError } from '#exceptions/handler'

declare global {
  // eslint-disable-next-line no-var
  var config: Config
}

const configSchema = z.object({
  transcodeCachePath: z.string(),
  plex: z.object({
    url: z.string(),
    token: z.string(),
  }),
  tmdb: z.object({
    url: z.string(),
    token: z.string(),
  }),
})

type Config = z.infer<typeof configSchema>

const getConfigPath = () => {
  switch (process.env.NODE_ENV) {
    case 'dev':
      return '../configs/autoscan.yaml'
    default:
      return '/autoscan/resources/autoscan.yaml'
  }
}

const loadConfig = () => {
  const path = getConfigPath()

  try {
    const fileContent = readFileSync(path, 'utf8')
    const transcodeCachePath = '/data/transcode_cache'
    mkdirSync(transcodeCachePath, { recursive: true })
    const parsedConfig = parse(fileContent)
    global.config = configSchema.parse({ ...parsedConfig, transcodeCachePath })
  } catch (error) {
    void handleError(error)
    process.exit(1)
  }
}

export { loadConfig }
