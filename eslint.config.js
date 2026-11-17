import { FlatCompat } from '@eslint/eslintrc';
import js from '@eslint/js';
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
];
