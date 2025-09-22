import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { ViteImageOptimizer } from 'vite-plugin-image-optimizer';

export default defineConfig({
  plugins: [
    react(),
    ViteImageOptimizer({
      test: /\.(jpe?g|png|gif|tiff|webp|avif)$/i,
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
        speed: 4,
      },
    })
  ],

  optimizeDeps: {
    exclude: ['lucide-react'],
  },

  server: {
    host: 'localhost',
    port: 5173,
    strictPort: false,
    hmr: {
      protocol: 'ws',
      host: 'localhost'
    }
  },

  build: {
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Core React libraries
          if (id.includes('react') || id.includes('react-dom')) {
            return 'vendor';
          }
          
          // Router
          if (id.includes('react-router')) {
            return 'router';
          }
          
          // UI libraries
          if (id.includes('framer-motion')) {
            return 'ui';
          }
          
          if (id.includes('lucide-react')) {
            return 'icons';
          }
          
          if (id.includes('recharts')) {
            return 'charts';
          }
          
          // Monitoring libraries - separate chunk
          if (id.includes('@sentry') || id.includes('logrocket')) {
            return 'monitoring';
          }

          // Supabase
          if (id.includes('@supabase')) {
            return 'supabase';
          }

          // Payment libraries
          if (id.includes('razorpay')) {
            return 'payment';
          }
          
          // Admin components - split by functionality
          if (id.includes('src/components/Dashboard/Admin/')) {
            if (id.includes('Analytics') || id.includes('Reports')) {
              return 'admin-analytics';
            }
            if (id.includes('Management') || id.includes('Manager')) {
              return 'admin-management';
            }
            return 'admin-components';
          }
          
          // Dashboard components
          if (id.includes('src/components/Dashboard/')) {
            return 'dashboard';
          }
          
          // Settings components
          if (id.includes('src/components/Settings/')) {
            return 'settings';
          }
          
          // Product components
          if (id.includes('src/components/Product/')) {
            return 'product';
          }
          
          // Context providers
          if (id.includes('src/contexts/')) {
            return 'contexts';
          }
          
          // Utils
          if (id.includes('src/utils/')) {
            return 'utils';
          }
          
          // Services
          if (id.includes('src/services/')) {
            return 'services';
          }
          
          // Pages - split by functionality for route-based loading
          if (id.includes('src/pages/')) {
            if (id.includes('Dashboard') || id.includes('Admin')) {
              return 'pages-admin';
            }
            if (id.includes('Product') || id.includes('Search') || id.includes('Category') || id.includes('Collection')) {
              return 'pages-catalog';
            }
            if (id.includes('Profile') || id.includes('Settings') || id.includes('Orders') || id.includes('Wishlist')) {
              return 'pages-user';
            }
            if (id.includes('Checkout') || id.includes('Payment')) {
              return 'pages-checkout';
            }
            if (id.includes('Home')) {
              return 'pages-home';
            }
            return 'pages';
          }
          
          // Default chunk for everything else
          return 'common';
        },
        // Optimize chunk naming
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]'
      }
    },
    chunkSizeWarningLimit: 1000,
    // Enable CSS code splitting
    cssCodeSplit: true,
    // Generate CSS sourcemaps in development
    sourcemap: true,
    // Minify with terser for better compression
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info', 'console.debug']
      },
      mangle: true,
      format: {
        comments: false
      }
    },
    // Enable brotli compression
    brotliSize: true,
  },
  
  // Optimize assets
  assetsInclude: ['**/*.JPG', '**/*.jpeg', '**/*.png', '**/*.webp', '**/*.avif'],
  
  // Enable brotli compression
  esbuild: {
    drop: ['console', 'debugger']
  }
});