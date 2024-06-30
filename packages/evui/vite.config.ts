import { resolve } from 'path';
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import dts from 'vite-plugin-dts';
import path from 'path';

export default defineConfig({
  assetsInclude: ['**/*.{eot,ttf,woff,woff2,svg}'],
  resolve: {
    alias: [
      { find: "@", replacement: path.resolve(__dirname, "./src") },
    ]
  },
  plugins: [vue(), dts({rollupTypes: true})],
  build: {
    lib: {
      entry: resolve(__dirname, './src'),
      fileName: 'index',
      name: 'evui',
    },
    rollupOptions: {
      external: ['vue'],
      output: {
        globals: {
          vue: 'Vue',
        },
      },
    },
  },
});
