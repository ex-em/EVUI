import pluginJs from '@eslint/js';
import tseslint from 'typescript-eslint';
import eslintConfigPrettier from 'eslint-config-prettier';
import vuePlugin from 'eslint-plugin-vue';
import globals from 'globals';

export default tseslint.config(
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  ...vuePlugin.configs['flat/recommended'],
  {
    plugins: {
      'typescript-eslint': tseslint.plugin,
    },
    languageOptions: {
      globals: globals.browser,
      parserOptions: {
        parser: tseslint.parser,
        extraFileExtensions: ['.vue'],
        sourceType: 'module',
      },
    },
  },
  {
    files: ['**/*.cjs', '**/scripts/**/*.{js,ts}', '**/*config.{js,ts}'],
    languageOptions: { globals: globals.node },
  },
  {
    files: ['**/*.cjs'],
    rules: { '@typescript-eslint/no-require-imports': 'off' },
  },
  {
    ignores: ['**/dist/', '**/node_modules/', '**/storybook-static/'],
  },
  eslintConfigPrettier
);
