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
        'pwa-192x192.png',
        'pwa-512x512.png',
        'assets/branding/logo.png',
        'assets/branding/logo-nav.png',
        'desktop_1.png',
        'desktop_2.png',
        'phone1.png',
        'phone2.png',
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
        screenshots: [
          {
            src: 'desktop_1.png',
            sizes: '1920x1080',
            type: 'image/png',
            form_factor: 'wide',
            label: 'Pokopia Pal item catalog on desktop',
          },
          {
            src: 'desktop_2.png',
            sizes: '1920x1080',
            type: 'image/png',
            form_factor: 'wide',
            label: 'Pokopia Pal detail view on desktop',
          },
          {
            src: 'phone1.png',
            sizes: '1442x3203',
            type: 'image/png',
            form_factor: 'narrow',
            label: 'Pokopia Pal item catalog on mobile',
          },
          {
            src: 'phone2.png',
            sizes: '1442x3202',
            type: 'image/png',
            form_factor: 'narrow',
            label: 'Pokopia Pal detail view on mobile',
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
              cacheName: 'poketracker-assets',
              expiration: {
                maxEntries: 3000,
                maxAgeSeconds: 60 * 60 * 24 * 30,
              },
              cacheableResponse: { statuses: [0, 200] },
              plugins: [
                {
                  handlerDidError: () => caches.match('pwa-192x192.png'),
                },
              ],
            },
          },
          {
            urlPattern: /\/assets\/pokemon-favorites\/images\/.+\.(?:png|webp|jpg|jpeg)$/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'pokemon-favorites',
              expiration: {
                maxEntries: 500,
                maxAgeSeconds: 60 * 60 * 24 * 30,
              },
              cacheableResponse: { statuses: [0, 200] },
              plugins: [
                {
                  handlerDidError: () => caches.match('pwa-192x192.png'),
                },
              ],
            },
          },
          {
            urlPattern: /^https:\/\/(?:pokopiaguide\.com|www\.serebii\.net)\/.+\.(?:png|webp|jpg|jpeg)$/i,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'external-images',
              expiration: {
                maxEntries: 500,
                maxAgeSeconds: 60 * 60 * 24 * 7,
              },
              cacheableResponse: { statuses: [0, 200] },
              plugins: [
                {
                  handlerDidError: () => caches.match('pwa-192x192.png'),
                },
              ],
            },
          },
        ],
      },
    }),
  ],
});
