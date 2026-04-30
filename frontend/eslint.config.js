import js from '@eslint/js';
import tseslint from '@typescript-eslint/eslint-plugin';
import tsparser from '@typescript-eslint/parser';
import globals from 'globals';

export default [
  {
    ignores: ['node_modules/**', 'dist/**', 'postcss.config.js'],
  },
  js.configs.recommended,
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parser: tsparser,
      globals: {
        ...globals.browser,
        React: 'readonly',
        EventListener: 'readonly',
      },
    },
    plugins: {
      '@typescript-eslint': tseslint,
    },
    rules: {
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': ['error', { 'argsIgnorePattern': '^_' }],
      'no-empty': 'warn',
      'no-empty-pattern': 'warn',
    },
  },
];