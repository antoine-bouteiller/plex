import { getFfprobeData, transcodeFile } from '#services/transcode_service';
import { test } from '@japa/runner';
import { copyFileSync, mkdirSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { testTempDir, videosPath } from 'tests/config.js';

export const testFile = 'test_aac_dts.mkv';
export const testDtsFile = 'test_dts.mkv';
export const tempTestFilePath = join(testTempDir, testFile);
export const tempTestFileDtsPath = join(testTempDir, testDtsFile);

test.group('Transcode functionnnal tests', (group) => {
  group.setup(async () => {
    mkdirSync(join(testTempDir, './transcode_cache'), { recursive: true });
    copyFileSync(join(videosPath, testFile), tempTestFilePath);
    copyFileSync(join(videosPath, testDtsFile), tempTestFileDtsPath);
  });

  group.teardown(() => {
    rmSync(testTempDir, { recursive: true, force: true });
  });

  test('Assert file is cleaned', async ({ assert }) => {
    const executed = await transcodeFile(tempTestFilePath, 'eng', 'test');

    assert.isTrue(executed);

    const ffprobeData = await getFfprobeData(tempTestFilePath);

    await assert.fileExists(testFile);
    assert.equal(ffprobeData.streams.length, 3);
    assert.equal(ffprobeData.streams[0].codec_type, 'video');
    assert.equal(ffprobeData.streams[1].codec_type, 'audio');
    assert.equal(ffprobeData.streams[1].tags?.language, 'eng');
    assert.equal(ffprobeData.streams[2].codec_type, 'subtitle');
    assert.equal(ffprobeData.streams[1].tags?.language, 'eng');
  });

  test('Assert audio is converted to aac', async ({ assert }) => {
    const executed = await transcodeFile(tempTestFileDtsPath, 'eng', 'test');

    assert.isTrue(executed);

    const ffprobeData = await getFfprobeData(tempTestFileDtsPath);

    assert.equal(ffprobeData.streams.length, 3);
    assert.equal(ffprobeData.streams[1].codec_name, 'aac');
    await assert.fileExists(testDtsFile);
  });
});
