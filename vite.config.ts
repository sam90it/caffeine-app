import { defineConfig } from 'vite';
import react from '@vitejs/react';
import { nodePolyfills } from 'vite-plugin-node-polyfills';

export default defineConfig({
  plugins: [
    react(),
    nodePolyfills(),
  ],
  resolve: {
    alias: {
      declarations: '/src/declarations',
    },
  },
});