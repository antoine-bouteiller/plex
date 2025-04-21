import type { PlexMedia, PlexReponse } from '#types/plex'

import executeWithErrorHandler from '#exceptions/handler'
import { getLanguage } from '#services/language_service'
import axios from 'axios'

export async function getMediaDetails(plexMedia: PlexMedia) {
  const mediaTitle = [plexMedia.grandparentTitle, plexMedia.parentTitle, plexMedia.title]
    .filter(Boolean)
    .join(' - ')

  const file = plexMedia.Media[0].Part[0].file

  const details = await sendPlexGetRequest(`${config.plex.url}${plexMedia.key}`)

  const tmdbId = Number(/{tmdb-(.*?)}/g.exec(file)?.[1])

  if (!tmdbId) {
    throw new Error(`[${mediaTitle}] No tmdbId found"`)
  }

  const originalLanguage = await getLanguage(tmdbId, plexMedia.type)

  return {
    partsId: details.Metadata[0].Media[0].Part[0].id,
    tmdbId,
    file,
    mediaTitle,
    originalLanguage,
    streams: details.Metadata[0].Media[0].Part[0].Stream,
  }
}

export async function getSectionMedia(id: number, sectionType: 'movie' | 'show') {
  const type = sectionType === 'show' ? 4 : 1
  const response = await sendPlexGetRequest(
    `${config.plex.url}/library/sections/${id}/recentlyAdded?type=${type}`
  )
  return response.Metadata
}

export async function getSections() {
  const response = await sendPlexGetRequest(`${config.plex.url}/library/sections`)
  return response.Directory
}

export async function refreshSection(id: number, filePath: string) {
  await executeWithErrorHandler(() =>
    axios.get(`${config.plex.url}/library/sections/${id}/refresh`, {
      headers: {
        'X-Plex-Token': config.plex.token,
      },
      params: {
        path: filePath,
      },
    })
  )
}

export async function updateStream(
  partsId: number,
  subtitleStreamId: number,
  originalLanguage: string,
  type: 'audio' | 'subtitle'
) {
  await executeWithErrorHandler(() =>
    axios.put(
      `${config.plex.url}/library/parts/${partsId}?${type}StreamID=${
        originalLanguage === 'fra' ? 0 : subtitleStreamId
      }`,
      undefined,
      {
        headers: {
          'X-Plex-Token': config.plex.token,
        },
        params: { allParts: 1 },
      }
    )
  )
}

async function sendPlexGetRequest(url: string) {
  const response = await axios.get<PlexReponse>(url, {
    headers: {
      'X-Plex-Token': config.plex.token,
    },
  })
  return response.data.MediaContainer
}
