import type { QueueResponse } from '#types/cleaner'

import { logger } from '#config/logger'
import env from '#start/env'
import ky from 'ky'

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
  await removeStalledDownloads(sonarrClient, 'Sonarr')
  await removeStalledDownloads(radarrClient, 'Radarr')
}

async function countRecords(client: typeof ky): Promise<number> {
  const queue = await makeApiRequest(client, 'queue')
  if (queue && typeof queue.totalRecords === 'number') {
    return queue.totalRecords
  }
  return 0
}

async function makeApiDelete(client: typeof ky, endpoint: string, params?: Record<string, string>) {
  try {
    const response = await client.delete(endpoint, { searchParams: params })
    if (!response.ok) {
      logger.error(
        `Error making API delete request to ${endpoint}: ${response.status} ${response.statusText}`
      )
    }
  } catch (error) {
    logger.error(`Error making API delete request to ${endpoint}:`, error)
  }
}

async function makeApiRequest(
  client: typeof ky,
  endpoint: string,
  params?: Record<string, string>
) {
  try {
    const response = await client.get<QueueResponse>(endpoint, { searchParams: params })
    if (!response.ok) {
      logger.error(
        `Error making API request to ${endpoint}: ${response.status} ${response.statusText}`
      )
      return null
    }
    return await response.json()
  } catch (error) {
    logger.error(`Error making API request to ${endpoint}:`, error)
    return null
  }
}

async function removeStalledDownloads(client: typeof ky, serviceName: string): Promise<void> {
  logger.info(`Checking ${serviceName} queue...`)

  const recordCount = await countRecords(client)
  const queue = await makeApiRequest(client, 'queue', {
    page: '1',
    pageSize: recordCount.toString(),
  })

  if (!queue?.records) {
    logger.warn(`${serviceName} queue is null or missing "records" key`)
    return
  }

  logger.info(`Processing ${serviceName} queue...`)

  for (const item of queue.records) {
    if (!item.title || !item.status) {
      logger.warn(`Skipping item in ${serviceName} queue due to missing or invalid keys:`, item)
      continue
    }

    logger.info(`Checking the status of ${item.title}`)

    if (
      item.status === 'warning' &&
      item.errorMessage === 'The download is stalled with no connections'
    ) {
      const itemId = item.id

      if (!(itemId in strikeCounts)) {
        strikeCounts[itemId] = 0
      }

      strikeCounts[itemId] += 1
      logger.info(`Item ${item.title} has ${strikeCounts[itemId]} strikes`)

      const strikeCount = env.STRIKE_COUNT ?? 3
      if (strikeCounts[itemId] >= strikeCount) {
        logger.info(`Removing stalled ${serviceName} download: ${item.title}`)
        await makeApiDelete(client, `queue/${itemId}`, {
          blocklist: 'true',
          removeFromClient: 'true',
        })
        strikeCounts[itemId] = 0
      }
    }
  }
}

export { cleanupAll }
