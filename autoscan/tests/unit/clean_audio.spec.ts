import { join } from 'node:path';
import { test } from '@japa/runner';
import { videosPath } from 'tests/config.js';
import { cleanAudio, getFileStreams } from '#services/transcode_service';

test.group('Clean audio', () => {
  test('should tag audio stream with language if language is undefined', async ({
    assert,
  }) => {
    const streams = await getFileStreams(
      join(videosPath, 'test_audio_tag.mkv'),
    );
    const audioArgs = cleanAudio(streams, 'eng', 'test');

    assert.equal(audioArgs.length, 2);
    assert.equal(audioArgs[1], '-metadata:s:a:0 language=eng');
  });

  test('should convert dts to aac', async ({ assert }) => {
    const streams = await getFileStreams(join(videosPath, 'test_dts.mkv'));
    const audioArgs = cleanAudio(streams, 'eng', 'test');

    assert.equal(audioArgs.length, 3);
    assert.equal(audioArgs[1], '-c:a:0 aac');
  });

  test('should keep aac over dts', async ({ assert }) => {
    const streams = await getFileStreams(join(videosPath, 'test_aac_dts.mkv'));
    const audioArgs = cleanAudio(streams, 'eng', 'test');

    assert.equal(audioArgs.length, 1);

    assert.equal(audioArgs[0], '-map 0:a:0');
  });

  test('should keep fre, eng and original language', async ({ assert }) => {
    const streams = await getFileStreams(
      join(videosPath, 'test_fre_eng_original_language.mkv'),
    );
    const audioArgs = cleanAudio(streams, 'spa', 'test');

    assert.equal(audioArgs.length, 3);
  });
});
