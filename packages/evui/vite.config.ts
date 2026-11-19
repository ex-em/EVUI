import { resolve } from 'path';
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import dts from 'vite-plugin-dts';
import path from 'path';

export default defineConfig({
  assetsInclude: ['**/*.{eot,ttf,woff,woff2,svg}'],
  resolve: {
    alias: [
      { find: '@', replacement: path.resolve(import.meta.dirname, './src') },
    ],
  },
  plugins: [
    vue(),
    dts({
      processor: 'vue',
      entryRoot: 'src',
      include: ['src/**/*'],
    }),
  ],
  build: {
    // Preserve the browser targets used by Vite 5 for library consumers.
    target: ['es2020', 'edge88', 'firefox78', 'chrome87', 'safari14'],
    lib: {
      entry: resolve(import.meta.dirname, './src/index.js'),
      fileName: 'index',
      cssFileName: 'style',
      name: 'evui',
    },
    rolldownOptions: {
      external: ['vue'],
      output: {
        globals: {
          vue: 'Vue',
        },
      },
    },
  },
});
