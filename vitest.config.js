import { defineConfig } from 'vitest/config';
import vue from '@vitejs/plugin-vue';
import { resolve } from 'path';

export default defineConfig({
  plugins: [vue()],
  test: {
    globals: true,
    environment: 'jsdom',
    include: ['src/**/*.spec.js'],
    exclude: ['src/**/*.visual.spec.js'],
    coverage: {
      provider: 'v8',
      reporter: ['text'],
      include: ['src/**/*.js'],
      exclude: ['src/main.js', 'src/**/index.js'],
    },
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
});
