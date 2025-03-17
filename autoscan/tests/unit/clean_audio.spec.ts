import { TranscodeService } from '#services/transcode_service'
import { iso2 } from '#types/iso_codes'
import { test } from '@japa/runner'
import { join } from 'node:path'
import { videosPath } from 'tests/config.js'

type TestCase = {
  title: string
  file: string
  language: iso2
  expected: {
    length: number
    commandAt?: { index: number; value: string }[]
  }
}

const dataset: TestCase[] = [
  {
    title: 'should tag audio stream with language if language is undefined - eng',
    file: 'test_audio_tag.mkv',
    language: 'eng',
    expected: {
      length: 3,
      commandAt: [{ index: 2, value: '-metadata:s:a:0 language=eng' }],
    },
  },
  {
    title: 'should tag audio stream with language if language is undefined - fre',
    file: 'test_audio_tag.mkv',
    language: 'fre',
    expected: {
      length: 3,
      commandAt: [{ index: 2, value: '-metadata:s:a:0 language=fre' }],
    },
  },
  {
    title: 'should convert dts to aac',
    file: 'test_dts.mkv',
    language: 'eng',
    expected: {
      length: 4,
      commandAt: [{ index: 2, value: '-c:a:0 aac' }],
    },
  },
  {
    title: 'should keep aac over dts',
    file: 'test_aac_dts.mkv',
    language: 'eng',
    expected: {
      length: 2,
      commandAt: [{ index: 1, value: '-map 0:a:0' }],
    },
  },
  {
    title: 'should keep fre, eng and original language',
    file: 'test_fre_eng_original_language.mkv',
    language: 'spa',
    expected: {
      length: 4,
    },
  },
]

test.group('Clean audio', () => {
  test('{title}')
    .with(dataset)
    .run(async ({ assert }, { file, language, expected }) => {
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
