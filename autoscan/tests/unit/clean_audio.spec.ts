import { cleanAudio, getFfprobeData } from '#services/transcode_service';
import { test } from '@japa/runner';
import { join } from 'node:path';
import { videosPath } from 'tests/config.js';

test.group('Clean audio', () => {
  test('Assert cleanAudio tags audio stream with language if language is undefined', async ({
    assert,
  }) => {
    const ffprobeData = await getFfprobeData(
      join(videosPath, 'test_audio_tag.mkv'),
    );
    const audioArgs = cleanAudio(ffprobeData.streams, 'eng', 'test');

    assert.equal(audioArgs.length, 2);
    assert.equal(audioArgs[1], '-metadata:s:a:0 language=eng');
  });

  test('Assert cleanAudio converts dts to aac', async ({ assert }) => {
    const ffprobeData = await getFfprobeData(join(videosPath, 'test_dts.mkv'));
    const audioArgs = cleanAudio(ffprobeData.streams, 'eng', 'test');

    assert.equal(audioArgs.length, 3);
    assert.equal(audioArgs[1], '-c:a:0 aac');
  });

  test('Assert cleanAudio keeps aac over dts', async ({ assert }) => {
    const ffprobeData = await getFfprobeData(
      join(videosPath, 'test_aac_dts.mkv'),
    );
    const audioArgs = cleanAudio(ffprobeData.streams, 'eng', 'test');

    assert.equal(audioArgs.length, 1);

    assert.equal(audioArgs[0], '-map 0:a:0');
  });

  test('Assert cleanAudio keeps fre, eng and original language', async ({
    assert,
  }) => {
    const ffprobeData = await getFfprobeData(
      join(videosPath, 'test_fre_eng_original_language.mkv'),
    );
    const audioArgs = cleanAudio(ffprobeData.streams, 'spa', 'test');

    assert.equal(audioArgs.length, 3);
  });
});
