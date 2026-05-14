// backend/vite.config.ts
import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    target: 'node20',
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        server: resolve(__dirname, 'src/server.ts')
      },
      external: [
        'express',
        'mongoose',
        'socket.io',
        'bcryptjs',
        'jsonwebtoken'
      ]
    },
    sourcemap: true,
    minify: false
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src')
    }
  },
  server: {
    port: 5000,
    hmr: false
  }
});