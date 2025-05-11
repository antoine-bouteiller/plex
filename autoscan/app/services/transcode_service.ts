import type { iso2 } from '#types/iso_codes'
import type { StreamData } from '#types/transcode'

import ffmpeg from '#config/ffmpeg'
import { logger } from '#config/logger'
import { copyFileSync, existsSync, mkdirSync, readdirSync, rmSync } from 'node:fs'
import { join } from 'node:path'

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

const wantedAudioEncodings = ['aac', 'ac3', 'eac3']
const wantedSubtitleEncodings = ['subrip', 'ass']

export class TranscodeService {
  command: string[] = ['-c copy']

  declare subtitleStreams: StreamData[]
  declare videoStreams: StreamData[]
  private audioStreams: StreamData[] = []

  private extension: string | undefined
  private fileName: string | undefined

  private shouldExecute = false

  constructor(
    private file: string,
    private mediaTitle: string,
    private originalLanguage: iso2
  ) {}

  cleanAudio() {
    const criterias: Criteria[][] = [
      [
        { language: this.originalLanguage, wantedEncodings: wantedAudioEncodings },
        { language: 'und', wantedEncodings: wantedAudioEncodings },
        { language: this.originalLanguage },
        { language: 'und' },
      ],
    ]

    if (this.originalLanguage !== 'eng' && this.originalLanguage !== 'fre') {
      criterias.push([
        { language: 'eng', wantedEncodings: wantedAudioEncodings },
        { language: 'eng' },
      ])
    }

    if (this.originalLanguage !== 'fre') {
      criterias.push([
        { language: 'fre', wantedEncodings: wantedAudioEncodings },
        { language: 'fre' },
      ])
    }

    let countAudioStreamToKeep = 0

    for (const languageCriteria of criterias) {
      let audioStreamToKeep = -1
      for (const condition of languageCriteria) {
        audioStreamToKeep = this.audioStreams.findIndex(isStreamWanted(condition))
        if (audioStreamToKeep !== -1) break
      }

      if (audioStreamToKeep === -1) continue

      const stream = this.audioStreams[audioStreamToKeep]
      this.command.push(`-map 0:a:${audioStreamToKeep}`)
      countAudioStreamToKeep++

      const codec = stream.codec_name?.toLowerCase()

      if (!codec || !wantedAudioEncodings.includes(codec)) {
        this.command.push(`-c:a:${audioStreamToKeep} aac`)

        this.shouldExecute = true

        logger.warn(
          `[${this.mediaTitle}] ${languageCriteria[0].language} audio stream 0:a:${audioStreamToKeep} is ${codec}, converting to aac.`
        )
      }

      if (stream.tags?.language === undefined || stream.tags.language.toLowerCase() === 'und') {
        this.command.push(`-metadata:s:a:${audioStreamToKeep} language=${this.originalLanguage}`)
        this.shouldExecute = true
      }
    }

    if (countAudioStreamToKeep !== this.audioStreams.length) {
      this.shouldExecute = true
    }

    return
  }

  async cleanUp() {
    const paths = this.file.split('/')

    paths.pop()

    const transcodePath = `${paths.join('/')}/transcode`

    if (!existsSync(transcodePath)) {
      return
    }

    const files = readdirSync(transcodePath)

    const videoFile = files.find((file) => file.endsWith('.mp4'))

    if (!videoFile) {
      logger.error(`[${this.mediaTitle}] No mp4 video file found`)
      rmSync(transcodePath, { recursive: true })
      return
    }

    const streams = await getFileStreams(join(transcodePath, videoFile))

    const videoStreams = streams.filter((stream) => stream.codec_type === 'video')
    const audioStreams = streams.filter((stream) => stream.codec_type === 'audio')

    if (videoStreams.length === 0 || audioStreams.length === 0) {
      logger.error(`[${this.mediaTitle}] No audio or video stream found on transcoded file`)
    } else {
      rmSync(this.file)
      for (const file of files) {
        copyFileSync(join(transcodePath, file), `${paths.join('/')}/${file}`)
      }
    }

    rmSync(transcodePath, { recursive: true })
  }

