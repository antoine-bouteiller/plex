import prisma from '#config/prisma'

for (let i = 0; i < 100; i++) {
  await prisma.media.create({
    data: {
      tmdbId: i,
      originalLanguage: 'en',
      title: `Test Movie ${i}`,
      type: 'movie',
    },
  })
}

for (let i = 0; i < 100; i++) {
  await prisma.media.create({
    data: {
      tmdbId: i,
      originalLanguage: 'en',
      title: `Test Show ${i}`,
      type: 'show',
    },
  })
}
