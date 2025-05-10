import type { MediaType } from '#types/plex'

import prisma from '#config/prisma'

export function countMediaByType(type: MediaType) {
  return prisma.media.count({
    where: {
      type,
    },
  })
}

export function createdOrUpdatedMedia(
  tmdbId: number,
  type: MediaType,
  title: string,
  originalLanguage: string
) {
  return prisma.media.upsert({
    create: {
      tmdbId,
      originalLanguage,
      title,
      type,
    },
    update: {
      originalLanguage,
      title,
    },
    where: {
      tmdbId_type: {
        tmdbId: tmdbId,
        type: type,
      },
    },
  })
}

export function getMediaByIdAndType(tmdbId: number, type: MediaType) {
  return prisma.media.findUnique({
    where: {
      tmdbId_type: {
        tmdbId,
        type,
      },
    },
  })
}

export function getMediaByTypeWithPagination(type: MediaType, page: number, pageSize: number) {
  return prisma.media.findMany({
    skip: pageSize * page,
    take: pageSize,
    where: {
      type,
    },
    orderBy: {
      title: 'asc',
    },
  })
}
