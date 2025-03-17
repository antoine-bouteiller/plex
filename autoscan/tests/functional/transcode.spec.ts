import { getFileStreams, TranscodeService } from '#services/transcode_service'
import { iso2 } from '#types/iso_codes'
import { test } from '@japa/runner'
import { copyFileSync, mkdirSync, rmSync } from 'node:fs'
import { join } from 'node:path'
import { testTempDir, videosPath } from 'tests/config.js'

type FileDataset = {
  title: string
  filename: string
  shouldExecute: boolean
  outputStreams: Array<{
    index: number
    codecType: string
    codecName: string
    language?: iso2
  }>
}

const dataset: FileDataset[] = [
  {
    title: 'should convert dts to aac',
    filename: 'test_dts.mkv',
    shouldExecute: true,
    outputStreams: [
      { index: 0, codecType: 'video', codecName: 'h264' },
      { index: 1, codecType: 'audio', codecName: 'aac', language: 'eng' },
    ],
  },
  {
    title: 'should convert format to mp4',
    filename: 'test_correct_file.mkv',
    shouldExecute: true,
    outputStreams: [
      { index: 0, codecType: 'video', codecName: 'h264' },
      { index: 1, codecType: 'audio', codecName: 'aac', language: 'eng' },
    ],
  },
  {
    title: 'should keep only wanted tracks',
    filename: 'test_aac_dts.mkv',
    shouldExecute: true,
    outputStreams: [
      { index: 0, codecType: 'video', codecName: 'h264' },
      { index: 1, codecType: 'audio', codecName: 'aac', language: 'eng' },
    ],
  },
  {
    title: 'should not transcode already correct file',
    filename: 'test_correct_file.mp4',
    shouldExecute: false,
    outputStreams: [
      { index: 0, codecType: 'video', codecName: 'h264' },
      { index: 1, codecType: 'audio', codecName: 'aac', language: 'eng' },
    ],
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
    .run(async ({ assert }, { filename, shouldExecute, outputStreams }) => {
      tempTestFilePath = join(testTempDir, filename)
      copyFileSync(join(videosPath, filename), tempTestFilePath)

      transcodeService = new TranscodeService(tempTestFilePath, 'test', 'eng')
      const executed = await transcodeService.transcodeFile()

      assert.equal(executed, shouldExecute)

      if (!executed) return

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
