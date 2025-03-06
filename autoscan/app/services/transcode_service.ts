import type { iso2 } from '#types/iso_codes'
import type { StreamData } from '#types/transcode'

import ffmpeg from '#config/ffmpeg'
import { logger } from '#config/logger'
import { copyFileSync, unlinkSync } from 'node:fs'

type Criteria =
  | {
      exclude?: string[]
      language: iso2
      wantedEncodings?: string[]
    }
  | {
      language: 'und'
      wantedEncodings?: string[]
    }

const wantedEncodings = ['aac', 'ac3']

export function cleanAudio(streams: StreamData[], originalLanguage: iso2, mediaName: string) {
  const command: string[] = []

  const audioStreams = streams.filter((stream) => stream.codec_type?.toLowerCase() === 'audio')

  const criterias: Criteria[][] = [
    [
      { language: originalLanguage, wantedEncodings: wantedEncodings },
      { language: 'und', wantedEncodings: wantedEncodings },
      { language: originalLanguage },
      { language: 'und' },
    ],
  ]

  if (originalLanguage !== 'eng' && originalLanguage !== 'fre') {
    criterias.push([{ language: 'eng', wantedEncodings: wantedEncodings }, { language: 'eng' }])
  }

  if (originalLanguage !== 'fre') {
    criterias.push([{ language: 'fre', wantedEncodings: wantedEncodings }, { language: 'fre' }])
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

    const codec = stream.codec_name?.toLowerCase()

    if (!codec || !wantedEncodings.includes(codec)) {
      command.push(`-c:a:${audioStreamToKeep} aac`)
      logger.warn(
        `[${mediaName}] ${languageCriteria[0].language} audio stream 0:a:${audioStreamToKeep} is ${codec}, converting to aac.`
      )
    }

    if (stream.tags?.language === undefined || stream.tags.language.toLowerCase() === 'und') {
      command.push(`-metadata:s:a:${audioStreamToKeep} language=${originalLanguage}`)
    }
  }
  if (command.length === 0) {
    logger.warn(
      `[${mediaName}] No audio stream respection language criteria, keeping all audio streams.`
    )
    return { command: ['-map 0:a'], shouldExecute: false }
  }

  return { command, shouldExecute: audioStreams.length !== command.length }
}

export function cleanSubtitles(streams: StreamData[], mediaName: string, originalLanguage: iso2) {
  const command: string[] = []

  const criterias: Criteria[] = [
    { exclude: ['forced', 'sdh'], language: 'eng' },
    { exclude: ['forced'], language: 'eng' },
    { language: 'und' },
    { language: 'eng' },
  ]

  const subtitleStreams = streams.filter(
    (stream) => stream.codec_type?.toLowerCase() === 'subtitle'
  )

  if (originalLanguage === 'fre') {
    return { command: [], shouldExecute: subtitleStreams.length > 0 }
  }

  if (subtitleStreams.length === 0) {
    return { command: [], shouldExecute: false }
  }

  let subtitleStreamToKeep = -1
  for (const condition of criterias) {
    subtitleStreamToKeep = subtitleStreams.findIndex(respectCriteria(condition))
    if (subtitleStreamToKeep !== -1) break
  }

  if (subtitleStreamToKeep === -1) {
    logger.warn(`[${mediaName}] No subtitle stream to keep, removing all subtitles.`)
    return { command: [], shouldExecute: false }
  }

  const stream = subtitleStreams[subtitleStreamToKeep]

  command.push(`-map 0:s:${subtitleStreamToKeep}`)

  if (stream.tags?.language === undefined || stream.tags.language.toLowerCase() === 'und') {
    command.push(`-metadata:s:s:${subtitleStreamToKeep} language=eng`)
  }
  return { command, shouldExecute: subtitleStreams.length !== command.length }
}

export function cleanVideo(streams: StreamData[], mediaName: string) {
  const command: string[] = ['-map 0:v:0']

  const videoStreams = streams.filter((stream) => stream.codec_type?.toLowerCase() === 'video')

  if (videoStreams.length === 0) {
    return { command: [], shouldExecute: false }
  }

  videoStreams.forEach((stream, index) => {
    if (
      stream.codec_name?.toLowerCase() === 'mjpeg' ||
      stream.codec_name?.toLowerCase() === 'png'
    ) {
      logger.warn(`[${mediaName}] Video stream 0:v:${index} is mjpeg or png, removing.`)
    }
  })

  return { command, shouldExecute: videoStreams.length !== command.length }
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

export async function transcodeFile(file: string, originalLanguage: iso2, mediaName: string) {
  const streams = await getFileStreams(file)

  const videoSettings = cleanVideo(streams, mediaName)
  const audioSettings = cleanAudio(streams, originalLanguage, mediaName)

  const subtitleSettings = cleanSubtitles(streams, mediaName, originalLanguage)

  const [fileName, extension] = [
    file.slice(0, file.lastIndexOf('.')).split('/').pop(),
    file.split('.').pop(),
  ]

  if (
    videoSettings.shouldExecute ||
    audioSettings.shouldExecute ||
    subtitleSettings.shouldExecute
  ) {
    await executeFfmpeg(
      file,
      ['-c copy', ...videoSettings.command, ...audioSettings.command, ...subtitleSettings.command],
      mediaName,
      fileName
    )
    return true
  }
  if (extension !== 'mkv') {
    logger.warn(`[${mediaName}] Transcoding to mkv`)
    await executeFfmpeg(file, ['-c copy'], mediaName, fileName)
    return true
  }
  return false
}

async function executeFfmpeg(
  file: string,
  command: string[],
  mediaName: string,
  fileName: string | undefined
) {
  const path = file.split('/')
  path.pop()

  const newFileName = `${fileName?.replace(/\[.+? 5.1\]/g, '[AC3 5.1]').replace(/\[.+? 2.0\]/g, '[AAC 2.0]')}.mkv`

  logger.info(`[${mediaName}] Transcoding with command ${command.join(' ')}`)

  await new Promise((resolve, reject) =>
    ffmpeg(file, { logger })
      .outputOptions(command)
      .on('error', (err) => {
        logger.error(JSON.stringify(command))
        logger.error(`${config.transcodeCachePath}/${newFileName}`)
        reject(err)
      })
      .on('end', resolve)
      .saveToFile(`${config.transcodeCachePath}/${newFileName}`)
  )

  copyFileSync(`${config.transcodeCachePath}/${newFileName}`, `${path.join('/')}/${newFileName}`)

  if (file !== `${path.join('/')}/${newFileName}`) {
    unlinkSync(file)
  }

  unlinkSync(`${config.transcodeCachePath}/${newFileName}`)
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
      (!criteria.wantedEncodings?.length ||
        (stream.codec_name && criteria.wantedEncodings.includes(stream.codec_name.toLowerCase())))
    )
  }
}
