import { renameSync, unlinkSync } from 'node:fs'

import ffmpeg from '#config/ffmpeg'
import { logger } from '#config/logger'
import type { iso2 } from '#types/iso_codes'
import type { StreamData } from '#types/transcode'

export async function transcodeFile(file: string, originalLanguage: iso2, mediaName: string) {
  const streams = await getFileStreams(file)

  const command = cleanAudio(streams, originalLanguage, mediaName)

  command.push(...cleanSubtitles(streams, mediaName))

  const [fileName, extension] = [
    file.slice(0, file.lastIndexOf('.')).split('/').pop(),
    file.split('.').pop(),
  ]

  if (command.length !== streams.length - 1) {
    await executeFfmpeg(file, ['-map 0:v', '-c copy', ...command], mediaName, fileName)
    return true
  }
  if (extension !== 'mkv') {
    logger.info(`[${mediaName}] Transcoding to mkv`)
    await executeFfmpeg(file, ['-c copy'], mediaName, fileName)
    return true
  }
  return false
}

export function cleanAudio(streams: StreamData[], originalLanguage: iso2, mediaName: string) {
  const command: string[] = []

  const audioStreams = streams.filter((stream) => stream.codec_type?.toLowerCase() === 'audio')

  const criterias: Criteria[][] = [
    [
      { language: originalLanguage, excludedEncodings: ['dts'] },
      { language: 'und', excludedEncodings: ['dts'] },
      { language: originalLanguage },
      { language: 'und' },
    ],
  ]

  if (originalLanguage !== 'eng') {
    criterias.push([{ language: 'eng', excludedEncodings: ['dts'] }, { language: 'eng' }])
  }

  if (originalLanguage !== 'fre') {
    criterias.push([{ language: 'fre', excludedEncodings: ['dts'] }, { language: 'fre' }])
  }

  for (const languageCriteria of criterias) {
    let audioStreamToKeep = -1
    for (const condition of languageCriteria) {
      audioStreamToKeep = audioStreams.findIndex(respectCriteria(condition))
      if (audioStreamToKeep !== -1) break
    }

    if (audioStreamToKeep === -1) continue

    const stream = audioStreams[audioStreamToKeep]
    command.push(`-map 0:a:${audioStreamToKeep}`)

    if (stream.codec_name?.toLowerCase() === 'dts') {
      command.push(`-c:a:${audioStreamToKeep} aac`)
      logger.info(
        `[${mediaName}] ${languageCriteria[0].language} audio stream 0:a:${audioStreamToKeep} is dts, converting to aac.`
      )
    }

    if (stream.tags?.language === undefined || stream.tags.language.toLowerCase() === 'und') {
      command.push(`-metadata:s:a:${audioStreamToKeep} language=eng`)
    }
  }
  if (command.length === 0) {
    logger.warn(
      `[${mediaName}] No audio stream respection language criteria, keeping all audio streams.`
    )
    return ['-map 0:a']
  }

  return command
}

export function cleanSubtitles(streams: StreamData[], mediaName: string) {
  const command: string[] = []

  const criterias: Criteria[] = [
    { language: 'eng', exclude: ['forced', 'sdh'] },
    { language: 'eng', exclude: ['forced'] },
    { language: 'und' },
    { language: 'eng' },
  ]

  const subtitleStreams = streams.filter(
    (stream) => stream.codec_type?.toLowerCase() === 'subtitle'
  )

  if (subtitleStreams.length === 0) {
    return []
  }

  let subtitleStreamToKeep = -1
  for (const condition of criterias) {
    subtitleStreamToKeep = subtitleStreams.findIndex(respectCriteria(condition))
    if (subtitleStreamToKeep !== -1) break
  }

  if (subtitleStreamToKeep === -1) {
    logger.warn(`[${mediaName}] No subtitle stream to keep, removing all subtitles.`)
    return []
  }

  const stream = subtitleStreams[subtitleStreamToKeep]

  command.push(`-map 0:s:${subtitleStreamToKeep}`)

  if (stream.tags?.language === undefined || stream.tags.language.toLowerCase() === 'und') {
    command.push(`-metadata:s:s:${subtitleStreamToKeep} language=eng`)
  }
  return command
}

export function getFileStreams(file: string): Promise<StreamData[]> {
  return new Promise((resolve, reject) => {
    ffmpeg(file).ffprobe((err, data) => {
      if (err) {
        if (typeof err === 'string') {
          reject(new Error(err))
        } else if (err instanceof Error) {
          reject(new Error(err.message))
        } else {
          reject(new Error('Unknown error'))
        }
      } else {
        resolve(data.streams as StreamData[])
      }
    })
  })
}

async function executeFfmpeg(
  file: string,
  command: string[],
  mediaName: string,
  fileName: string | undefined
) {
  let prevProgress = -1
  const path = file.split('/')
  path.pop()

  const newFileName = `${fileName?.replace('[DTS 5.1]', '[AC3 5.1]').replace('[DTS 2.0]', '[AAC 2.0]')}.mkv`

  await new Promise((resolve, reject) =>
    ffmpeg(file, { logger })
      .outputOptions(command)
      .on('progress', (progress) => {
        const progressPercent = Math.round(progress.percent ?? 0)
        if (progressPercent % 10 === 0 && progressPercent !== prevProgress) {
          prevProgress = progressPercent
          logger.info(
            `[${mediaName}] [${'='.repeat(Math.floor(progressPercent / 10))}${'-'.repeat(
              Math.max(10 - Math.floor(progressPercent / 10), 0)
            )}] ${Math.floor(progressPercent)}%`
          )
        }
      })
      .on('error', (err) => {
        logger.error(JSON.stringify(command))
        reject(err)
      })
      .on('end', resolve)
      .saveToFile(`${config.transcodeCachePath}/${newFileName}`)
  )

  unlinkSync(file)

  renameSync(`${config.transcodeCachePath}/${newFileName}`, `${path.join('/')}/${newFileName}`)
}

type Criteria =
  | {
      language: iso2
      exclude?: string[]
      excludedEncodings?: string[]
    }
  | {
      language: 'und'
      excludedEncodings?: string[]
    }

function respectCriteria(criteria: Criteria) {
  return (stream: StreamData) => {
    if (criteria.language === 'und') {
      return stream.tags?.language === undefined || stream.tags.language.toLowerCase() === 'und'
    }
    return (
      stream.tags?.language?.toLowerCase() === criteria.language &&
      (!criteria.exclude?.length ||
        !criteria.exclude.some((term) => stream.tags?.title?.toLowerCase().includes(term))) &&
      (!criteria.excludedEncodings?.length ||
        (stream.codec_name &&
          !criteria.excludedEncodings.includes(stream.codec_name.toLowerCase())))
    )
  }
}
