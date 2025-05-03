import type { iso2 } from '#types/iso_codes'

import { TranscodeService } from '#services/transcode_service'
import { test } from '@japa/runner'
import { join } from 'node:path'
import { videosPath } from 'tests/config.js'

interface TestCase {
  expected: {
    commandAt?: { index: number; value: string }[]
    length: number
  }
  file: string
  language: iso2
  title: string
}

const dataset: TestCase[] = [
  {
    expected: {
      commandAt: [{ index: 2, value: '-metadata:s:a:0 language=eng' }],
      length: 3,
    },
    file: 'test_audio_tag.mkv',
    language: 'eng',
    title: 'should tag audio stream with language if language is undefined - eng',
  },
  {
    expected: {
      commandAt: [{ index: 2, value: '-metadata:s:a:0 language=fre' }],
      length: 3,
    },
    file: 'test_audio_tag.mkv',
    language: 'fre',
    title: 'should tag audio stream with language if language is undefined - fre',
  },
  {
    expected: {
      commandAt: [{ index: 2, value: '-c:a:0 aac' }],
      length: 4,
    },
    file: 'test_dts.mkv',
    language: 'eng',
    title: 'should convert dts to aac',
  },
  {
    expected: {
      commandAt: [{ index: 1, value: '-map 0:a:0' }],
      length: 2,
    },
    file: 'test_aac_dts.mkv',
    language: 'eng',
    title: 'should keep aac over dts',
  },
  {
    expected: {
      length: 4,
    },
    file: 'test_fre_eng_original_language.mkv',
    language: 'spa',
    title: 'should keep fre, eng and original language',
  },
]

test.group('Clean audio', () => {
  test('{title}')
    .with(dataset)
    .run(async ({ assert }, { expected, file, language }) => {
      const filePath = join(videosPath, file)
      const transcodeService = new TranscodeService(filePath, 'test', language)
      await transcodeService.init()

      transcodeService.cleanAudio()

      const command = transcodeService.command

      assert.equal(command.length, expected.length)

      expected.commandAt?.forEach(({ index, value }) => {
        assert.equal(command[index], value)
      })
    })
})
