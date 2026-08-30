import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      devOptions: {
        enabled: true
      },
      includeAssets: ['favicon.jpg', 'icons.svg'],
      manifest: {
        name: 'Kibô-no-Iê Visitante',
        short_name: 'Visitante',
        description: 'Guia de bolso e cardápio digital oficial para o público',
        theme_color: '#f5f8f2',
        background_color: '#f5f8f2',
        display: 'standalone',
        icons: [
          {
            src: '/favicon.jpg',
            sizes: '1024x1024',
            type: 'image/jpeg'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,jpg,jpeg,webp,woff2}'],
        navigateFallback: 'index.html',
        runtimeCaching: [
          {
            // Endpoints da API (listProducts, listShop, listWarning e Cloud Functions)
            urlPattern: ({ url }) => {
              const pathname = url.pathname.toLowerCase();
              return pathname.includes('listproducts') ||
                     pathname.includes('listshop') ||
                     pathname.includes('listwarning');
            },
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-data-cache',
              networkTimeoutSeconds: 3,
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 24 * 60 * 60 // 24 horas
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          {
            // Fotos e imagens remotas (Firebase Storage e outras mídias)
            urlPattern: ({ request, url }) => {
              return request.destination === 'image' ||
                     url.hostname.includes('firebasestorage.googleapis.com') ||
                     url.pathname.match(/\.(png|jpg|jpeg|svg|webp|gif)$/i) !== null;
            },
            handler: 'NetworkFirst',
            options: {
              cacheName: 'remote-images-cache',
              networkTimeoutSeconds: 3,
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 7 * 24 * 60 * 60 // 7 dias
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          {
            // Scripts e assets do Google Maps / Google Fonts
            urlPattern: /^https:\/\/(maps\.googleapis\.com|maps\.gstatic\.com|fonts\.googleapis\.com|fonts\.gstatic\.com)\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'google-assets-cache',
              networkTimeoutSeconds: 3,
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 30 * 24 * 60 * 60 // 30 dias
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          }
        ]
      }
    })
  ],
})
