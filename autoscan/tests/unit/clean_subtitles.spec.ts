import { cleanSubtitles, getFfprobeData } from '#services/transcode_service';
import { test } from '@japa/runner';
import { join } from 'node:path';
import { videosPath } from 'tests/config.js';

test.group('Clean subtitles', () => {
  test('Assert subtitles tags audio stream with language if language is undefined', async ({
    assert,
  }) => {
    const ffprobeData = await getFfprobeData(
      join(videosPath, 'test_subtitle_tag.mkv'),
    );
    const subtitlesArgs = cleanSubtitles(ffprobeData.streams, 'test');

    assert.equal(subtitlesArgs.length, 2);
    assert.equal(subtitlesArgs[0], '-map 0:s:0');
    assert.equal(subtitlesArgs[1], '-metadata:s:s:0 language=eng');
  });

  test('Assert keep non forced eng subtitle', async ({ assert }) => {
    const ffprobeData = await getFfprobeData(
      join(videosPath, 'test_subtitle_forced.mkv'),
    );
    const subtitlesArgs = cleanSubtitles(ffprobeData.streams, 'test');

    assert.equal(subtitlesArgs.length, 1);
    assert.equal(subtitlesArgs[0], '-map 0:s:1');
  });

  test('Assert keep undefined over forced eng subtitle', async ({ assert }) => {
    const ffprobeData = await getFfprobeData(
      join(videosPath, 'test_subtitle_forced_no_eng.mkv'),
    );
    const subtitlesArgs = cleanSubtitles(ffprobeData.streams, 'test');

    assert.equal(subtitlesArgs.length, 2);
    assert.equal(subtitlesArgs[0], '-map 0:s:1');
  });
});
