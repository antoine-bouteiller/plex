import { cleanAudio, getFileStreams } from '#services/transcode_service'
import { test } from '@japa/runner'
import { join } from 'node:path'
import { videosPath } from 'tests/config.js'

test.group('Clean audio', () => {
  test('should tag audio stream with language if language is undefined', async ({ assert }) => {
    const streams = await getFileStreams(join(videosPath, 'test_audio_tag.mkv'))
    const audioArgsEng = cleanAudio(streams, 'eng', 'test').command

    assert.equal(audioArgsEng.length, 2)
    assert.equal(audioArgsEng[1], '-metadata:s:a:0 language=eng')

    const audioArgsFre = cleanAudio(streams, 'fre', 'test').command

    assert.equal(audioArgsFre.length, 2)
    assert.equal(audioArgsFre[1], '-metadata:s:a:0 language=fre')
  })

  test('should convert dts to aac', async ({ assert }) => {
    const streams = await getFileStreams(join(videosPath, 'test_dts.mkv'))
    const audioArgs = cleanAudio(streams, 'eng', 'test').command

    assert.equal(audioArgs.length, 3)
    assert.equal(audioArgs[1], '-c:a:0 aac')
  })

  test('should keep aac over dts', async ({ assert }) => {
    const streams = await getFileStreams(join(videosPath, 'test_aac_dts.mkv'))
    const audioArgs = cleanAudio(streams, 'eng', 'test').command

    assert.equal(audioArgs.length, 1)

    assert.equal(audioArgs[0], '-map 0:a:0')
  })

  test('should keep fre, eng and original language', async ({ assert }) => {
    const streams = await getFileStreams(join(videosPath, 'test_fre_eng_original_language.mkv'))
    const audioArgs = cleanAudio(streams, 'spa', 'test').command

    assert.equal(audioArgs.length, 3)
  })
})
