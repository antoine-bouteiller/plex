import js from '@eslint/js'
import prettierConfig from 'eslint-config-prettier'
import perfectionist from 'eslint-plugin-perfectionist'
import unicorn from 'eslint-plugin-unicorn'
import tseslint from 'typescript-eslint'

const sortRules = {
  groups: ['top', ['method', 'unknown', 'multiline'], 'bottom'],
  customGroups: {
    top: ['.*(?:I|i)d$', '^name$'],
    bottom: ['^createdAt$', '^orderBy$'],
  },
}

export default tseslint.config(
  js.configs.recommended,
  ...tseslint.configs.strictTypeChecked,
  ...tseslint.configs.stylisticTypeChecked,
  perfectionist.configs['recommended-natural'],
  {
    plugins: {
      '@unicorn': unicorn,
    },
    rules: {
      '@typescript-eslint/consistent-type-imports': 'error',
      '@typescript-eslint/no-unsafe-return': 'off',
      '@typescript-eslint/no-empty-function': 'off',
      '@typescript-eslint/no-misused-promises': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/only-throw-error': 'off',
      '@typescript-eslint/restrict-template-expressions': 'off',
      '@typescript-eslint/require-await': 'off',
      '@typescript-eslint/no-empty-object-type': 'off',
      '@typescript-eslint/no-unnecessary-condition': [
        'error',
        { allowConstantLoopConditions: true },
      ],
      '@typescript-eslint/no-namespace': [
        'error',
        {
          allowDeclarations: true,
        },
      ],

      '@unicorn/filename-case': [
        'error',
        {
          cases: {
            snakeCase: true,
          },
        },
      ],

      'no-console': 'error',

      'perfectionist/sort-interfaces': ['error', sortRules],
      'perfectionist/sort-objects': ['error', { ...sortRules, partitionByNewLine: true }],
    },
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  {
    ignores: ['**/*.config.ts', '**/*.{cjs,mjs,js}', '**/prisma/client/**', '**/.next/**'],
  },
  prettierConfig
)
