import type { TmdbResponse } from '#types/tmdb'

import prisma from '#config/prisma'
import executeWithErrorHandler from '#exceptions/handler'
import { countryISOMapping, type iso2 } from '#types/iso_codes'
import axios from 'axios'

export async function getLanguageByIdAndType(
  tmdbId: number,
  type: 'episode' | 'movie'
): Promise<iso2> {
  switch (type) {
    case 'episode':
      return getSeriesLanguageById(tmdbId)
    case 'movie':
      return getMovieLanguageById(tmdbId)
    default:
      throw new Error('Invalid type')
  }
}

async function getMovieLanguageById(tmdbId: number): Promise<iso2> {
  const response = await executeWithErrorHandler(() =>
    axios.get<TmdbResponse>(`${config.tmdb.url}/movie/${tmdbId}`, {
      headers: {
        Authorization: `Bearer ${config.tmdb.token}`,
      },
    })
  )

  if (!response?.data) return 'eng'

  const language = countryISOMapping[response.data.original_language]
  await prisma.media.create({
    data: {
      tmdbId,
      originalLanguage: language,
      title: response.data.title,
    },
  })
  return language
}

async function getSeriesLanguageById(tmdbId: number): Promise<iso2> {
  const response = await executeWithErrorHandler(() =>
    axios.get<TmdbResponse>(`${config.tmdb.url}/tv/${tmdbId}`, {
      headers: {
        Authorization: `Bearer ${config.tmdb.token}`,
      },
    })
  )

  if (!response?.data) return 'eng'

  const language = countryISOMapping[response.data.original_language]
  await prisma.media.create({
    data: {
      tmdbId,
      originalLanguage: language,
      title: response.data.name,
    },
  })
  return language
}
