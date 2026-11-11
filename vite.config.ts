import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  base: '/',
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        popup: 'index.html',
        background: 'src/background/index.ts',
      },
      output: {
        // The manifest points at a fixed service worker path, so the
        // background entry must not get a content hash.
        entryFileNames: (chunk) =>
          chunk.name === 'background'
            ? 'background.js'
            : 'assets/[name]-[hash].js',
      },
    },
  },
});
