import { defineConfig } from 'vitest/config';
import vue from '@vitejs/plugin-vue';
import { resolve } from 'path';

export default defineConfig({
  plugins: [vue()],
  test: {
    globals: true,
    environment: 'jsdom',
    include: ['src/**/*.spec.{js,ts}'],
    exclude: ['src/**/*.visual.spec.js'],
    coverage: {
      provider: 'v8',
      reporter: ['text'],
      include: ['src/**/*.{js,ts}'],
      exclude: ['src/main.js', 'src/**/index.js'],
    },
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
    extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json', '.vue'],
  },
});
