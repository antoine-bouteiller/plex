import type { iso2 } from '#types/iso_codes'
import type { StreamData } from '#types/transcode'

import ffmpeg from '#config/ffmpeg'
import { logger } from '#config/logger'
import { copyFileSync, mkdirSync, rmSync, unlinkSync } from 'node:fs'

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
  shouldExecute = false

  declare subtitleStreams: StreamData[]
  declare videoStreams: StreamData[]
  private audioStreams: StreamData[] = []

  private extension: string | undefined
  private fileName: string | undefined

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

        logger.warn(
          `[${this.mediaTitle}] ${languageCriteria[0].language} audio stream 0:a:${audioStreamToKeep} is ${codec}, converting to aac.`
        )
      }

      if (stream.tags?.language === undefined || stream.tags.language.toLowerCase() === 'und') {
        this.command.push(`-metadata:s:a:${audioStreamToKeep} language=${this.originalLanguage}`)
      }
    }

    if (countAudioStreamToKeep !== this.audioStreams.length) {
      this.shouldExecute = true
    }

    return
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

    logger.info(`[${this.fileName}] Subtitle extracted`)
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
    await this.init()

    this.cleanVideo()
    this.cleanAudio()
    await this.extractSubtitles()

    if (this.shouldExecute || this.extension !== 'mp4') {
      const newFileName = `${this.fileName}.mp4`
      await executeFfmpeg(this.file, newFileName, this.command)
      if (newFileName !== this.fileName) {
        unlinkSync(this.file)
      }
      logger.info(`[${this.mediaTitle}] Transcoded with command: ${this.command.join(' ')}`)
      return true
    }
    return false
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

  copyFileSync(`${path.join('/')}/transcode/${output}`, `${path.join('/')}/${output}`)
  rmSync(`${path.join('/')}/transcode`, { recursive: true })
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
