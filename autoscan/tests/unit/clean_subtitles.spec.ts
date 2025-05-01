import type { iso2 } from '#types/iso_codes'

import { TranscodeService } from '#services/transcode_service'
import { test } from '@japa/runner'
import { copyFileSync, mkdirSync, rmSync } from 'node:fs'
import { join } from 'node:path'
import { testTempDir, videosPath } from 'tests/config.js'

interface TestCase {
  exists: boolean
  file: string
  language: iso2
  title: string
}

const dataset: TestCase[] = [
  {
    exists: true,
    file: 'test_subtitle_tag.mkv',
    language: 'eng',
    title: 'should tag subtitle stream with language if language is undefined - eng',
  },
  {
    exists: true,
    file: 'test_subtitle_forced.mkv',
    language: 'eng',
    title: 'should keep non forced eng subtitle',
  },
  {
    exists: true,
    file: 'test_subtitle_forced_no_eng.mkv',
    language: 'eng',
    title: 'should keep undefined over forced eng subtitle',
  },
  {
    exists: false,
    file: 'test_subtitle_forced.mkv',
    language: 'fre',
    title: 'should not keep subilte if original language is fre',
  },
]

test.group('Extract subtitles', (group) => {
  group.setup(async () => {
    mkdirSync(join(testTempDir, './transcode_cache'), { recursive: true })

    return () => {
      rmSync(testTempDir, { force: true, recursive: true })
    }
  })

  test('{title}')
    .with(dataset)
    .run(async ({ assert }, { exists, file, language }) => {
      const tempTestFilePath = join(testTempDir, file)
      copyFileSync(join(videosPath, file), tempTestFilePath)
      const transcodeService = new TranscodeService(tempTestFilePath, 'test', language)
      await transcodeService.init()

      await transcodeService.extractSubtitles()

      if (exists) {
        await assert.fileExists(file.replace('.mkv', `.${language}.srt`))
      } else {
        await assert.fileNotExists(file.replace('.mkv', `.${language}.srt`))
      }
    })
})