  cleanVideo() {
    if (this.videoStreams.length === 0) {
      return
    }

    let countVideoStreamToKeep = 0

    this.videoStreams.forEach((stream, index) => {
      if (
        stream.codec_name?.toLowerCase() === 'mjpeg' ||
        stream.codec_name?.toLowerCase() === 'png' ||
        stream.codec_name?.toLowerCase() === 'gif'
      ) {
        logger.warn(
          `[${this.mediaTitle}] Video stream 0:v:${index} is ${stream.codec_name.toLowerCase()} removing.`
        )
      } else {
        this.command.push(`-map 0:v:${index}`)
        countVideoStreamToKeep++
      }
    })

    if (countVideoStreamToKeep !== this.videoStreams.length) {
      this.shouldExecute = true
    }
  }

  async extractSubtitles() {
    const criterias: Criteria[] = [
      { exclude: ['forced', 'sdh'], language: 'eng', wantedEncodings: wantedSubtitleEncodings },
      { exclude: ['forced'], language: 'eng', wantedEncodings: wantedSubtitleEncodings },
      { language: 'und', wantedEncodings: wantedSubtitleEncodings },
    ]

    if (this.originalLanguage === 'fre' || this.subtitleStreams.length === 0) {
      return
    }

    if (this.subtitleStreams.length > 0) {
      this.shouldExecute = true
    }

    let subtitleStreamToKeep = -1
    for (const condition of criterias) {
      subtitleStreamToKeep = this.subtitleStreams.findIndex(isStreamWanted(condition))
      if (subtitleStreamToKeep !== -1) break
    }

    if (subtitleStreamToKeep === -1) {
      return
    }

    const stream = this.subtitleStreams[subtitleStreamToKeep]

    const language = stream.tags?.language?.toLowerCase() ?? 'eng'

    await executeFfmpeg(this.file, `${this.fileName}.${language}.srt`, [
      `-map 0:s:${subtitleStreamToKeep}`,
      `-c:s:${subtitleStreamToKeep} srt`,
    ])

    this.shouldExecute = true

    logger.info(`[${this.mediaTitle}] Subtitle extracted`)
  }

  async init() {
    const streams = await getFileStreams(this.file)

    this.videoStreams = streams.filter((stream) => stream.codec_type === 'video')
    this.audioStreams = streams.filter((stream) => stream.codec_type === 'audio')
    this.subtitleStreams = streams.filter((stream) => stream.codec_type === 'subtitle')

    this.fileName = this.file.slice(0, this.file.lastIndexOf('.')).split('/').pop()
    this.extension = this.file.split('.').pop()
  }

  async transcodeFile() {
    try {
      await this.init()

      this.cleanVideo()
      this.cleanAudio()
      await this.extractSubtitles()

      if (this.extension !== 'mp4') {
        this.shouldExecute = true
      }

      if (this.shouldExecute) {
        const newFileName = `${this.fileName}.mp4`
        await executeFfmpeg(this.file, newFileName, this.command)
        logger.info(`[${this.mediaTitle}] Transcoded with command: ${this.command.join(' ')}`)
        await this.cleanUp()
      }

      return this.shouldExecute
    } catch (error) {
      if (error instanceof Error) {
        logger.error(`Unknown error: ${error.message}`)
      } else {
        logger.error(`Unknown error: ${error}`)
      }
      return false
    }
  }
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

async function executeFfmpeg(input: string, output: string, command: string[]) {
  const path = input.split('/')
  path.pop()

  mkdirSync(`${path.join('/')}/transcode`, { recursive: true })

  await new Promise((resolve, reject) =>
    ffmpeg(input, { logger })
      .outputOptions(command)
      .on('error', (err) => {
        reject(err)
      })
      .on('end', resolve)
      .saveToFile(`${path.join('/')}/transcode/${output}`)
  )
}

function isStreamWanted(criteria: Criteria) {
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
