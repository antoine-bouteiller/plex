import { handleError } from '#exceptions/handler'
import 'dotenv/config'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { parse } from 'yaml'
import { z } from 'zod'

const envSchema = z.object({
  plex: z.object({
    token: z.string(),
    url: z.string(),
  }),
  telegram: z.object({
    chatId: z.number(),
    token: z.string(),
  }),
  tmdb: z.object({
    token: z.string(),
    url: z.string(),
  }),
})

type Env = z.infer<typeof envSchema>

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
  env = envSchema.parse({ ...parsedConfig })
} catch (error) {
  void handleError(error)
  process.exit(1)
}

export default env
