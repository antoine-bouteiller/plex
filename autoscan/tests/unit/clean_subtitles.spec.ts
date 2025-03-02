import { cleanSubtitles, getFileStreams } from '#services/transcode_service'
import { test } from '@japa/runner'
import { join } from 'node:path'
import { videosPath } from 'tests/config.js'

test.group('Clean subtitles', () => {
  test('should tag subtitle stream with language if language is undefined', async ({ assert }) => {
    const streams = await getFileStreams(join(videosPath, 'test_subtitle_tag.mkv'))
    const subtitlesArgs = cleanSubtitles(streams, 'test', 'eng').command

    assert.equal(subtitlesArgs.length, 2)
    assert.equal(subtitlesArgs[0], '-map 0:s:0')
    assert.equal(subtitlesArgs[1], '-metadata:s:s:0 language=eng')
  })

  test('should keep non forced eng subtitle', async ({ assert }) => {
    const streams = await getFileStreams(join(videosPath, 'test_subtitle_forced.mkv'))
    const subtitlesArgs = cleanSubtitles(streams, 'test', 'eng').command

    assert.equal(subtitlesArgs.length, 1)
    assert.equal(subtitlesArgs[0], '-map 0:s:1')
  })

  test('should keep undefined over forced eng subtitle', async ({ assert }) => {
    const streams = await getFileStreams(join(videosPath, 'test_subtitle_forced_no_eng.mkv'))
    const subtitlesArgs = cleanSubtitles(streams, 'test', 'eng').command

    assert.equal(subtitlesArgs.length, 2)
    assert.equal(subtitlesArgs[0], '-map 0:s:1')
  })

  test('should not keep subilte if original language is fre', async ({ assert }) => {
    const streams = await getFileStreams(join(videosPath, 'test_subtitle_forced.mkv'))
    const subtitlesArgs = cleanSubtitles(streams, 'test', 'fre').command

    assert.equal(subtitlesArgs.length, 0)
  })
})
