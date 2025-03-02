import 'dotenv/config'
import { handleError } from '#exceptions/handler'
import { mkdirSync, readFileSync } from 'node:fs'
import { parse } from 'yaml'
import { z } from 'zod'

declare global {
  // eslint-disable-next-line no-var
  var config: Config
}

const configSchema = z.object({
  plex: z.object({
    token: z.string(),
    url: z.string(),
  }),
  tmdb: z.object({
    token: z.string(),
    url: z.string(),
  }),
  transcodeCachePath: z.string(),
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
    const parsedConfig = parse(fileContent)
    global.config = configSchema.parse({ ...parsedConfig })
    mkdirSync(config.transcodeCachePath, { recursive: true })
  } catch (error) {
    void handleError(error)
    process.exit(1)
  }
}

export { loadConfig }
