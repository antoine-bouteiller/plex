import { copyFileSync, mkdirSync, rmSync } from 'node:fs'
import { join } from 'node:path'

import { test } from '@japa/runner'
import { testTempDir, videosPath } from 'tests/config.js'

import { getFileStreams, transcodeFile } from '#services/transcode_service'

const testFiles: Record<string, string> = {
  'should keep only wanted tracks': 'test_aac_dts.mkv',
  'should convert dts to aac': 'test_dts.mkv',
  'should not transcode already correct file': 'test_correct_file.mkv',
}

test.group('Transcode functionnnal tests', (group) => {
  let tempTestFilePath: string
  let file: string

  group.setup(async () => {
    mkdirSync(join(testTempDir, './transcode_cache'), { recursive: true })

    return () => {
      rmSync(testTempDir, { recursive: true, force: true })
    }
  })

  group.each.setup(async ({ context }) => {
    file = testFiles[context.test.title]
    tempTestFilePath = join(testTempDir, file)
    copyFileSync(join(videosPath, file), tempTestFilePath)
  })

  test('should keep only wanted tracks', async ({ assert }) => {
    const executed = await transcodeFile(tempTestFilePath, 'eng', 'test')

    assert.isTrue(executed)

    const streams = await getFileStreams(tempTestFilePath)

    await assert.fileExists(file)
    assert.equal(streams.length, 3)
    assert.equal(streams[0].codec_type, 'video')
    assert.equal(streams[1].codec_type, 'audio')
    assert.equal(streams[1].tags?.language, 'eng')
    assert.equal(streams[2].codec_type, 'subtitle')
    assert.equal(streams[1].tags?.language, 'eng')
  })

  test('should convert dts to aac', async ({ assert }) => {
    const executed = await transcodeFile(tempTestFilePath, 'eng', 'test')

    assert.isTrue(executed)

    const streams = await getFileStreams(tempTestFilePath)

    assert.equal(streams.length, 3)
    assert.equal(streams[1].codec_name, 'aac')
    await assert.fileExists(file)
  })

  test('should not transcode already correct file', async ({ assert }) => {
    const executed = await transcodeFile(tempTestFilePath, 'eng', 'test')

    assert.isFalse(executed)
  })
})
