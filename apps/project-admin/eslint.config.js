import pluginVue from 'eslint-plugin-vue'
import tsParser from '@typescript-eslint/parser'
import tsPlugin from '@typescript-eslint/eslint-plugin'
import prettier from 'eslint-plugin-prettier'
import eslintConfigPrettier from 'eslint-config-prettier'

export default [
  {
    ignores: [
      'dist/**',
      'node_modules/**',
      'src/types/auto-imports.d.ts',
      'src/types/components.d.ts',
    ],
  },
  // TypeScript 檔案規則
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
    },
    plugins: {
      '@typescript-eslint': tsPlugin,
      prettier,
    },
    rules: {
      ...tsPlugin.configs.recommended.rules,
      ...eslintConfigPrettier.rules,
      'prettier/prettier': 'error',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          varsIgnorePattern: '^_',
          argsIgnorePattern: '^_',
          destructuredArrayIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
    },
  },
  // Vue 檔案規則
  {
    files: ['**/*.vue'],
    languageOptions: {
      parser: (await import('vue-eslint-parser')).default,
      parserOptions: {
        parser: tsParser,
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
    },
    plugins: {
      vue: pluginVue,
      '@typescript-eslint': tsPlugin,
      prettier,
    },
    rules: {
      ...pluginVue.configs['flat/recommended'].rules,
      ...eslintConfigPrettier.rules,
      'prettier/prettier': 'error',
      'vue/multi-word-component-names': 'warn',
      'vue/block-order': [
        'error',
        {
          order: ['script', 'template', 'style'],
        },
      ],
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          varsIgnorePattern: '^_',
          argsIgnorePattern: '^_',
          destructuredArrayIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
      '@typescript-eslint/no-explicit-any': 'warn',
    },
  },
]
