import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    lib: {
      entry: {
        main: path.resolve(__dirname, 'src/main.js'),
        resolver: path.resolve(__dirname, 'src/resolver.js'),
      },
      formats: ['es'],
    },
    rollupOptions: {
      external: [
        'vue',
        'lodash-es',
        'dayjs',
        'bignumber.js',
        'korean-regexp',
        'vue-resize-observer',
        'vue3-observe-visibility',
      ],
      output: {
        preserveModules: true,
        preserveModulesRoot: 'src',
        entryFileNames: '[name].js',
      },
    },
  },
  css: {
    preprocessorOptions: {
      scss: {
        api: 'modern',
      },
    },
  },
  plugins: [vue()],
  resolve: {
    extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json', '.vue'],
    alias: {
      '@': path.join(__dirname, 'src/'),
      docs: path.join(__dirname, 'docs/'),
    },
  },
});
