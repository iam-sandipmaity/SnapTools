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
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      external: ['@vercel/analytics'],
      output: {
        format: 'es',
        inlineDynamicImports: false,
        assetFileNames: 'assets/[name][extname]',
        manualChunks: {
          // React core
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          
          // UI libraries
          'ui-vendor': [
            '@radix-ui/react-dialog',
            '@radix-ui/react-dropdown-menu',
            '@radix-ui/react-select',
            '@radix-ui/react-tabs',
            '@radix-ui/react-accordion',
            '@radix-ui/react-tooltip',
            'framer-motion',
          ],
          
          // Large utilities
          'pdf-vendor': ['pdf-lib'],
          'chart-vendor': ['recharts'],
          'crypto-vendor': ['crypto-js', 'crypto-browserify', 'bcryptjs', 'node-forge'],
          'code-vendor': ['react-syntax-highlighter'],
          
          // Other heavy dependencies
          'utility-vendor': ['html2canvas', 'qrcode', 'jsbarcode', 'axios'],
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