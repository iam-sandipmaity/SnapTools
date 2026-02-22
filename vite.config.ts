import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import wasm from 'vite-plugin-wasm'
import topLevelAwait from 'vite-plugin-top-level-await'
import markdown from './vite-plugin-markdown'
import { visualizer } from 'rollup-plugin-visualizer'
import ogPlugin from './vite-plugin-og'

export default defineConfig({
  plugins: [
    react(),
    wasm(),
    topLevelAwait(),
    markdown(),
    ogPlugin(),
    visualizer({
      open: false, // Set to true to open bundle analysis in browser
      gzipSize: true,
      brotliSize: true,
      filename: 'dist/stats.html',
    }),
  ],

  server: {
    host: '0.0.0.0', // Listen on all network interfaces
    port: 5173, // Default Vite port
    strictPort: false, // Try next port if 5173 is busy
    proxy: {
      // Proxy Azure Blob Storage PUT requests to avoid CORS.
      // Requests to /azure-upload/... are forwarded to Azure's blob endpoint.
      '/azure-upload': {
        target: 'https://appsprodaksharpublicsa.blob.core.windows.net',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/azure-upload/, ''),
        configure: (proxy) => {
          proxy.on('proxyReq', (proxyReq) => {
            // Azure SAS PUT requires this header to identify the blob type
            proxyReq.setHeader('x-ms-blob-type', 'BlockBlob');
          });
        },
      },
    },
  },

  resolve: {
    dedupe: ['react', 'react-dom'],
    alias: {
      '@': path.resolve(__dirname, './src'),
      // Provide aliases so imports like 'crypto-js/md2' resolve to our polyfills
      'crypto-js/md2': path.resolve(__dirname, './src/lib/crypto-polyfills/md2.ts'),
      'crypto-js/md4': path.resolve(__dirname, './src/lib/crypto-polyfills/md4.ts'),
      'crypto-js/mdc2': path.resolve(__dirname, './src/lib/crypto-polyfills/mdc2.ts'),
      'crypto-js/cast': path.resolve(__dirname, './src/lib/crypto-polyfills/cast5.ts'),
    },
  },

  build: {
    target: 'esnext',
    sourcemap: false, // Disable source maps for production
    chunkSizeWarningLimit: 3000,
    modulePreload: {
      polyfill: true,
    },
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) {
            // Split application code by feature/directory
            if (id.includes('src/components/tools/')) {
              const toolMatch = id.match(/src[\/\\]components[\/\\]tools[\/\\]([^\/\\]+)[\/\\]([^\/\\]+)/);
              if (toolMatch) {
                const category = toolMatch[1];
                const component = toolMatch[2].replace(/\.(tsx|ts|jsx|js)$/, '');

                // For heavy tool components, create individual chunks
                if (category === 'data') {
                  // Split data tools individually due to heavy dependencies
                  if (component === 'FakeDataGenerator') return 'tool-data-faker';
                  if (component === 'ExcelViewer') return 'tool-data-excel';
                  if (component.includes('Csv')) return 'tool-data-csv';
                  return `tool-data-${component.toLowerCase()}`;
                }
                if (category === 'code') {
                  // Split code tools individually
                  return `tool-code-${component.toLowerCase()}`;
                }
                // Other tools: group by category
                return `tool-${category}`;
              }
            }
            if (id.includes('src/blog/')) {
              return 'blog';
            }
            return;
          }

          // Core React packages (needed on every page)
          if (
            id.includes('react/') ||
            id.includes('react-dom/') ||
            id.includes('scheduler/')
          ) {
            return 'react-vendor';
          }

          // React Router (needed for navigation)
          if (id.includes('react-router')) {
            return 'router-vendor';
          }

          // UI Framework - Radix UI
          if (id.includes('@radix-ui')) {
            return 'radix-vendor';
          }

          // Framer Motion (animation) - used heavily
          if (id.includes('framer-motion')) {
            return 'animation-vendor';
          }

          // CRITICAL: Split heavy data libraries into separate chunks
          // @faker-js/faker is ~2MB - must be separate
          if (id.includes('@faker-js/faker')) {
            return 'faker-vendor';
          }

          // xlsx is ~800KB - must be separate
          if (id.includes('xlsx')) {
            return 'xlsx-vendor';
          }

          // papaparse is ~100KB - group with CSV tools
          if (id.includes('papaparse')) {
            return 'csv-vendor';
          }

          // PDF libraries (LAZY LOADED)
          if (id.includes('pdf-lib') || id.includes('pdfjs-dist')) {
            return 'pdf-vendor';
          }

          // Crypto libraries (LAZY LOADED)
          if (
            id.includes('crypto-js') ||
            id.includes('bcryptjs') ||
            id.includes('node-forge') ||
            id.includes('scrypt-js')
          ) {
            return 'crypto-vendor';
          }

          // QR Code (LAZY LOADED)
          if (id.includes('qrcode') || id.includes('html5-qrcode')) {
            return 'qr-vendor';
          }

          // Charts (LAZY LOADED)
          if (id.includes('recharts') || id.includes('d3-')) {
            return 'chart-vendor';
          }

          // Image processing (LAZY LOADED)
          if (id.includes('browser-image-compression') || id.includes('pica')) {
            return 'image-vendor';
          }

          // Lucide icons (used on homepage)
          if (id.includes('lucide-react')) {
            return 'icons-vendor';
          }

          // JSZip and File utilities (LAZY LOADED)
          if (id.includes('jszip') || id.includes('file-saver')) {
            return 'zip-vendor';
          }

          // Date utilities (used in some tools)
          if (id.includes('date-fns') || id.includes('dayjs')) {
            return 'date-vendor';
          }

          // Form libraries (used across site)
          if (id.includes('react-hook-form') || id.includes('@hookform') || id.includes('zod')) {
            return 'form-vendor';
          }

          // Markdown (LAZY LOADED - blog/docs)
          if (id.includes('react-markdown') || id.includes('remark') || id.includes('rehype') || id.includes('marked')) {
            return 'markdown-vendor';
          }

          // HTML/Canvas libraries (LAZY LOADED)
          if (id.includes('html2canvas') || id.includes('html2pdf') || id.includes('jspdf') || id.includes('mammoth')) {
            return 'canvas-vendor';
          }

          // PeerJS (LAZY LOADED - file/text sharing)
          if (id.includes('peerjs')) {
            return 'peer-vendor';
          }

          // Barcode libraries (LAZY LOADED)
          if (id.includes('jsbarcode')) {
            return 'barcode-vendor';
          }

          // React Query (state management)
          if (id.includes('@tanstack/react-query')) {
            return 'query-vendor';
          }

          // Theme libraries (needed early)
          if (id.includes('next-themes') || id.includes('class-variance-authority') || id.includes('clsx') || id.includes('tailwind-merge')) {
            return 'theme-vendor';
          }

          // Sonner (toast notifications)
          if (id.includes('sonner')) {
            return 'toast-vendor';
          }

          // EmailJS (contact form)
          if (id.includes('@emailjs')) {
            return 'email-vendor';
          }

          // React Simple Maps (LAZY LOADED)
          if (id.includes('react-simple-maps')) {
            return 'maps-vendor';
          }

          // Let Vite handle remaining dependencies automatically to avoid circular dependency issues
        },
        // Optimize chunk naming for better caching
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
      },
    },
    // Enable additional optimizations
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info', 'console.debug'],
        passes: 2,
      },
      mangle: {
        safari10: true,
      },
      format: {
        comments: false,
      },
    },
  },
  optimizeDeps: {
    exclude: ['@ffmpeg/ffmpeg', '@ffmpeg/util'],
  },
})
