import { FlatCompat } from '@eslint/eslintrc';
import js from '@eslint/js';
import typescriptParser from '@typescript-eslint/parser';
import legacy from './.eslintrc.cjs';

const config = { ...legacy };
delete config.root;
const compat = new FlatCompat({
  baseDirectory: import.meta.dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
});

export default [
  { linterOptions: { reportUnusedDisableDirectives: 'off' } },
  { ignores: ['dist/**', 'docs/**', 'node_modules/**', 'index.html', 'CHANGELOG.md'] },
  ...compat.config(config),
  {
    files: ['**/*.{js,ts,vue}'],
    languageOptions: { parserOptions: { parser: { ts: typescriptParser } } },
  },
  {
    files: ['src/**/*.ts'],
    languageOptions: { parser: typescriptParser },
    rules: { 'no-undef': 'off', 'no-unused-vars': 'off' },
  },
  {
    files: ['**/*.vue'],
    rules: {
      'no-unused-vars': [
        'error',
        {
          vars: 'all',
          args: 'after-used',
          argsIgnorePattern: '^_',
          ignoreRestSiblings: true,
          caughtErrors: 'none',
        },
      ],
    },
  },
];
