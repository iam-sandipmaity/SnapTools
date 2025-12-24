import { defineConfig, ConfigEnv, UserConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import wasm from "vite-plugin-wasm";
import topLevelAwait from "vite-plugin-top-level-await";
import { NodeGlobalsPolyfillPlugin } from '@esbuild-plugins/node-globals-polyfill';
import { NodeModulesPolyfillPlugin } from '@esbuild-plugins/node-modules-polyfill';
import markdown from './vite-plugin-markdown';

// https://vitejs.dev/config/
export default defineConfig(({ mode }: ConfigEnv): UserConfig => ({
  optimizeDeps: {
    exclude: ['scrypt-js', 'argon2-browser'],
    esbuildOptions: {
      target: 'esnext',
      supported: {
        'top-level-await': true
      },
      define: {
        'process.env.NODE_DEBUG': 'false',
        global: 'globalThis'
      },
      plugins: [
        NodeGlobalsPolyfillPlugin({
          buffer: true,
          process: true
        }),
        NodeModulesPolyfillPlugin()
      ]
    }
  },
  build: {
    target: 'esnext',
    sourcemap: true,
    chunkSizeWarningLimit: 6000,
    rollupOptions: {
      external: ['@vercel/analytics'],
      output: {
        format: 'es',
        inlineDynamicImports: false,
        assetFileNames: 'assets/[name][extname]',
        manualChunks(id) {
          // Only process node_modules
          if (id.includes('node_modules')) {
            // React core libraries
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router')) {
              return 'react-vendor';
            }

            // Radix UI and shadcn components
            if (id.includes('@radix-ui') || id.includes('shadcn')) {
              return 'ui-vendor';
            }

            // Framer Motion
            if (id.includes('framer-motion')) {
              return 'ui-vendor';
            }

            // PDF libraries
            if (id.includes('pdf-lib') || id.includes('pdfjs-dist')) {
              return 'pdf-vendor';
            }

            // Crypto libraries
            if (
              id.includes('crypto-js') ||
              id.includes('crypto-browserify') ||
              id.includes('bcryptjs') ||
              id.includes('node-forge') ||
              id.includes('scrypt-js')
            ) {
              return 'crypto-vendor';
            }

            // QR and barcode libraries
            if (
              id.includes('qrcode') ||
              id.includes('html5-qrcode') ||
              id.includes('jsbarcode')
            ) {
              return 'qr-vendor';
            }

            // Chart libraries
            if (id.includes('recharts') || id.includes('d3-')) {
              return 'chart-vendor';
            }

            // Code highlighting
            if (id.includes('react-syntax-highlighter') || id.includes('prism')) {
              return 'code-vendor';
            }

            // Heavy utilities
            if (
              id.includes('html2canvas') ||
              id.includes('axios') ||
              id.includes('mammoth') ||
              id.includes('jszip')
            ) {
              return 'utility-vendor';
            }

            // Validation libraries
            if (id.includes('zod') || id.includes('yup')) {
              return 'validation-vendor';
            }
          }
          // Let Vite handle other chunks automatically
        }
      },
      plugins: [
        NodeGlobalsPolyfillPlugin({
          buffer: true,
          process: true
        }),
        NodeModulesPolyfillPlugin()
      ]
    }
  },
  server: {
    host: "localhost",
    port: 8080,
  },
  plugins: [
    wasm(),
    topLevelAwait(),
    react(),
    mode === 'development' &&
    componentTagger(),
    markdown()
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));