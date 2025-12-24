import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import wasm from 'vite-plugin-wasm'
import topLevelAwait from 'vite-plugin-top-level-await'
import markdown from './vite-plugin-markdown'

export default defineConfig({
  plugins: [
    react(),
    wasm(),
    topLevelAwait(),
    markdown(),
  ],

  resolve: {
    dedupe: ['react', 'react-dom'],
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },

  build: {
    target: 'esnext',
    sourcemap: true,
    chunkSizeWarningLimit: 6000,
    modulePreload: false,

    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return

          if (
            id.includes('react') ||
            id.includes('react-dom') ||
            id.includes('react-router')
          ) {
            return 'react-vendor'
          }

          if (id.includes('@radix-ui') || id.includes('shadcn')) {
            return 'ui-vendor'
          }

          // ❗ DO NOT chunk framer-motion manually
          // Let Rollup handle it

          if (id.includes('pdf-lib') || id.includes('pdfjs-dist')) {
            return 'pdf-vendor'
          }

          if (
            id.includes('crypto-js') ||
            id.includes('bcryptjs') ||
            id.includes('node-forge') ||
            id.includes('scrypt-js')
          ) {
            return 'crypto-vendor'
          }

          if (id.includes('qrcode')) {
            return 'qr-vendor'
          }

          if (id.includes('recharts')) {
            return 'chart-vendor'
          }

          if (id.includes('axios') || id.includes('jszip')) {
            return 'utility-vendor'
          }
        },
      },
    },
  },
})
