import js from '@eslint/js'
import globals from 'globals'
import perfectionist from 'eslint-plugin-perfectionist'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: globals.browser,
    },
    plugins: {
      perfectionist,
    },
    rules: {
      'perfectionist/sort-interfaces': [
        'error',
        { type: 'alphabetical', order: 'asc', groups: ['required-member', 'optional-member'] },
      ],
      'perfectionist/sort-object-types': [
        'error',
        { type: 'alphabetical', order: 'asc', groups: ['required-member', 'optional-member'] },
      ],
      'perfectionist/sort-objects': ['error', { type: 'alphabetical', order: 'asc' }],
    },
  },
])
