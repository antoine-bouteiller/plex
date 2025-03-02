import { assert } from '@japa/assert'
import { fileSystem } from '@japa/file-system'
import { configure, processCLIArgs, run } from '@japa/runner'
import { join } from 'node:path'

process.env.NODE_ENV = 'test'

processCLIArgs(process.argv.splice(2))
configure({
  plugins: [
    assert(),
    fileSystem({
      autoClean: false,
      basePath: join(import.meta.dirname, '../tests/tmp'),
    }),
  ],
  suites: [
    {
      files: ['tests/unit/**/*.spec.ts'],
      name: 'unit',
    },
    {
      files: ['tests/functional/**/*.spec.ts'],
      name: 'functional',
    },
  ],
})

void run()
