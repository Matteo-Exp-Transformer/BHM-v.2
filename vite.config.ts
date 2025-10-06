import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import { sentryVitePlugin } from '@sentry/vite-plugin'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  base: '/BHM-v.2/',
  plugins: [
    react(),
    ...(process.env.SENTRY_AUTH_TOKEN
      ? [
          sentryVitePlugin({
            org: process.env.SENTRY_ORG,
            project: process.env.SENTRY_PROJECT,
            authToken: process.env.SENTRY_AUTH_TOKEN,
            telemetry: false,
            sourcemaps: {
              assets: './dist/**',
            },
          }),
        ]
      : []),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icons/icon.svg'],
      manifest: {
        name: 'HACCP Business Manager',
        short_name: 'HACCP Manager',
        description:
          'Progressive Web App for digitalizing food safety management in restaurants',
        theme_color: '#3b82f6',
        background_color: '#ffffff',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/BHM-v.2/',
        start_url: '/BHM-v.2/',
        icons: [
          {
            src: 'icons/icon.svg',
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'any maskable',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/api\.supabase\.io\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'supabase-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365, // <== 365 days
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
        ],
      },
    }),
  ],
  optimizeDeps: {
    force: true,
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@tanstack/react-query',
      '@clerk/clerk-react',
      '@sentry/react',
    ],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    host: true,
    port: 3000,
    cors: true,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  },
  build: {
    target: 'esnext',
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunks
          'react-vendor': ['react', 'react-dom'],
          'router-vendor': ['react-router-dom'],
          'query-vendor': ['@tanstack/react-query'],
          'auth-vendor': ['@clerk/clerk-react'],
          'ui-vendor': ['lucide-react', 'react-toastify'],
          'calendar-vendor': [
            '@fullcalendar/react',
            '@fullcalendar/core',
            '@fullcalendar/daygrid',
            '@fullcalendar/timegrid',
            '@fullcalendar/interaction',
          ],

          // Feature chunks
          'calendar-features': [
            './src/features/calendar/CalendarPage',
            './src/features/calendar/Calendar',
            './src/hooks/useCalendar.ts',
          ],
          'inventory-features': [
            './src/features/inventory/InventoryPage',
            './src/types/inventory.ts',
          ],
          'conservation-features': [
            './src/features/conservation/ConservationPage',
            './src/hooks/useConservation.ts',
          ],
          'management-features': ['./src/features/management/ManagementPage'],
          'dashboard-features': ['./src/features/dashboard/DashboardPage'],
          'settings-features': ['./src/features/settings/SettingsPage'],
        },
      },
    },
    chunkSizeWarningLimit: 1000,
  },
})
