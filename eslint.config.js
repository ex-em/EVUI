import pluginJs from '@eslint/js';
import tseslint from 'typescript-eslint';
import eslintConfigPrettier from 'eslint-config-prettier';

export default tseslint.config(
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  {
    project: ['./tsconfig.eslint.json', './packages/*/tsconfig.json'],
    ignores: ['**/dist/', '**/node_modules/'],
    tsconfigRootDir: import.meta.dirname,
  },
  eslintConfigPrettier
);
