import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { ViteImageOptimizer } from 'vite-plugin-image-optimizer';
import path from 'path';

export default defineConfig({
  plugins: [
    react(),
    ViteImageOptimizer({
      test: /\\.(jpe?g|png|gif|tiff|webp|avif)$/i,
      exclude: undefined,
      include: undefined,
      includePublic: true,
      logStats: true,
      ansiColors: true,
      png: {
        quality: 80,
        palette: true,
        compressionLevel: 9,
        adaptiveFiltering: true,
      },
      jpeg: {
        quality: 80,
        mozjpeg: true,
      },
      jpg: {
        quality: 80,
        mozjpeg: true,
      },
      webp: {
        quality: 80,
        lossless: false,
        nearLossless: false,
        smartSubsample: true,
      },
      avif: {
        quality: 60,
        lossless: false,
      },
    })
  ],

  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },

  optimizeDeps: {
    exclude: ['lucide-react'],
  },

  server: {
    host: '0.0.0.0', // Allow access from local network (mobile devices)
    port: 5173,
    strictPort: false,
    hmr: {
      protocol: 'ws',
      host: 'localhost'
    }
  },

  build: {
    target: 'es2015',
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    },
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Core React libraries
          if (id.includes('react') || id.includes('react-dom')) {
            return 'vendor-react';
          }
          
          // Router
          if (id.includes('react-router')) {
            return 'vendor-router';
          }
          
          // Heavy UI libraries - separate chunk
          if (id.includes('framer-motion')) {
            return 'vendor-animations';
          }
          
          // Icons - separate chunk for better caching
          if (id.includes('lucide-react')) {
            return 'vendor-icons';
          }
          
          // Supabase and database related
          if (id.includes('@supabase') || id.includes('supabase')) {
            return 'vendor-db';
          }
          
          // Home page components - critical chunk
          if (id.includes('/src/pages/HomePage') || id.includes('/src/pages/OptimizedHomePage')) {
            return 'page-home';
          }
          
          // Other page components
          if (id.includes('/src/pages/')) {
            return 'pages';
          }
          
          // Home components - load with home page
          if (id.includes('/src/components/Home/')) {
            return 'components-home';
          }
          
          // Large component groups
          if (id.includes('/src/components/Dashboard/')) {
            return 'components-dashboard';
          }
          
          if (id.includes('/src/components/Product/')) {
            return 'components-product';
          }
          
          // Utilities and contexts
          if (id.includes('/src/contexts/') || id.includes('/src/utils/')) {
            return 'app-core';
          }
          
          // All other vendor packages
          if (id.includes('node_modules')) {
            return 'vendor-misc';
          }
        },
        // Optimize chunk naming for better caching
        chunkFileNames: 'js/[name]-[hash].js',
        entryFileNames: 'js/[name]-[hash].js',
        assetFileNames: (assetInfo) => {
          const name = assetInfo.name || 'asset';
          const extType = name.split('.').pop() || '';
          if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(extType)) {
            return `images/[name]-[hash].[ext]`;
          }
          if (/css/i.test(extType)) {
            return `css/[name]-[hash].[ext]`;
          }
          return `assets/[name]-[hash].[ext]`;
        }
      }
    },
    // Performance optimizations
    cssCodeSplit: true,
    sourcemap: false, // Disable for production
    reportCompressedSize: false, // Faster builds
    chunkSizeWarningLimit: 1000
  }
});