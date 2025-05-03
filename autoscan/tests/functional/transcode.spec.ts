import type { iso2 } from '#types/iso_codes'

import { getFileStreams, TranscodeService } from '#services/transcode_service'
import { test } from '@japa/runner'
import { copyFileSync, mkdirSync, rmSync } from 'node:fs'
import { join } from 'node:path'
import { testTempDir, videosPath } from 'tests/config.js'

interface FileDataset {
  filename: string
  outputStreams: {
    codecName: string
    codecType: string
    index: number
    language?: iso2
  }[]
  shouldExecute: boolean
  title: string
}

const dataset: FileDataset[] = [
  {
    filename: 'test_dts.mkv',
    outputStreams: [
      { codecName: 'h264', codecType: 'video', index: 0 },
      { codecName: 'aac', codecType: 'audio', index: 1, language: 'eng' },
    ],
    shouldExecute: true,
    title: 'should convert dts to aac',
  },
  {
    filename: 'test_correct_file.mkv',
    outputStreams: [
      { codecName: 'h264', codecType: 'video', index: 0 },
      { codecName: 'aac', codecType: 'audio', index: 1, language: 'eng' },
    ],
    shouldExecute: true,
    title: 'should convert format to mp4',
  },
  {
    filename: 'test_aac_dts.mkv',
    outputStreams: [
      { codecName: 'h264', codecType: 'video', index: 0 },
      { codecName: 'aac', codecType: 'audio', index: 1, language: 'eng' },
    ],
    shouldExecute: true,
    title: 'should keep only wanted tracks',
  },
  {
    filename: 'test_correct_file.mp4',
    outputStreams: [
      { codecName: 'h264', codecType: 'video', index: 0 },
      { codecName: 'aac', codecType: 'audio', index: 1, language: 'eng' },
    ],
    shouldExecute: false,
    title: 'should not transcode already correct file',
  },
]

test.group('Transcode', (group) => {
  let tempTestFilePath: string
  let transcodeService: TranscodeService

  group.setup(async () => {
    mkdirSync(join(testTempDir, './transcode_cache'), { recursive: true })
    return () => {
      rmSync(testTempDir, { force: true, recursive: true })
    }
  })

  test('{title}')
    .with(dataset)
    .run(async ({ assert }, { filename, outputStreams, shouldExecute }) => {
      tempTestFilePath = join(testTempDir, filename)
      copyFileSync(join(videosPath, filename), tempTestFilePath)

      transcodeService = new TranscodeService(tempTestFilePath, 'test', 'eng')
      const executed = await transcodeService.transcodeFile()

      assert.equal(executed, shouldExecute)

      if (!executed) {
        await assert.fileExists(filename)
        return
      }

      const outputFileName = filename.replace('.mkv', '.mp4')
      await assert.fileExists(outputFileName)
      await assert.fileExists(outputFileName.replace('.mp4', '.eng.srt'))

      if (outputFileName !== filename) {
        await assert.fileNotExists(filename)
      }

      const streams = await getFileStreams(join(testTempDir, outputFileName))

      for (const stream of outputStreams) {
        assert.equal(streams[stream.index].codec_type, stream.codecType)
        assert.equal(streams[stream.index].codec_name, stream.codecName)
        if (stream.language) {
          assert.equal(streams[stream.index].tags?.language, stream.language)
        }
      }
    })
})
