import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import { APP_DESCRIPTION, APP_FULL_NAME } from './src/lib/appConfig.js';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifestFilename: 'manifest.json',
      includeAssets: [
        'favicon.ico',
        'favicon.svg',
        'favicon-32.png',
        'favicon-16.png',
        'apple-touch-icon.png',
        'manifest.json',
        'assets/branding/logo.png',
        'assets/branding/logo-nav.png',
      ],
      manifest: {
        name: APP_FULL_NAME,
        short_name: APP_FULL_NAME,
        description: APP_DESCRIPTION,
        theme_color: '#c6e7e1',
        background_color: '#fff9eb',
        display: 'standalone',
        orientation: 'portrait-primary',
        start_url: '/',
        scope: '/',
        icons: [
          { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' },
          {
            src: 'pwa-512x512-maskable.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,webp,woff2}'],
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
        runtimeCaching: [
          {
            urlPattern: /\/assets\/poketracker\/.+\.(?:png|webp|jpg|jpeg)$/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'pokopia-sprites',
              expiration: {
                maxEntries: 2500,
                maxAgeSeconds: 60 * 60 * 24 * 30,
              },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },
    }),
  ],
});
