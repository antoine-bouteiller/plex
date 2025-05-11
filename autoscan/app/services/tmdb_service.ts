import type { MediaType } from '#types/plex'
import type { TmdbResponse } from '#types/tmdb'

import { createdOrUpdatedMedia } from '#services/media_service'
import env from '#start/env'
import { countryISOMapping, type iso2 } from '#types/iso_codes'
import ky from 'ky'

const tmdbClient = ky.create({
  headers: {
    Authorization: `Bearer ${env.tmdb.token}`,
  },
  prefixUrl: env.tmdb.url,
  throwHttpErrors: false,
})

export async function getLanguageByIdAndType(tmdbId: number, type: MediaType): Promise<iso2> {
  switch (type) {
    case 'movie':
      return getMovieLanguageById(tmdbId)
    case 'show':
      return getSeriesLanguageById(tmdbId)
    default:
      throw new Error('Invalid type')
  }
}

async function getMovieLanguageById(tmdbId: number): Promise<iso2> {
  const response = await tmdbClient<TmdbResponse>(`${env.tmdb.url}/movie/${tmdbId}`, {
    headers: {
      Authorization: `Bearer ${env.tmdb.token}`,
    },
  })

  if (!response.ok) return 'eng'

  const data = await response.json()

  const language = countryISOMapping[data.original_language]

  await createdOrUpdatedMedia(tmdbId, 'movie', data.title, language)

  return language
}

async function getSeriesLanguageById(tmdbId: number): Promise<iso2> {
  const response = await tmdbClient<TmdbResponse>(`${env.tmdb.url}/tv/${tmdbId}`, {
    headers: {
      Authorization: `Bearer ${env.tmdb.token}`,
    },
  })

  if (!response.ok) return 'eng'

  const data = await response.json()

  const language = countryISOMapping[data.original_language]

  await createdOrUpdatedMedia(tmdbId, 'show', data.name, language)

  return language
}
