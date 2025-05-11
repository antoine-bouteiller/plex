import type { PlexMedia, PlexReponse } from '#types/plex'

import { getLanguage } from '#services/language_service'
import env from '#start/env'
import ky from 'ky'

const plexClient = ky.create({
  headers: {
    'X-Plex-Token': env.plex.token,
  },
  prefixUrl: env.plex.url,
  throwHttpErrors: false,
})

export async function getMediaDetails(plexMedia: PlexMedia) {
  const mediaTitle = [plexMedia.grandparentTitle, plexMedia.parentTitle, plexMedia.title]
    .filter(Boolean)
    .join(' - ')

  const file = plexMedia.Media[0].Part[0].file

  const details = await plexClient<PlexReponse>(`${env.plex.url}${plexMedia.key}`).json()

  const tmdbId = Number(/{tmdb-(.*?)}/g.exec(file)?.[1])

  if (!tmdbId) {
    throw new Error(`[${mediaTitle}] No tmdbId found"`)
  }

  const originalLanguage = await getLanguage(
    tmdbId,
    plexMedia.type === 'episode' ? 'show' : plexMedia.type
  )

  return {
    partsId: details.MediaContainer.Metadata[0].Media[0].Part[0].id,
    tmdbId,
    file,
    mediaTitle,
    originalLanguage,
    streams: details.MediaContainer.Metadata[0].Media[0].Part[0].Stream,
  }
}

export async function getSectionMedia(id: number, sectionType: 'movie' | 'show') {
  const type = sectionType === 'show' ? 4 : 1
  const response = await plexClient<PlexReponse>(
    `${env.plex.url}/library/sections/${id}/all?type=${type}`
  ).json()

  return response.MediaContainer.Metadata
}

export async function getSections() {
  const response = await plexClient<PlexReponse>(`${env.plex.url}/library/sections`).json()
  return response.MediaContainer.Directory
}

export async function refreshSection(id: number, filePath: string) {
  await plexClient(`/library/sections/${id}/refresh`, {
    searchParams: {
      path: filePath,
    },
  })
}

export async function updateStream(
  partsId: number,
  subtitleStreamId: number,
  originalLanguage: string,
  type: 'audio' | 'subtitle'
) {
  await plexClient.put(
    `/library/parts/${partsId}?${type}StreamID=${
      originalLanguage === 'fra' ? 0 : subtitleStreamId
    }`,
    {
      searchParams: { allParts: 1 },
    }
  )
}
