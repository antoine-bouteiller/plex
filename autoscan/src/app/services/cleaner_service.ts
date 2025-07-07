import ky from 'ky'

import type { QueueResponse } from '@/types/cleaner'

import { tryCatch } from '@/app/exceptions/handler'
import env from '@/config/env'
import { logger } from '@/config/logger'

const STRIKE_COUNT = 5

const sonarrClient = ky.create({
  headers: {
    'X-Api-Key': env.SONARR_API_KEY,
  },
  prefixUrl: `${env.SONARR_API_URL}/api/v3`,
  throwHttpErrors: false,
})

const radarrClient = ky.create({
  headers: {
    'X-Api-Key': env.RADARR_API_KEY,
  },
  prefixUrl: `${env.RADARR_API_URL}/api/v3`,
  throwHttpErrors: false,
})

// Initialize the strike count dictionary
const strikeCounts: Record<number, number> = {}

async function cleanupAll(): Promise<void> {
  await tryCatch(async () => removeStalledDownloads(sonarrClient, 'Sonarr'))
  await tryCatch(async () => removeStalledDownloads(radarrClient, 'Radarr'))
}

async function removeStalledDownloads(client: typeof ky, serviceName: string): Promise<void> {
  const queue = await client.get<QueueResponse>('queue').json()

  for (const item of queue.records) {
    if (!item.title || !item.status) {
      logger.warn(`Skipping item in ${serviceName} queue due to missing or invalid keys:`, item)
      continue
    }

    const itemId = item.id
    const noEligibleFiles = item.statusMessages
      ?.flatMap((message) => message.messages)
      .some(
        (message) =>
          message.includes('No files found are eligible for import') ||
          message.includes('Caution: Found potentially dangerous file with extension:')
      )

    if (
      item.status === 'warning' &&
      item.errorMessage === 'The download is stalled with no connections'
    ) {
      strikeCounts[itemId] = (strikeCounts[itemId] ?? 0) + 1
      logger.info(`Item ${item.title} has ${strikeCounts[itemId]} strikes`)
    }

    if (noEligibleFiles || (strikeCounts[itemId] ?? 0) >= STRIKE_COUNT) {
      logger.info(`Removing ${serviceName} download: ${item.title}`)
      await client.delete(`queue/${itemId}`, {
        searchParams: {
          blocklist: 'true',
          removeFromClient: 'true',
        },
      })
    }
  }
}

export { cleanupAll }
