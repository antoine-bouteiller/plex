import { join } from 'node:path';
import { assert } from '@japa/assert';
import { fileSystem } from '@japa/file-system';
import { configure, processCLIArgs, run } from '@japa/runner';

process.env.NODE_ENV = 'test';

processCLIArgs(process.argv.splice(2));
configure({
  plugins: [
    assert(),
    fileSystem({
      basePath: join(import.meta.dirname, '../tests/tmp'),
      autoClean: false,
    }),
  ],
  suites: [
    {
      name: 'unit',
      files: ['tests/unit/**/*.spec.ts'],
    },
    {
      name: 'functional',
      files: ['tests/functional/**/*.spec.ts'],
    },
  ],
});

run();
